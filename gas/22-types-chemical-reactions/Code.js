/**
 * MISSION: Standardized Assignment Portal - MASTER SECURE TEMPLATE
 */

// === QUICK CONFIGURATION ========================================
const ASSIGNMENT_CODE = "CH_U07_A22_G";
const ASSIGNMENT_TITLE = "Types of Chemical Reactions";
const SHEET_ID = "1NT5wVymwWpW5-NPu1cra0LH8byk7LLnVd4FKU1pSTcs"; 
const TAB_GID = 598574737;
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "Identify the type of reaction below: 2H₂ + O₂ → 2H₂O", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 2, type: "mc", text: "Identify the type of reaction below: 2H₂O → 2H₂ + O₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 3, type: "mc", text: "Identify the type of reaction below: Zn + H₂SO₄ → ZnSO₄ + H₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 4, type: "mc", text: "Identify the type of reaction below: 2CO + O₂ → 2CO₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 5, type: "mc", text: "Identify the type of reaction below: 2HgO → 2Hg + O₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 6, type: "mc", text: "Identify the type of reaction below: 2KBr + Cl₂ → 2KCl + Br₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 7, type: "mc", text: "Identify the type of reaction below: CaO + H₂O → Ca(OH)₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 8, type: "mc", text: "Identify the type of reaction below: AgNO₃ + NaCl → AgCl + NaNO₃", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 9, type: "mc", text: "Identify the type of reaction below: H₂O₂ → 2H₂O + O₂", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 10, type: "mc", text: "Identify the type of reaction below: Ca(OH)₂ + H₂SO₄ → CaSO₄ + 2H₂O", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 11, type: "mc", text: "Identify the type of reaction below: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O", options: ["Synthesis (combination)", "Decomposition", "Single Replacement", "Double Replacement", "Combustion"] },
  { id: 12, type: "fr", text: "Write and balance the equation for the synthesis reaction between hydrogen and bromine forming hydrogen bromide." },
  { id: 13, type: "fr", text: "Write and balance the equation for the synthesis reaction between fluorine and argon forming argon trifluoride." },
  { id: 14, type: "fr", text: "Write and balance the equation for the decomposition of water into hydrogen and oxygen." },
  { id: 15, type: "fr", text: "Write and balance the equation for the decomposition of aluminum oxide into aluminum and oxygen." }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
const ANSWER_KEY = { 
  1: 0, 2: 1, 3: 2, 4: 0, 5: 1, 6: 2, 7: 0, 8: 3, 9: 1, 10: 3, 11: 4,
  12: "H₂ + Br₂ → 2HBr",
  13: "3F₂ + 2Ar → 2ArF₃",
  14: "2H₂O → 2H₂ + O₂",
  15: "2Al₂O₃ → 4Al + 3O₂"
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

// 🚀 ORDER-AGNOSTIC EQUATION EVALUATOR
function checkFRQ(studentVal, keyVal) {
  let s = String(studentVal || '').replace(/\s+/g, '');
  let k = String(keyVal || '').replace(/\s+/g, '');
  
  if (!s.includes('→') || !k.includes('→')) return s === k;
  
  let sSides = s.split('→');
  let kSides = k.split('→');
  
  let sReact = sSides[0].split('+').sort().join('+');
  let sProd = (sSides[1] || "").split('+').sort().join('+');
  let kReact = kSides[0].split('+').sort().join('+');
  let kProd = (kSides[1] || "").split('+').sort().join('+');
  
  return sReact === kReact && sProd === kProd;
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
      if (qData.type === 'mc') {
         if (qData.selection == ANSWER_KEY[i]) correctCount++;
      } else if (qData.type === 'fr') {
         if (checkFRQ(qData.selection, ANSWER_KEY[i])) correctCount++;
      }
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