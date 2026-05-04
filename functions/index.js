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
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

// Access the API Key from Google Cloud Secret Manager
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.universalAiGrader = onValueUpdated({
    // Monitors submissions across all period folders and student UIDs
    ref: "/teacherGradebook/{periodFolder}/{assignmentFolder}/{studentUid}",
    secrets: [GEMINI_API_KEY],
    memory: "512MiB"
}, async (event) => {

    const afterData = event.data.after.val();

    // 1. EXIT CHECK: Proceed only if grading is requested
    if (!afterData || afterData.needsGrading !== true) return null;

    const { assignmentFolder, studentUid } = event.params;
    const apiKey = GEMINI_API_KEY.value();
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log(`Grading Session: ${assignmentFolder} for ${studentUid}`);

        // 2. RUBRIC RETRIEVAL
        let rubricSnap = await admin.database().ref(`/rubrics/${assignmentFolder}`).once('value');
        let rubric = rubricSnap.val();

        // Fallback for folders containing Google Classroom ID suffixes
        if (!rubric && assignmentFolder.includes('_')) {
            const assignmentCode = assignmentFolder.split('_').slice(0, -1).join('_');
            rubricSnap = await admin.database().ref(`/rubrics/${assignmentCode}`).once('value');
            rubric = rubricSnap.val();
        }

        if (!rubric) throw new Error(`Rubric missing for: ${assignmentFolder}`);

        // 3. MODEL CONFIGURATION
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1
            }
        });

        // 4. THE SYSTEM PROMPT
        const systemPrompt = `
            You are an expert Science Teacher grading a lab: ${rubric.assignmentTitle}.
            
            RUBRIC_DATA: ${JSON.stringify(rubric)}
            STUDENT_SUBMISSION: ${JSON.stringify(afterData)}

            STRICT GRADING RULES:
            1. GRANULAR SCORES: You MUST provide a "score" (0 or 1) for EVERY unique key in the STUDENT_SUBMISSION starting with 'q' (e.g., q10_sol1_moles, q13_sol1_vol, q16_sm_pos1). This is required for visual cell tinting.
            2. RANKING LOGIC: In rankings (Q16-Q20), equalities are interchangeable. "Sol 1 = Sol 2" is identical to "Sol 2 = Sol 1".
            3. ECF (Error Carried Forward): If an earlier calculation is wrong, but the current math is correct based on that wrong value, give full credit for the math.
            
            5. NO SPOILERS (PEDAGOGICAL GUARDRAIL): 
               - If a student is wrong, identify THAT they are wrong, but DO NOT provide the correct answer or the scientific explanation in the feedback.
               - Example: Instead of saying "Molarity is the measure of concentration, not volume," say "Your identification is correct, but your reasoning needs to be based on the definition of concentration."
               - Goal: Point out the 'gap' in their logic without filling it for them. Lead them to look back at their notes.

            6. FEEDBACK ROUTING: 
               - Sub-parts (e.g., q10_sol1_moles) MUST NOT receive text feedback.
               - All necessary feedback for a group of questions must be combined and placed in the feedback string for the ROOT prefix only (e.g., "q1", "q10", "q16").

            OUTPUT FORMAT:
            {
              "overallScore": number,
              "overallFeedback": "string",
              "parts": {
                "q1": {"score": 1, "feedback": ""},
                "q10_sol1_moles": {"score": 0, "feedback": ""},
                "q10": {"score": 0.5, "feedback": "Your calculation for solution 1 is incorrect."}
              }
            }
        `;

        // 5. AI EXECUTION & SANITIZATION
        const result = await model.generateContent(systemPrompt);
        const cleanJson = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const gradingResults = JSON.parse(cleanJson);

        // 6. DATABASE UPDATES PREPARATION
        const updates = {};
        updates['aiFeedback'] = gradingResults.overallFeedback;
        updates['totalScore'] = gradingResults.overallScore;
        updates['needsGrading'] = false;
        updates['isLocked'] = true;      // Ensure the student remains locked out
        updates['lastGraded'] = Date.now();
        updates['aiError'] = null;

        // Loop through results to map scores to cells and feedback to main nodes
        for (let partId in gradingResults.parts) {
            const data = gradingResults.parts[partId];

            // Apply the granular score for cell/input tinting
            updates[`${partId}/score`] = data.score;

            // Only apply feedback if it's attached to a main prefix or provided by AI
            // This ensures sub-nodes (like q10_sol1_moles) don't get a "teacherComment" node
            const prefix = partId.split('_')[0];
            if (data.feedback && data.feedback !== "") {
                updates[`${prefix}/teacherComment`] = data.feedback;
                updates[`${prefix}/commentUnread`] = true;
            }
        }

        // 7. ATOMIC COMMIT
        return event.data.after.ref.update(updates);

    } catch (error) {
        console.error("CRITICAL GRADING ERROR:", error);
        return event.data.after.ref.update({
            needsGrading: false,
            aiError: `Grader Error: ${error.message}`
        });
    }
});