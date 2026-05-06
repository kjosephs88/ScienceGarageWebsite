// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A08_P";
const ASSIGNMENT_TITLE = "Soluble Ions in Aqueous Solutions";

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "According to the Reference Table, which of these salts is least likely to be soluble in water?", options: ["$ \\ce{LiCl} $", "$ \\ce{RbCl} $", "$ \\ce{KNO3} $", "$ \\ce{PbCl2} $"] },
  { id: 2, type: "mc", text: "Which compound is insoluble in water?", options: ["$ \\ce{BaSO4} $", "$ \\ce{Na2S} $", "$ \\ce{KClO3} $", "$ \\ce{NH4Cl} $"] },
  { id: 3, type: "mc", text: "Which compound is most soluble in water?", options: ["$ \\ce{AgCl} $", "$ \\ce{PbCl2} $", "$ \\ce{CaCO3} $", "$ \\ce{NaNO3} $"] },
  { id: 4, type: "mc", text: "Which saturated solution has the lowest concentration of dissolved ions?", options: ["$ \\ce{NaCl(aq)} $", "$ \\ce{NH4Cl(aq)} $", "$ \\ce{MgCO3(aq)} $", "$ \\ce{K2SO4(aq)} $"] },
  { id: 5, type: "mc", text: "According to the Reference Table, which of these compounds is most soluble in water?", options: ["$ \\ce{AgCl} $", "$ \\ce{PbCO3} $", "$ \\ce{(NH4)2CO3} $", "$ \\ce{BaSO4} $"] },
  { id: 6, type: "mc", text: "Based on the Reference Table, which salt is the most soluble?", options: ["$ \\ce{AgI} $", "$ \\ce{PbS} $", "$ \\ce{BaCO3} $", "$ \\ce{K2SO4} $"] },
  { id: 7, type: "mc", text: "Based on the Reference Table, which compound could form a highly concentrated aqueous solution?", options: ["$ \\ce{AgBr} $", "$ \\ce{AgCl} $", "$ \\ce{Ag2CO3} $", "$ \\ce{AgNO3} $"] },
  { id: 8, type: "mc", text: "Which compound when stirred in water will not pass through filter paper?", options: ["$ \\ce{NaCl} $", "$ \\ce{NH4Cl} $", "$ \\ce{Mg(OH)2} $", "$ \\ce{LiCl} $"] },
  { id: 9, type: "mc", text: "A student observed the following reaction: <br> $$ \\ce{AlCl3(aq) + 3NaOH(aq) -> Al(OH)3(s) + 3NaCl(aq)} $$<br>After the products were filtered, which substance remained on the filter paper?", options: ["$ \\ce{NaCl} $", "$ \\ce{NaOH} $", "$ \\ce{AlCl3} $", "$ \\ce{Al(OH)3} $"] },
  { id: 10, type: "mc", text: "Which barium salt is insoluble in water?", options: ["$ \\ce{BaCO3} $", "$ \\ce{Ba(C2H3O2)2} $", "$ \\ce{Ba(ClO3)2} $", "$ \\ce{Ba(NO3)2} $"] },
  { id: 11, type: "text", text: "In a laboratory activity, solid $ \\ce{NaOH} $ is dissolved in distilled water.<br>a) Identify the negative ion produced.<br>b) Based on the reference table, explain why $ \\ce{NaOH} $ is highly soluble." },
  { id: 12, type: "text", text: "a) Identify a soluble compound containing the hydroxide ($ \\ce{OH-} $) ion.<br>b) Explain why potassium hydroxide would form a concentrated solution in water." },
  { id: 13, type: "text", text: "Give a statement on the solubility of $ \\ce{Pb(C2H3O2)2} $ in water based on the new reference table." },
  { id: 14, type: "text", text: "Write the chemical formula for a soluble compound containing the bromide ($ \\ce{Br-} $) ion." }
];

// ==========================================
// DASHBOARD ROSTER MAP GENERATION
// ==========================================
function generateNameMap() {
  try {
    const rawJson = HtmlService.createHtmlOutputFromFile('RosterData').getContent();
    const students = JSON.parse(rawJson);
    let map = {};
    students.forEach(student => {
      const hash = getSaltedStudentHash(student.email);
      map[hash] = student.name;
    });
    return map;
  } catch (e) { return {}; }
}

function getSaltedStudentHash(email) {
  if (!EMAIL_SALT) throw new Error("EMAIL_SALT is not defined in Script Properties.");
  const safeEmail = email.toString().toLowerCase().trim();
  const saltedEmail = EMAIL_SALT + safeEmail;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedEmail);
  return digest.map(byte => ('0' + (byte < 0 ? byte + 256 : byte).toString(16)).slice(-2)).join('');
}

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
    
    // Fetch Answer Key dynamically from rubrics node
    let fetchedKey = {};
    try {
       const keyRes = UrlFetchApp.fetch(`${FIREBASE_DB_URL}/rubrics/${ASSIGNMENT_CODE}.json?auth=${FIREBASE_SECRET}`);
       fetchedKey = JSON.parse(keyRes.getContentText()) || {};
    } catch(err) {}

    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    template.ANSWER_KEY = JSON.stringify(fetchedKey); 
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
  
  try { 
    template.STUDENT_UUID = getStudentInitialData().saltedHash;
  } catch (err) { 
    template.STUDENT_UUID = "ERROR_" + err.message; 
  }
  
  return template.evaluate().setTitle(`Assignment: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// DASHBOARD ROSTER FETCHING
// ==========================================
function getDashboardRoster() {
  const url = `${FIREBASE_DB_URL}/studentRoster.json?auth=${FIREBASE_SECRET}`;
  const nameMap = generateNameMap(); 
  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0]; 
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText()) || {};
    let roster = [];
    
    for (let hash in data) {
      const studentClasses = data[hash];
      for (let className in studentClasses) {
        if (className.startsWith(subjectPrefix)) {
          roster.push({
            uid: hash,
            name: nameMap[hash] || "Unknown Student",
            period: className
          });
        }
      }
    }
    return roster;
  } catch(e) {
    return [];
  }
}

// ==========================================
// SINGLE-CLASS ROUTING & DATA FETCHING
// ==========================================
function getStudentInitialData() {
  const email = Session.getActiveUser().getEmail();
  const saltedHash = getSaltedStudentHash(email);
  
  const rosterData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/studentRoster/${saltedHash}.json?auth=${FIREBASE_SECRET}`).getContentText());
  if (!rosterData) throw new Error("Student not found in any class roster.");
  
  const allClassFolders = Object.keys(rosterData);
  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0];
  
  const targetFolder = allClassFolders.find(folder => folder.startsWith(subjectPrefix));
  if (!targetFolder) throw new Error(`You do not appear to be enrolled in a class matching the prefix ${subjectPrefix}.`);

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
  let savedState = {};

  try {
    const stateUrl = `${FIREBASE_DB_URL}/${basePathTG}.json?auth=${FIREBASE_SECRET}`;
    const fetchedState = JSON.parse(UrlFetchApp.fetch(stateUrl).getContentText());
    if (fetchedState) savedState = fetchedState;
  } catch (e) {}

  return {
    saltedHash: saltedHash,
    targetFolder: targetFolder, 
    basePath: basePathTG,      
    savedState: savedState
  };
}

// ==========================================
// SINGLE-CLASS GRADING LOGIC
// ==========================================
function gradeSubmission(config) {
  const { basePath } = config;
  if (!basePath) return { status: 'error' };

  // Fetch dynamic answer key
  let fetchedKey = {};
  try {
     const keyRes = UrlFetchApp.fetch(`${FIREBASE_DB_URL}/rubrics/${ASSIGNMENT_CODE}.json?auth=${FIREBASE_SECRET}`);
     fetchedKey = JSON.parse(keyRes.getContentText()) || {};
  } catch(e) {}

  const url = `${FIREBASE_DB_URL}/${basePath}.json?auth=${FIREBASE_SECRET}`;
  const response = UrlFetchApp.fetch(url);
  const studentData = JSON.parse(response.getContentText()) || {};

  let mcCorrect = 0;
  const mcQuestions = QUESTIONS_ARRAY.filter(q => q.type === 'mc').map(q => q.id);
  const totalMC = mcQuestions.length;
  
  for (let i of mcQuestions) {
    const qData = studentData[`q${i}`];
    if (qData && qData.selection !== undefined && qData.selection !== null && qData.selection !== "") {
      if (qData.selection == fetchedKey[i]) mcCorrect++;
    }
  }

  // Text grading check
  const textQuestions = QUESTIONS_ARRAY.filter(q => q.type === 'text').map(q => q.id);
  let textGradedCount = 0;
  let textCorrectCount = 0;
  for (let i of textQuestions) {
    const qData = studentData[`q${i}`];
    if (qData && qData.isCorrect !== undefined) {
      textGradedCount++;
      if (qData.isCorrect === true) textCorrectCount++;
    }
  }

  const totalQuestions = QUESTIONS_ARRAY.length;
  const totalCorrect = mcCorrect + textCorrectCount;
  const isFullyGraded = (textGradedCount === textQuestions.length);
  
  // Unlock logic still based on MC threshold (80% of MC) or overall? 
  // User said "graded result is at least 80% correct for all questions" for the SHADES in Index.html.
  // But usually "unlocking" (seeing the key) happens based on MC.
  // I'll keep the MC threshold for UNLOCKING (status: 'unlocked'), 
  // but calculate the overall percent for the UI.
  const mcThreshold = Math.ceil(totalMC * 0.8);
  const isUnlocked = (mcCorrect >= mcThreshold);
  
  let pathUpdates = {
    submitted: true,
    score: totalCorrect,
    status: "completed"
  };
  
  if (isUnlocked) {
    pathUpdates.unlocked = true;
    pathUpdates.answerKey = fetchedKey;
  }

  UrlFetchApp.fetch(`${FIREBASE_DB_URL}/${basePath}.json?auth=${FIREBASE_SECRET}`, { 
      method: "PATCH", contentType: "application/json", payload: JSON.stringify(pathUpdates) 
  });

  return { 
      status: isUnlocked ? 'unlocked' : 'fail', 
      mcCorrect: mcCorrect,
      totalMC: totalMC,
      textGradedCount: textGradedCount,
      textCorrectCount: textCorrectCount,
      totalText: textQuestions.length,
      totalCorrect: totalCorrect,
      totalQuestions: totalQuestions,
      isFullyGraded: isFullyGraded,
      mcThreshold: mcThreshold,
      answerKey: isUnlocked ? fetchedKey : null 
  };
}

// ==========================================
// RUBRIC MANAGEMENT (Run Manually via Editor)
// ==========================================
function pushRubricToFirebase() {
  // Define the master answer key for this specific assignment.
  // Make sure to double-check these before pushing!
  const MASTER_ANSWER_KEY = { 
    1: 3, 2: 0, 3: 3, 4: 2, 5: 2, 
    6: 3, 7: 3, 8: 2, 9: 3, 10: 0 
  };
  
  // Target the specific assignment node within the 'rubrics' parent node
  const url = `${FIREBASE_DB_URL}/rubrics/${ASSIGNMENT_CODE}.json?auth=${FIREBASE_SECRET}`;
  
  const options = {
    method: 'PUT', // PUT replaces the exact node with this payload, ensuring a clean overwrite
    contentType: 'application/json',
    payload: JSON.stringify(MASTER_ANSWER_KEY)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log(`✅ Successfully pushed rubric for ${ASSIGNMENT_CODE}`);
    Logger.log(`Response: ${response.getContentText()}`);
  } catch (error) {
    Logger.log(`❌ Error pushing rubric: ${error}`);
  }
}