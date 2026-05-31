/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * THE SCIENCE GARAGE: UNIVERSAL AI GRADER (v2.5)
 * Socratic Feedback | Granular Cell Tinting | No-Spoiler Rule
 */

const { onValueUpdated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require("firebase-functions/params");
const MASTER_KEYS = require("./keys"); // 🔑 Import our secure vault

admin.initializeApp();

// Access the API Key from Google Cloud Secret Manager
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

/**
 * THE SCIENCE GARAGE: UNIVERSAL AI GRADER (v3.0)
 * Future AI Grading experiments and automated text feedback.
 */
/**
 * THE SCIENCE GARAGE: UNIVERSAL AI GRADER (v3.0)
 * Future AI Grading experiments and automated text feedback.
 */
exports.universalAiGrader = onValueUpdated({
    ref: "/teacherGradebook/{periodFolder}/{assignmentFolder}/{studentUid}",
    secrets: [GEMINI_API_KEY],
    memory: "512MiB"
}, async (event) => {
    // This is your placeholder for future AI grading logic.
    // It currently monitors the same path but can be customized later.
    console.log("Universal AI Grader placeholder triggered.");
    return null;
});

/**
 * THE SCIENCE GARAGE: LIVE MIRROR (v1.0)
 * Automatically mirrors any change from the master gradebook to the 
 * anonymous student session feed.
 */
exports.mirrorGradebookToSession = onValueUpdated({
    ref: "/teacherGradebook/{periodFolder}/{assignmentFolder}/{studentUid}",
    memory: "256MiB"
}, async (event) => {
    const afterData = event.data.after.val();
    const beforeData = event.data.before.val();
    
    const oldSession = beforeData ? beforeData.currentSession : null;
    const newSession = afterData ? afterData.currentSession : null;

    if (newSession) {
        if (oldSession && oldSession !== newSession) {
            // 1. Signal disconnection to the old window
            await admin.database().ref(`liveUpdates/${oldSession}`).set({ disconnected: true });
            // 2. Revoke the old session immediately by setting expiry to 0
            // This allows the pruner to find it and clean up the liveUpdates node later.
            await admin.database().ref(`ActiveSessions/${oldSession}`).update({ expires: 0 });
        }
        return admin.database().ref(`liveUpdates/${newSession}`).set(afterData);
    }
    return null;
});










exports.cleanupSessions = onSchedule("every 1 hours", async (event) => {
    const now = Date.now();
    const snapshot = await admin.database().ref("ActiveSessions").orderByChild("expires").endAt(now).get();
    if (!snapshot.exists()) return null;
    const expiredTokens = Object.keys(snapshot.val());
    const updates = {};
    expiredTokens.forEach(token => {
        updates[`ActiveSessions/${token}`] = null;
        updates[`liveUpdates/${token}`] = null;
    });
    return admin.database().ref().update(updates);
});











/**
 * THE SCIENCE GARAGE: SECURE PROXY (v1.0)
 * Acts as a middleman to hide SaltedHashes from student browsers.
 * Validates SessionTokens and maps them to permanent RTDB nodes.
 */
exports.secureProxy = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
    const { token, qId, selection, textValue, action } = req.body;

    if (!token) return res.status(400).send("Missing Session Token");

    try {
        // 1. Resolve Token to Real Hash
        const sessionRef = admin.database().ref(`ActiveSessions/${token}`);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists()) return res.status(403).send("Session Expired");

        const sessionData = sessionSnap.val();
        const { realHash, periodFolder, assignmentFolder, expires } = sessionData;

        // 2. Expiration Check (1 Hour Limit)
        if (Date.now() > expires) {
            await sessionRef.remove();
            return res.status(403).send("Session Expired");
        }

      // =====================================================================
        // FLASHCARD ACTIONS (NO APPS SCRIPT BANDWIDTH)
        // =====================================================================
        if (action === "initFlashcards") {
            // Fetch the massive master question bank via admin privileges
            const bankSnap = await admin.database().ref("mcQuestionBank").get();
            const bankData = bankSnap.exists() ? Object.values(bankSnap.val()) : [];

            // Securely fetch the student's private history node using the mapped realHash
            const historySnap = await admin.database().ref(`chemReview2026/${realHash}`).get();
            const historyData = historySnap.exists() ? historySnap.val() : {};

            // Stream the unified payload directly back to the client viewport
            return res.status(200).json({
                bank: bankData,
                history: historyData
            });

        } else if (action === "saveFlashcardProgress") {
            const { deckId, unseenIds, masteredIds, learningIds, deckMetadata, isFinished } = req.body;
            
            // Build the update payload targeting the chemReview2026 node directly
            const basePath = `chemReview2026/${realHash}/${deckId}`;
            const updates = {
                [`${basePath}/state`]: { 
                    unseen: unseenIds || [], 
                    mastered: masteredIds || [], 
                    learning: learningIds || [] 
                },
                [`${basePath}/score`]: (masteredIds || []).length,
                [`${basePath}/lastUpdated`]: Date.now()
            };
            
            if (deckMetadata) updates[`${basePath}/metadata`] = deckMetadata;
            if (isFinished) updates[`${basePath}/completed`] = true;
            
            await admin.database().ref().update(updates);
            return res.status(200).send("Progress Saved");

        } else if (action === "deleteFlashcardDeck") {
            const { deckId } = req.body;
            // Instantly wipe the deck from the database
            await admin.database().ref(`chemReview2026/${realHash}/${deckId}`).remove();
            return res.status(200).send("Deck Deleted");
        }

        // Permanent reference path for Graded Assignments
        const studentRef = admin.database().ref(`teacherGradebook/${periodFolder}/${assignmentFolder}/${realHash}`);

        // 3. Handle Graded Assignment Actions
        if (action === "saveAnswer") {
            const updateData = {
                needsGrading: true,
                lastUpdated: Date.now(),
                [`q${qId}/selection`]: (selection !== undefined) ? selection : textValue
            };

            // 📝 Grade Reset: If text answer is edited, clear the old isCorrect status
            if (textValue !== undefined) {
                updateData[`q${qId}/isCorrect`] = null;
                updateData[`q${qId}/score`] = null;
            }
            await studentRef.update(updateData);
        } else if (action === "submit") {
            await studentRef.update({ 
                submitted: true, 
                needsGrading: true, 
                lastSubmitted: Date.now() 
            });
        } else if (action === "markRead") {
            if (qId) {
                await studentRef.child(`q${qId}`).update({ commentUnread: false });
            }
        }

        return res.status(200).send("Success");

    } catch (error) {
        console.error("PROXY ERROR:", error);
        return res.status(500).send("Server Error");
    }
});




















/**
 * THE SCIENCE GARAGE: STUDENT ACTIVITY TRIGGER (v3.1)
 * Handles Secure MC Grading and Mastery Tracking
 */
exports.onStudentActivityTrigger = onValueUpdated({
    ref: "/teacherGradebook/{periodFolder}/{assignmentFolder}/{studentUid}",
    secrets: [GEMINI_API_KEY],
    memory: "512MiB",
    timeoutSeconds: 30
}, async (event) => {

    const afterData = event.data.after.val();

    // 1. EXIT CHECK: Proceed only if grading is requested
    if (!afterData || afterData.needsGrading !== true) return null;

    const { assignmentFolder, studentUid } = event.params;
    
    // Clean assignmentFolder to get the base code
    const assignmentCode = assignmentFolder.includes('_') 
        ? assignmentFolder.split('_').slice(0, -1).join('_') 
        : assignmentFolder;

    console.log(`Processing Activity: ${assignmentCode} for ${studentUid}`);

    try {
        const updates = {};
        const assignmentKey = MASTER_KEYS[assignmentCode];
        
        let totalCorrect = 0;
        let totalQuestions = 0;

        if (assignmentKey) {
            const masterQIds = Object.keys(assignmentKey);
            totalQuestions = masterQIds.length;
            
            masterQIds.forEach(qId => {
                const qKey = `q${qId}`;
                const qRubric = assignmentKey[qId];
                const studentData = afterData[qKey] || {};
                
                if (typeof qRubric === 'object') {
                    if (studentData.isCorrect === true) totalCorrect++;
                } else {
                    const studentAnswer = studentData.selection;
                    if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== "") {
                        const isCorrect = (studentAnswer == qRubric);
                        updates[`${qKey}/isCorrect`] = isCorrect;
                        updates[`${qKey}/score`] = isCorrect ? 1 : 0;
                        if (isCorrect) totalCorrect++;
                    }
                }
            });
        }

        const totalThreshold = Math.ceil(totalQuestions * 0.8);
        const isUnlockedNow = totalCorrect >= totalThreshold;
        // THE GATE: Only unlock if already unlocked OR (Submit was pressed AND current grade >= 80%)
        const shouldBeUnlocked = (afterData.unlocked === true) || (afterData.submitted === true && isUnlockedNow);

        const finalUpdates = {
            ...updates,
            score: totalCorrect,
            unlocked: shouldBeUnlocked,
            needsGrading: false,
            lastGraded: Date.now()
        };

        await event.data.after.ref.update(finalUpdates);

        return null;


    } catch (error) {
        console.error("TRIGGER ERROR:", error);
        return event.data.after.ref.update({ needsGrading: false });
    }
});