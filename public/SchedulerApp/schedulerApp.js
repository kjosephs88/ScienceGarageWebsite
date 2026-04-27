import { db } from './firebase-config.js';
import { ref, get, update, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let currentClassData = {};
let unsubscribeAssignments = null;

// ==========================================
// 1. HELPER: GENERATE CLASS FOLDER ID
// ==========================================
// This exactly mirrors the Gateway logic to find the right folder (e.g., CH_P6_123456789)
function getFolderId(className, classId) {
    let subj = "ZZ";
    let lowerClassName = className.toLowerCase();
    if (lowerClassName.includes("chemistry")) subj = "CH";
    else if (lowerClassName.includes("physics")) subj = "PH";
    else if (lowerClassName.includes("forensic")) subj = "FS";

    let periodMatch = className.match(/P\d/i);
    let period = periodMatch ? periodMatch[0].toUpperCase() : "P0";

    return `${subj}_${period}_${classId}`;
}

// ==========================================
// 2. INITIALIZATION & DROPDOWN LOADING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadInitialClasses();
    window.initializeCalendarUI();
});

async function loadInitialClasses() {
    try {
        // Fetch the entire schedulerAssignments node (which contains class folders)
        const snapshot = await get(ref(db, 'schedulerAssignments'));

        if (snapshot.exists()) {
            const allFolders = snapshot.val();
            const uniqueClasses = new Set();

            // Loop through each folder to find the unique classes
            Object.values(allFolders).forEach(folderData => {
                // Peek at the first assignment in the folder to grab the class info
                const sampleAssignment = Object.values(folderData)[0];
                if (sampleAssignment && sampleAssignment.className && sampleAssignment.classId) {
                    uniqueClasses.add(JSON.stringify({
                        name: sampleAssignment.className,
                        id: sampleAssignment.classId
                    }));
                }
            });

            const classSelect = document.getElementById('class-select');
            classSelect.innerHTML = '<option value="">-- Select a Class --</option>';

            const sortedClasses = Array.from(uniqueClasses).map(str => JSON.parse(str)).sort((a, b) => a.name.localeCompare(b.name));

            sortedClasses.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                classSelect.appendChild(opt);
            });

            classSelect.addEventListener('change', (e) => {
                const selectedId = e.target.value;
                const selectedName = e.target.options[e.target.selectedIndex].text;
                if (selectedId) {
                    const pMatch = selectedName.match(/P\d/i);
                    const periodCode = pMatch ? pMatch[0].toUpperCase() : "P0";
                    window.fetchClassData(selectedName, selectedId, periodCode);
                } else {
                    currentClassData = {};
                    if (unsubscribeAssignments) unsubscribeAssignments();
                    window.buildTopicDropdown();
                    window.renderCalendar();
                }
            });
        }
    } catch (error) {
        console.error("Error loading classes:", error);
    }
}

// ==========================================
// 3. FETCH DATA FOR SELECTED CLASS
// ==========================================
window.fetchClassData = async function (className, classId, periodCode) {
    try {
        const activePeriod = periodCode || "P0";
        document.getElementById('calendar-title').innerText = `Calendar - ${activePeriod}`;

        await window.updateMasterCalendarState([activePeriod]);

        if (unsubscribeAssignments) unsubscribeAssignments();

        const classFolder = getFolderId(className, classId);

        // Listen DIRECTLY to the specific class folder. Zero client-side filtering needed!
        unsubscribeAssignments = onValue(ref(db, `schedulerAssignments/${classFolder}`), (assigSnap) => {
            currentClassData = {};

            if (assigSnap.exists()) {
                const rawData = assigSnap.val();

                // Map the Firebase composite keys (fbKey) back to local assignmentIds for the UI
                Object.keys(rawData).forEach(fbKey => {
                    let assig = rawData[fbKey];
                    assig._fbKey = fbKey; // Secretly store the composite key for saving later
                    currentClassData[assig.assignmentId] = assig;
                });
            }

            if (!window.isDragging) {
                window.buildTopicDropdown();
                window.renderCalendar();
            }
        });

    } catch (error) {
        console.error("Error fetching class data:", error);
    }
};

// ==========================================
// 4. FIREBASE UPDATE FUNCTIONS
// ==========================================
window.saveAssignmentDates = async function (assignmentId, newDates) {
    try {
        const assig = currentClassData[assignmentId];
        if (!assig) return;

        const classFolder = getFolderId(assig.className, assig.classId);
        const updateRef = ref(db, `schedulerAssignments/${classFolder}/${assig._fbKey}`);
        await update(updateRef, { scheduledDates: newDates });

    } catch (error) {
        console.error("Error updating dates:", error);
    }
};

window.saveDayOrder = async function (assignmentId, newOrder) {
    try {
        const assig = currentClassData[assignmentId];
        if (!assig) return;

        const classFolder = getFolderId(assig.className, assig.classId);
        const updateRef = ref(db, `schedulerAssignments/${classFolder}/${assig._fbKey}`);
        await update(updateRef, { dayOrder: newOrder });

    } catch (error) {
        console.error("Error saving dayOrder:", error);
    }
};

window.saveNotes = async function (assignmentId, text) {
    try {
        const assig = currentClassData[assignmentId];
        if (!assig) return;

        const classFolder = getFolderId(assig.className, assig.classId);
        const updateRef = ref(db, `schedulerAssignments/${classFolder}/${assig._fbKey}`);
        await update(updateRef, { notes: text });

    } catch (e) {
        console.error("Error saving notes:", e);
    }
};

// ==========================================
// 5. GLOBAL EXPORTS FOR UI (Kept Intact)
// ==========================================
window.getCurrentClassData = function () {
    return currentClassData;
};