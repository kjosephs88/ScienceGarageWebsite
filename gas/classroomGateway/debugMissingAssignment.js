function debugMissingAssignment() {
  // 👇 CHANGE THESE TWO VARIABLES TO MATCH YOUR MISSING ASSIGNMENT 👇
  const TARGET_CLASS_NAME = "Spring 2026 P1 Q3 Forensic Science"; 
  const TARGET_ASSIGNMENT_TITLE = "03 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃 - Lab 1 - Locard's Exchange Principle (printout)"; 

  try {
    // 1. Find the Class ID
    const courses = Classroom.Courses.list().courses || [];
    const course = courses.find(c => c.name === TARGET_CLASS_NAME);
    if (!course) {
      Logger.log(`❌ Class '${TARGET_CLASS_NAME}' not found.`);
      return;
    }
    const classId = course.id;
    Logger.log(`Found Class: ${course.name} (ID: ${classId})`);

    let foundItems = [];

    // 2. Search Standard Assignments (Pulling EVERYTHING: Published, Draft, Deleted)
    let pageToken = null;
    do {
      const response = Classroom.Courses.CourseWork.list(classId, {
        pageToken: pageToken,
        courseWorkStates: ["PUBLISHED", "DRAFT", "DELETED"] 
      });
      if (response.courseWork) {
        // We use .includes() just in case there's an invisible space issue
        const matches = response.courseWork.filter(cw =>
          cw.title.toLowerCase().includes(TARGET_ASSIGNMENT_TITLE.toLowerCase())
        );
        matches.forEach(m => foundItems.push({ type: "ASSIGNMENT", data: m }));
      }
      pageToken = response.nextPageToken;
    } while (pageToken);

    // 3. Report Results
    if (foundItems.length === 0) {
      Logger.log(`\n❌ CRITICAL: The assignment '${TARGET_ASSIGNMENT_TITLE}' was NOT FOUND by the API at all.`);
      Logger.log(`This means either the title is spelled differently, or Google Classroom's API is completely hiding it.`);
    } else {
      Logger.log(`\n✅ FOUND ${foundItems.length} match(es) for '${TARGET_ASSIGNMENT_TITLE}':\n`);
      foundItems.forEach((item, index) => {
        Logger.log(`--- Match #${index + 1} ---`);
        Logger.log(`ID: ${item.data.id}`);
        Logger.log(`Exact Title: "${item.data.title}"`);
        Logger.log(`State: ${item.data.state}`);
        Logger.log(`Creation Time: ${item.data.creationTime}`);
        
        // Log the full raw object for deep inspection
        Logger.log(`\nRAW API DATA:`);
        Logger.log(JSON.stringify(item.data, null, 2));
      });
    }

  } catch (error) {
    Logger.log(`Error during debug: ${error.message}`);
  }
}