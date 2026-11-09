/**
 * Import function triggers from their respective submodules:
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { onValueUpdated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

/**
 * THE SCIENCE GARAGE: LIVE MIRROR (v1.0)
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
            await admin.database().ref(`sessionBridge/${oldSession}`).set({ disconnected: true });
            await admin.database().ref(`ActiveSessions/${oldSession}`).update({ expires: 0 });
        }
        return admin.database().ref(`sessionBridge/${newSession}`).set(afterData);
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
        updates[`sessionBridge/${token}`] = null;
    });
    return admin.database().ref().update(updates);
});







/**
 * Resolves assignment folder to the correct RTDB rubric node.
 * Handles:
 *   - Stripping Google Classroom IDs (e.g., CH_U04_A01_P_883065905929 -> CH_U04_A01_P)
 *   - Variant suffixes (_G, _P) with fallback to base rubric (rubric_CH_U04_A01)
 *   - Bellringers (CH_BR_W05, PH_BR_W07)
 */
async function getAssignmentRubric(assignmentFolder) {
    // 1. Strip trailing numeric Google Classroom ID (8+ digits)
    const cleanFolder = assignmentFolder.replace(/_\d{8,}$/, '');

    // 2. Try exact match (e.g., rubric_CH_U04_A01_P, rubric_CH_BR_W05, rubric_FS_U03_A03)
    let rubricSnap = await admin.database().ref(`rubrics/rubric_${cleanFolder}`).once('value');
    if (rubricSnap.exists()) {
        return rubricSnap.val();
    }

    // 3. Fallback: If it ends in a single letter variant (_P, _G, _R, _U), strip it
    const baseFolder = cleanFolder.replace(/_[A-Z]$/, '');
    if (baseFolder !== cleanFolder) {
        rubricSnap = await admin.database().ref(`rubrics/rubric_${baseFolder}`).once('value');
        if (rubricSnap.exists()) {
            return rubricSnap.val();
        }
    }

    return null;
}

















/**
 * THE SCIENCE GARAGE: SECURE PROXY (Unified)
 */
exports.secureProxy = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
    const { token, qId, selection, textValue, action, assignment } = req.body;
    if (!token) return res.status(400).send("Missing Session Token");

    try {
        const sessionRef = admin.database().ref(`ActiveSessions/${token}`);
        const sessionSnap = await sessionRef.get();
        if (!sessionSnap.exists()) return res.status(403).send("Session Expired");

        const sessionData = sessionSnap.val();
        const { realHash, periodFolder, assignmentFolder, expires } = sessionData;

        if (Date.now() > expires) {
            await sessionRef.remove();
            return res.status(403).send("Session Expired");
        }

        let exactStudentPath = sessionData.exactStudentPath;
        const isRawFolder = exactStudentPath && exactStudentPath.includes(`/${assignmentFolder}/${realHash}`);

        if (!exactStudentPath || isRawFolder) {
            const classSubject = assignmentFolder.substring(0, 2); 
            const periodNum = periodFolder.replace("Period", "");
            const classPrefix = `${classSubject}_P${periodNum}`; 
            
            const gradebookSnap = await admin.database().ref('teacherGradebook')
                .orderByKey().startAt(classPrefix).endAt(classPrefix + "\uf8ff").once('value');
            
            if (gradebookSnap.exists()) {
                const exactClassFolder = Object.keys(gradebookSnap.val())[0];
                const classAssignments = gradebookSnap.val()[exactClassFolder] || {};
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

        // Initialize Session (Text Assessment or Video Guide)
        if (action === "initSession" || action === "initVideo") {
            const targetAssignment = assignment || assignmentFolder;
            const asgSnap = await admin.database().ref(`assignments/${targetAssignment}`).once('value');
            const asgData = asgSnap.val() || {};
            const maxAttempts = asgData.maxAttempts || 3;
            
            const studentSnap = await admin.database().ref(exactStudentPath).once('value');
            let savedState = studentSnap.val();
            
            if (!savedState) {
                // Initialize new student as Locked
                savedState = {
                    isLocked: true,
                    tabLeaves: 0,
                    attemptsLeft: maxAttempts,
                    currentSession: token
                };
                await admin.database().ref(exactStudentPath).set(savedState);
            } else {
                await admin.database().ref(exactStudentPath).update({ currentSession: token });
            }
            
            await admin.database().ref(livePath).set(savedState);
            return res.status(200).json({ sessionToken: token, livePath: livePath, savedState: savedState });
        }

        // Save Tab Leave & Lockout Security State
        if (action === "saveSecurityState" || action === "endSession") {
            const updates = {};
            if (req.body.tabLeaves !== undefined) {
                updates[`${exactStudentPath}/tabLeaves`] = req.body.tabLeaves;
                updates[`${livePath}/tabLeaves`] = req.body.tabLeaves;
            }
            if (req.body.isLocked !== undefined) {
                updates[`${exactStudentPath}/isLocked`] = req.body.isLocked;
                updates[`${livePath}/isLocked`] = req.body.isLocked;
            }
            
            if (action === "endSession") {
                updates[`ActiveSessions/${token}`] = null;
                updates[`sessionBridge/${token}`] = null;
            }
            
            await admin.database().ref().update(updates);
            return res.status(200).send({ success: true });
        }

        // Save Video Playback Progress
        if (action === "saveVideoProgress") {
            const updates = {};
            updates[`${exactStudentPath}/maxWatchedTime`] = req.body.time;
            updates[`${livePath}/maxWatchedTime`] = req.body.time;
            await admin.database().ref().update(updates);
            return res.status(200).send({ success: true });
        }

        // Save Answer
        if (action === "saveAnswer") {
            const updates = {};
            const qKey = `q${qId}`;
            const ans = (selection !== undefined && selection !== null) ? selection : textValue;
            
            updates[`${exactStudentPath}/${qKey}/selection`] = ans;
            updates[`${exactStudentPath}/lastUpdated`] = Date.now();
            updates[`${livePath}/${qKey}/selection`] = ans;

            await admin.database().ref().update(updates);
            return res.status(200).send("Saved");
        } 
        
        // Final Submit (Triggers Dynamic Evaluation & Gemini AI)
        if (action === "submit") {
            const rubricData = await getAssignmentRubric(assignmentFolder);
            const questionsRubric = rubricData?.questions || rubricData?.keys || rubricData || {};

            const studentSnap = await admin.database().ref(exactStudentPath).once('value');
            const studentData = studentSnap.val() || {};
            const currentAttempts = studentData.attemptsLeft !== undefined ? studentData.attemptsLeft : 3;
            const attemptsLeft = Math.max(0, currentAttempts - 1);

            const hasShortAnswer = Object.values(questionsRubric).some(
                q => typeof q === 'object' && q.type === 'short-answer'
            );

            // ROUTE A: Asynchronous Gemini Pipeline
            if (hasShortAnswer) {
                const updates = {
                    [`${exactStudentPath}/submitted`]: true,
                    [`${exactStudentPath}/needsGrading`]: true,
                    [`${exactStudentPath}/attemptsLeft`]: attemptsLeft,
                    [`${exactStudentPath}/lastSubmitted`]: Date.now(),
                    [`${livePath}/submitted`]: true,
                    [`${livePath}/needsGrading`]: true,
                    [`${livePath}/attemptsLeft`]: attemptsLeft
                };
                await admin.database().ref().update(updates);
                return res.status(200).json({ status: "processing" });
            }

            // ROUTE B: Synchronous Grading (Pure Multiple Choice)
            let totalCorrect = 0;
            const totalQuestions = Object.keys(questionsRubric).length;
            const incorrectQs = [];
            const updates = {};

            Object.keys(questionsRubric).forEach(k => {
                const cleanId = String(k).replace(/^q/, '');
                const rule = questionsRubric[k];
                const correctAns = (typeof rule === 'object') ? rule.answer : rule;
                const studentAns = studentData[`q${cleanId}`]?.selection;

                const isCorrect = (studentAns !== undefined && studentAns !== null && studentAns == correctAns);
                updates[`${exactStudentPath}/q${cleanId}/isCorrect`] = isCorrect;
                updates[`${livePath}/q${cleanId}/isCorrect`] = isCorrect;

                if (isCorrect) {
                    totalCorrect++;
                } else {
                    incorrectQs.push(cleanId);
                }
            });

            updates[`${exactStudentPath}/submitted`] = true;
            updates[`${exactStudentPath}/needsGrading`] = false;
            updates[`${exactStudentPath}/score`] = totalCorrect;
            updates[`${exactStudentPath}/attemptsLeft`] = attemptsLeft;
            updates[`${exactStudentPath}/lastSubmitted`] = Date.now();
            updates[`${livePath}/submitted`] = true;
            updates[`${livePath}/needsGrading`] = false;
            updates[`${livePath}/attemptsLeft`] = attemptsLeft;

            await admin.database().ref().update(updates);

            return res.status(200).json({
                score: totalCorrect,
                total: totalQuestions,
                incorrect: incorrectQs,
                attemptsLeft: attemptsLeft
            });
        }

        // Mark Comments Read
        if (action === "markRead") {
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
 * THE SCIENCE GARAGE: STUDENT ACTIVITY TRIGGER (v3.3)
 * Dynamic Rubric Matching | In-Memory MC | Gemini 3.8 Flash Batch Short-Answer
 */
exports.onStudentActivityTrigger = onValueUpdated({
    ref: "/teacherGradebook/{periodFolder}/{assignmentFolder}/{studentUid}",
    secrets: [GEMINI_API_KEY],
    memory: "512MiB",
    timeoutSeconds: 60
}, async (event) => {
    const afterData = event.data.after.val();
    if (!afterData || afterData.needsGrading !== true) return null;

    const { assignmentFolder } = event.params;

    try {
        // 1. Resolve master rubric using smart matching
        const rubricData = await getAssignmentRubric(assignmentFolder);
        if (!rubricData) {
            console.error(`Rubric could not be resolved for folder: ${assignmentFolder}`);
            return event.data.after.ref.update({ needsGrading: false });
        }

        const questionsRubric = rubricData.questions || rubricData.keys || rubricData || {};
        
        let totalCorrect = 0;
        let totalGradedCount = 0;
        const updates = {};
        const shortAnswerQueue = [];

        // 2. Separate Multiple Choice from Short Answer
        Object.keys(questionsRubric).forEach(qKey => {
            const cleanId = String(qKey).replace(/^q/, '');
            const rule = questionsRubric[qKey];
            const studentEntry = afterData[`q${cleanId}`] || {};
            const studentVal = studentEntry.selection;

            totalGradedCount++;

            if (typeof rule === 'object' && rule.type === 'short-answer') {
                shortAnswerQueue.push({
                    qId: cleanId,
                    questionText: rule.text || "",
                    studentAnswer: studentVal || "[No response provided]",
                    criteria: rule.criteria || rule.rubric || "Award 1 point for a chemically sound, accurate explanation."
                });
            } else {
                const correctVal = (typeof rule === 'object') ? rule.answer : rule;
                const isCorrect = (studentVal !== undefined && studentVal !== null && studentVal == correctVal);
                
                updates[`q${cleanId}/isCorrect`] = isCorrect;
                updates[`q${cleanId}/score`] = isCorrect ? 1 : 0;
                if (isCorrect) totalCorrect++;
            }
        });

        // 3. Batch Process Short Answers via Gemini 3.8 Flash
        if (shortAnswerQueue.length > 0) {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
            const model = genAI.getGenerativeModel({
                model: "gemini-3.8-flash",
                generationConfig: {
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json",
                    thinkingConfig: {
                        thinkingLevel: "medium"
                    }
                },
                systemInstruction: "You are an objective high school science teacher grading short-answer assessments. Evaluate each student response against the question's criteria. For each question, output: 1) isCorrect (boolean), 2) score (1 or 0), and 3) feedback (if incorrect: a brief 1-2 sentence guiding Socratic hint that leads them toward the correct concept without giving away the direct answer; if correct: a short encouraging confirmation)."
            });

            const prompt = `Grade the following student responses against their respective rubrics:\n\n${JSON.stringify(shortAnswerQueue, null, 2)}\n\nRespond ONLY with a valid JSON array of objects with the following schema:
[
  {
    "qId": "string",
    "isCorrect": boolean,
    "score": number,
    "feedback": "string"
  }
]`;

            const aiResult = await model.generateContent(prompt);
            const aiText = aiResult.response.text();
            const cleanedJson = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const gradedBatch = JSON.parse(cleanedJson);

            gradedBatch.forEach(item => {
                updates[`q${item.qId}/isCorrect`] = item.isCorrect;
                updates[`q${item.qId}/score`] = item.score;
                updates[`q${item.qId}/feedback`] = item.feedback;
                if (item.isCorrect) totalCorrect++;
            });
        }

        // 4. Calculate Threshold and Update Gradebook
        const threshold = Math.ceil(totalGradedCount * 0.8);
        const isUnlocked = totalCorrect >= threshold;
        const currentAttempts = afterData.attemptsLeft !== undefined ? afterData.attemptsLeft : 3;

        const finalUpdates = {
            ...updates,
            score: totalCorrect,
            total: totalGradedCount,
            unlocked: isUnlocked,
            attemptsLeft: currentAttempts,
            needsGrading: false,
            lastGraded: Date.now()
        };

        await event.data.after.ref.update(finalUpdates);
        return null;

    } catch (error) {
        console.error("TRIGGER GRADING ERROR:", error);
        return event.data.after.ref.update({ 
            needsGrading: false, 
            gradingError: true 
        });
    }
}); 