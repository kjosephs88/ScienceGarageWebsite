/**
 * MISSION: Lab 10 - Blood-Spatter Analysis
 * ASSIGNMENT: FS_U05_A06
 */

const ASSIGNMENT_CODE = "FS_U05_A06";
const ASSIGNMENT_TITLE = "Lab 10: Blood-Spatter Analysis";
const DB_URL = "https://scigarage-default-rtdb.firebaseio.com/";
const SHEET_ID = "1idQ_iJ-JaqKSEP0wdsgHz1n625AOhVShFHXhVyR1e90";
const TAB_GID = 1951332896;
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const QUESTIONS_ARRAY = [
  { id: "q_t1", title: "Table 1 (Trial Data)", inputs: ["h0", "t1_0_1", "t1_0_2", "t1_0_3", "h1", "t1_1_1", "t1_1_2", "t1_1_3", "h2", "t1_2_1", "t1_2_2", "t1_2_3", "h3", "t1_3_1", "t1_3_2", "t1_3_3", "h4", "t1_4_1", "t1_4_2", "t1_4_3", "h5", "t1_5_1", "t1_5_2", "t1_5_3"] },
  { id: "q_t2", title: "Table 2 (Averages)", inputs: ["t2_0", "t2_1", "t2_2", "t2_3", "t2_4", "t2_5"] },
  { id: "q1", title: "Q1. Height vs Diameter", inputs: ["ans_q1"] },
  { id: "q2", title: "Q2. T/F & Support", inputs: ["ans_q2_tf", "ans_q2_sup"] },
  { id: "q3", title: "Q3. Venn Diagram (25 vs 250)", inputs: ["ans_q3_25", "ans_q3_both", "ans_q3_250"] },
  { id: "q4", title: "Q4. Height vs Satellites", inputs: ["ans_q4_sup"] },
  { id: "q5", title: "Q5. Classmates & Drop Errors", inputs: ["ans_q5a", "ans_q5b"] },
  { id: "q6", title: "Q6. Roof Drop Analysis", inputs: ["ans_q6_sup"] },
  { id: "q7", title: "Q7. Terminal Velocity", inputs: ["ans_q7a", "ans_q7b", "ans_q7c", "ans_q7d", "ans_q7e"] }
];

function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === TAB_GID) return sheets[i];
  }
  throw new Error("Could not find the roster tab.");
}

function getStudentId() {
  const email = Session.getActiveUser().getEmail();
  if (!email || email === "") throw new Error("Could not detect email. Please log in.");
  const cleanEmail = email.toLowerCase().trim();
  const cache = CacheService.getScriptCache();
  const cachedRoster = cache.get("CLASS_ROSTER");

  if (cachedRoster) {
    const rosterMap = JSON.parse(cachedRoster);
    if (rosterMap[cleanEmail] && rosterMap[cleanEmail] !== "") return rosterMap[cleanEmail];
  }

  const sheet = getTargetSheet();
  const data = sheet.getDataRange().getValues(); 
  let rowIndex = -1;
  let newRosterMap = {};
  
  for (let i = 0; i < data.length; i++) {
    const rowEmail = data[i][0] ? data[i][0].toString().toLowerCase().trim() : "";
    if (rowEmail === cleanEmail) rowIndex = i;
    if (rowEmail !== "") newRosterMap[rowEmail] = data[i][7] ? data[i][7].toString().trim() : "";
  }
  
  if (rowIndex === -1) throw new Error("Your email (" + email + ") is not authorized.");
  let randomId = newRosterMap[cleanEmail];
  
  if (!randomId || randomId === "") {
    randomId = Utilities.getUuid();
    sheet.getRange(rowIndex + 1, 8).setValue(randomId);
    newRosterMap[cleanEmail] = randomId;
  }
  
  cache.put("CLASS_ROSTER", JSON.stringify(newRosterMap), 21600);
  return randomId;
}

function getStudentRoster() {
  const sheet = getTargetSheet();
  const data = sheet.getDataRange().getValues();
  const roster = {};
  
  for (let i = 1; i < data.length; i++) {
    const email = data[i][0] ? data[i][0].toString().trim() : "";
    const period = data[i][1] ? data[i][1].toString().trim() : "0";
    const name = data[i][2] ? data[i][2].toString().trim() : "";
    const uuid = data[i][7] ? data[i][7].toString().trim() : "";
    
    if (uuid && uuid !== "") {
      roster[uuid] = { name: name || email.split('@')[0], email: email, period: period };
    }
  }
  return roster;
}

function doGet(e) {
  const userEmail = Session.getActiveUser().getEmail().toLowerCase().trim();
  
  if (e.parameter.page === 'dashboard') {
    if (!ADMIN_EMAILS.includes(userEmail)) return HtmlService.createHtmlOutput("<h2 style='color:red;padding:20px;'>Access Denied.</h2>");
    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
    template.ROSTER_DATA = JSON.stringify(getStudentRoster());
    template.QUESTIONS_ARRAY = JSON.stringify(QUESTIONS_ARRAY);
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    return template.evaluate().setTitle(`Dashboard: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  let template = HtmlService.createTemplateFromFile('Index');
  template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
  template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
  template.QUESTIONS_ARRAY = JSON.stringify(QUESTIONS_ARRAY);
  try { template.STUDENT_UUID = getStudentId(); } catch (err) { template.STUDENT_UUID = "ERROR_" + err.message; }
  
  return template.evaluate().setTitle(ASSIGNMENT_TITLE).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}