// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A20_P";
const ASSIGNMENT_TITLE = "Reactions Involving Acids and Bases";

// 🖼️ IMAGE ASSETS
const IMAGE_URLS = {};

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "Which metal will release $ \\ce{H2(g)} $ when it reacts with HCl?", options: ["$ \\ce{Au(s)} $", "$ \\ce{Zn(s)} $", "$ \\ce{Hg(l)} $", "$ \\ce{Ag(s)} $"] },
  { id: 2, type: "mc", text: "Which type of reaction occurs when 50-mL quantities of 1 M $ \\ce{Ba(OH)2(aq)} $ and $ \\ce{H2SO4(aq)} $ are combined?", options: ["hydrolysis", "ionization", "hydrogenation", "neutralization"] },
  { id: 3, type: "mc", text: "Which compound reacts with an acid to produce water and a salt?", options: ["$ \\ce{CH3Cl} $", "$ \\ce{CH3COOH} $", "$ \\ce{KCl} $", "$ \\ce{KOH} $"] },
  { id: 4, type: "mc", text: "Which formula represents a salt?", options: ["$ \\ce{KOH} $", "$ \\ce{KCl} $", "$ \\ce{CH3OH} $", "$ \\ce{CH3COOH} $"] },
  { id: 5, type: "mc", text: "Consult the reference tables to determine if a reaction will occur between calcium and hydrochloric acid.", options: ["No", "Yes"] },
  { id: 6, type: "mc", text: "Consult the reference tables to determine if a reaction will occur between lead and carbonic acid.", options: ["No", "Yes"] },
  { id: 7, type: "text", text: "Write the balanced equation for the neutralization reaction between sulfuric acid and magnesium hydroxide in the space provided below." },
  { id: 8, type: "text", text: "Write the balanced equation for the neutralization reaction between phosphoric acid and calcium hydroxide in the space provided below." }
];
// ==========================================
// CORE AUTH & ROUTING
// ==========================================

function doGet(e) {
  const userEmail = Session.getActiveUser().getEmail().toLowerCase().trim();
  let headerSub = `Assignment: ${ASSIGNMENT_CODE}`; 
  try {
    const parts = ASSIGNMENT_CODE.split('_'); 
    if (parts.length >= 3) {
      const unitNum = parts[1].replace(/\D/g, ''); 
      const assignNum = parts[2].replace(/\D/g, ''); 
      headerSub = `Unit ${unitNum} - Assignment #${assignNum}`;
    }
  } catch(err) {}

  if (e.parameter.page === 'dashboard') {
    if (!ADMIN_EMAILS.includes(userEmail)) return HtmlService.createHtmlOutput("<h2 style='color:red;padding:20px;'>Access Denied.</h2>");
    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
    template.FIREBASE_SECRET = FIREBASE_SECRET;
    template.NAME_MAP = JSON.stringify(generateNameMap());
    template.HEADER_TYPE = ASSIGNMENT_CODE.endsWith("P") ? "Practice" : "Graded";
    template.HEADER_SUB = headerSub;
    return template.evaluate().setTitle(`Dashboard: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  let template = HtmlService.createTemplateFromFile('Index');
  template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
  template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
  template.HEADER_TYPE = ASSIGNMENT_CODE.endsWith("P") ? "Practice" : "Graded";
  template.HEADER_SUB = headerSub;
  template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
  // Student UUID is not needed in the template for the new Proxy architecture
  template.STUDENT_UUID = "SESSION_PENDING";
  return template.evaluate().setTitle(`Assignment: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getStudentInitialData() {
  const email = Session.getActiveUser().getEmail();
  const saltedHash = getSaltedStudentHash(email);
  const rosterData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/studentRoster/${saltedHash}.json?auth=${FIREBASE_SECRET}`).getContentText());
  if (!rosterData) throw new Error("Student not found in any class roster.");
  
  const allClassFolders = Object.keys(rosterData);
  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0];
  const targetFolder = allClassFolders.find(folder => folder.startsWith(subjectPrefix));
  if (!targetFolder) throw new Error(`Enrolled class prefix error.`);

  const parts = targetFolder.split('_');
  const classroomId = parts[parts.length - 1];
  const provisionalKey = `${ASSIGNMENT_CODE}_${classroomId}`;
  let actualAssignmentKey = provisionalKey;

  try {
    const tgUrl = `${FIREBASE_DB_URL}/teacherGradebook/${targetFolder}.json?auth=${FIREBASE_SECRET}&shallow=true`;
    const existingKeys = JSON.parse(UrlFetchApp.fetch(tgUrl).getContentText()) || {};
    const officialKey = Object.keys(existingKeys).find(k => k.startsWith(ASSIGNMENT_CODE) && k !== provisionalKey);
    if (officialKey) actualAssignmentKey = officialKey;
  } catch (e) {}

  const basePathTG = `teacherGradebook/${targetFolder}/${actualAssignmentKey}/${saltedHash}`;
  
  // 🛡️ SECURE SESSION GENERATION
  const sessionToken = "ST-" + Math.random().toString(36).substring(2, 15).toUpperCase();
  const sessionPayload = {
      realHash: saltedHash,
      periodFolder: targetFolder,
      assignmentFolder: actualAssignmentKey,
      expires: Date.now() + (1 * 60 * 60 * 1000) // 1 Hour
  };
  
  // Save mapping for the Proxy
  UrlFetchApp.fetch(`${FIREBASE_DB_URL}/ActiveSessions/${sessionToken}.json?auth=${FIREBASE_SECRET}`, {
      method: "PUT",
      payload: JSON.stringify(sessionPayload)
  });

  // Tag the student node for Mirroring
  UrlFetchApp.fetch(`${FIREBASE_DB_URL}/${basePathTG}/currentSession.json?auth=${FIREBASE_SECRET}`, {
      method: "PUT",
      payload: JSON.stringify(sessionToken)
  });

  let savedState = {};

  try {
    const stateUrl = `${FIREBASE_DB_URL}/${basePathTG}.json?auth=${FIREBASE_SECRET}`;
    savedState = JSON.parse(UrlFetchApp.fetch(stateUrl).getContentText()) || {};
  } catch (e) {}

  return { 
    sessionToken: sessionToken, 
    livePath: `liveUpdates/${sessionToken}`, 
    savedState: savedState 
  };
}

function refreshSessionToken() {
    return getStudentInitialData();
}


// ==========================================
// HELPERS
// ==========================================

function getDashboardRoster() {
  const url = `${FIREBASE_DB_URL}/studentRoster.json?auth=${FIREBASE_SECRET}`;
  const nameMap = generateNameMap(); 
  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0]; 
  try {
    const data = JSON.parse(UrlFetchApp.fetch(url).getContentText()) || {};
    let roster = [];
    for (let hash in data) {
      for (let className in data[hash]) {
        if (className.startsWith(subjectPrefix)) {
          roster.push({ uid: hash, name: nameMap[hash] || "Unknown Student", period: className });
        }
      }
    }
    return roster;
  } catch(e) { return []; }
}

function generateNameMap() {
  try {
    const students = JSON.parse(HtmlService.createHtmlOutputFromFile('RosterData').getContent());
    let map = {};
    students.forEach(student => { map[getSaltedStudentHash(student.email)] = student.name; });
    return map;
  } catch (e) { return {}; }
}

function getSaltedStudentHash(email) {
  const saltedEmail = EMAIL_SALT + email.toString().toLowerCase().trim();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedEmail);
  return digest.map(byte => ('0' + (byte < 0 ? byte + 256 : byte).toString(16)).slice(-2)).join('');
}



/**
 * Pushes the rubric for the "Properties of Acids and Bases" assignment.
 * Assignment Code: CH_U08_A15_G
 */
function pushRubricToFirebase() {
  const assignmentCode = "CH_U08_A20_P";
  
  // Rubric data based on the assignment questions
  // Note: Question 10 is an FRQ and is excluded from numeric keys
  const rubricData = {
    "1": 1,
    "2": 3,
    "3": 3,
    "4": 1,
    "5": 1,
    "6": 1,
    "maxPoints": 8,
    "totalQuestions": 8
  };

  const options = {
    "method": "patch",
    "contentType": "application/json",
    "payload": JSON.stringify(rubricData),
    "muteHttpExceptions": true
  };

  try {
    // Constructing the URL with the global variables
    const url = `${FIREBASE_DB_URL}/rubrics/${assignmentCode}.json?auth=${FIREBASE_SECRET}`;
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      console.log(`Successfully updated rubric for: ${assignmentCode}`);
    } else {
      console.error(`Failed to push rubric. Response code: ${response.getResponseCode()}`);
      console.error(response.getContentText());
    }
  } catch (e) {
    console.error(`Network or Script Error: ${e.message}`);
  }
}

