// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ADMIN_EMAILS = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

function doGet(e) {
  const page = e.parameter.page;
  const userEmail = Session.getActiveUser().getEmail().toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  if (page === 'UploadDialog' && isAdmin) {
    return HtmlService.createTemplateFromFile('UploadDialog').evaluate()
        .setTitle("Admin: Upload Results")
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  if (page === 'dashboard' && isAdmin) {
    let tpl = HtmlService.createTemplateFromFile('Dashboard');
    tpl.TEST_LAYOUT_HTML = TEST_LAYOUT_HTML;
    return tpl.evaluate()
        .setTitle("Admin: Dashboard")
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  let tpl = HtmlService.createTemplateFromFile('Index');
  tpl.TEST_LAYOUT_HTML = TEST_LAYOUT_HTML;
  return tpl.evaluate()
      .setTitle("Science Garage: Test Results")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Fetches the student's name, rich results, and class info.
 */
function getStudentPayload() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const studentHash = generateHash(userEmail, EMAIL_SALT);
    const assignmentPrefix = "CH_U07_A30_G";

    // 1. Find the student's name from RosterData.html
    const rosterRaw = HtmlService.createTemplateFromFile('RosterData').getRawContent();
    const rosterJson = JSON.parse(rosterRaw);
    const studentEntry = rosterJson.find(s => s.email.toLowerCase().trim() === userEmail.toLowerCase().trim());
    const studentName = studentEntry ? studentEntry.name : "Student";

    // 2. Locate the Class Node
    const rosterUrl = `${FIREBASE_DB_URL}/studentRoster/${studentHash}.json?auth=${FIREBASE_SECRET}`;
    const enrolledClasses = JSON.parse(UrlFetchApp.fetch(rosterUrl).getContentText());
    if (!enrolledClasses) return { error: "No roster entry found for your account." };
    
    const classNode = Object.keys(enrolledClasses)[0];

    // 3. Locate the Assignment and pull results
    const gbUrl = `${FIREBASE_DB_URL}/teacherGradebook/${classNode}.json?auth=${FIREBASE_SECRET}`;
    const assignments = JSON.parse(UrlFetchApp.fetch(gbUrl).getContentText());
    const fullAssignmentId = Object.keys(assignments).find(key => key.startsWith(assignmentPrefix));
    
    if (!fullAssignmentId || !assignments[fullAssignmentId][studentHash]) {
      return { error: "Results for this assignment have not been uploaded yet." };
    }

    const studentData = assignments[fullAssignmentId][studentHash];

    return {
      studentName: studentName,
      results: studentData.richResults.responses, // Accessing the array from your screenshot
      assignmentCode: assignmentPrefix
    };
  } catch (e) {
    return { error: "Server Error: " + e.toString() };
  }
}

/**
 * Generates the SHA-256 hash required for ID matching.
 */
function generateHash(email, salt) {
  const rawValue = salt + email.toLowerCase().trim();
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawValue);
  return signature.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Administrative upload logic for GEM JSON files.
 */
function processJsonUpload(jsonString) {
  const data = JSON.parse(jsonString);
  const shortId = data.StudentID; 
  const assignmentPrefix = "CH_U07_A30_G";

  try {
    const rosterData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/studentRoster.json?auth=${FIREBASE_SECRET}`).getContentText());
    const fullHash = Object.keys(rosterData).find(key => key.startsWith(shortId));
    if (!fullHash) throw new Error(`Student prefix ${shortId} not found.`);

    const classNode = Object.keys(rosterData[fullHash])[0];
    const gbResponse = UrlFetchApp.fetch(`${FIREBASE_DB_URL}/teacherGradebook/${classNode}.json?auth=${FIREBASE_SECRET}`);
    const assignments = JSON.parse(gbResponse.getContentText());
    const fullAssignmentId = Object.keys(assignments).find(key => key.startsWith(assignmentPrefix));

    if (!fullAssignmentId) throw new Error("Assignment node not found.");

    const targetPath = `teacherGradebook/${classNode}/${fullAssignmentId}/${fullHash}/richResults.json?auth=${FIREBASE_SECRET}`;
    const payload = { lastUpdated: new Date().getTime(), responses: data.results };

    UrlFetchApp.fetch(FIREBASE_DB_URL + "/" + targetPath, {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });

    return `Success! Uploaded results for ${shortId}`;
  } catch (e) {
    throw new Error(e.toString());
  }
}


/**
 * Fetches the student roster for the sidebar.
 * Maps hashes to names using your RosterData.html.
 */
function getTeacherRoster() {
  const rosterRaw = HtmlService.createTemplateFromFile('RosterData').getRawContent();
  const rosterJson = JSON.parse(rosterRaw);
  
  // Create a quick lookup for names
  const nameMap = {};
  rosterJson.forEach(student => {
    const hash = generateHash(student.email, EMAIL_SALT);
    nameMap[hash] = student.name;
  });
  
  return nameMap;
}

/**
 * Fetches the richResults for a specific student hash.
 */
/**
 * Fetches the richResults for a specific student hash.
 */
function getStudentResultsForTeacher(studentHash) {
  const assignmentPrefix = "CH_U07_A30_G";
  
  try {
    const rosterUrl = `${FIREBASE_DB_URL}/studentRoster/${studentHash}.json?auth=${FIREBASE_SECRET}`;
    const enrolledClasses = JSON.parse(UrlFetchApp.fetch(rosterUrl).getContentText());
    if (!enrolledClasses) return { error: "No roster found" };
    const classNode = Object.keys(enrolledClasses)[0];

    const gbUrl = `${FIREBASE_DB_URL}/teacherGradebook/${classNode}.json?auth=${FIREBASE_SECRET}`;
    const assignments = JSON.parse(UrlFetchApp.fetch(gbUrl).getContentText());
    
    const fullAssignmentId = Object.keys(assignments).find(key => key.startsWith(assignmentPrefix));
    const richResults = assignments[fullAssignmentId][studentHash].richResults;

    return {
      responses: richResults.responses,
      lastUpdated: richResults.lastUpdated
    };
  } catch (e) {
    return { error: "Could not find results: " + e.toString() };
  }
}


/**
 * Modern Dashboard: Fetches all results for all students in the roster to populate the Grid View.
 */
function getDashboardData() {
  try {
    const rosterRaw = HtmlService.createTemplateFromFile('RosterData').getRawContent();
    const rosterJson = JSON.parse(rosterRaw);
    const assignmentPrefix = "CH_U07_A30_G";
    
    const results = {};
    const students = [];

    rosterJson.forEach(s => {
      const hash = generateHash(s.email, EMAIL_SALT);
      students.push({ hash: hash, name: s.name });
    });

    // We need to find which class nodes to look in.
    // In this project, we'll iterate through students and find their class nodes.
    // To be efficient, we'll cache class data.
    const classCache = {};

    students.forEach(student => {
      try {
        const studentHash = student.hash;
        const rosterUrl = `${FIREBASE_DB_URL}/studentRoster/${studentHash}.json?auth=${FIREBASE_SECRET}`;
        const enrolledClasses = JSON.parse(UrlFetchApp.fetch(rosterUrl).getContentText());
        if (!enrolledClasses) return;
        
        const classNode = Object.keys(enrolledClasses)[0];
        student.period = classNode; // Store the period/class node

        if (!classCache[classNode]) {
          const gbUrl = `${FIREBASE_DB_URL}/teacherGradebook/${classNode}.json?auth=${FIREBASE_SECRET}`;
          classCache[classNode] = JSON.parse(UrlFetchApp.fetch(gbUrl).getContentText());
        }

        const assignments = classCache[classNode];
        const fullAssignmentId = Object.keys(assignments).find(key => key.startsWith(assignmentPrefix));
        
        if (fullAssignmentId && assignments[fullAssignmentId][studentHash]) {
          results[studentHash] = assignments[fullAssignmentId][studentHash].richResults;
        }
      } catch (e) {
        // Skip individual failures
      }
    });

    return {
      students: students,
      results: results,
      assignmentPrefix: assignmentPrefix,
      numQuestions: 20
    };
  } catch (e) {
    return { error: e.toString() };
  }
}
// ==========================================
// TEST LAYOUT HTML
// ==========================================
const TEST_LAYOUT_HTML = `<div class="narrative-block">
        <span class="narrative-title">Chemistry of Underwater Welding - Part 1</span>
        <p>Underwater welders often use "Thermite" reactions to repair steel ship hulls or pipelines. Because this reaction provides its own oxygen source within the reactants, it can proceed underwater without being extinguished. The reaction involves a mixture of powdered aluminum (\\(\\ce{Al}\\)) and iron (III) oxide (\\(\\ce{Fe2O3}\\)). This reaction is so energetic that the iron is produced in a liquid state at temperatures exceeding 2500°C, allowing it to flow into cracks and fuse metal parts together.</p>
        <p style="text-align:center;">Unbalanced equation for this reaction:<br>
        \\(\\ce{Al(s) + Fe2O3(s) -> Al2O3(s) + Fe(l)}\\)</p>
    </div>

    <div class="question-block">
        <div class="question-text" id="q1">1. When the equation is correctly balanced using the smallest whole-number coefficients, what is the total sum of the coefficients? (1 point)</div>
        <ul class="mc-options">
            <li>a) 4</li>
            <li>b) 5</li>
            <li>c) 6</li>
            <li>d) 7</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q2">2. Which type of reaction is represented by the welders thermite equation? (1 point)</div>
        <ul class="mc-options">
            <li>a) Double Replacement</li>
            <li>b) Combustion</li>
            <li>c) Single Replacement</li>
            <li>d) Synthesis</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q3">3. Based on the "Thermite reaction" discussed above, which element is undergoing oxidation? Choose the answer with the best explanation.</div>
        <ul class="mc-options">
            <li>a) \\(\\ce{Al}\\), because it gains electrons and its oxidation number goes from +3 to 0</li>
            <li>b) \\(\\ce{Fe^{+3}}\\), because is gains electrons and its oxidation number goes from +3 to 0</li>
            <li>c) \\(\\ce{Al}\\), because it loses electrons and its oxidation number goes from 0 to +3</li>
            <li>d) \\(\\ce{Fe^{+3}}\\), because is loses electrons and its oxidation number goes from 0 to +3</li>
        </ul>
        
    </div>

    <div class="narrative-block">
        <span class="narrative-title">Chemistry of Underwater Welding - Part 2</span>
        <p>During underwater welding the aluminum powder can often become damp, and a side reaction occurs where the aluminum begins to react with water. When aluminum reacts with water it will produce aluminum oxide and hydrogen gas. This is shown by the balanced chemical equation below.</p>
        <p style="text-align:center;">\\(\\ce{2Al(s) + 6H2O(l) -> 2Al(OH)3 + 3H2(g)}\\)</p>
    </div>

    <div class="question-block">
        <div class="question-text" id="q4">4. According to the balanced equation, what is the total number of moles of water (\\(\\ce{H2O}\\)) required to react completely with 2.0 moles of Aluminum (\\(\\ce{Al}\\))? (1 point)</div>
        <ul class="mc-options">
            <li>a) 2.0 moles</li>
            <li>b) 6.0 moles</li>
            <li>c) 3.0 moles</li>
            <li>d) 12.0 moles</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q5">5. Construct a mathematical representation and calculate the number of grams of Aluminum oxide (\\(\\ce{Al(OH)3}\\)) that can be produced if 4.5 grams of Aluminum (\\(\\ce{Al}\\)) reacts with excess water. (molar mass \\(\\ce{Al(OH)3}\\) = 78.0 g/mol) (molar mass \\(\\ce{Al}\\) = 26.98 g/mol) (2 points)</div>
        
    </div>

    <div class="narrative-block">
        <span class="narrative-title">Propane Grills</span>
        <p>Propane grills are a staple of American outdoor cooking, valued for their convenience and clean-burning blue flame. Propane (\\(\\ce{C3H8}\\)) is a byproduct of natural gas processing and petroleum refining. While it burns more cleanly than coal or wood, the combustion of propane is a significant source of anthropocentric carbon dioxide, a greenhouse gas that traps heat in the Earth’s atmosphere.</p>
        <p>When a grill is functioning correctly with sufficient oxygen, it undergoes complete combustion, producing water vapor and \\(\\ce{CO2}\\). However, if air vents are restricted, incomplete combustion occurs, producing carbon monoxide - a toxic, colorless gas - and "soot" (unburned carbon). As environmental concerns grow, many consumers are looking at alternatives like Electric Grills powered by renewable energy or Hydrogen-Fueled Grills, which produce only water vapor as a byproduct, effectively eliminating the carbon footprint of the cooking process.</p>
        <p style="text-align:center;">Propane Grill Reaction: \\(\\ce{C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g) + heat}\\)<br>
        Hydrogen-Fueled Grill Reaction: \\(\\ce{2H2 + O2 -> 2H2O + heat}\\)</p>
    </div>

    <div class="question-block">
        <div class="question-text" id="q6">6. What is the sum of the coefficients (smallest whole number coefficients) in the propane grill combustion reaction when the reaction has been properly balanced? (1 point)</div>
        <ul class="mc-options">
            <li>a) 12</li>
            <li>b) 13</li>
            <li>c) 14</li>
            <li>d) 4</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q7">7. To prove the law of conservation of mass for the hydrogen-fueled grill reaction, a student writes the following:<br>
        \\((2 \\times 2.0\\text{ g}) + (32.0\\text{ g}) = (2 \\times 18.0\\text{ g})\\)<br>
        Identify if this mathematical representation is correct and explain how it demonstrates that mass is conserved. (1 point)</div>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q8">8. A specialty hydrogen tank for a "Green Grill" contains 10.0 moles of hydrogen gas (\\(\\ce{H2}\\)). Using the balanced equation for hydrogen-fueled grills, calculate the total mass of water vapor (\\(\\ce{H2O}\\)) produced when the entire tank is burned. (2 points)</div>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q9">9. Choose and support a claim, citing both qualitative (environmental impact) and quantitative (moles, grams, ect.) evidence from the text and balanced equations, to either promote or oppose the continued residential reliance on propane as a primary cooking fuel. (3 points)</div>
        
    </div>

    <div class="narrative-block">
        <span class="narrative-title">Airbag Chemistry - Part 1</span>
        <p>When a car undergoes a sudden collision, a series of rapid chemical reactions occur to inflate an airbag in less than 0.05 seconds. The primary reaction involves the solid compound sodium azide (\\(\\ce{NaN3}\\)). An electronic signal ignites the \\(\\ce{NaN3}\\), causing it to decompose into solid sodium (\\(\\ce{Na}\\)) and nitrogen gas (\\(\\ce{N2}\\)).</p>
        <p style="text-align:center;">The following unbalanced equation represents the chemical process inside the airbag:<br>
        Reaction 1: \\(\\ce{NaN3(s) -> Na(s) + N2(g)}\\)</p>
    </div>

    <div class="question-block">
        <div class="question-text" id="q10">10. Based on the chemical equation provided, which type of chemical reaction occurs when sodium azide is ignited? (1 point)</div>
        <ul class="mc-options">
            <li>a) Synthesis</li>
            <li>b) Decomposition</li>
            <li>c) Single replacement</li>
            <li>d) Double replacement</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q11">11. A technician determines that a deployed airbag contains \\(3.01 \\times 10^{23}\\) molecules of nitrogen gas. Calculate the total number of moles of \\(\\ce{N2}\\) present in the airbag. (1 point)</div>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q12">12. Balance the Reaction 1: \\(\\ce{NaN3(s) -> Na(s) + N2(g)}\\) (1 point)</div>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q13">13. Reaction 1 is a Redox Reaction. Identify who is reduced and write the half reaction. Be sure to include electrons. (2 point)</div>
        
    </div>

    <div class="narrative-block">
        <span class="narrative-title">Airbag Chemistry - Part 2</span>
        <p>The sodium metal (\\(\\ce{Na}\\)) produced in the first reaction is highly reactive and potentially dangerous. To neutralize it, airbag manufacturers include potassium nitrate (\\(\\ce{KNO3}\\)), which reacts with the sodium to produce more nitrogen gas and various metal oxides.</p>
        <p style="text-align:center;">Reaction 2: \\(\\ce{10Na + 2KNO3 -> K2O + 5Na2O + N2}\\)</p>
    </div>

    <div class="question-block">
        <div class="question-text" id="q14">14. In Reaction 2, the sodium atoms lose electrons to become \\(\\ce{Na^{+}}\\) ions. Which statement best describes this process? (1 point)</div>
        <ul class="mc-options">
            <li>a) It is a nuclear process...</li>
            <li>b) It is a chemical process involving the transfer of electrons.</li>
            <li>c) It is a physical change...</li>
            <li>d) It is a phase change...</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q15">15. Based on patterns of the Periodic Table, why does sodium (\\(\\ce{Na}\\)) react so readily to form \\(\\ce{Na^{+}}\\) ions during these processes? (1 point)</div>
        <ul class="mc-options">
            <li>a) It has a full outer energy level...</li>
            <li>b) It needs to gain 7 electrons...</li>
            <li>c) It has 1 valence electron that is easily removed...</li>
            <li>d) Its nucleus contains more neutrons...</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q16">16. Predict the outcome if a different group 1 metal, such as lithium (\\(\\ce{Li}\\)), was used instead of sodium (\\(\\ce{Na}\\)) in a similar reaction to reaction 2. Explain your prediction using trends in the periodic table. (2 points)</div>
        
    </div>

    <div class="narrative-block">
        <span class="narrative-title">Optimizing Photosynthesis in Controlled Agriculture</span>
        <p>A commercial greenhouse is attempting to maximize crop yield by carefully controlling environmental conditions. Scientists monitor how light intensity and carbon dioxide concentration affect the rate of photosynthesis. They use sensors to measure oxygen production as an indicator of how efficiently plants convert light energy into stored chemical energy (glucose). The goal is to determine the optimal conditions for energy transformation in plants without wasting resources.</p>
        <p style="text-align:center;">Reaction : \\(\\ce{6CO2 + 6H2O + \\text{light energy} -> C6H12O6 + 6O2}\\)</p>
        <div class="graph-container">
            <span class="axis-label y-label">Rate of Photosynthesis<br>(µmol \\(\\ce{O2}/m^2/s\\))</span>
            <span class="axis-label x-label">Light Intensity</span>
            <div class="dot" style="bottom: 10px; left: 10px;"></div>
            <div class="dot" style="bottom: 30px; left: 25px;"></div>
            <div class="dot" style="bottom: 60px; left: 40px;"></div>
            <div class="dot" style="bottom: 90px; left: 55px;"></div>
            <div class="dot" style="bottom: 130px; left: 70px;"></div>
            <div class="dot" style="bottom: 170px; left: 85px;"></div>
            <div class="dot" style="bottom: 210px; left: 100px;"></div>
            <div class="dot" style="bottom: 250px; left: 120px;"></div>
            <div class="dot" style="bottom: 265px; left: 140px;"></div>
            <div class="dot" style="bottom: 275px; left: 165px;"></div>
            <div class="dot" style="bottom: 275px; left: 185px;"></div>
            <div class="dot" style="bottom: 275px; left: 205px;"></div>
            <div class="dot" style="bottom: 275px; left: 225px;"></div>
        </div>
    </div>

    <div class="question-block">
        <div class="question-text" id="q17">17. Which statement best describes the energy transformation occurring during photosynthesis?</div>
        <ul class="mc-options">
            <li>a) Chemical \\(\\rightarrow\\) light</li>
            <li>b) Light energy \\(\\rightarrow\\) chemical energy stored in glucose</li>
            <li>c) Thermal \\(\\rightarrow\\) kinetic</li>
            <li>d) Chemical \\(\\rightarrow\\) electrical</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q18">18. Based on the graph, which conclusion is most supported?</div>
        <ul class="mc-options">
            <li>a) Always increases...</li>
            <li>b) Independent...</li>
            <li>c) A limiting factor prevents further increase at high light intensity</li>
            <li>d) Oxygen production decreases...</li>
        </ul>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q19">19. A plant produces 6 moles of oxygen during photosynthesis. Show a mathematical representation and calculated result to determine how many moles of glucose are produced.</div>
        
    </div>

    <div class="question-block">
        <div class="question-text" id="q20">20. Glucose's Molecular Formula is \\(\\ce{C6H12O6}\\). What is the empirical formula?</div>
        
    </div>

    `;
