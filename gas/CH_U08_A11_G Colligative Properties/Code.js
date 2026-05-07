// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A11_G";
const ASSIGNMENT_TITLE = "Colligative Properties";

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "The depression of the freezing point is dependent on", options: ["(1) the nature of the solute", "(2) the formula mass of the solute", "(3) the concentration of dissolved particles", "(4) hydrogen bonding"] },
  { id: 2, type: "mc", text: "Compared to a 1.0 M $\\ce{NaCl(aq)}$ solution at 1.0 atm, a 2.0 M $\\ce{NaCl(aq)}$ solution at 1.0 atm has", options: ["(1) a lower boiling point and a lower freezing point", "(2) a lower boiling point and higher freezing point", "(3) a higher boiling point and a lower freezing point", "(4) a higher boiling point and a higher freezing point"] },
  { id: 3, type: "mc", text: "A beaker contains a dilute sodium chloride solution at 1 atmosphere. What happens to the number of solute particles in the solution and the boiling point of the solution, as more sodium chloride is dissolved?", options: ["(1) The number of solute particles increases, and the boiling point increases.", "(2) The number of solute particles increases, and the boiling point decreases.", "(3) The number of solute particles decreases, and the boiling point increases.", "(4) The number of solute particles decreases, and the boiling point decreases."] },
  { id: 4, type: "mc", text: "At standard pressure, the boiling point of an unsaturated $\\ce{NaNO3(aq)}$ solution increases when", options: ["(1) the solution is diluted with water", "(2) some of the $\\ce{NaNO3(aq)}$ solution is removed", "(3) the solution is stirred", "(4) more $\\ce{NaNO3(s)}$ is dissolved in the solution"] },
  { id: 5, type: "text", text: "Identify the solute and the solvent used in this investigation." },
  { id: 6, type: "text", text: "Show a numerical setup for calculating the percent by mass of $\\ce{NaCl}$ in the solution in beaker 4." },
  { id: 7, type: "text", text: "Explain, in terms of ions, why the ability to conduct an electric current is greater for the solution in beaker 4 than for the solution in beaker 1." },
  { id: 8, type: "text", text: "State the relationship between the concentration of ions and the boiling point for these solutions." }
];

const MASTER_RUBRIC = {
  1: 2, // Particles
  2: 2, // Higher BP / Lower FP
  3: 0, // Particles increase, BP increases
  4: 3  // More solute dissolved
};


// ==========================================
// CORE AUTH & ROUTING
// ==========================================

function doGet(e) {
  const userEmail = Session.getActiveUser().getEmail().toLowerCase().trim();
  let headerSub = `Unit 08 - Assignment #11`; 

  if (e.parameter.page === 'dashboard') {
    if (!ADMIN_EMAILS.includes(userEmail)) return HtmlService.createHtmlOutput("<h2 style='color:red;padding:20px;'>Access Denied.</h2>");
    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
    template.FIREBASE_SECRET = FIREBASE_SECRET;
    template.NAME_MAP = JSON.stringify(generateNameMap());
    template.HEADER_TYPE = "Graded";
    template.HEADER_SUB = headerSub;
    return template.evaluate().setTitle(`Dashboard: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  let template = HtmlService.createTemplateFromFile('Index');
  template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
  template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
  template.HEADER_TYPE = "Graded";
  template.HEADER_SUB = headerSub;
  template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
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
  const classroomId = targetFolder.split('_').pop();
  const actualAssignmentKey = `${ASSIGNMENT_CODE}_${classroomId}`;

  const sessionToken = "ST-" + Math.random().toString(36).substring(2, 15).toUpperCase();
  const sessionPayload = { realHash: saltedHash, periodFolder: targetFolder, assignmentFolder: actualAssignmentKey, expires: Date.now() + (1 * 60 * 60 * 1000) };
  
  UrlFetchApp.fetch(`${FIREBASE_DB_URL}/ActiveSessions/${sessionToken}.json?auth=${FIREBASE_SECRET}`, { method: "PUT", payload: JSON.stringify(sessionPayload) });
  UrlFetchApp.fetch(`${FIREBASE_DB_URL}/teacherGradebook/${targetFolder}/${actualAssignmentKey}/${saltedHash}/currentSession.json?auth=${FIREBASE_SECRET}`, { method: "PUT", payload: JSON.stringify(sessionToken) });

  let savedState = {};
  try {
    savedState = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/teacherGradebook/${targetFolder}/${actualAssignmentKey}/${saltedHash}.json?auth=${FIREBASE_SECRET}`).getContentText()) || {};
  } catch (e) {}

  return { sessionToken: sessionToken, livePath: `liveUpdates/${sessionToken}`, savedState: savedState };
}

function refreshSessionToken() { return getStudentInitialData(); }

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

// ==========================================
// ADMIN TOOLS
// ==========================================

/**
 * Pushes the MASTER_RUBRIC defined above to Firebase.
 * Run this from the Apps Script editor or via the Dashboard button.
 */
function syncRubricToFirebase() {
  const userEmail = Session.getActiveUser().getEmail().toLowerCase().trim();
  if (!ADMIN_EMAILS.includes(userEmail)) throw new Error("Unauthorized");

  const url = `${FIREBASE_DB_URL}/rubrics/${ASSIGNMENT_CODE}.json?auth=${FIREBASE_SECRET}`;
  const options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(MASTER_RUBRIC)
  };
  
  UrlFetchApp.fetch(url, options);
  return "Rubric successfully synced to Cloud for " + ASSIGNMENT_CODE;
}