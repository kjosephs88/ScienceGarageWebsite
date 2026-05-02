// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A04_G";
const ASSIGNMENT_TITLE = "Solution Concentration";

const IMAGE_URLS = {};

const QUESTIONS_ARRAY = [
  { id: 1, type: "mc", text: "If 0.025 grams of Pb(NO₃)₂ is dissolved in 100. grams of H₂O, what is the concentration of the resulting solution, in parts per million?", options: ["2.5 × 10⁻⁴ ppm", "2.5 ppm", "250 ppm", "4.0 × 10³ ppm"] },
  { id: 2, type: "mc", text: "Which unit can be used to express solution concentration?", options: ["J/mol", "L/mol", "mol/L", "mol/s"] },
  { id: 3, type: "mc", text: "What is the molarity of a solution containing 20 grams of NaOH in 500 milliliters of solution?", options: ["1 M", "2 M", "0.04 M", "0.5 M"] },
  { id: 4, type: "mc", text: "What is the total number of moles of solute in 250 milliliters of a 1.0 M solution of NaCl?", options: ["1.0 mole", "0.25 mole", "0.50 mole", "42 moles"] },
  { id: 5, type: "mc", text: "What is the concentration of a solution in parts per million, if 0.45 gram of KNO₃ is dissolved in 1000. grams of water?", options: ["450 ppm", "4.5 × 10⁻⁵ ppm", "4.5 × 10⁻⁶ ppm", "225 ppm"] },
  { id: 6, type: "mc", text: "What is the total number of grams of NaI(s) needed to make 1.0 liter of 0.010 M solution?", options: ["0.015 g", "0.15 g", "1.5 g", "15 g"] },
  { id: 7, type: "mc", text: "A student wants to prepare a 1.0-liter solution of a specific molarity. The student determines that the mass of the solute needs to be 30. grams. What is the proper procedure to follow?", options: ["Add 30. g of solute to 1.0 L of solvent.", "Add 30. g of solute to 970. mL of solvent to make 1.0 L of solution.", "Add 1000. g of solvent to 30. g of solute.", "Add enough solvent to 30. g of solute to make 1.0 L of solution."] },
  { id: 8, type: "mc", text: "Which preparation produces 2.0 M solution of C₆H₁₂O₆? [molar mass = 180.0 g/mol]", options: ["90.0 g of C₆H₁₂O₆ dissolved in 500.0 mL of solution", "90.0 g of C₆H₁₂O₆ dissolved in 1000. mL of solution", "180.0 g of C₆H₁₂O₆ dissolved in 500.0 mL of solution", "180.0 g of C₆H₁₂O₆ dissolved in 1000. mL of solution"] },
  { id: 9, type: "mc", text: "What is the molarity of a KF(aq) solution containing 116 g of KF in 1.00 L of solution?", options: ["1.00 M", "2.00 M", "3.00 M", "4.00 M"] },
  { id: 10, type: "mc", text: "Carbon dioxide gas has a solubility of 0.0972 g/100 g H₂O at 40°C. Expressed in parts per million, this concentration is closest to", options: ["0.972 ppm", "9.72 ppm", "97.2 ppm", "972 ppm"] },
  { id: 11, type: "text", text: "What is the molarity of the solution produced when 85.6 g of hydrochloric acid (HCl) is dissolved in sufficient water to prepare 0.385 L of solution?" },
  { id: 12, type: "text", text: "To produce 3.00 L of a 1.90 M solution of sodium hydroxide (NaOH), how many grams of sodium hydroxide must be dissolved?" }
];

const TOTAL_QUESTIONS = QUESTIONS_ARRAY.length;
const ANSWER_KEY = { 
  1: 2, 2: 2, 3: 0, 4: 1, 5: 0, 6: 2, 7: 3, 8: 2, 9: 1, 10: 3,
  11: "6.09 M", 12: "228g"
};


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
  let textUpdates = {};
  
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const qData = studentData[`q${i}`];
    if (qData && qData.selection !== undefined && qData.selection !== null && qData.selection !== "") {
      const qDef = QUESTIONS_ARRAY.find(q => q.id === i);
      if (qDef && qDef.type === 'text') {
        let isCorrectText = false;
        const rawStudentAns = String(qData.rawSelection !== undefined ? qData.rawSelection : qData.selection).trim();
        const numMatch = rawStudentAns.match(/[\d\.]+/);
        
        if (numMatch) {
            const num = parseFloat(numMatch[0]);
            
            if (i === 11) {
                const expectedNum = 6.09;
                if (Math.abs(num - expectedNum) <= expectedNum * 0.02) {
                    const textOnly = rawStudentAns.replace(/[\d\.]+/g, '').trim();
                    if (textOnly !== "") {
                        const lowerText = textOnly.toLowerCase();
                        const startsWithCapitalM = (textOnly.length > 0 && textOnly[0] === 'M');
                        
                        if (startsWithCapitalM && !lowerText.substring(1).startsWith("ol") && !lowerText.substring(1).startsWith("ass")) {
                            isCorrectText = true;
                        } else if (lowerText.includes("molar")) {
                            isCorrectText = true;
                        } else if (/mole?s?\s*(\/|per)\s*(l|liter|liters)/.test(lowerText)) {
                            isCorrectText = true;
                        }
                    }
                }
            } else if (i === 12) {
                const expectedNum = 228;
                if (Math.abs(num - expectedNum) <= expectedNum * 0.02) {
                    const textPart = rawStudentAns.replace(/[\d\.]+/g, '').replace(/[^a-zA-Z]/g, '').toLowerCase();
                    if (textPart !== "" && textPart.startsWith("g")) {
                        isCorrectText = true;
                    }
                }
            }
        }
        if (isCorrectText) {
            correctCount++;
            textUpdates[`q${i}/selection`] = ANSWER_KEY[i];
        }
      } else {
        if (qData.selection == ANSWER_KEY[i]) correctCount++;
      }
    }
  }

  let isUnlocked = (correctCount >= threshold);
  let statusRet = isUnlocked ? 'unlocked' : 'fail';
  
  let pathUpdates = {
    submitted: true,
    score: correctCount,
    status: "completed",
    ...textUpdates
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