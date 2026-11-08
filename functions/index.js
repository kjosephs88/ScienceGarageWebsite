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
 * THE SCIENCE GARAGE: SECURE PROXY (Unified v1.2)
 * Acts as a middleman to hide SaltedHashes from student browsers.
 * Handles Flashcards, dynamic Gradebook mapping (pre/post Classroom posting),
 * live SSE sync, and Video Guide security states.
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
            const bankSnap = await admin.database().ref("mcQuestionBank").get();
            const bankData = bankSnap.exists() ? Object.values(bankSnap.val()) : [];

            const historySnap = await admin.database().ref(`chemReview2026/${realHash}`).get();
            const historyData = historySnap.exists() ? historySnap.val() : {};

            return res.status(200).json({ bank: bankData, history: historyData });

        } else if (action === "saveFlashcardProgress") {
            const { deckId, unseenIds, masteredIds, learningIds, deckMetadata, isFinished } = req.body;
            const basePath = `chemReview2026/${realHash}/${deckId}`;
            const updates = {
                [`${basePath}/state`]: { unseen: unseenIds || [], mastered: masteredIds || [], learning: learningIds || [] },
                [`${basePath}/score`]: (masteredIds || []).length,
                [`${basePath}/lastUpdated`]: Date.now()
            };
            if (deckMetadata) updates[`${basePath}/metadata`] = deckMetadata;
            if (isFinished) updates[`${basePath}/completed`] = true;
            await admin.database().ref().update(updates);
            return res.status(200).send("Progress Saved");

        } else if (action === "deleteFlashcardDeck") {
            await admin.database().ref(`chemReview2026/${realHash}/${req.body.deckId}`).remove();
            return res.status(200).send("Deck Deleted");
        }

        // =====================================================================
        // GRADED ASSIGNMENT & VIDEO PLAYER ACTIONS
        // =====================================================================
        
        // 3. Dynamically Resolve Exact Gradebook Path
        let exactStudentPath = sessionData.exactStudentPath;
        const isRawFolder = exactStudentPath && exactStudentPath.includes(`/${assignmentFolder}/${realHash}`);

        if (!exactStudentPath || isRawFolder) {
            const classSubject = assignmentFolder.substring(0, 2); 
            const periodNum = periodFolder.replace("Period", "");
            const classPrefix = `${classSubject}_P${periodNum}`; // e.g. "FS_P6"
            
            const gradebookSnap = await admin.database().ref('teacherGradebook')
                .orderByKey().startAt(classPrefix).endAt(classPrefix + "\uf8ff").once('value');
            
            if (gradebookSnap.exists()) {
                const exactClassFolder = Object.keys(gradebookSnap.val())[0]; // e.g. FS_P6_876562785599
                const classAssignments = gradebookSnap.val()[exactClassFolder] || {};

                // 1. Matches posted Classroom folder (e.g. FS_U03_A03_895932117550)
                // 2. Falls back to base code if testing before posting
                const matchedAssignmentKey = Object.keys(classAssignments).find(k => k.startsWith(`${assignmentFolder}_`)) 
                    || Object.keys(classAssignments).find(k => k === assignmentFolder) 
                    || assignmentFolder;

                exactStudentPath = `teacherGradebook/${exactClassFolder}/${matchedAssignmentKey}/${realHash}`;
                await sessionRef.update({ exactStudentPath: exactStudentPath });
            } else {
                return res.status(500).json({ error: "Class folder not found in gradebook." });
            }
        }

        const livePath = `sessionBridge/${token}`;

        // Initialize Video Player & establish SSE live session
        if (action === "initVideo") {
            const studentSnap = await admin.database().ref(exactStudentPath).once('value');
            const savedState = studentSnap.val() || {}; 
            
            await admin.database().ref(livePath).set(savedState);
            
            return res.status(200).json({
                sessionToken: token,
                livePath: livePath,
                savedState: savedState
            });
        }

        // Save progress tracker max watched time
        if (action === "saveVideoProgress") {
            const updates = {};
            updates[`${exactStudentPath}/maxWatchedTime`] = req.body.time;
            updates[`${livePath}/maxWatchedTime`] = req.body.time;
            await admin.database().ref().update(updates);
            return res.status(200).send({ success: true });
        }

        // Save tab leave & lockout security state
        if (action === "saveSecurityState") {
            const updates = {};
            if (req.body.tabLeaves !== undefined) {
                updates[`${exactStudentPath}/tabLeaves`] = req.body.tabLeaves;
                updates[`${livePath}/tabLeaves`] = req.body.tabLeaves;
            }
            if (req.body.isLocked !== undefined) {
                updates[`${exactStudentPath}/isLocked`] = req.body.isLocked;
                updates[`${livePath}/isLocked`] = req.body.isLocked;
            }
            await admin.database().ref().update(updates);
            return res.status(200).send({ success: true });
        }

        // End session: Permanently saves strikes/lockout and immediately revokes the session token
        if (action === "endSession") {
            const updates = {};
            if (req.body.tabLeaves !== undefined) {
                updates[`${exactStudentPath}/tabLeaves`] = req.body.tabLeaves;
            }
            if (req.body.isLocked !== undefined) {
                updates[`${exactStudentPath}/isLocked`] = req.body.isLocked;
            }

            // Revoke the token and clean up the live session bridge
            updates[`ActiveSessions/${token}`] = null;
            updates[`sessionBridge/${token}`] = null;

            await admin.database().ref().update(updates);
            return res.status(200).send({ success: true, revoked: true });
        }

        // Process standard assignment answers
        if (action === "saveAnswer") {
            const updates = {};
            const qKey = `q${qId}`;
            const ans = (selection !== undefined) ? selection : textValue;
            
            updates[`${exactStudentPath}/needsGrading`] = true;
            updates[`${exactStudentPath}/lastUpdated`] = Date.now();
            updates[`${exactStudentPath}/${qKey}/selection`] = ans;
            updates[`${livePath}/${qKey}/selection`] = ans;

            if (textValue !== undefined) {
                updates[`${exactStudentPath}/${qKey}/isCorrect`] = null;
                updates[`${exactStudentPath}/${qKey}/score`] = null;
                updates[`${livePath}/${qKey}/isCorrect`] = null;
                updates[`${livePath}/${qKey}/score`] = null;
            }
            await admin.database().ref().update(updates);

        } else if (action === "submit") {
            // Strip off Google Classroom numeric suffix if present (e.g., FS_U04_A01_895932117550 -> FS_U04_A01)
            const parts = assignmentFolder.split('_');
            const rubricCode = /^\d+$/.test(parts[parts.length - 1]) 
                ? parts.slice(0, -1).join('_') 
                : assignmentFolder;

            // Target the standardized rubric node
            const rubricSnap = await admin.database().ref(`rubrics/rubric_${rubricCode}/keys`).once('value');
            const answerKeys = rubricSnap.val() || {};

            // Fetch student's current recorded selections
            const studentSnap = await admin.database().ref(exactStudentPath).once('value');
            const studentData = studentSnap.val() || {};

            let totalCorrect = 0;
            const totalQuestions = Object.keys(answerKeys).length;
            const incorrectQs = [];
            const updates = {};

            // Compare each question against rubric keys
            Object.keys(answerKeys).forEach(k => {
                const qKey = `q${k}`;
                const correctAns = answerKeys[k];
                const studentAns = studentData[qKey]?.selection;

                const isCorrect = (studentAns !== undefined && studentAns !== null && studentAns == correctAns);
                updates[`${exactStudentPath}/${qKey}/isCorrect`] = isCorrect;
                updates[`${livePath}/${qKey}/isCorrect`] = isCorrect;

                if (isCorrect) {
                    totalCorrect++;
                } else {
                    incorrectQs.push(k);
                }
            });

            // Decrement remaining submission attempts (defaults to 3 on first run)
            const currentAttempts = studentData.attemptsLeft !== undefined ? studentData.attemptsLeft : 3;
            const attemptsLeft = Math.max(0, currentAttempts - 1);

            updates[`${exactStudentPath}/submitted`] = true;
            updates[`${exactStudentPath}/score`] = totalCorrect;
            updates[`${exactStudentPath}/attemptsLeft`] = attemptsLeft;
            updates[`${exactStudentPath}/lastSubmitted`] = Date.now();
            updates[`${livePath}/submitted`] = true;

            await admin.database().ref().update(updates);

            // Instant return to frontend
            return res.status(200).json({
                score: totalCorrect,
                total: totalQuestions,
                incorrect: incorrectQs,
                attemptsLeft: attemptsLeft
            });

        } else if (action === "markRead") {
            if (qId) {
                await admin.database().ref(`${exactStudentPath}/q${qId}`).update({ commentUnread: false });
                await admin.database().ref(`${livePath}/q${qId}`).update({ commentUnread: false });
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
    if (!afterData || afterData.needsGrading !== true) return null;

    const { assignmentFolder, studentUid } = event.params;
    const assignmentCode = assignmentFolder.includes('_') 
        ? assignmentFolder.split('_').slice(0, -1).join('_') 
        : assignmentFolder;

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