// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

const ASSIGNMENT_CODE = "CH_U08_A06_G";
const ASSIGNMENT_TITLE = "Lab 18 - Solution Concentration";

// 🖼️ IMAGE PLACEHOLDERS
const IMAGE_URLS = {};

const QUESTIONS_ARRAY = [
  { id: 'q1', type: 'text', text: '1. Solute:' },
  { id: 'q2', type: 'text', text: '2. Solvent:' },
  { id: 'q3', type: 'text', text: '3. Solution:' },
  { id: 'q4', type: 'text', text: '4. Mole:' },
  { id: 'q5', type: 'text', text: '5. Molar mass:' },
  { id: 'q6', type: 'text', text: '6. Mass:' },
  { id: 'q7', type: 'text', text: '7. Concentration:' },
  { id: 'q8', type: 'text', text: '8. Molarity:' },
  { id: 'q9', type: 'text', text: '9. Volume:' },
  { id: 'q10_sol1_moles', type: 'text', text: 'Q10: Sol 1 Moles' },
  { id: 'q10_sol2_moles', type: 'text', text: 'Q10: Sol 2 Moles' },
  { id: 'q10_sol3_moles', type: 'text', text: 'Q10: Sol 3 Moles' },
  { id: 'q10_sol4_moles', type: 'text', text: 'Q10: Sol 4 Moles' },
  { id: 'q11_sol1_mass', type: 'text', text: 'Q11: Sol 1 Mass' },
  { id: 'q11_sol2_mass', type: 'text', text: 'Q11: Sol 2 Mass' },
  { id: 'q11_sol3_mass', type: 'text', text: 'Q11: Sol 3 Mass' },
  { id: 'q11_sol4_mass', type: 'text', text: 'Q11: Sol 4 Mass' },
  { id: 'q12_sol1_mass', type: 'text', text: 'Q12: Visual Mass 1' },
  { id: 'q12_sol2_mass', type: 'text', text: 'Q12: Visual Mass 2' },
  { id: 'q12_sol3_mass', type: 'text', text: 'Q12: Visual Mass 3' },
  { id: 'q12_sol4_mass', type: 'text', text: 'Q12: Visual Mass 4' },
  { id: 'q13_sol1_vol', type: 'text', text: 'Q13: Visual Volume 1' },
  { id: 'q13_sol2_vol', type: 'text', text: 'Q13: Visual Volume 2' },
  { id: 'q13_sol3_vol', type: 'text', text: 'Q13: Visual Volume 3' },
  { id: 'q13_sol4_vol', type: 'text', text: 'Q13: Visual Volume 4' },
  { id: 'q14_sol1_hue', type: 'text', text: 'Q14: Color Intensity 1' },
  { id: 'q14_sol2_hue', type: 'text', text: 'Q14: Color Intensity 2' },
  { id: 'q14_sol3_hue', type: 'text', text: 'Q14: Color Intensity 3' },
  { id: 'q14_sol4_hue', type: 'text', text: 'Q14: Color Intensity 4' },
  { id: 'q15_sol1_taste', type: 'text', text: 'Q15: Taste Strength 1' },
  { id: 'q15_sol2_taste', type: 'text', text: 'Q15: Taste Strength 2' },
  { id: 'q15_sol3_taste', type: 'text', text: 'Q15: Taste Strength 3' },
  { id: 'q15_sol4_taste', type: 'text', text: 'Q15: Taste Strength 4' },
  { id: 'q16_sm_pos1', type: 'text', text: 'Q16: Solute Mass R1' },
  { id: 'q16_sm_op1', type: 'text', text: 'Q16: Solute Mass O1' },
  { id: 'q16_sm_pos2', type: 'text', text: 'Q16: Solute Mass R2' },
  { id: 'q16_sm_op2', type: 'text', text: 'Q16: Solute Mass O2' },
  { id: 'q16_sm_pos3', type: 'text', text: 'Q16: Solute Mass R3' },
  { id: 'q16_sm_op3', type: 'text', text: 'Q16: Solute Mass O3' },
  { id: 'q16_sm_pos4', type: 'text', text: 'Q16: Solute Mass R4' },
  { id: 'q17_mo_pos1', type: 'text', text: 'Q17: Solute Moles R1' },
  { id: 'q17_mo_op1', type: 'text', text: 'Q17: Solute Moles O1' },
  { id: 'q17_mo_pos2', type: 'text', text: 'Q17: Solute Moles R2' },
  { id: 'q17_mo_op2', type: 'text', text: 'Q17: Solute Moles O2' },
  { id: 'q17_mo_pos3', type: 'text', text: 'Q17: Solute Moles R3' },
  { id: 'q17_mo_op3', type: 'text', text: 'Q17: Solute Moles O3' },
  { id: 'q17_mo_pos4', type: 'text', text: 'Q17: Solute Moles R4' },
  { id: 'q18_sv_pos1', type: 'text', text: 'Q18: Solution Volume R1' },
  { id: 'q18_sv_op1', type: 'text', text: 'Q18: Solution Volume O1' },
  { id: 'q18_sv_pos2', type: 'text', text: 'Q18: Solution Volume R2' },
  { id: 'q18_sv_op2', type: 'text', text: 'Q18: Solution Volume O2' },
  { id: 'q18_sv_pos3', type: 'text', text: 'Q18: Solution Volume R3' },
  { id: 'q18_sv_op3', type: 'text', text: 'Q18: Solution Volume O3' },
  { id: 'q18_sv_pos4', type: 'text', text: 'Q18: Solution Volume R4' },
  { id: 'q19_sc_pos1', type: 'text', text: 'Q19: Solution Conc R1' },
  { id: 'q19_sc_op1', type: 'text', text: 'Q19: Solution Conc O1' },
  { id: 'q19_sc_pos2', type: 'text', text: 'Q19: Solution Conc R2' },
  { id: 'q19_sc_op2', type: 'text', text: 'Q19: Solution Conc O2' },
  { id: 'q19_sc_pos3', type: 'text', text: 'Q19: Solution Conc R3' },
  { id: 'q19_sc_op3', type: 'text', text: 'Q19: Solution Conc O3' },
  { id: 'q19_sc_pos4', type: 'text', text: 'Q19: Solution Conc R4' },
  { id: 'q20_ts_pos1', type: 'text', text: 'Q20: Taste Strength R1' },
  { id: 'q20_ts_op1', type: 'text', text: 'Q20: Taste Strength O1' },
  { id: 'q20_ts_pos2', type: 'text', text: 'Q20: Taste Strength R2' },
  { id: 'q20_ts_op2', type: 'text', text: 'Q20: Taste Strength O2' },
  { id: 'q20_ts_pos3', type: 'text', text: 'Q20: Taste Strength R3' },
  { id: 'q20_ts_op3', type: 'text', text: 'Q20: Taste Strength O3' },
  { id: 'q20_ts_pos4', type: 'text', text: 'Q20: Taste Strength R4' },
  { id: 'q21', type: 'text', text: '21. Conclusions: Same moles, diff conc' },
  { id: 'q22', type: 'text', text: '22. Conclusions: Same vol, diff conc' },
  { id: 'q23', type: 'text', text: '23. Conclusions: Tasted same' },
  { id: 'q24', type: 'text', text: '24. Post-Lab: KOH Molarity' },
  { id: 'q25', type: 'text', text: '25. Post-Lab: KNO3 Moles' },
  { id: 'q26', type: 'text', text: '26. Post-Lab: More conc NaOH' },
  { id: 'q27', type: 'text', text: '27. Post-Lab: Vol vs Solute' }
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
  } catch (err) { }

  if (e.parameter.page === 'dashboard') {
    if (!ADMIN_EMAILS.includes(userEmail)) return HtmlService.createHtmlOutput("<h2 style='color:red;padding:20px;'>Access Denied.</h2>");
    let template = HtmlService.createTemplateFromFile('Dashboard');
    template.ASSIGNMENT_CODE = ASSIGNMENT_CODE;
    template.ASSIGNMENT_TITLE = ASSIGNMENT_TITLE;
    template.ANSWER_KEY = JSON.stringify(ANSWER_KEY);
    template.QUESTIONS = JSON.stringify(QUESTIONS_ARRAY);
    template.FIREBASE_SECRET = FIREBASE_SECRET;
    template.NAME_MAP = JSON.stringify(generateNameMap());

    template.HEADER_TYPE = "Graded";
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
  } catch (e) {
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
    } catch (e) { }

    const basePathTG = `teacherGradebook/${folder}/${actualAssignmentKey}/${saltedHash}`;
    basePaths.push(basePathTG);

    if (Object.keys(savedState).length === 0) {
      try {
        const stateUrl = `${FIREBASE_DB_URL}/${basePathTG}.json?auth=${FIREBASE_SECRET}`;
        const fetchedState = JSON.parse(UrlFetchApp.fetch(stateUrl).getContentText());
        if (fetchedState) savedState = fetchedState;
      } catch (e) { }
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

