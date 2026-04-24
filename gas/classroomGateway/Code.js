// A secret password to prevent unauthorized access to your API
const API_KEY = PropertiesService.getScriptProperties().getProperty("APP_API_KEY"); 


// Run this once to trigger the Auth flow based on your appsscript.json
function triggerAuthorization() {
  Logger.log("Authorization check complete!");
}


function doPost(e) {
  try {
    // 1. Parse the incoming data package
    const data = JSON.parse(e.postData.contents);
    
    // 2. Security Check
    if (data.apiKey !== API_KEY) {
      return sendResponse({ status: "error", message: "Unauthorized: Invalid API Key" });
    }

    // 3. The Switchboard (Route to the correct function based on the requested 'action')
    let result;
    if (data.action === "postAssignment") {
      result = createClassroomAssignment(data.payload);
    } 
    else if (data.action === "updateGrades") {
      result = updateClassroomGrades(data.payload);
    } 
    else {
      return sendResponse({ status: "error", message: "Unknown action requested." });
    }

    // 4. Send the result back to the Google Sheet
    return sendResponse(result);

  } catch (error) {
    return sendResponse({ status: "error", message: "Server Error: " + error.message });
  }
}

// Helper function to format the response so the Google Sheet understands it
function sendResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
                       .setMimeType(ContentService.MimeType.JSON);
}

// --- YOUR ACTUAL CLASSROOM FUNCTIONS GO BELOW ---

// ==========================================
// 1. GLOBAL CONFIGURATION (Put these at the very top!)
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com"; 
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");

// ==========================================
// 2. FIREBASE HELPER FUNCTION (UPGRADED FOR BULK SYNC)
// ==========================================
function sendToFirebase(firebaseDataObjects) {
  // 1. Bundle all assignments into a single update object
  const bulkUpdatePayload = {};
  firebaseDataObjects.forEach(data => {
    bulkUpdatePayload[data.assignmentId] = data;
  });

  // 2. Point to the main /assignments node
  const url = `${FIREBASE_DB_URL}/assignments.json?auth=${FIREBASE_SECRET}`;
  
  // 3. Send a single PATCH request with explicitly declared UTF-8 charset
  const options = {
    method: "patch", // 'patch' updates these specific items without wiping the rest of the database
    contentType: "application/json; charset=utf-8", // <-- Protects your bold unicode text!
    payload: JSON.stringify(bulkUpdatePayload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    console.error("Firebase Bulk Sync Error:", response.getContentText());
    throw new Error("Failed to push data to Firebase. Check the Apps Script execution log.");
  }
}

// ==========================================
// 3. YOUR MAIN ASSIGNMENT FUNCTION
// ==========================================
function createClassroomAssignment(payload) {
  const className = payload.className;
  const assignments = payload.assignments;

  let postedCount = 0;
  const firebaseDataObjects = []; 

  try {
    const classId = getClassIdByName(className);
    const encodedClassId = Utilities.base64EncodeWebSafe(classId);

    assignments.forEach(assignment => {
      
      if (!["DRAFT", "PUBLISHED", "DELETED"].includes(assignment.state)) return;

      const materials = [];

      if (assignment.files && assignment.files.length > 0 && assignment.folderId) {
        assignment.files.forEach(fileName => {
          const file = getFileByName(assignment.folderId, fileName);
          if (file) {
            materials.push({ driveFile: { driveFile: { id: file.getId() } } });
          }
        });
      }

      if (assignment.links) {
        const linkList = assignment.links.split(',').map(link => link.trim());
        linkList.forEach(linkUrl => {
          if (linkUrl) materials.push({ link: { url: linkUrl } });
        });
      }

      let topicId = null;
      if (assignment.topicName) {
        topicId = getTopicIdByName(classId, assignment.topicName) || createTopic(classId, assignment.topicName);
      }

      let individualStudentsOptions = null;
      if (assignment.studentsCell) {
        const studentEmails = assignment.studentsCell.split(',').map(email => email.trim());
        const studentIds = getStudentIdsFromEmails(classId, studentEmails);
        if (studentIds.length > 0) individualStudentsOptions = { studentIds: studentIds };
      }

      let parsedDate = undefined;
      if (assignment.dueDateString) {
        let dateStr = assignment.dueDateString.toString();
        
        // If the string is NOT an ISO timestamp (meaning it doesn't contain a "T"),
        // we replace dashes with slashes. JS parses "M/D/YYYY" perfectly, 
        // but can sometimes get confused by "M-D-YYYY".
        if (!dateStr.includes("T")) {
          dateStr = dateStr.replace(/-/g, "/"); 
        }
        
        // Let JavaScript's native engine handle the heavy lifting
        let dateObj = new Date(dateStr);
        
        // Ensure it parsed correctly before passing to Classroom
        if (!isNaN(dateObj.getTime())) {
           parsedDate = {
            "year": dateObj.getFullYear(),
            "month": dateObj.getMonth() + 1, // JS months are 0-11, Classroom expects 1-12
            "day": dateObj.getDate()
          };
        }
      }

      const defaultDueTime = { "hours": 23, "minutes": 59, "seconds": 59 };
      let createdItem = null;

      if (assignment.workType === "ASSIGNMENT") {
        const coursework = {
          title: assignment.title,
          description: assignment.description || "",
          materials: materials,
          state: assignment.state.toUpperCase(),
          workType: "ASSIGNMENT",
          topicId: topicId,
          assigneeMode: individualStudentsOptions ? 'INDIVIDUAL_STUDENTS' : undefined,
          individualStudentsOptions: individualStudentsOptions || undefined,
          maxPoints: assignment.maxPoints || undefined,
          dueDate: parsedDate || undefined,
          dueTime: parsedDate ? defaultDueTime : undefined,
        };
        createdItem = Classroom.Courses.CourseWork.create(coursework, classId);
        postedCount++;
      } 
      else if (assignment.workType === "MATERIAL") {
        const material = {
          title: assignment.title,
          description: assignment.description || "",
          materials: materials,
          state: assignment.state.toUpperCase(),
          topicId: topicId,
          assigneeMode: individualStudentsOptions ? 'INDIVIDUAL_STUDENTS' : undefined,
          individualStudentsOptions: individualStudentsOptions || undefined,
        };
        createdItem = Classroom.Courses.CourseWorkMaterials.create(material, classId);
        postedCount++;
      }

      if (createdItem) {
        const encodedAssId = Utilities.base64EncodeWebSafe(createdItem.id);
        const urlType = assignment.workType === "MATERIAL" ? "m" : "a"; // Materials use /m/ in URL
        const encodedUrl = `https://classroom.google.com/c/${encodedClassId}/${urlType}/${encodedAssId}/details`;
        
        firebaseDataObjects.push({
          assignmentId: createdItem.id,
          title: assignment.title,
          classId: classId,
          className: className, 
          topicId: createdItem.topicId || topicId || "", 
          topicName: assignment.topicName || "", 
          encodedUrl: encodedUrl,
          state: assignment.state.toUpperCase(),
          workType: assignment.workType || "ASSIGNMENT",
          timestampCreated: Date.now(),
          dueDateString: assignment.dueDateString || "",
          maxPoints: assignment.maxPoints || 0,
          scheduledDates: ["unassigned"], 
          sortIndex: 0,
          category: "",
          durationMinutes: 0
        });
      }
    });

    if (firebaseDataObjects.length > 0) {
      sendToFirebase(firebaseDataObjects);
    }

    return { 
      status: "success", 
      message: `Successfully posted ${postedCount} items to ${className} and synced to database.` 
    };

  } catch (error) {
    throw new Error(`Failed during Classroom API execution: ${error.message}`);
  }
}

function updateClassroomGrades(payload) {
  const className = payload.className;
  const assignmentName = payload.assignmentName;
  const gradesArray = payload.gradesArray; 

  let updatedCount = 0;
  let errorLog = [];

  try {
    const classId = getClassIdByName(className);
    const courseWorkList = Classroom.Courses.CourseWork.list(classId).courseWork || [];
    const assignment = courseWorkList.find(cw => cw.title.trim().toLowerCase() === assignmentName.toLowerCase());
    
    if (!assignment) {
      throw new Error(`Assignment '${assignmentName}' not found in Classroom.`);
    }
    const assignmentId = assignment.id;
    const maxPoints = assignment.maxPoints || 100;

    const studentsList = Classroom.Courses.Students.list(classId).students || [];
    const emailToUserId = {};
    studentsList.forEach(s => {
      if (s.profile && s.profile.emailAddress) {
        emailToUserId[s.profile.emailAddress.toLowerCase().trim()] = s.userId;
      }
    });

    const studentSubmissionsList = Classroom.Courses.CourseWork.StudentSubmissions.list(classId, assignmentId);
    const studentSubmissions = studentSubmissionsList.studentSubmissions || [];

    gradesArray.forEach(item => {
      const email = item.email.toLowerCase().trim();
      const gradeValue = parseFloat(item.grade);

      if (isNaN(gradeValue)) {
        errorLog.push(`Skipped ${email}: Grade is not a number.`);
        return; 
      }

      const userId = emailToUserId[email];
      if (!userId) {
        errorLog.push(`Skipped ${email}: Not found in Classroom roster.`);
        return;
      }

      const submission = studentSubmissions.find(sub => sub.userId === userId);
      if (!submission) {
        errorLog.push(`Skipped ${email}: No submission file found.`);
        return;
      }

      try {
        const patchObj = { 'assignedGrade': gradeValue, 'draftGrade': gradeValue };
        
        Classroom.Courses.CourseWork.StudentSubmissions.patch(
          patchObj, classId, assignmentId, submission.id, { 'updateMask': 'assignedGrade,draftGrade' }
        );
        
        Classroom.Courses.CourseWork.StudentSubmissions['return'](
          {}, classId, assignmentId, submission.id
        );
        
        updatedCount++;
      } catch (e) {
        errorLog.push(`Skipped ${email}: API Error - ${e.message}`);
      }
    });

    return {
      status: "success",
      message: `Successfully returned ${updatedCount} grades.`,
      errors: errorLog,
      maxPoints: maxPoints 
    };

  } catch (error) {
     throw new Error(`Grade Update Failed: ${error.message}`);
  }
}

// --- HELPER FUNCTIONS FOR WEB APP ---

function getClassIdByName(className) {
  const courses = Classroom.Courses.list().courses || [];
  const course = courses.find(c => c.name === className);
  if (course) {
    return course.id;
  } else {
    throw new Error("Class not found: " + className);
  }
}

function getFileByName(folderId, fileName) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  } else {
    return null;
  }
}

function getTopicIdByName(classId, topicName) {
  const response = Classroom.Courses.Topics.list(classId);
  const topics = response.topic || [];
  const topic = topics.find(t => t.name === topicName);
  return topic ? topic.topicId : null;
}

function createTopic(classId, topicName) {
  const topic = { name: topicName };
  try {
    const createdTopic = Classroom.Courses.Topics.create(topic, classId);
    return createdTopic.topicId;
  } catch (error) {
    throw new Error("Failed to create topic: " + error.message);
  }
}

function getStudentIdsFromEmails(classId, emails) {
  const studentIds = [];
  const roster = Classroom.Courses.Students.list(classId).students || [];

  emails.forEach(email => {
    const student = roster.find(s => s.profile.emailAddress === email);
    if (student) {
      studentIds.push(student.userId);
    }
  });

  return studentIds;
}

// ==========================================
// ADMIN SYNC INTERFACE FUNCTIONS
// ==========================================

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Admin')
    .setTitle('Classroom Sync Admin')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getActiveClassesForSync() {
  const classes = (Classroom.Courses.list().courses || []).filter(
    c => c.courseState !== "ARCHIVED"
  );
  return classes.map(c => ({ id: c.id, name: c.name })); 
}

// 3. The main sync function
function syncClassroomToDatabase(classId, className) {
  try {
    const encodedClassId = Utilities.base64EncodeWebSafe(classId);
    let allCourseWork = [];
    let pageToken = null;

    // A. Fetch all standard coursework (EXPLICITLY INCLUDING DRAFTS)
    do {
      const response = Classroom.Courses.CourseWork.list(classId, { 
        pageToken: pageToken,
        courseWorkStates: ["PUBLISHED", "DRAFT"] 
      });
      if (response.courseWork) {
        allCourseWork = allCourseWork.concat(response.courseWork);
      }
      pageToken = response.nextPageToken;
    } while (pageToken);

    const gcAssignmentIds = allCourseWork.map(work => work.id);

    // B. Fetch Topics to build a map of ID -> Name
    const topicsMap = {};
    let topicPageToken = null;
    do {
      const response = Classroom.Courses.Topics.list(classId, { pageToken: topicPageToken });
      if (response.topic) {
        response.topic.forEach(t => {
          topicsMap[t.topicId] = t.name;
        });
      }
      topicPageToken = response.nextPageToken;
    } while (topicPageToken);

    // C. Fetch from Firebase
    const searchParam = `orderBy=${encodeURIComponent('"classId"')}&equalTo=${encodeURIComponent(`"${classId}"`)}`;
    const rtdbUrl = `${FIREBASE_DB_URL}/assignments.json?${searchParam}&auth=${FIREBASE_SECRET}`;
    const rtdbData = JSON.parse(UrlFetchApp.fetch(rtdbUrl).getContentText()) || {};

    // D. Deletion Sweep
    let deletedCount = 0;
    Object.keys(rtdbData).forEach(rtdbId => {
      if (!gcAssignmentIds.includes(rtdbId)) {
        UrlFetchApp.fetch(`${FIREBASE_DB_URL}/assignments/${rtdbId}.json?auth=${FIREBASE_SECRET}`, { method: "delete" });
        deletedCount++;
      }
    });

    // E. Build Fresh Payload (WITH DATA PRESERVATION)
    const firebaseDataObjects = [];
    allCourseWork.forEach(work => {
      const encodedAssId = Utilities.base64EncodeWebSafe(work.id);
      
      // --- THE RESCUE MISSION ---
      // Check Firebase data to see if dates, notes, or list orders already exist
      let preservedDates = ["unassigned"];
      let preservedNotes = null;
      let preservedDayOrder = null;

      if (rtdbData[work.id]) {
          if (rtdbData[work.id].scheduledDates) preservedDates = rtdbData[work.id].scheduledDates;
          if (rtdbData[work.id].notes) preservedNotes = rtdbData[work.id].notes;
          if (rtdbData[work.id].dayOrder) preservedDayOrder = rtdbData[work.id].dayOrder;
      }

      firebaseDataObjects.push({
        assignmentId: work.id,
        title: work.title,
        classId: classId,
        className: className,
        topicId: work.topicId || "",
        topicName: work.topicId ? (topicsMap[work.topicId] || "") : "",
        encodedUrl: `https://classroom.google.com/c/${encodedClassId}/a/${encodedAssId}/details`,
        state: work.state || "PUBLISHED",
        workType: work.workType || "ASSIGNMENT",
        timestampCreated: work.creationTime ? new Date(work.creationTime).getTime() : Date.now(),
        dueDateString: work.dueDate ? `${work.dueDate.year}-${work.dueDate.month}-${work.dueDate.day}` : "",
        maxPoints: work.maxPoints || 0,
        
        // --- THE BACKPACK ---
        scheduledDates: preservedDates, 
        notes: preservedNotes,       // Keeps your inline text safe!
        dayOrder: preservedDayOrder, // Keeps your drag-and-drop order safe!
        
        sortIndex: 0,
        category: "",
        durationMinutes: 0
      });
    });

    if (firebaseDataObjects.length > 0) sendToFirebase(firebaseDataObjects);
    
    // F. Extract just the titles for the frontend report
    const syncedTitles = firebaseDataObjects.map(data => data.title);

    // G. Return the count, deleted count, AND the array of titles
    return { 
      count: firebaseDataObjects.length, 
      deletedCount: deletedCount,
      syncedTitles: syncedTitles 
    };
    
  } catch (error) {
    throw new Error(`Sync failed: ${error.message}`);
  }
}