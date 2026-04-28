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
// 3. BATCH ASSIGNMENT CREATION (From Sheet)
// ==========================================
function createClassroomAssignment(payload) {
  const className = payload.className;
  const assignmentsToPost = payload.assignments;
  let classId;

  try {
    classId = getClassIdByName(className);
  } catch (error) {
    return { status: "error", message: `Could not find class: ${className}` };
  }

  // Cache API calls once per batch
  let currentTopics = Classroom.Courses.Topics.list(classId).topic || [];
  let currentRoster = Classroom.Courses.Students.list(classId).students || [];

  let postedCount = 0;
  let errorLog = [];

  assignmentsToPost.forEach(assignment => {
    try {
      let topicId = null;
      if (assignment.topicName) {
        let existingTopic = currentTopics.find(t => t.name.toLowerCase() === assignment.topicName.toLowerCase());
        if (existingTopic) {
          topicId = existingTopic.topicId;
        } else {
          const newTopic = Classroom.Courses.Topics.create({ name: assignment.topicName }, classId);
          topicId = newTopic.topicId;
          currentTopics.push(newTopic);
        }
      }

      let materials = [];
      if (assignment.files && assignment.folderId) {
        assignment.files.forEach(fileName => {
          const fileId = getDriveFileIdByName(assignment.folderId, fileName);
          if (fileId) materials.push({ driveFile: { driveFile: { id: fileId } } });
        });
      }
      if (assignment.links) {
        const linkList = assignment.links.split(',').map(l => l.trim());
        linkList.forEach(url => { if (url) materials.push({ link: { url: url } }); });
      }

      let parsedDate = undefined;
      let defaultDueTime = undefined;
      if (assignment.dueDateString) {
        const dateParts = assignment.dueDateString.split("-");
        parsedDate = { year: parseInt(dateParts[2]), month: parseInt(dateParts[0]), day: parseInt(dateParts[1]) + 1 };
        defaultDueTime = { hours: 0, minutes: 0, seconds: 0 };
      }

      let individualStudentsOptions = undefined;
      if (assignment.studentsCell) {
        const studentEmails = assignment.studentsCell.split(',').map(e => e.trim().toLowerCase());
        const studentIds = [];
        studentEmails.forEach(email => {
          const student = currentRoster.find(s => s.profile && s.profile.emailAddress.toLowerCase() === email);
          if (student) studentIds.push(student.userId);
        });
        if (studentIds.length > 0) individualStudentsOptions = { studentIds: studentIds };
      }

      if (assignment.workType === "MATERIAL") {
        const materialObj = {
          title: assignment.title,
          description: assignment.description || "",
          materials: materials,
          state: (assignment.state || "PUBLISHED").toUpperCase(),
          topicId: topicId,
          assigneeMode: individualStudentsOptions ? 'INDIVIDUAL_STUDENTS' : undefined,
          individualStudentsOptions: individualStudentsOptions
        };
        Classroom.Courses.CourseWorkMaterials.create(materialObj, classId);
      } else {
        const courseworkObj = {
          title: assignment.title,
          description: assignment.description || "",
          materials: materials,
          state: (assignment.state || "PUBLISHED").toUpperCase(),
          workType: "ASSIGNMENT",
          topicId: topicId,
          maxPoints: assignment.maxPoints || undefined,
          dueDate: parsedDate,
          dueTime: defaultDueTime,
          assigneeMode: individualStudentsOptions ? 'INDIVIDUAL_STUDENTS' : undefined,
          individualStudentsOptions: individualStudentsOptions
        };
        Classroom.Courses.CourseWork.create(courseworkObj, classId);
      }

      postedCount++;
      Utilities.sleep(1000);

    } catch (e) {
      errorLog.push(`Failed to post "${assignment.title}": ${e.message}`);
    }
  });

  let syncMessage = "No assignments posted, skipped database sync.";
  if (postedCount > 0) {
    try {
      syncClassroomToDatabase(classId, className);
      syncTeacherGradebook(classId, className);
      syncMessage = "Firebase databases successfully synced.";
    } catch (e) {
      errorLog.push(`Classroom posting succeeded, but Firebase Sync failed: ${e.message}`);
    }
  }

  return {
    status: errorLog.length === 0 ? "success" : "partial",
    message: `Successfully posted ${postedCount} assignments. ${syncMessage}`,
    errors: errorLog
  };
}

// ==========================================
// 4. MAIN ASSIGNMENT SYNC (Scheduler)
// ==========================================
function syncClassroomToDatabase(classId, className) {
  try {
    const encodedClassId = Utilities.base64EncodeWebSafe(classId);

    let subj = "ZZ";
    let lowerClassName = className.toLowerCase();
    if (lowerClassName.includes("chemistry")) subj = "CH";
    else if (lowerClassName.includes("physics")) subj = "PH";
    else if (lowerClassName.includes("forensic")) subj = "FS";

    let periodMatch = className.match(/P\d/i);
    let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";
    let classFolder = `${subj}_${period}_${classId}`;

    // 1. Fetch current Classroom CourseWork
    let allCourseWork = []; let pageToken = null;
    do {
      const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
      if (response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
      pageToken = response.nextPageToken;
    } while (pageToken);

    // 2. Map Topics
    const topicsMap = {}; let topicPageToken = null;
    do {
      const response = Classroom.Courses.Topics.list(classId, { pageToken: topicPageToken });
      if (response.topic) response.topic.forEach(t => topicsMap[t.topicId] = t.name);
      topicPageToken = response.nextPageToken;
    } while (topicPageToken);

    // 3. Get existing RTDB data for this specific class folder
    const classNodeUrl = `${FIREBASE_DB_URL}/schedulerAssignments/${classFolder}.json?auth=${FIREBASE_SECRET}`;
    const rtdbData = JSON.parse(UrlFetchApp.fetch(classNodeUrl).getContentText()) || {};

    // Map existing entries by Assignment Code to identify ghosts/clashes
    const existingByCode = {};
    Object.keys(rtdbData).forEach(fbKey => {
      const entry = rtdbData[fbKey];
      if (entry && entry.assignmentCode) {
        existingByCode[entry.assignmentCode] = { key: fbKey, data: entry };
      }
    });

    const bulkPayload = {};

    // 4. Process current Classroom assignments
    allCourseWork.forEach(work => {
      let topicName = work.topicId ? (topicsMap[work.topicId] || "") : "";
      if (topicName.toLowerCase().includes("bellringer")) return;

      const assignCode = generateAssignmentCode(className, topicName, work.title);
      const encodedAssId = Utilities.base64EncodeWebSafe(work.id);
      let fbKey = `${assignCode}_${work.id}`;

      let finalDates = ["unassigned"];
      let finalNotes = null;
      let finalDayOrder = null;

      // GHOST DETECTION & CLASH RESOLUTION
      if (existingByCode[assignCode]) {
        const currentEntry = existingByCode[assignCode].data;

        // Carry over manual data (dates, notes, etc.)
        if (currentEntry.scheduledDates) finalDates = currentEntry.scheduledDates;
        if (currentEntry.notes) finalNotes = currentEntry.notes;
        if (currentEntry.dayOrder) finalDayOrder = currentEntry.dayOrder;

        // If the IDs are different, the old one is a "ghost" (repost). Delete it.
        if (currentEntry.assignmentId !== work.id) {
          bulkPayload[existingByCode[assignCode].key] = null;
        }
      }

      // Add/Update the current assignment
      bulkPayload[fbKey] = {
        assignmentId: work.id,
        classId: classId,
        topicId: work.topicId || "",
        title: work.title,
        className: className,
        topicName: topicName,
        assignmentCode: assignCode,
        encodedUrl: `https://classroom.google.com/c/${encodedClassId}/a/${encodedAssId}/details`,
        state: work.state || "PUBLISHED",
        workType: work.workType || "ASSIGNMENT",
        timestampCreated: work.creationTime ? new Date(work.creationTime).getTime() : Date.now(),
        dueDateString: work.dueDate ? `${work.dueDate.year}-${work.dueDate.month}-${work.dueDate.day}` : "",
        maxPoints: work.maxPoints || 0,
        scheduledDates: finalDates,
        notes: finalNotes,
        dayOrder: finalDayOrder
      };
    });

    // NOTE: The general "Cleanup" loop is removed. 
    // This ensures assignments from previous years/classes remain in the RTDB 
    // unless their code clashes with a current sync item.

    if (Object.keys(bulkPayload).length > 0) {
      UrlFetchApp.fetch(classNodeUrl, {
        method: "patch",
        contentType: "application/json; charset=utf-8",
        payload: JSON.stringify(bulkPayload),
        muteHttpExceptions: true
      });
    }
    return { status: "success", syncedCount: allCourseWork.length };
  } catch (error) {
    throw new Error(`Sync failed: ${error.message}`);
  }
}

// ==========================================
// 5. STUDENT REPORT CARD SYNC
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
// 6. TEACHER GRADEBOOK SYNC
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
  const unitMappingDictionary = {};

  allCourseWork.forEach(work => {
    let topicName = topicMap[work.topicId] || "Uncategorized";
    let assignmentCode = generateAssignmentCode(className, topicName, work.title);

    let codeParts = assignmentCode.split('_');
    let unitCode = codeParts.length > 1 ? codeParts[1] : "U00";

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

function getDriveFileIdByName(folderId, fileName) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFilesByName(fileName);
    if (files.hasNext()) return files.next().getId();
    return null;
  } catch (e) {
    return null;
  }
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Classroom Sync Admin').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

