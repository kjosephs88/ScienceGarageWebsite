/**
 * MISSION: Standardized Assignment Portal - MASTER SECURE TEMPLATE
 */

// === QUICK CONFIGURATION ========================================
const ASSIGNMENT_CODE = "CH_U07_A18_G";
const ASSIGNMENT_TITLE = "Mole Ratios and Review";
const SHEET_ID = "1NT5wVymwWpW5-NPu1cra0LH8byk7LLnVd4FKU1pSTcs"; 
const TAB_GID = 598574737;
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

// ---> NEW: Map period numbers to their exact Classroom names <---
const CLASS_MAPPING = {
  "6": "25-26 P6 Q4 Chemistry",
  "8": "25-26 P8 Q4 Chemistry"
};

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "Given the balanced equation representing a reaction: $$4Al(s) + 3O_{2}(g) \\rightarrow 2Al_{2}O_{3}(s)$$ How many moles of \\(Al(s)\\) react completely with 4.50 moles of \\(O_{2}(g)\\) to produce 3.00 moles of \\(Al_{2}O_{3}(s)\\)?", options: ["1.50 mol", "2.00 mol", "6.00 mol", "4.00 mol"] },
  { id: 2, type: "mc", text: "Given the balanced equation representing the reaction between propane and oxygen: $$C_{3}H_{8} + 5O_{2} \\rightarrow 3CO_{2} + 4H_{2}O$$ According to this equation, which ratio of oxygen to propane is correct?", options: ["\\( \\frac{5 \\text{ grams } O_{2}}{1 \\text{ gram } C_{3}H_{8}} \\)", "\\( \\frac{5 \\text{ moles } O_{2}}{1 \\text{ mole } C_{3}H_{8}} \\)", "\\( \\frac{10 \\text{ grams } O_{2}}{11 \\text{ grams } C_{3}H_{8}} \\)", "\\( \\frac{10 \\text{ moles } O_{2}}{11 \\text{ moles } C_{3}H_{8}} \\)"] },
  { id: 3, type: "mc", text: "Which ion in the ground state has the same electron configuration as an atom of neon in the ground state?", options: ["Ca\\(^{2+}\\)", "Cl\\(^-\\)", "Li\\(^+\\)", "O\\(^{2-}\\)"] },
  { id: 4, type: "mc", text: "Given the balanced equation representing a reaction: $$2NO + O_{2} \\rightarrow 2NO_{2} + \\text{energy}$$ The mole ratio of NO to \\(NO_{2}\\) is:", options: ["1 to 1", "2 to 1", "3 to 2", "5 to 2"] },
  { id: 5, type: "mc", text: "Given the reaction: $$2KClO_{3}(s) \\rightarrow 2KCl(s) + 3O_{2}(g)$$ How many moles of \\(KClO_{3}\\) must completely react to produce 6 moles of \\(O_{2}\\)?", options: ["1 mole", "2 moles", "6 moles", "4 moles"] },
  { id: 6, type: "mc", text: "Given the balanced equation representing a reaction: $$2CO(g) + O_{2}(g) \\rightarrow 2CO_{2}(g)$$ What is the mole ratio of \\(CO(g)\\) to \\(CO_{2}(g)\\) in this reaction?", options: ["1:1", "1:2", "2:1", "3:2"] },
  { id: 7, type: "mc", text: "Given the equation: $$2C_{2}H_{2}(g) + 5O_{2}(g) \\rightarrow 4CO_{2}(g) + 2H_{2}O(g)$$ How many moles of oxygen are required to react completely with 1.0 mole of \\(C_{2}H_{2}\\)?", options: ["2.5", "2.0", "5.0", "10"] },
  { id: 8, type: "mc", text: "Given the balanced equation for the reaction of butane and oxygen: $$2C_{4}H_{10} + 13O_{2} \\rightarrow 8CO_{2} + 10H_{2}O + \\text{energy}$$ How many moles of carbon dioxide are produced when 5.0 moles of butane react completely?", options: ["5.0 mol", "10. mol", "20. mol", "40. mol"] },
  { id: 9, type: "mc", text: "A solution contains 25 grams of \\(KNO_{3}\\) dissolved in 200. grams of \\(H_{2}O\\). Which numerical setup can be used to calculate the percent by mass of \\(KNO_{3}\\) in this solution?", options: ["\\( \\frac{25 \\text{ g}}{175 \\text{ g}} \\times 100 \\)", "\\( \\frac{25 \\text{ g}}{200. \\text{ g}} \\times 100 \\)", "\\( \\frac{25 \\text{ g}}{225 \\text{ g}} \\times 100 \\)", "\\( \\frac{200. \\text{ g}}{225 \\text{ g}} \\times 100 \\)"] },
  { id: 10, type: "mc", text: "What is the number of moles of \\(CO_{2}\\) in a 220.-gram sample of \\(CO_{2}\\) (molar mass = 44 g/mol)?", options: ["0.20 mol", "5.0 mol", "15 mol", "44 mol"] },
  { id: 11, type: "mc", text: "Given the balanced equation representing a reaction: $$Al_{2}(SO_{4})_{3} + 6NaOH \\rightarrow 2Al(OH)_{3} + 3Na_{2}SO_{4}$$ The mole ratio of NaOH to \\(Al(OH)_{3}\\) is:", options: ["1:1", "1:3", "3:1", "3:7"] },
  { id: 12, type: "mc", text: "A sample of a compound contains 65.4 grams of zinc, 12.0 grams of carbon, and 48.0 grams of oxygen. What is the mole ratio of zinc to carbon to oxygen in this compound?", options: ["1:1:2", "1:1:3", "1:4:6", "5:1:4"] },
  { id: 13, type: "mc", text: "Given the reaction: $$N_{2}(g) + 3H_{2}(g) \\rightleftharpoons 2NH_{3}(g)$$ What is the mole-to-mole ratio between nitrogen gas and hydrogen gas?", options: ["1:2", "1:3", "2:2", "2:3"] },
  { id: 14, type: "mc", text: "Given the balanced equation representing the reaction between methane and oxygen: $$CH_{4} + 2O_{2} \\rightarrow CO_{2} + 2H_{2}O$$ According to this equation, what is the mole ratio of oxygen to methane?", options: ["\\( \\frac{1 \\text{ gram } O_{2}}{2 \\text{ grams } CH_{4}} \\)", "\\( \\frac{1 \\text{ mole } O_{2}}{2 \\text{ moles } CH_{4}} \\)", "\\( \\frac{2 \\text{ grams } O_{2}}{1 \\text{ gram } CH_{4}} \\)", "\\( \\frac{2 \\text{ moles } O_{2}}{1 \\text{ mole } CH_{4}} \\)"] },
  { id: 15, type: "mc", text: "Given the balanced equation representing a reaction: $$F_{2}(g) + H_{2}(g) \\rightarrow 2HF(g)$$ What is the mole ratio of \\(H_{2}(g)\\) to \\(HF(g)\\) in this reaction?", options: ["1:1", "1:2", "2:1", "2:3"] }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
const ANSWER_KEY = { 
  1: 2, 2: 1, 3: 3, 4: 0, 5: 3, 6: 0, 7: 0, 
  8: 2, 9: 2, 10: 1, 11: 2, 12: 1, 13: 1, 14: 3, 15: 1
};
const DB_URL = "https://scigarage-default-rtdb.firebaseio.com/"; 

function getCachedRosterData() {
  const cache = CacheService.getScriptCache();
  const cacheKey = "ROSTER_" + ASSIGNMENT_CODE; 
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) { cache.remove(cacheKey); }
  }
  
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = ss.getSheets();
  let sheet = null;
  for (let i = 0; i < sheets.length; i++) { if (sheets[i].getSheetId() === TAB_GID) sheet = sheets[i]; }
  if (!sheet) throw new Error("Roster tab not found.");

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const data = sheet.getRange(1, 1, lastRow, 8).getValues();
  const roster = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      roster.push({
        row: i + 1, 
        email: data[i][0].toString().toLowerCase().trim(),
        period: data[i][1], name: data[i][2], uid: data[i][7]
      });
    }
  }
  cache.put(cacheKey, JSON.stringify(roster), 21600); 
  return roster;
}

function getStudentId() {
  const email = Session.getActiveUser().getEmail().toLowerCase().trim();
  const roster = getCachedRosterData();
  const student = roster.find(s => s.email === email);
  if (!student) throw new Error("Email [" + email + "] not on roster.");
  
  let studentUID = student.uid;
  if (!studentUID || studentUID === "") {
    studentUID = Utilities.getUuid();
    SpreadsheetApp.openById(SHEET_ID).getSheets().find(s => s.getSheetId() === TAB_GID).getRange(student.row, 8).setValue(studentUID); 
    CacheService.getScriptCache().remove("ROSTER_" + ASSIGNMENT_CODE);
  }
  return studentUID;
}

function doGet(e) {
  const userEmail = Session.getActiveUser().getEmail().toLowerCase().trim();
  if (e.parameter.page === 'dashboard') {
    if (!ADMIN_EMAILS.includes(userEmail)) return HtmlService.createHtmlOutput("Unauthorized.");
    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    template.ANSWER_KEY = JSON.stringify(ANSWER_KEY); 
    template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
    template.FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
    return template.evaluate().setTitle(`Dashboard: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  let template = HtmlService.createTemplateFromFile('Index');
  template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
  template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
  template.HEADER_TYPE = ASSIGNMENT_CODE.endsWith("P") ? "Practice" : "Graded";
  
  let headerSub = `Assignment: ${ASSIGNMENT_CODE}`; 
  try {
    const parts = ASSIGNMENT_CODE.split('_'); 
    if (parts.length >= 3) {
      const unitNum = parts[1].replace(/\D/g, ''); 
      const assignNum = parts[2].replace(/\D/g, ''); 
      headerSub = `Unit ${unitNum} - Assignment #${assignNum}`;
    }
  } catch(err) {}
  template.HEADER_SUB = headerSub;
  
  template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
  try { 
    template.STUDENT_UUID = getStudentId();
  } catch (err) { 
    template.STUDENT_UUID = "ERROR_" + err.message; 
  }
  
  return template.evaluate().setTitle(`Assignment: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function gradeSubmission(uid) {
  const secret = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
  const url = `${DB_URL}classroomAssignments/${ASSIGNMENT_CODE}/${uid}.json?auth=${secret}`;
  const response = UrlFetchApp.fetch(url);
  const studentData = JSON.parse(response.getContentText()) || {};

  let correctCount = 0;
  const threshold = Math.ceil(TOTAL_QUESTIONS * 0.8);
  
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const qData = studentData[`q${i}`];
    if (qData && qData.selection !== undefined && qData.selection !== null && qData.selection !== "") {
      if (qData.selection == ANSWER_KEY[i]) correctCount++;
    }
  }

  let statusPayload = { submitted: true };
  if (correctCount >= threshold) { 
      statusPayload.unlocked = true; 
      statusPayload.answerKey = ANSWER_KEY;
  }

  UrlFetchApp.fetch(url, { method: "PATCH", contentType: "application/json", payload: JSON.stringify(statusPayload) });
  
  // ---> NEW: Trigger the fan-out to lock in the final score and submitted status!
  autoSyncGrade(uid);

  return { 
      status: statusPayload.unlocked ? 'unlocked' : 'fail', 
      correctCount: correctCount, 
      total: TOTAL_QUESTIONS, 
      threshold: threshold, 
      answerKey: statusPayload.unlocked ? ANSWER_KEY : null 
  };
}

function getDashboardRoster() { return getCachedRosterData().filter(s => s.uid !== ""); }

function forceClearCache() {
  CacheService.getScriptCache().remove("ROSTER_" + ASSIGNMENT_CODE);
  Logger.log("Cache cleared successfully for: " + ASSIGNMENT_CODE);
}

// ---> FIXED: 3-Way Surgical Sync bypassing the Root Wipe Bug <---
function autoSyncGrade(uid) {
  const secret = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
  
  // 1. Identify the student and their class period
  const roster = getCachedRosterData();
  const student = roster.find(s => s.uid === uid);
  if (!student) return;
  const className = CLASS_MAPPING[student.period.toString().trim()];

  // 2. Fetch the student's current answers
  const url = `${DB_URL}classroomAssignments/${ASSIGNMENT_CODE}/${uid}.json?auth=${secret}`;
  const res = UrlFetchApp.fetch(url);
  const studentData = JSON.parse(res.getContentText()) || {};

  // 3. Calculate the raw numerical score quietly in the background
  let correctCount = 0;
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const q = studentData[`q${i}`];
    if (q && q.selection !== undefined && q.selection !== null && q.selection !== "") {
      if (q.selection == ANSWER_KEY[i]) correctCount++;
    }
  }

  const timestamp = Date.now();
  const statusText = studentData.submitted ? "submitted" : "in_progress";

  // 4. Fire 3 SEPARATE surgical PATCH requests to safely update nodes without root-wiping

  // Update A: Granular Tracker
  UrlFetchApp.fetch(`${DB_URL}classroomAssignments/${ASSIGNMENT_CODE}/${uid}.json?auth=${secret}`, {
    method: "PATCH",
    contentType: "application/json",
    payload: JSON.stringify({ score: correctCount, lastUpdated: timestamp })
  });

  // Update B: Teacher Gradebook
  if (className) {
    UrlFetchApp.fetch(`${DB_URL}teacherGradebook/${className}/${ASSIGNMENT_CODE}/${uid}.json?auth=${secret}`, {
      method: "PATCH",
      contentType: "application/json",
      payload: JSON.stringify({ score: correctCount, status: statusText, lastUpdated: timestamp })
    });
  }

  // Update C: Student Report Cards (Gated at 80% Mastery)
  const threshold = Math.ceil(TOTAL_QUESTIONS * 0.8);
  if (correctCount >= threshold) {
    UrlFetchApp.fetch(`${DB_URL}StudentReportCards/${uid}/${ASSIGNMENT_CODE}.json?auth=${secret}`, {
      method: "PATCH",
      contentType: "application/json",
      payload: JSON.stringify({ score: correctCount, _exists: true })
    });
  }
}