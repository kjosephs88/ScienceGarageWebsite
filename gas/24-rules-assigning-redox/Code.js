/**
 * MISSION: Standardized Assignment Portal - MASTER SECURE TEMPLATE
 */

// === QUICK CONFIGURATION ========================================
const ASSIGNMENT_CODE = "CH_U07_A24_G";
const ASSIGNMENT_TITLE = "Rules for Assigning Oxidation Numbers (States)";
const SHEET_ID = "1NT5wVymwWpW5-NPu1cra0LH8byk7LLnVd4FKU1pSTcs"; 
const TAB_GID = 598574737;
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "What is the sum of the oxidation numbers in the compound CO₂?", options: ["0", "-2", "-4", "+4"] },
  { id: 2, type: "mc", text: "The oxidation number of nitrogen in N₂ is", options: ["+1", "0", "+3", "-3"] },
  { id: 3, type: "mc", text: "What is the oxidation number of Pt in K₂PtCl₆?", options: ["-2", "+2", "-4", "+4"] },
  { id: 4, type: "mc", text: "In which substance does phosphorus have a +3 oxidation state?", options: ["P₄O₁₀", "PCl₅", "Ca₃(PO₄)₂", "KH₂PO₃"] },
  { id: 5, type: "mc", text: "What is the oxidation number of sulfur in H₂SO₄?", options: ["0", "-2", "+6", "+4"] },
  { id: 6, type: "mc", text: "In which substance does sulfur have a negative oxidation number?", options: ["Na₂S", "CaSO₄", "S", "SO₂"] },
  { id: 7, type: "mc", text: "In which compound does hydrogen have an oxidation number of -1?", options: ["NH₃", "KH", "HCl", "H₂O"] },
  { id: 8, type: "mc", text: "The oxidation number of an uncombined Group 2 metal is", options: ["+1", "+2", "-2", "0"] },
  { id: 9, type: "mc", text: "Hydrogen has an oxidation number of", options: ["0 only", "+1 only", "-1 only", "0, +1, or -1"] },
  { id: 10, type: "mc", text: "What are the two oxidation states of nitrogen in the compound NH₄NO₃?", options: ["-3 and +5", "-3 and -5", "+3 and +5", "+3 and -5"] }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
const ANSWER_KEY = { 
  1: 0, 2: 1, 3: 3, 4: 3, 5: 2, 6: 0, 7: 1, 8: 3, 9: 3, 10: 0
};
const DB_URL = "https://scigarage-default-rtdb.firebaseio.com/"; 

// 🚀 DYNAMIC ROSTER ENGINE
function getCachedRosterData() {
  const cache = CacheService.getScriptCache();
  const cacheKey = "ROSTER_" + ASSIGNMENT_CODE; // Prevents assignment clashing
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
  cache.put(cacheKey, JSON.stringify(roster), 21600); // 6 hours
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
  return { 
      status: statusPayload.unlocked ? 'unlocked' : 'fail', 
      correctCount: correctCount, 
      total: TOTAL_QUESTIONS, 
      threshold: threshold, 
      answerKey: statusPayload.unlocked ? ANSWER_KEY : null 
  };
}

function getDashboardRoster() { return getCachedRosterData().filter(s => s.uid !== ""); }

// 🚀 MANUAL OVERRIDE TO CLEAR THIS ASSIGNMENT'S CACHE
function forceClearCache() {
  CacheService.getScriptCache().remove("ROSTER_" + ASSIGNMENT_CODE);
  Logger.log("Cache cleared successfully for: " + ASSIGNMENT_CODE);
}