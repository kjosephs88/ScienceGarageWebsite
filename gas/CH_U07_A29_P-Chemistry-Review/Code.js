// ==========================================
// GLOBAL CONFIGURATION
// ==========================================
const FIREBASE_DB_URL = "https://scigarage-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
const EMAIL_SALT = PropertiesService.getScriptProperties().getProperty("EMAIL_SALT");
const ASSIGNMENT_CODE = "CH_U07_A29_P";

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Chemistry Multiple Choice Review')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// RUN ONCE TO UPLOAD NEW DECK TO RTDB
// ==========================================
function uploadDeckToRTDB() {
  const DECK_DATA = [
    { id: 0, q: "What are the two main types of compounds in chemistry?", opts: ["Acids and Bases", "Ionic and Molecular", "Organic and Inorganic", "Homogeneous and Heterogeneous"], correct: 1, exp: "Ionic compounds are formed by ionic bonds (metal + non-metal), while molecular compounds are formed by covalent bonds (non-metals)." },
    { id: 1, q: "Between what types of elements does an ionic bond occur?", opts: ["Two non-metals", "Two metals", "A metal and a non-metal", "Noble gases only"], correct: 2, exp: "Ionic bonds require the transfer of electrons from a metal (which forms a positive ion) to a non-metal (which forms a negative ion)." },
    { id: 2, q: "What does the Stock System use to show the charge on a positive metal ion?", opts: ["Greek prefixes", "Subscripts", "Roman numerals", "Superscripts"], correct: 2, exp: "Roman numerals are placed in parentheses after the metal's name to indicate its charge, such as iron(III) for Fe³⁺." },
    { id: 3, q: "What is a hydrate?", opts: ["A dissolved acid", "A compound that produces hydrogen", "A liquid metal", "An ionic compound with water molecules in its crystal structure"], correct: 3, exp: "Hydrates physically trap water molecules within their crystalline structure, represented by a dot (e.g., CuSO₄ • 5H₂O)." },
    { id: 4, q: "What does an empirical formula express?", opts: ["The exact number of atoms in a molecule", "The lowest whole number ratio of atoms", "The spatial geometry of a compound", "The molar mass of a substance"], correct: 1, exp: "An empirical formula is the simplest, most reduced ratio of elements in a compound. Ionic compounds are always empirical." },
    { id: 5, q: "What do the phase indicators (s), (g), (l), and (aq) stand for?", opts: ["Solid, gas, liquid, aqueous", "Solute, gas, lipid, aqua", "Suspension, gravity, liter, aqueous", "Synthesis, grams, liquid, acid"], correct: 0, exp: "(s) Solid, (g) Gas, (l) Liquid, and (aq) Aqueous meaning the substance is dissolved in water." },
    { id: 6, q: "Describe a single replacement reaction.", opts: ["Two reactants form one product", "One reactant breaks into two products", "A metal replaces another metal in a compound", "Two ionic compounds switch ions"], correct: 2, exp: "In a single replacement, a more active free element takes the place of a less active element in a compound." },
    { id: 7, q: "What is an endothermic process?", opts: ["A process that releases energy", "A process that absorbs energy", "A process that creates a vacuum", "A process that yields a gas"], correct: 1, exp: "Endothermic reactions absorb energy from their surroundings, meaning energy is treated as a reactant." },
    { id: 8, q: "What happens to a species during oxidation?", opts: ["It gains protons", "It loses protons", "It gains electrons", "It loses electrons"], correct: 3, exp: "LEO the lion says GER: Losing Electrons is Oxidation. This causes its oxidation state to increase." },
    { id: 9, q: "What is the empirical formula of a compound with the molecular formula N₂O₄?", opts: ["Acids and Bases", "NO₂", "NO", "N₂O₃"], correct: 1, exp: "The empirical formula represents the simplest whole-number ratio of elements in a compound. Dividing the subscripts in N₂O₄ by 2 reduces it to NO₂." },
    { id: 10, q: "Which list includes three types of chemical reactions?", opts: ["decomposition, solidification, and sublimation", "condensation, double replacement, and sublimation", "decomposition, double replacement, and synthesis", "condensation, solidification, and synthesis"], correct: 2, exp: "Synthesis, decomposition, and double replacement are standard chemical reactions. Condensation, solidification, and sublimation are merely physical phase changes." },
    { id: 11, q: "Given the reaction: Mg(s) + 2AgNO₃(aq) → Mg(NO₃)₂(aq) + 2Ag(s). Which type of reaction is represented?", opts: ["double replacement", "decomposition", "synthesis", "single replacement"], correct: 3, exp: "A single, more active element (Mg) takes the place of another element (Ag) inside a compound." },
    { id: 12, q: "Which equation shows a conservation of mass?", opts: ["Al + Br₂ → AlBr₃", "Na + Cl₂ → NaCl", "PCl₅ → PCl₃ + Cl₂", "H₂O → H₂ + O₂"], correct: 2, exp: "Conservation of mass means the chemical equation must be balanced. Only PCl₅ → PCl₃ + Cl₂ has the exact same number of phosphorus (1) and chlorine (5) atoms on both sides of the arrow." },
    { id: 13, q: "Given the balanced equation: AgNO₃(aq) + NaCl(aq) → NaNO₃(aq) + AgCl(s). This reaction is classified as...", opts: ["double replacement", "decomposition", "single replacement", "synthesis"], correct: 0, exp: "The cations and anions of two different aqueous compounds switch bonding partners to form two completely new compounds, one of which is a solid precipitate." },
    { id: 14, q: "If an equation is balanced properly, both sides of the equation must have the same number of...", opts: ["coefficients", "moles of molecules", "atoms", "molecules"], correct: 2, exp: "The Law of Conservation of Mass dictates that atoms are neither created nor destroyed in a chemical reaction. The total number of atoms of each element must remain constant." },
    { id: 15, q: "Given the unbalanced equation: _Al + _CuSO₄ → _Al₂(SO₄)₃ + _Cu. When the equation is balanced using the smallest whole-number coefficients, what is the coefficient of Al?", opts: ["1", "2", "3", "4"], correct: 1, exp: "To balance the equation, you need 2 Aluminums to match the right side, and 3 Copper Sulfates to provide the 3 Sulfates needed on the right. This leaves you with: 2Al + 3CuSO₄ → 1Al₂(SO₄)₃ + 3Cu." },
    { id: 16, q: "What is the total number of oxygen atoms in the formula MgSO₄ · 7H₂O?", opts: ["5", "11", "7", "4"], correct: 1, exp: "There are 4 oxygen atoms in the magnesium sulfate (MgSO₄) portion, plus 7 oxygen atoms from the 7 water molecules (7H₂O). 4 + 7 = 11 oxygen atoms total." },
    { id: 17, q: "What is the formula of titanium (II) oxide?", opts: ["TiO₂", "Ti₂O₃", "Ti₂O", "TiO"], correct: 3, exp: "The Roman numeral (II) tells us Titanium has a +2 charge (Ti²⁺). Oxide always has a -2 charge (O²⁻). Because their charges balance perfectly, they combine in a 1:1 ratio." },
    { id: 18, q: "A student heated a 9.10-gram sample of a hydrated salt to a constant mass of 5.41 grams. What percent by mass of water did the salt contain?", opts: ["59.5%", "3.69%", "40.5%", "16.8%"], correct: 2, exp: "First, find the mass of the evaporated water: 9.10g - 5.41g = 3.69g of water. To find the percent composition: (3.69g / 9.10g) × 100 = 40.54%." },
    { id: 19, q: "Given the reaction: 2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O. What is the total number of moles of CO₂ produced by the complete combustion of 5.0 moles of C₂H₆?", opts: ["1.0 mole", "2.0 moles", "5.0 moles", "10. moles"], correct: 3, exp: "The stoichiometric ratio of ethane to carbon dioxide is 2:4 (or simplified, 1:2). Since it produces twice as many moles of CO₂, 5.0 moles of C₂H₆ will yield 10.0 moles of CO₂." },
    { id: 20, q: "Given the reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g). What is the mole-to-mole ratio between nitrogen gas and hydrogen gas?", opts: ["1:2", "2:2", "2:3", "1:3"], correct: 3, exp: "The coefficients in the balanced chemical equation represent the molar ratios. Nitrogen has an implied coefficient of 1, and hydrogen has a coefficient of 3." },
    { id: 21, q: "Given the balanced equation: 2C + 3H₂ → C₂H₆. What is the total number of moles of C that must completely react to produce 2.0 moles of C₂H₆?", opts: ["4.0 mol", "1.0 mol", "2.0 mol", "3.0 mol"], correct: 0, exp: "The balanced equation shows a 2:1 ratio between Carbon and C₂H₆. To produce 2.0 moles of the product, you need double the amount of the Carbon reactant (4.0 moles)." },
    { id: 22, q: "The percentage by mass of Br in the compound AlBr₃ is closest to...", opts: ["10.%", "25%", "75%", "90.%"], correct: 3, exp: "The molar mass of AlBr₃ is approx 267 g/mol (Al=27, Br=80×3=240). The percent by mass of bromine is (240 / 267) × 100 = 89.8%, which rounds to 90%." },
    { id: 23, q: "A sample of a substance containing only magnesium and chlorine was tested and found to be composed of 74.5% chlorine by mass. If the total mass of the sample was 190.2 grams, what was the mass of the magnesium?", opts: ["142 g", "48.5 g", "70.9 g", "24.3 g"], correct: 1, exp: "Since the compound is 74.5% chlorine, the remaining 25.5% must be magnesium (100% - 74.5%). Find the mass by multiplying the total mass by that percentage: 190.2g × 0.255 = 48.5g." }
  ];

  const url = `${FIREBASE_DB_URL}/flashcardDecks/${ASSIGNMENT_CODE}.json?auth=${FIREBASE_SECRET}`;
  UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(DECK_DATA)
  });
  Logger.log("Deck successfully uploaded to RTDB!");
}

// ==========================================
// APP LOGIC
// ==========================================
function getStudentInitialData() {
  const email = Session.getActiveUser().getEmail();
  const saltedHash = getSaltedStudentHash(email);
  
  const rosterData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/studentRoster/${saltedHash}.json?auth=${FIREBASE_SECRET}`).getContentText());
  if (!rosterData) throw new Error("Student not found in any class roster.");
  const allClassFolders = Object.keys(rosterData);
  
  const deckData = JSON.parse(UrlFetchApp.fetch(`${FIREBASE_DB_URL}/flashcardDecks/${ASSIGNMENT_CODE}.json?auth=${FIREBASE_SECRET}`).getContentText());
  if (!deckData) throw new Error("Deck not found in Database. Teacher must run uploadDeckToRTDB().");

  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0];
  const targetFolder = allClassFolders.find(folder => folder.startsWith(subjectPrefix));
  
  let savedState = { mastered: [], learning: [] };

  if (targetFolder) {
    const parts = targetFolder.split('_');
    const classroomId = parts[parts.length - 1];
    const provisionalKey = `${ASSIGNMENT_CODE}_${classroomId}`;
    let actualAssignmentKey = provisionalKey;

    try {
      // 1. Single Source of Truth: Look in the Teacher Gradebook
      const tgUrl = `${FIREBASE_DB_URL}/teacherGradebook/${targetFolder}.json?auth=${FIREBASE_SECRET}&shallow=true`;
      const existingKeys = JSON.parse(UrlFetchApp.fetch(tgUrl).getContentText()) || {};

      // 2. Prioritize the Official Key (The one that DOES NOT end with the classroom ID)
      const officialKey = Object.keys(existingKeys).find(k => k.startsWith(ASSIGNMENT_CODE) && k !== provisionalKey);
      if (officialKey) {
        actualAssignmentKey = officialKey;
      }
    } catch (e) {}

    try {
      // 3. Fetch from the synchronized path
      const stateUrl = `${FIREBASE_DB_URL}/StudentReportCards/${saltedHash}/${targetFolder}/${actualAssignmentKey}/state.json?auth=${FIREBASE_SECRET}`;
      const fetchedState = JSON.parse(UrlFetchApp.fetch(stateUrl).getContentText());
      
      if (fetchedState) {
         savedState = fetchedState;
      }
    } catch (e) {}
  }

  return {
    saltedHash: saltedHash,
    allClassFolders: allClassFolders,
    savedState: savedState,
    deck: deckData
  };
}

function saveProgress(payload) {
  const { saltedHash, allClassFolders, masteredIds, learningIds, isFinished } = payload;
  const timestamp = Date.now();
  const updates = {};
  
  const questionBreakdown = {};
  masteredIds.forEach(id => {
    let qNum = (id + 1).toString().padStart(2, '0');
    questionBreakdown[`Q${qNum}`] = "Known";
  });
  learningIds.forEach(id => {
    let qNum = (id + 1).toString().padStart(2, '0');
    questionBreakdown[`Q${qNum}`] = "Try Again";
  });

  const subjectPrefix = ASSIGNMENT_CODE.split('_')[0];

  allClassFolders.forEach(classFolder => {
    // SECURITY CHECK: Only save if the class matches the assignment subject
    if (!classFolder.startsWith(subjectPrefix)) return; 

    const parts = classFolder.split('_');
    const classroomId = parts[parts.length - 1];
    const provisionalKey = `${ASSIGNMENT_CODE}_${classroomId}`;
    let assignmentKey = provisionalKey; 
    
    try {
      // Single Source of Truth Synchronization
      const tgUrl = `${FIREBASE_DB_URL}/teacherGradebook/${classFolder}.json?auth=${FIREBASE_SECRET}&shallow=true`;
      const existingKeys = JSON.parse(UrlFetchApp.fetch(tgUrl).getContentText()) || {};
      
      const officialKey = Object.keys(existingKeys).find(k => k.startsWith(ASSIGNMENT_CODE) && k !== provisionalKey);
      if (officialKey) {
        assignmentKey = officialKey;
      }
    } catch(e) {}

    const basePathRC = `StudentReportCards/${saltedHash}/${classFolder}/${assignmentKey}`;
    const basePathTG = `teacherGradebook/${classFolder}/${assignmentKey}/${saltedHash}`;
    
    updates[`${basePathRC}/state/mastered`] = masteredIds;
    updates[`${basePathRC}/state/learning`] = learningIds;
    updates[`${basePathRC}/_exists`] = true;
    
    updates[`${basePathRC}/questionBreakdown`] = questionBreakdown;
    updates[`${basePathTG}/questionBreakdown`] = questionBreakdown;
    
    updates[`${basePathTG}/score`] = masteredIds.length;
    updates[`${basePathTG}/status`] = (learningIds.length === 0 && masteredIds.length > 0) ? "completed" : "in_progress";
    updates[`${basePathTG}/lastUpdated`] = timestamp;
    
    if (isFinished) {
      updates[`${basePathTG}/completedAtLeastOnce`] = true;
      updates[`${basePathRC}/completedAtLeastOnce`] = true;
    }
  });
  
  UrlFetchApp.fetch(`${FIREBASE_DB_URL}/.json?auth=${FIREBASE_SECRET}`, {
    method: "patch", contentType: "application/json", payload: JSON.stringify(updates)
  });
}

function getSaltedStudentHash(email) {
  if (!EMAIL_SALT) throw new Error("EMAIL_SALT is not defined in Script Properties.");
  const safeEmail = email.toString().toLowerCase().trim();
  const saltedEmail = EMAIL_SALT + safeEmail;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedEmail);
  return digest.map(byte => ('0' + (byte < 0 ? byte + 256 : byte).toString(16)).slice(-2)).join('');
}