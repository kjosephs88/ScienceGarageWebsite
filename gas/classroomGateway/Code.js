// A secret password to prevent unauthorized access to your API
const API_KEY = PropertiesService.getScriptProperties().getProperty("APP_API_KEY"); 

// Run this once to trigger the Auth flow based on your appsscript.json
function triggerAuthorization() {
  Logger.log("Authorization check complete!");
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.apiKey !== API_KEY) return sendResponse({ status: "error", message: "Unauthorized" });

    let result;
    if (data.action === "postAssignment") result = createClassroomAssignment(data.payload);
    else if (data.action === "updateGrades") result = updateClassroomGrades(data.payload);
    else return sendResponse({ status: "error", message: "Unknown action." });

    return sendResponse(result);
  } catch (error) {
    return sendResponse({ status: "error", message: "Server Error: " + error.message });
  }
}

function sendResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 1. GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com"; 
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");

const ROSTER_CONFIG = {
  chemistry: { id: "1NT5wVymwWpW5-NPu1cra0LH8byk7LLnVd4FKU1pSTcs", gid: "598574737" },
  physics: { id: "1u1Cd78qCaaoBhJpHTdxSHVFrHKhMZzaBv4Z-K8tP_0A", gid: "1951332896" },
  forensics: { id: "1idQ_iJ-JaqKSEP0wdsgHz1n625AOhVShFHXhVyR1e90", gid: "1951332896" }
};

// ==========================================
// 2. FIREBASE HELPER FUNCTION 
// ==========================================
function sendToFirebase(firebaseDataObjects) {
  const bulkUpdatePayload = {};
  firebaseDataObjects.forEach(data => bulkUpdatePayload[data.assignmentId] = data);
  const response = UrlFetchApp.fetch(`${FIREBASE_DB_URL}/assignments.json?auth=${FIREBASE_SECRET}`, {
    method: "patch", contentType: "application/json; charset=utf-8", payload: JSON.stringify(bulkUpdatePayload), muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) throw new Error("Firebase Bulk Sync Error: " + response.getContentText());
}

// ==========================================
// 3. MAIN ASSIGNMENT SYNC (Scheduler)
// ==========================================
function syncClassroomToDatabase(classId, className) {
  try {
    const encodedClassId = Utilities.base64EncodeWebSafe(classId);
    let allCourseWork = []; let pageToken = null;
    do {
      const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
      if (response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
      pageToken = response.nextPageToken;
    } while (pageToken);

    const gcAssignmentIds = allCourseWork.map(work => work.id);
    const topicsMap = {}; let topicPageToken = null;
    do {
      const response = Classroom.Courses.Topics.list(classId, { pageToken: topicPageToken });
      if (response.topic) response.topic.forEach(t => topicsMap[t.topicId] = t.name);
      topicPageToken = response.nextPageToken;
    } while (topicPageToken);

    const rtdbData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/assignments.json?orderBy="classId"&equalTo="${classId}"&auth=${FIREBASE_SECRET}`).getContentText()) || {};
    let deletedCount = 0;
    Object.keys(rtdbData).forEach(rtdbId => {
      if (!gcAssignmentIds.includes(rtdbId)) {
        UrlFetchApp.fetch(`${FIREBASE_DB_URL}/assignments/${rtdbId}.json?auth=${FIREBASE_SECRET}`, { method: "delete" });
        deletedCount++;
      }
    });

    const firebaseDataObjects = [];
    allCourseWork.forEach(work => {
      const encodedAssId = Utilities.base64EncodeWebSafe(work.id);
      let preservedDates = ["unassigned"]; let preservedNotes = null; let preservedDayOrder = null;
      if (rtdbData[work.id]) {
          if (rtdbData[work.id].scheduledDates) preservedDates = rtdbData[work.id].scheduledDates;
          if (rtdbData[work.id].notes) preservedNotes = rtdbData[work.id].notes;
          if (rtdbData[work.id].dayOrder) preservedDayOrder = rtdbData[work.id].dayOrder;
      }
      firebaseDataObjects.push({
        assignmentId: work.id, title: work.title, classId: classId, className: className,
        topicId: work.topicId || "", topicName: work.topicId ? (topicsMap[work.topicId] || "") : "",
        encodedUrl: `https://classroom.google.com/c/${encodedClassId}/a/${encodedAssId}/details`,
        state: work.state || "PUBLISHED", workType: work.workType || "ASSIGNMENT",
        timestampCreated: work.creationTime ? new Date(work.creationTime).getTime() : Date.now(),
        dueDateString: work.dueDate ? `${work.dueDate.year}-${work.dueDate.month}-${work.dueDate.day}` : "",
        maxPoints: work.maxPoints || 0, scheduledDates: preservedDates, notes: preservedNotes, dayOrder: preservedDayOrder, sortIndex: 0, category: "", durationMinutes: 0
      });
    });

    if (firebaseDataObjects.length > 0) sendToFirebase(firebaseDataObjects);
    return { count: firebaseDataObjects.length, deletedCount: deletedCount, syncedTitles: firebaseDataObjects.map(data => data.title) };
  } catch (error) { throw new Error(`Sync failed: ${error.message}`); }
}

// ==========================================
// 4. STUDENT REPORT CARD SYNC
// ==========================================
function syncGradebook(classId, className) {
  let sheetId = ""; let sheetGid = "";
  if (/chemistry/i.test(className)) { sheetId = ROSTER_CONFIG.chemistry.id; sheetGid = ROSTER_CONFIG.chemistry.gid; } 
  else if (/physics/i.test(className)) { sheetId = ROSTER_CONFIG.physics.id; sheetGid = ROSTER_CONFIG.physics.gid; } 
  else if (/forensic/i.test(className)) { sheetId = ROSTER_CONFIG.forensics.id; sheetGid = ROSTER_CONFIG.forensics.gid; } 
  else throw new Error("Unknown subject");

  const emailToUuidMap = getEmailToUuidMap(sheetId, sheetGid);
  const classroomUsers = Classroom.Courses.Students.list(classId).students || [];
  const userIdToUuid = {};
  classroomUsers.forEach(student => {
    if (student.profile && student.profile.emailAddress && emailToUuidMap[student.profile.emailAddress.toLowerCase().trim()]) {
      userIdToUuid[student.userId] = emailToUuidMap[student.profile.emailAddress.toLowerCase().trim()];
    }
  });

  const topicsResponse = Classroom.Courses.Topics.list(classId).topic || [];
  const topicMap = {}; topicsResponse.forEach(topic => topicMap[topic.topicId] = topic.name);

  let allCourseWork = []; let pageToken = null;
  do {
    const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
    if (response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
    pageToken = response.nextPageToken;
  } while (pageToken);
  
  let firebaseUpdates = {};
  allCourseWork.forEach(work => {
    let topicName = topicMap[work.topicId] || "";
    let assignmentCode = generateAssignmentCode(className, topicName, work.title);
    let b64Course = Utilities.base64EncodeWebSafe(classId.toString());
    let b64Work = Utilities.base64EncodeWebSafe(work.id.toString());
    let assignmentUrl = `https://classroom.google.com/c/${b64Course}/a/${b64Work}/details`;

    firebaseUpdates[`StudentReportCards/${className}/${assignmentCode}/url`] = assignmentUrl;
    firebaseUpdates[`StudentReportCards/${className}/${assignmentCode}/title`] = work.title;
    firebaseUpdates[`StudentReportCards/${className}/${assignmentCode}/unitName`] = topicName;

    if (work.workType !== "MATERIAL") {
      try {
        let submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(classId, work.id).studentSubmissions || [];
        submissions.forEach(sub => {
          let uuid = userIdToUuid[sub.userId];
          if (uuid) {
            firebaseUpdates[`StudentReportCards/${uuid}/${assignmentCode}/_exists`] = true;
            if (sub.assignedGrade !== undefined && sub.assignedGrade !== null) {
              firebaseUpdates[`StudentReportCards/${uuid}/${assignmentCode}/score`] = sub.assignedGrade;
            }
          }
        });
      } catch (err) { console.warn(`Error fetching grades: ${err.message}`); }
    } else {
      Object.values(userIdToUuid).forEach(uuid => firebaseUpdates[`StudentReportCards/${uuid}/${assignmentCode}/_exists`] = true);
    }
  });

  patchFirebaseGradebook(firebaseUpdates);
  return { status: "success", message: `Initialized StudentReportCards for ${className}.` };
}

// ==========================================
// 5. TEACHER GRADEBOOK SYNC (UPDATED WITH UNIT MAP)
// ==========================================
function syncTeacherGradebook(classId, className) {
  let sheetId = ""; let sheetGid = "";
  if (/chemistry/i.test(className)) { sheetId = ROSTER_CONFIG.chemistry.id; sheetGid = ROSTER_CONFIG.chemistry.gid; } 
  else if (/physics/i.test(className)) { sheetId = ROSTER_CONFIG.physics.id; sheetGid = ROSTER_CONFIG.physics.gid; } 
  else if (/forensic/i.test(className)) { sheetId = ROSTER_CONFIG.forensics.id; sheetGid = ROSTER_CONFIG.forensics.gid; } 
  else throw new Error("Unknown subject");

  const emailToUuidMap = getEmailToUuidMap(sheetId, sheetGid);
  const classroomUsers = Classroom.Courses.Students.list(classId).students || [];
  const userIdToUuid = {};
  classroomUsers.forEach(student => {
    if (student.profile && student.profile.emailAddress && emailToUuidMap[student.profile.emailAddress.toLowerCase().trim()]) {
      userIdToUuid[student.userId] = emailToUuidMap[student.profile.emailAddress.toLowerCase().trim()];
    }
  });

  const topicsResponse = Classroom.Courses.Topics.list(classId).topic || [];
  const topicMap = {}; topicsResponse.forEach(topic => topicMap[topic.topicId] = topic.name);

  let allCourseWork = []; let pageToken = null;
  do {
    const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
    if (response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
    pageToken = response.nextPageToken;
  } while (pageToken);
  
  let firebaseUpdates = {};
  const currentTimestamp = Date.now();
  const unitMappingDictionary = {}; // Dictionary to store parsed Unit Code -> Full Unit Name

  allCourseWork.forEach(work => {
    let topicName = topicMap[work.topicId] || "Uncategorized";
    let assignmentCode = generateAssignmentCode(className, topicName, work.title);
    
    // Extract the Unit Code (e.g. U07, BR, SDA) from the generated assignment code
    let codeParts = assignmentCode.split('_');
    let unitCode = codeParts.length > 1 ? codeParts[1] : "U00";
    
    // Build the mapping dictionary
    unitMappingDictionary[unitCode] = topicName;

    let b64Course = Utilities.base64EncodeWebSafe(classId.toString());
    let b64Work = Utilities.base64EncodeWebSafe(work.id.toString());
    let assignmentUrl = `https://classroom.google.com/c/${b64Course}/a/${b64Work}/details`;

    firebaseUpdates[`teacherGradebook/${className}/${assignmentCode}/url`] = assignmentUrl;
    firebaseUpdates[`teacherGradebook/${className}/${assignmentCode}/title`] = work.title;

    if (work.workType !== "MATERIAL") {
      try {
        let submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(classId, work.id).studentSubmissions || [];
        submissions.forEach(sub => {
          let uuid = userIdToUuid[sub.userId];
          if (uuid) {
            let score = (sub.assignedGrade !== undefined && sub.assignedGrade !== null) ? sub.assignedGrade : null;
            let statusText = sub.state ? sub.state.toLowerCase() : "assigned";
            let basePath = `teacherGradebook/${className}/${assignmentCode}/${uuid}`;
            
            firebaseUpdates[`${basePath}/score`] = score;
            firebaseUpdates[`${basePath}/status`] = statusText;
            firebaseUpdates[`${basePath}/gcSynced`] = (score !== null);
            firebaseUpdates[`${basePath}/lastUpdated`] = currentTimestamp;
          }
        });
      } catch (err) { console.warn(`Error fetching grades: ${err.message}`); }
    }
  });

  // Write the completed Unit Dictionary into the class node
  Object.keys(unitMappingDictionary).forEach(uCode => {
    firebaseUpdates[`teacherGradebook/${className}/_unitMap/${uCode}`] = unitMappingDictionary[uCode];
  });

  patchFirebaseGradebook(firebaseUpdates);
  return { status: "success", message: `Mapped Teacher Gradebook for ${className}.` };
}

// --- GLOBAL HELPER FUNCTIONS ---
function getEmailToUuidMap(sheetId, gid) {
  const ss = SpreadsheetApp.openById(sheetId);
  const data = ss.getSheets().find(s => s.getSheetId() == gid).getDataRange().getValues();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    let email = data[i][0]; let uuid = data[i][7];
    if (email && uuid) map[email.toString().toLowerCase().trim()] = uuid.toString().trim();
  }
  return map;
}

function generateAssignmentCode(className, topicName, assignmentTitle) {
  let subj = "ZZ";
  if (/chemistry/i.test(className)) subj = "CH";
  else if (/physics/i.test(className)) subj = "PH";
  else if (/forensic/i.test(className)) subj = "FS";

  let unitCode = "U00"; let aCode = "A00";
  let tName = (topicName || "").toLowerCase();

  if (tName.includes("bellringer")) {
    unitCode = "BR";
    let wMatch = assignmentTitle.match(/Week\s*(\d+)/i);
    if (wMatch) aCode = "W" + ("0" + wMatch[1]).slice(-2);
  } else if (tName.includes("science discovery") || tName.includes("article summaries")) {
    unitCode = "SDA";
    let aMatch = assignmentTitle.match(/^(\d+)/);
    if (aMatch) aCode = "A" + ("0" + aMatch[1]).slice(-2);
  } else {
    let unitMatch = tName.match(/unit\s*(\d+)/i);
    if (unitMatch) unitCode = "U" + ("0" + unitMatch[1]).slice(-2);
    let aMatch = assignmentTitle.match(/^(\d+)/);
    if (aMatch) aCode = "A" + ("0" + aMatch[1]).slice(-2);
  }

  let suffixCode = "";
  let splitByDash = assignmentTitle.split('-');
  if (splitByDash.length > 1) {
    let lastSection = splitByDash[splitByDash.length - 1].trim();
    let typeMatch = lastSection.match(/^(Practice|Graded|Review|Ungraded)/i);
    if (typeMatch) suffixCode = "_" + typeMatch[1].charAt(0).toUpperCase();
  }

  return `${subj}_${unitCode}_${aCode}${suffixCode}`;
}

function patchFirebaseGradebook(payload) {
  const response = UrlFetchApp.fetch(`${FIREBASE_DB_URL}/.json?auth=${FIREBASE_SECRET}`, {
    method: "patch", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) throw new Error("Firebase error: " + response.getContentText());
}

function getClassIdByName(className) {
  const course = (Classroom.Courses.list().courses || []).find(c => c.name === className);
  if (course) return course.id; else throw new Error("Class not found");
}

function getActiveClassesForSync() {
  return (Classroom.Courses.list().courses || []).filter(c => c.courseState !== "ARCHIVED").map(c => ({ id: c.id, name: c.name })); 
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Classroom Sync Admin').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}