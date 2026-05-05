// ==========================================
// 1. GLOBAL CONFIGURATION & AUTH
// ==========================================
// A secret password to prevent unauthorized access to your API
const API_KEY = PropertiesService.getScriptProperties().getProperty("APP_API_KEY");
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");

const ROSTER_CONFIG = {
  chemistry: { id: "1NT5wVymwWpW5-NPu1cra0LH8byk7LLnVd4FKU1pSTcs", gid: "598574737" },
  physics: { id: "1u1Cd78qCaaoBhJpHTdxSHVFrHKhMZzaBv4Z-K8tP_0A", gid: "1951332896" },
  forensics: { id: "1idQ_iJ-JaqKSEP0wdsgHz1n625AOhVShFHXhVyR1e90", gid: "1951332896" }
};

function triggerAuthorization() {
  Logger.log("Authorization check complete!");
}

// ==========================================
// 2. WEBHOOK HANDLER
// ==========================================
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

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Classroom Sync Admin').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}






// ==========================================
// 3. BATCH ASSIGNMENT CREATION
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

  const cleanClassName = className.replace(/\bQ\d\b/gi, '').replace(/\bSpring\b/gi, '').replace(/\bForensic Science\b/gi, 'Forensics').replace(/\s{2,}/g, ' ').trim();
  let subj = "ZZ";
  let lowerClassName = cleanClassName.toLowerCase();
  if (lowerClassName.includes("chemistry")) subj = "CH";
  else if (lowerClassName.includes("physics")) subj = "PH";
  else if (lowerClassName.includes("forensic")) subj = "FS";

  let periodMatch = cleanClassName.match(/P\d/i);
  let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";
  let classFolder = `${subj}_${period}_${classId}`;
  let b64Course = Utilities.base64EncodeWebSafe(classId.toString());

  let currentTopics = [];
  try { currentTopics = Classroom.Courses.Topics.list(classId).topic || []; } catch (e) { }
  
  let currentRoster = [];
  try { currentRoster = Classroom.Courses.Students.list(classId).students || []; } catch (e) { }

  const gcIdToHashedMap = {};
  currentRoster.forEach(student => {
    if (student.profile && student.profile.emailAddress) {
      gcIdToHashedMap[student.userId.toString()] = getSaltedStudentHash(student.profile.emailAddress);
    }
  });

  const rtdbUrl = `${FIREBASE_DB_URL}/schedulerAssignments/${classFolder}.json?auth=${FIREBASE_SECRET}`;
  const rtdbData = JSON.parse(UrlFetchApp.fetch(rtdbUrl).getContentText()) || {};
  const existingByCode = {};
  Object.keys(rtdbData).forEach(fbKey => {
    if (rtdbData[fbKey] && rtdbData[fbKey].assignmentCode) {
      existingByCode[rtdbData[fbKey].assignmentCode] = { key: fbKey, data: rtdbData[fbKey] };
    }
  });

  let postedCount = 0;
  let errorLog = [];
  let firebaseUpdates = {}; 
  const currentTimestamp = Date.now();

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
        parsedDate = { year: parseInt(dateParts[2]), month: parseInt(dateParts[0]), day: parseInt(dateParts[1]) }; 
        defaultDueTime = { hours: 0, minutes: 0, seconds: 0 };
      }

      let assignedStudentIds = currentRoster.map(s => s.userId); 
      let individualStudentsOptions = undefined;
      if (assignment.studentsCell) {
        const studentEmails = assignment.studentsCell.split(',').map(e => e.trim().toLowerCase());
        const studentIds = [];
        studentEmails.forEach(email => {
          const student = currentRoster.find(s => s.profile && s.profile.emailAddress.toLowerCase() === email);
          if (student) studentIds.push(student.userId);
        });
        if (studentIds.length > 0) {
            individualStudentsOptions = { studentIds: studentIds };
            assignedStudentIds = studentIds; 
        }
      }

      let createdWork;
      let workType = assignment.workType === "MATERIAL" ? "MATERIAL" : "ASSIGNMENT";

      if (workType === "MATERIAL") {
        const materialObj = {
          title: assignment.title, description: assignment.description || "", materials: materials,
          state: (assignment.state || "PUBLISHED").toUpperCase(), topicId: topicId,
          assigneeMode: individualStudentsOptions ? 'INDIVIDUAL_STUDENTS' : undefined, individualStudentsOptions: individualStudentsOptions
        };
        createdWork = Classroom.Courses.CourseWorkMaterials.create(materialObj, classId);
      } else {
        const courseworkObj = {
          title: assignment.title, description: assignment.description || "", materials: materials,
          state: (assignment.state || "PUBLISHED").toUpperCase(), workType: "ASSIGNMENT", topicId: topicId,
          maxPoints: assignment.maxPoints || undefined, dueDate: parsedDate, dueTime: defaultDueTime,
          assigneeMode: individualStudentsOptions ? 'INDIVIDUAL_STUDENTS' : undefined, individualStudentsOptions: individualStudentsOptions
        };
        createdWork = Classroom.Courses.CourseWork.create(courseworkObj, classId);
      }

      let assignmentId = createdWork.id;
      let topicName = assignment.topicName || "Uncategorized";
      let assignCode = generateAssignmentCode(cleanClassName, topicName, assignment.title);
      let assignmentKey = `${assignCode}_${assignmentId}`;
      let b64Work = Utilities.base64EncodeWebSafe(assignmentId.toString());
      let assignmentUrl = `https://classroom.google.com/c/${b64Course}/a/${b64Work}/details`;

      let finalDates = ["unassigned"];
      let finalNotes = null;
      let finalDayOrder = null;

      // 1. Ghost Adoption (Scheduler side)
      if (existingByCode[assignCode]) {
        const oldEntry = existingByCode[assignCode].data;
        const oldKey = existingByCode[assignCode].key;
        if (oldEntry.scheduledDates) finalDates = oldEntry.scheduledDates;
        if (oldEntry.notes) finalNotes = oldEntry.notes;
        if (oldEntry.dayOrder) finalDayOrder = oldEntry.dayOrder;
        firebaseUpdates[`schedulerAssignments/${classFolder}/${oldKey}`] = null;
      }

      // 2. Gradebook Adoption (Student data side)
      let ghostKey = null;
      try {
        const gradebookKeys = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/teacherGradebook/${classFolder}.json?auth=${FIREBASE_SECRET}&shallow=true`).getContentText()) || {};
        ghostKey = Object.keys(gradebookKeys).find(k => k.startsWith(assignCode) && k !== assignmentKey);
      } catch(e) {}

      if (ghostKey) {
        const ghostUrl = `${FIREBASE_DB_URL}/teacherGradebook/${classFolder}/${ghostKey}.json?auth=${FIREBASE_SECRET}`;
        const ghostData = JSON.parse(UrlFetchApp.fetch(ghostUrl).getContentText()) || {};

        Object.keys(ghostData).forEach(key => {
          if (key.length === 64) {
            firebaseUpdates[`teacherGradebook/${classFolder}/${assignmentKey}/${key}`] = ghostData[key];
            firebaseUpdates[`StudentReportCards/${key}/${classFolder}/${assignmentKey}`] = ghostData[key];
          }
        });

        firebaseUpdates[`teacherGradebook/${classFolder}/${ghostKey}`] = null;
        firebaseUpdates[`StudentReportCards/${classFolder}/${ghostKey}`] = null;
        Object.values(gcIdToHashedMap).forEach(hash => {
           firebaseUpdates[`StudentReportCards/${hash}/${classFolder}/${ghostKey}`] = null;
        });
      }

      // 3. Update the clean scheduler item
      let cleanSchedulerItem = {
        assignmentCode: assignCode, classId: classId, className: cleanClassName,
        topicId: topicId || "", topicName: topicName, assignmentId: assignmentId, title: assignment.title,
        maxPoints: assignment.maxPoints || 0, encodedUrl: assignmentUrl, workType: workType,
        state: (assignment.state || "PUBLISHED").toUpperCase(), scheduledDates: finalDates, timestampCreated: currentTimestamp
      };
      if (finalDayOrder) cleanSchedulerItem.dayOrder = finalDayOrder;
      if (finalNotes) cleanSchedulerItem.notes = finalNotes;
      
      // RULE: Exclude Bellringers from Scheduler
      if (topicName.toLowerCase().indexOf("bellringer") === -1) {
         firebaseUpdates[`schedulerAssignments/${classFolder}/${assignmentKey}`] = cleanSchedulerItem;
      }

      // Always update Grading nodes
      firebaseUpdates[`StudentReportCards/${classFolder}/${assignmentKey}/title`] = assignment.title;
      firebaseUpdates[`StudentReportCards/${classFolder}/${assignmentKey}/url`] = assignmentUrl;
      firebaseUpdates[`StudentReportCards/${classFolder}/${assignmentKey}/unitName`] = topicName;
      firebaseUpdates[`teacherGradebook/${classFolder}/${assignmentKey}/title`] = assignment.title;
      firebaseUpdates[`teacherGradebook/${classFolder}/${assignmentKey}/url`] = assignmentUrl;

      let codeParts = assignCode.split('_');
      let unitCode = codeParts.length > 1 ? codeParts[1] : "U00";
      firebaseUpdates[`teacherGradebook/${classFolder}/_unitMap/${unitCode}`] = topicName;

      postedCount++;
      Utilities.sleep(1000); 

    } catch (e) {
      errorLog.push(`Failed to process "${assignment.title}": ${e.message}`);
    }
  });

  if (postedCount > 0 && Object.keys(firebaseUpdates).length > 0) {
    try {
      UrlFetchApp.fetch(`${FIREBASE_DB_URL}/.json?auth=${FIREBASE_SECRET}`, {
        method: "patch", contentType: "application/json", payload: JSON.stringify(firebaseUpdates)
      });
    } catch (e) { errorLog.push(`Firebase rejected: ${e.message}`); }
  }

  return { status: errorLog.length === 0 ? "success" : "partial", message: `Successfully posted ${postedCount} assignments.`, errors: errorLog };
}












// ==========================================
// 4. MAIN ASSIGNMENT SYNC (Scheduler)
// ==========================================
function syncClassroomToDatabase(classId, className) {
  try {
    const encodedClassId = Utilities.base64EncodeWebSafe(classId);
    const cleanClassName = className.replace(/\bQ\d\b/gi, '').replace(/\s{2,}/g, ' ').trim();

    let subj = "ZZ";
    let lowerClassName = cleanClassName.toLowerCase();
    if (lowerClassName.includes("chemistry")) subj = "CH";
    else if (lowerClassName.includes("physics")) subj = "PH";
    else if (lowerClassName.includes("forensic")) subj = "FS";

    let periodMatch = cleanClassName.match(/P\d/i);
    let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";
    let classFolder = `${subj}_${period}_${classId}`;

    // --- A. FETCH CURRENT DATA FROM FIREBASE ---
    const classNodeUrl = `${FIREBASE_DB_URL}/schedulerAssignments/${classFolder}.json?auth=${FIREBASE_SECRET}`;
    const rtdbData = JSON.parse(UrlFetchApp.fetch(classNodeUrl).getContentText()) || {};

    const orphanChecklist = new Set(Object.keys(rtdbData)); 
    const existingByCode = {};
    Object.keys(rtdbData).forEach(fbKey => {
      const entry = rtdbData[fbKey];
      if (entry && entry.assignmentCode) {
        existingByCode[entry.assignmentCode] = { key: fbKey, data: entry };
        // RULE 1: Protect "Custom Notes" from deletion
        if (entry.topicName === "Custom Notes") orphanChecklist.delete(fbKey);
      }
    });

    // --- B. FETCH ALL ASSIGNMENTS FROM GOOGLE CLASSROOM (The missing block!) ---
    let allCourseWork = []; 
    let pageToken = null;
    try {
      do {
        const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
        if (response && response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
        pageToken = response ? response.nextPageToken : null;
      } while (pageToken);
    } catch (e) { /* No assignments found */ }

    // Fetch Topics to map Names to IDs
    const topicsMap = {}; 
    let topicPageToken = null;
    try {
      do {
        const response = Classroom.Courses.Topics.list(classId, { pageToken: topicPageToken });
        if (response && response.topic) response.topic.forEach(t => topicsMap[t.topicId] = t.name);
        topicPageToken = response ? response.nextPageToken : null;
      } while (topicPageToken);
    } catch (e) { /* No topics found */ }

    const bulkPayload = {};

    // --- C. PROCESS THE SYNC LOOP ---
    allCourseWork.forEach(work => {
      let topicName = work.topicId ? (topicsMap[work.topicId] || "Uncategorized") : "Uncategorized";
      
      // RULE 2: Exclude Bellringers from the Scheduler planning node
      if (topicName.toLowerCase().includes("bellringer")) return;

      const assignCode = generateAssignmentCode(cleanClassName, topicName, work.title);
      const encodedAssId = Utilities.base64EncodeWebSafe(work.id);
      let fbKey = `${assignCode}_${work.id}`;

      // Mark as active in Classroom
      orphanChecklist.delete(fbKey); 

      let finalDates = ["unassigned"];
      let finalNotes = null;
      let finalDayOrder = null;

      // RULE 3: Ghost Adoption / Rescue Logic
      if (existingByCode[assignCode]) {
        const currentEntry = existingByCode[assignCode].data;
        const oldKey = existingByCode[assignCode].key;

        if (currentEntry.scheduledDates) finalDates = currentEntry.scheduledDates;
        if (currentEntry.notes) finalNotes = currentEntry.notes;
        if (currentEntry.dayOrder) finalDayOrder = currentEntry.dayOrder;

        if (oldKey !== fbKey) {
          bulkPayload[oldKey] = null;
          orphanChecklist.delete(oldKey); 
        }
      }

      const cleanItem = {
        assignmentCode: assignCode, classId: classId, className: cleanClassName,
        topicId: work.topicId || "", topicName: topicName, assignmentId: work.id, title: work.title,
        maxPoints: work.maxPoints || 0, encodedUrl: `https://classroom.google.com/c/${encodedClassId}/a/${encodedAssId}/details`,
        workType: work.workType || "ASSIGNMENT", state: work.state || "PUBLISHED",
        scheduledDates: finalDates, timestampCreated: work.creationTime ? new Date(work.creationTime).getTime() : Date.now()
      };
      if (finalDayOrder !== null && finalDayOrder !== undefined) cleanItem.dayOrder = finalDayOrder;
      if (finalNotes !== null && finalNotes !== undefined) cleanItem.notes = finalNotes;

      bulkPayload[fbKey] = cleanItem;
    });

    // --- D. FINAL ORPHAN SWEEP ---
    orphanChecklist.forEach(abandonedKey => {
       const entry = rtdbData[abandonedKey];
       if (entry && entry.topicName === "Custom Notes") return;
       if (abandonedKey.startsWith("-")) return;

       bulkPayload[abandonedKey] = null;
    });

    if (Object.keys(bulkPayload).length > 0) {
      UrlFetchApp.fetch(classNodeUrl, { method: "patch", contentType: "application/json", payload: JSON.stringify(bulkPayload) });
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
  try {
    const cleanClassName = className.replace(/\bQ\d\b/gi, '').replace(/\bSpring\b/gi, '').replace(/\bForensic Science\b/gi, 'Forensics').replace(/\s{2,}/g, ' ').trim();
    let subj = "ZZ";
    let lowerClassName = cleanClassName.toLowerCase();
    if (lowerClassName.includes("chemistry")) subj = "CH";
    else if (lowerClassName.includes("physics")) subj = "PH";
    else if (lowerClassName.includes("forensic")) subj = "FS";

    let periodMatch = cleanClassName.match(/P\d/i);
    let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";
    let classFolder = `${subj}_${period}_${classId}`;

    let classroomUsers = [];
    try { classroomUsers = Classroom.Courses.Students.list(classId).students || []; } catch(e) {}
    
    const gcIdToHashedMap = {};
    classroomUsers.forEach(student => {
      if (student.profile && student.profile.emailAddress) {
        gcIdToHashedMap[student.userId.toString()] = getSaltedStudentHash(student.profile.emailAddress);
      }
    });

    const topicMap = {}; 
    let topicPageToken = null;
    try {
      do {
        const response = Classroom.Courses.Topics.list(classId, { pageToken: topicPageToken });
        if (response && response.topic) response.topic.forEach(t => topicMap[t.topicId] = t.name);
        topicPageToken = response ? response.nextPageToken : null;
      } while (topicPageToken);
    } catch(e) {}

    let allCourseWork = []; let pageToken = null;
    try {
      do {
        const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
        if (response && response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
        pageToken = response ? response.nextPageToken : null;
      } while (pageToken);
    } catch(e) {}

    let firebaseUpdates = {};

    allCourseWork.forEach(work => {
      let topicName = topicMap[work.topicId] || "";
      if (topicName.toLowerCase().includes("bellringer")) return; 
      
      let assignmentCode = generateAssignmentCode(cleanClassName, topicName, work.title);
      let assignmentKey = `${assignmentCode}_${work.id}`; 
      
      let b64Course = Utilities.base64EncodeWebSafe(classId.toString());
      let b64Work = Utilities.base64EncodeWebSafe(work.id.toString());
      let assignmentUrl = `https://classroom.google.com/c/${b64Course}/a/${b64Work}/details`;

      let metaPath = `StudentReportCards/${classFolder}/${assignmentKey}`;
      firebaseUpdates[`${metaPath}/title`] = work.title;
      firebaseUpdates[`${metaPath}/url`] = assignmentUrl;
      firebaseUpdates[`${metaPath}/unitName`] = topicName;

      if (work.workType !== "MATERIAL") {
        try {
          let submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(classId, work.id).studentSubmissions || [];
          submissions.forEach(sub => {
            let saltedHashedEmail = gcIdToHashedMap[sub.userId];
            if (saltedHashedEmail) {
              let studentPath = `StudentReportCards/${saltedHashedEmail}/${classFolder}/${assignmentKey}`;
              
              firebaseUpdates[`${studentPath}/_exists`] = true;
              if (sub.assignedGrade !== undefined && sub.assignedGrade !== null) {
                firebaseUpdates[`${studentPath}/score`] = sub.assignedGrade;
              }
            }
          });
        } catch (err) { console.warn(`Error fetching grades for ${work.title}: ${err.message}`); }
      } else {
        classroomUsers.forEach(student => {
          let saltedHashedEmail = gcIdToHashedMap[student.userId];
          if (saltedHashedEmail) {
             let studentPath = `StudentReportCards/${saltedHashedEmail}/${classFolder}/${assignmentKey}`;
             firebaseUpdates[`${studentPath}/_exists`] = true;
          }
        });
      }
    });

    if (Object.keys(firebaseUpdates).length > 0) patchFirebaseGradebook(firebaseUpdates);
    
    return { status: "success", message: `Successfully synced StudentReportCards for ${cleanClassName}.` };
    
  } catch (error) {
    throw new Error(`Sync Gradebook failed: ${error.message}`);
  }
}










// ==========================================
// 6. TEACHER GRADEBOOK SYNC
// ==========================================
function syncTeacherGradebook(classId, className) {
  try {
    const cleanClassName = className.replace(/\bQ\d\b/gi, '').replace(/\bSpring\b/gi, '').replace(/\bForensic Science\b/gi, 'Forensics').replace(/\s{2,}/g, ' ').trim();
    let subj = "ZZ";
    let lowerClassName = cleanClassName.toLowerCase();
    if (lowerClassName.includes("chemistry")) subj = "CH";
    else if (lowerClassName.includes("physics")) subj = "PH";
    else if (lowerClassName.includes("forensic")) subj = "FS";

    let periodMatch = cleanClassName.match(/P\d/i);
    let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";
    let classFolder = `${subj}_${period}_${classId}`;

    let classroomUsers = [];
    try { classroomUsers = Classroom.Courses.Students.list(classId).students || []; } catch(e) {}
    
    const gcIdToHashedMap = {};
    classroomUsers.forEach(student => {
      if (student.profile && student.profile.emailAddress) {
        gcIdToHashedMap[student.userId.toString()] = getSaltedStudentHash(student.profile.emailAddress);
      }
    });

    const topicMap = {}; 
    let topicPageToken = null;
    try {
      do {
        const response = Classroom.Courses.Topics.list(classId, { pageToken: topicPageToken });
        if (response && response.topic) response.topic.forEach(t => topicMap[t.topicId] = t.name);
        topicPageToken = response ? response.nextPageToken : null;
      } while (topicPageToken);
    } catch(e) {}

    let allCourseWork = []; let pageToken = null;
    try {
      do {
        const response = Classroom.Courses.CourseWork.list(classId, { pageToken: pageToken, courseWorkStates: ["PUBLISHED", "DRAFT"] });
        if (response && response.courseWork) allCourseWork = allCourseWork.concat(response.courseWork);
        pageToken = response ? response.nextPageToken : null;
      } while (pageToken);
    } catch(e) {}

    let firebaseUpdates = {};
    const currentTimestamp = Date.now();
    const unitMappingDictionary = {};

    allCourseWork.forEach(work => {
      let topicName = topicMap[work.topicId] || "Uncategorized";
      let assignmentCode = generateAssignmentCode(cleanClassName, topicName, work.title);
      let assignmentKey = `${assignmentCode}_${work.id}`;

      let codeParts = assignmentCode.split('_');
      let unitCode = codeParts.length > 1 ? codeParts[1] : "U00";
      unitMappingDictionary[unitCode] = topicName;

      let b64Course = Utilities.base64EncodeWebSafe(classId.toString());
      let b64Work = Utilities.base64EncodeWebSafe(work.id.toString());
      let assignmentUrl = `https://classroom.google.com/c/${b64Course}/a/${b64Work}/details`;

      let basePath = `teacherGradebook/${classFolder}/${assignmentKey}`;

      firebaseUpdates[`${basePath}/url`] = assignmentUrl;
      firebaseUpdates[`${basePath}/title`] = work.title;

      if (work.workType !== "MATERIAL") {
        try {
          let submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(classId, work.id).studentSubmissions || [];
          submissions.forEach(sub => {
            let saltedHashedEmail = gcIdToHashedMap[sub.userId];
            if (saltedHashedEmail) {
              let score = (sub.assignedGrade !== undefined && sub.assignedGrade !== null) ? sub.assignedGrade : null;
              let statusText = sub.state ? sub.state.toLowerCase() : "assigned";
              let studentPath = `${basePath}/${saltedHashedEmail}`;

              firebaseUpdates[`${studentPath}/score`] = score;
              firebaseUpdates[`${studentPath}/status`] = statusText;
              firebaseUpdates[`${studentPath}/gcSynced`] = (score !== null);
              firebaseUpdates[`${studentPath}/lastUpdated`] = currentTimestamp;
            }
          });
        } catch (err) { console.warn(`Error fetching grades for ${work.title}: ${err.message}`); }
      }
    });

    Object.keys(unitMappingDictionary).forEach(uCode => {
      firebaseUpdates[`teacherGradebook/${classFolder}/_unitMap/${uCode}`] = unitMappingDictionary[uCode];
    });

    if (Object.keys(firebaseUpdates).length > 0) patchFirebaseGradebook(firebaseUpdates);
    
    return { status: "success", message: `Mapped Teacher Gradebook for ${cleanClassName}.` };

  } catch (error) {
    throw new Error(`Sync Teacher Gradebook failed: ${error.message}`);
  }
}









// ==========================================
// 7. BUILD STUDENT ROSTER IN FIREBASE
// ==========================================
function buildStudentRosterInFirebase() {
  if (!EMAIL_SALT) {
    Logger.log("Error: Missing EMAIL_SALT in Script Properties.");
    return;
  }

  const MASTER_SHEET_ID = "1toxgffc7B3ahE70q9ChTE7wC3o27l9a3e9uodHLc1iM";
  const sheet = SpreadsheetApp.openById(MASTER_SHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  const rosterPayload = {};

  for (let i = 1; i < data.length; i++) {
    let rawIdentifier = data[i][0]; // Column A (Could be raw email OR hash)
    let className = data[i][1];     // Column B
    let classId = data[i][2];       // Column C
    
    if (rawIdentifier && className && classId) {
      let finalHashedEmail = "";
      
      // Check if it's an unknown raw email address and hash it on the fly
      if (rawIdentifier.toString().includes("@")) {
        finalHashedEmail = getSaltedStudentHash(rawIdentifier.toString());
      } else {
        finalHashedEmail = rawIdentifier.toString().trim();
      }
      
      let cleanClassName = className.toString().replace(/\bQ\d\b/gi, '').replace(/\bSpring\b/gi, '').replace(/\bForensic Science\b/gi, 'Forensics').replace(/\s{2,}/g, ' ').trim();
      let subj = "ZZ";
      let lower = cleanClassName.toLowerCase();
      
      if (lower.includes("chemistry")) subj = "CH";
      else if (lower.includes("physics")) subj = "PH";
      else if (lower.includes("forensic")) subj = "FS";

      let periodMatch = cleanClassName.match(/P\d/i);
      let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";
      let classFolder = `${subj}_${period}_${classId}`;

      if (!rosterPayload[finalHashedEmail]) {
        rosterPayload[finalHashedEmail] = {};
      }
      
      rosterPayload[finalHashedEmail][classFolder] = true;
    }
  }

  const options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(rosterPayload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(`${FIREBASE_DB_URL}/studentRoster.json?auth=${FIREBASE_SECRET}`, options);
  
  if (response.getResponseCode() === 200) Logger.log("Successfully built studentRoster in Firebase!");
  else Logger.log("Error: " + response.getContentText());
}

// --- GLOBAL HELPER FUNCTIONS ---

/**
 * Generates a SHA-256 salted hash using the global EMAIL_SALT property
 */
function getSaltedStudentHash(email) {
  if (!EMAIL_SALT) throw new Error("EMAIL_SALT is not defined in Script Properties.");
  const safeEmail = email.toString().toLowerCase().trim();
  const saltedEmail = EMAIL_SALT + safeEmail;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedEmail);
  return digest.map(byte => ('0' + (byte < 0 ? byte + 256 : byte).toString(16)).slice(-2)).join('');
}

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
    const files = folder.getFilesByNme(fileName);
    if (files.hasNext()) return files.next().getId();
    return null;
  } catch (e) {
    return null;
  }
}







