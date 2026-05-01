// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A05";
const ASSIGNMENT_TITLE = "Solubility and Saturation";

// 🖼️ IMAGE PLACEHOLDERS
const IMAGE_URLS = {};

const QUESTIONS_ARRAY = [
  { id: 'q1', type: 'text', text: '1. Identify the variable(s) that were controlled among all three experiments in Model 1.' },
  { id: 'q2', type: 'text', text: '2. What variable(s) were changed purposefully among the three experiments in Model 1?' },
  { id: 'q3', type: 'text', text: '3. What experimental question can be answered by analyzing the data in the three experiments in Model 1?' },
  { id: 'q5', type: 'text', text: '5. Propose an explanation for why the mass of dissolved solute changed among the three Experiments.' },
  { id: 'q6', type: 'text', text: '6. Would it be acceptable for a student to use Trial 2 from Experiment 1 to determine the solubility?' },
  { id: 'q7', type: 'text', text: '7. Explain how the ratio "grams of solute per 100 g H₂O" can be calculated from the data.' },
  { id: 'q8a', type: 'text', text: '8a. Experiment 1 Solubility:' },
  { id: 'q8b', type: 'text', text: '8b. Experiment 2 Solubility:' },
  { id: 'q8c', type: 'text', text: '8c. Experiment 3 Solubility:' },
  { id: 'q9a', type: 'radio', text: '9a. When the volume of solvent increases, the mass of solute that can dissolve...' },
  { id: 'q9b', type: 'radio', text: '9b. When the volume of solvent increases, the solubility of a solute...' },
  { id: 'q10', type: 'text', text: '10. Devise a well-constructed response to this claim.' },
  { id: 'q11a', type: 'text', text: '11a. Only solutes dissolved in aqueous form' },
  { id: 'q11b', type: 'text', text: '11b. Solutes dissolved in aqueous form and solids not dissolved in solution' },
  { id: 'q12', type: 'text', text: '12. What variables are controlled in all five beakers of Model 2?' },
  { id: 'm2-a-solid', type: 'text', text: '13. M2 Beaker A solid:' },
  { id: 'm2-b-diss', type: 'text', text: '13. M2 Beaker B diss:' },
  { id: 'm2-c-solid', type: 'text', text: '13. M2 Beaker C solid:' },
  { id: 'm2-c-diss', type: 'text', text: '13. M2 Beaker C diss:' },
  { id: 'm2-d-diss', type: 'text', text: '13. M2 Beaker D diss:' },
  { id: 'm2-e-solid', type: 'text', text: '13. M2 Beaker E solid:' },
  { id: 'q14a', type: 'text', text: '14a. Which beakers represent unsaturated solutions?' },
  { id: 'q14b', type: 'text', text: '14b. Which beakers represent saturated solutions?' },
  { id: 'q15a', type: 'text', text: '15a. When a small amount of additional solute is added to an unsaturated solution...' },
  { id: 'q15b', type: 'text', text: '15b. When a small amount of additional solute is added to a saturated solution...' },
  { id: 'q15c', type: 'text', text: '15c. Predict what would happen if a small amount of additional solute were stirred into beaker E.' },
  { id: 'q16', type: 'text', text: '16. Summarize the meaning of the word saturated.' },
  { id: 'q17', type: 'text', text: '17. What feature would typically enable a student to distinguish a saturated solution?' },
  { id: 'q18', type: 'text', text: '18. What simple test could you perform to determine the answer?' },
  { id: 'q19', type: 'text', text: '19. Write the letters for those beakers next to the corresponding trial numbers.' },
  { id: 'q20', type: 'text', text: '20. Determine the mass of solid solute remaining on the bottom of the beaker.' },
  { id: 'q21a', type: 'text', text: '21a. Is the filtrate unsaturated or saturated? Explain.' },
  { id: 'q21b', type: 'text', text: '21b. Which beaker in Model 1 best represents the filtrate?' },
  { id: 'q22', type: 'text', text: '22. What factor(s) might also affect how much of a solute dissolves in a solution?' }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
const ANSWER_KEY = {}; // No auto-grading for this assignment

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
    
    template.HEADER_TYPE = "POGIL";
    template.HEADER_SUB = headerSub;
    template.IMAGE_URLS = IMAGE_URLS;
    
    return template.evaluate().setTitle(`Dashboard: ${ASSIGNMENT_CODE}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  let template = HtmlService.createTemplateFromFile('Index');
  template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
  template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
  template.HEADER_TYPE = "POGIL";
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

  let pathUpdates = {
    submitted: true,
    status: "completed"
  };

  basePaths.forEach(path => {
    UrlFetchApp.fetch(`${FIREBASE_DB_URL}/${path}.json?auth=${FIREBASE_SECRET}`, { 
        method: "PATCH", contentType: "application/json", payload: JSON.stringify(pathUpdates) 
    });
  });

  return { 
      status: 'submitted', 
      total: TOTAL_QUESTIONS
  };
}
