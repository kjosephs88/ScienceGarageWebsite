// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A02_G";
const ASSIGNMENT_TITLE = "Introduction to Solutions";

// 🖼️ IMAGE PLACEHOLDERS
const IMAGE_URLS = {
  // Put your 4 image links for Question 8's options here:
  q8_opt1: "https://docs.google.com/drawings/d/e/2PACX-1vRqlkB6BTx1ti1K6UA6YYUFVO45_aD8c2V5VSVCqZUG6rqHsHK2GIvqEF7BdNVrjq-7W2JZbxngdZ_a/pub?w=960&h=720",
  q8_opt2: "https://docs.google.com/drawings/d/e/2PACX-1vQ29EQsJ2iVUpC0_hZ4PuBoHKmzYjU13v3dvhvFTfSIb9t4CKls0NoP3lToG11_fdf-BaWd_fetvtS-/pub?w=960&h=720",
  q8_opt3: "https://docs.google.com/drawings/d/e/2PACX-1vQpoI2kwrQXej67Yr-179RB416FPKjC1pEWKiDNA_53Rsu-vkA98zBpsFhnuNAZZoC9YL_qz2gqnkt6/pub?w=960&h=720",
  q8_opt4: "https://docs.google.com/drawings/d/e/2PACX-1vR4fv9Le5jQnXBc-yGP7lzuYwF9GhNYbN5KEq7Y-CbciZMeRiN6i8QHAdIC8fNk2uZkQEn4PBK5JAos/pub?w=960&h=720"
};

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "In a true solution, the dissolved particles", options: ["are visible to the eye", "will settle out on standing", "are always solids", "cannot be removed by filtration"] },
  { id: 2, type: "mc", text: "When a teaspoon of sugar is added to water and stirred, the sugar", options: ["melts", "dissolves", "condenses", "evaporates"] },
  { id: 3, type: "mc", text: "In an aqueous solution of potassium chloride, the solute is", options: ["Cl⁻ only", "K⁺ only", "K⁺Cl⁻", "H₂O"] },
  { id: 4, type: "mc", text: "Which sample of matter is a mixture?", options: ["H₂O(s)", "H₂O(l)", "NaCl(l)", "NaCl(aq)"] },
  { id: 5, type: "mc", text: "Most ionic substances are soluble in water because water molecules are", options: ["nonpolar", "inorganic", "ionic", "polar"] },
  { id: 6, type: "mc", text: "An aqueous solution of copper sulfate is poured into a filter paper cone. What passes through the filter paper?", options: ["only the solvent", "only the solute", "both solvent and solute", "neither the solute nor solvent"] },
  { id: 7, type: "mc", text: "Nonpolar solvents will most easily dissolve solids that are", options: ["ionic", "covalent", "metallic", "colored"] },
  { id: 8, type: "mc", text: "Which diagram best illustrates the ion-molecule attractions that occur when ions of NaCl(s) are added to water?", options: [
    `<img src='${IMAGE_URLS.q8_opt1}' class='max-w-full h-auto rounded border border-gray-200 shadow-sm'>`,
    `<img src='${IMAGE_URLS.q8_opt2}' class='max-w-full h-auto rounded border border-gray-200 shadow-sm'>`,
    `<img src='${IMAGE_URLS.q8_opt3}' class='max-w-full h-auto rounded border border-gray-200 shadow-sm'>`,
    `<img src='${IMAGE_URLS.q8_opt4}' class='max-w-full h-auto rounded border border-gray-200 shadow-sm'>`
  ] },
  { id: 9, type: "mc", text: "What happens when NaCl(s) is dissolved in water?", options: ["Cl⁻ ions are attracted to the oxygen atoms of the water.", "Cl⁻ ions are attracted to the hydrogen atoms of the water.", "Na⁺ ions are attracted to the hydrogen atoms of the water.", "No attractions are involved; the crystal just falls apart."] },
  { id: 10, type: "mc", text: "A solution", options: ["will separate on standing", "may have color", "can be cloudy", "can be heterogeneous"] }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
// 0-indexed Answer Key based on the graded PDF
const ANSWER_KEY = { 1: 3, 2: 1, 3: 2, 4: 3, 5: 3, 6: 2, 7: 1, 8: 0, 9: 1, 10: 1 };

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
    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    template.ANSWER_KEY = JSON.stringify(ANSWER_KEY); 
    template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
    template.FIREBASE_SECRET = FIREBASE_SECRET;
    template.NAME_MAP = JSON.stringify(generateNameMap());
    
    template.HEADER_TYPE = ASSIGNMENT_CODE.endsWith("P") ? "Practice" : "Graded";
    template.HEADER_SUB = headerSub;
    template.IMAGE_URLS = IMAGE_URLS;
    
    return template.evaluate().setTitle(`Dashboard: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  let template = HtmlService.createTemplateFromFile('Index');
  template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
  template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
  template.HEADER_TYPE = ASSIGNMENT_CODE.endsWith("P") ? "Practice" : "Graded";
  template.HEADER_SUB = headerSub;
  template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY); 
  template.IMAGE_URLS = IMAGE_URLS; 
  
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
// MULTI-CLASS ROUTING & DATA FETCHING
// ==========================================
function getStudentInitialData() {
  const email = Session.getActiveUser().getEmail();
  const saltedHash = getSaltedStudentHash(email);
  
  const rosterData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/studentRoster/${saltedHash}.json?auth=${FIREBASE_SECRET}`).getContentText());
  if (!rosterData) throw new Error("Student not found in any class roster.");
  const allClassFolders = Object.keys(rosterData);
  
  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0];
  const targetFolders = allClassFolders.filter(folder => folder.startsWith(subjectPrefix));
  if (targetFolders.length === 0) throw new Error(`You do not appear to be enrolled in a class matching the prefix ${subjectPrefix}.`);

  let basePaths = [];
  let savedState = {};

  targetFolders.forEach(folder => {
    const parts = folder.split('_');
    const classroomId = parts[parts.length - 1];
    const provisionalKey = `${ASSIGNMENT_CODE}_${classroomId}`;
    let actualAssignmentKey = provisionalKey;

    try {
      const tgUrl = `${FIREBASE_DB_URL}/teacherGradebook/${folder}.json?auth=${FIREBASE_SECRET}&shallow=true`;
      const existingKeys = JSON.parse(UrlFetchApp.fetch(tgUrl).getContentText()) || {};
      const officialKey = Object.keys(existingKeys).find(k => k.startsWith(ASSIGNMENT_CODE) && k !== provisionalKey);
      if (officialKey) actualAssignmentKey = officialKey;
    } catch (e) {}

    const basePathTG = `teacherGradebook/${folder}/${actualAssignmentKey}/${saltedHash}`;
    basePaths.push(basePathTG);

    if (Object.keys(savedState).length === 0) {
      try {
        const stateUrl = `${FIREBASE_DB_URL}/${basePathTG}.json?auth=${FIREBASE_SECRET}`;
        const fetchedState = JSON.parse(UrlFetchApp.fetch(stateUrl).getContentText());
        if (fetchedState) savedState = fetchedState;
      } catch (e) {}
    }
  });

  return {
    saltedHash: saltedHash,
    targetFolders: targetFolders,
    basePaths: basePaths, 
    savedState: savedState
  };
}

// ==========================================
// MULTI-CLASS GRADING LOGIC
// ==========================================
function gradeSubmission(config) {
  const { basePaths } = config;
  if (!basePaths || basePaths.length === 0) return { status: 'error' };

  const url = `${FIREBASE_DB_URL}/${basePaths[0]}.json?auth=${FIREBASE_SECRET}`;
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

  let isUnlocked = (correctCount >= threshold);
  let statusRet = isUnlocked ? 'unlocked' : 'fail';
  
  let pathUpdates = {
    submitted: true,
    score: correctCount,
    status: "completed"
  };
  
  if (isUnlocked) {
    pathUpdates.unlocked = true;
    pathUpdates.answerKey = ANSWER_KEY;
  }

  basePaths.forEach(path => {
    UrlFetchApp.fetch(`${FIREBASE_DB_URL}/${path}.json?auth=${FIREBASE_SECRET}`, { 
        method: "PATCH", contentType: "application/json", payload: JSON.stringify(pathUpdates) 
    });
  });

  return { 
      status: statusRet, 
      correctCount: correctCount, 
      total: TOTAL_QUESTIONS, 
      threshold: threshold, 
      answerKey: isUnlocked ? ANSWER_KEY : null 
  };
}