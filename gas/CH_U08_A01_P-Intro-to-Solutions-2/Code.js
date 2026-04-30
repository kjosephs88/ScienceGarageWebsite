// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A01_P";
const ASSIGNMENT_TITLE = "Introduction to Solutions";

// 🖼️ IMAGE PLACEHOLDERS
const IMAGE_URLS = {
  q6: "https://docs.google.com/drawings/d/e/2PACX-1vQAOL8npL5ugKKPh6jdcwD5cge7tZ0OCNhScvh9f1qLaEQ400LV1FjZdXHhMl8JVJWI_9189hRhCXaF/pub?w=960&h=720",
  reading_pg2: "https://docs.google.com/drawings/d/e/2PACX-1vQUHylpJpsL37zdRRhxH1wxtpRbUXzvhl5jr03gs5z86ljBelPwJ0_vDTTTegrBURKavLvDNNwc7u_d/pub?w=417&h=688"
};

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "When a teaspoon of sugar is added to water in a beaker, the sugar dissolves. The resulting mixture is", options: ["a compound", "a homogeneous solution", "a heterogeneous solution", "an emulsion"] },
  { id: 2, type: "mc", text: "A small quantity of salt is stirred into a liter of water until it dissolves. In the resulting mixture, the water is", options: ["the solvent", "the solute", "dispersed material", "a precipitate"] },
  { id: 3, type: "mc", text: "A solution", options: ["will separate on standing", "may have color", "can be cloudy", "can be heterogeneous"] },
  { id: 4, type: "mc", text: "Nonpolar solvents will most easily dissolve solids that are", options: ["ionic", "covalent", "metallic", "heterogenous"] },
  { id: 5, type: "mc", text: "Under which conditions are gases most soluble", options: ["high temperature and high pressure", "high temperature and low pressure", "low temperature and high pressure", "low temperature and low pressure"] },
  { id: 6, type: "mc", text: `The diagrams below represent an ionic crystal being dissolved in water.<br><br><img src='${IMAGE_URLS.q6}' alt='Question 6 Diagram' class='my-4 max-w-full h-auto border border-gray-300 rounded shadow-sm'><br>According to the diagrams the dissolving process takes place by`, options: ["hydrogen bond formation", "metallic bonding", "dipole-dipole attractions", "molecule-ion attractions"] },
  { id: 7, type: "mc", text: "What happens when KI(s) is dissolved in water?", options: ["I⁻ ions are attracted to the oxygen atoms of the water.", "K⁺ ions are attracted to the oxygen atoms of the water.", "K⁺ ions are attracted to the hydrogen atoms of the water.", "No attractions are involved; the crystals just fall apart."] },
  { id: 8, type: "mc", text: "Which two compounds contain only polar molecules?", options: ["CCl₄ and CH₄", "HCl and Cl₂", "HCl and NH₃", "CO and CO₂"] },
  { id: 9, type: "mc", text: "Stainless steel is a solution because", options: ["It is an element formed between two metals.", "It is a compound formed between two metals.", "It is a homogeneous mixture between two metals.", "It is a heterogenous mixture between two metals."] },
  { id: 10, type: "mc", text: "The term \"like dissolves like\" means that", options: ["An attraction exists between an electron and a proton.", "An attraction exists between two protons.", "A nonpolar substance will dissolve a polar substance.", "A nonpolar substance will dissolve a nonpolar substance."] },
  { id: 11, type: "mc", text: "A solution cannot be cloudy because solutions", options: ["don't disperse light.", "can have color.", "are mixtures.", "are compounds."] },
  { id: 12, type: "mc", text: "A solution does not disperse light because", options: ["the solvent particles are too large.", "the solvent particles are too small.", "the solute particles are too large.", "the solute particles are too small."] },
  { id: 13, type: "mc", text: "Dissolved particles pass through a filter because", options: ["the solvent particles are too large pass through the filter.", "the solvent particles are small enough to pass through the filter.", "the solute particles are too large pass through the filter.", "the solute particles are small enough to pass through the filter."] },
  { id: 14, type: "mc", text: "Dissolved particles can be separated from a solvent by", options: ["filtering the solution.", "evaporating the solvent.", "stirring the solution.", "adding more solute to the solution."] }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
const ANSWER_KEY = { 1: 1, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 1, 8: 2, 9: 2, 10: 3, 11: 0, 12: 3, 13: 3, 14: 1 };

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
  
  // Format the sub-header for BOTH views so they look identical to the printout
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
  
  // Extract the prefix (e.g., "CH") from the assignment code
  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0]; 
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText()) || {};
    let roster = [];
    
    // Look through every student's hash in the RTDB roster
    for (let hash in data) {
      const studentClasses = data[hash];
      
      // Look at the classes this specific student is enrolled in
      for (let className in studentClasses) {
        
        // ONLY add the student to the dashboard if the class matches the prefix!
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