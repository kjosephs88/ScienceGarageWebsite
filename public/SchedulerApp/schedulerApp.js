import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, query, orderByChild, equalTo, get, update, remove, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 🛑🛑🛑 FIREBASE CONFIG 🛑🛑🛑
const firebaseConfig = {
    apiKey: "AIzaSyCcpjuH1qv9IUDJJQR_5ms18TBRS8UFaV8",
    authDomain: "scigarage.firebaseapp.com",
    databaseURL: "https://scigarage-default-rtdb.firebaseio.com",
    projectId: "scigarage",
    storageBucket: "scigarage.firebasestorage.app",
    messagingSenderId: "768658065204",
    appId: "1:768658065204:web:31e0386ee9c9edfe3ac761",
    measurementId: "G-SJ48L43TZ2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

window.loginTeacher = function() {
    signInWithPopup(auth, provider).catch((error) => {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
    });
};

window.logoutTeacher = function() {
    signOut(auth).catch((error) => console.error("Logout error:", error));
};

let currentMonday = (function() {
    let now = new Date();
    now.setHours(12, 0, 0, 0); 
    let day = now.getDay();    
    let diff = 1 - day;        
    now.setDate(now.getDate() + diff);
    return now;
})();

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
let currentClassData = {}; 
let currentCalendarConfig = {}; 
let currentBellringers = {}; 
let activePeriod = ""; 
let unsubscribeAssignments = null; 
window.isDragging = false;         

function formatDateLocal(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// --- NEW: THE OPTIMIZED MASTER CALENDAR ENGINE ---
window.updateMasterCalendarState = async function(periodsToUpdate = [activePeriod]) {
    const updates = {};
    
    for (const period of periodsToUpdate) {
        let configToUpdate = currentCalendarConfig;
        if (period !== activePeriod) {
            const snap = await get(ref(db, `calendarConfig/${period}`));
            configToUpdate = snap.exists() ? snap.val() : {};
        }

        let currDate = new Date('2025-07-01T12:00:00'); 
        let endDate = new Date('2026-06-30T12:00:00'); 
        let isDouble = true; 

        while (currDate <= endDate) {
            let dStr = formatDateLocal(currDate);
            let dayOfWeek = currDate.getDay();
            let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            let dayConfig = configToUpdate[dStr] || {};

            if (!isWeekend) {
                if (dayConfig.flipped) isDouble = !isDouble;
                
                if (dayConfig.isDouble !== isDouble) {
                    updates[`/calendarConfig/${period}/${dStr}/isDouble`] = isDouble;
                    
                    if (period === activePeriod) {
                        if (!currentCalendarConfig[dStr]) currentCalendarConfig[dStr] = {};
                        currentCalendarConfig[dStr].isDouble = isDouble;
                    }
                }

                if (!dayConfig.isDayOff) isDouble = !isDouble; 
            }
            currDate.setDate(currDate.getDate() + 1);
        }
    }
    try {
        if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
        }
    } catch (error) { console.error("Master calendar sync failed", error); }
}

const allowedAdmins = ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'];

onAuthStateChanged(auth, (user) => {
    const authStatus = document.getElementById('auth-status');
    const authBtn = document.getElementById('auth-btn');
    const sidebar = document.getElementById('teacher-sidebar');
    const mainView = document.getElementById('main-view');

    if (user) {
        if (allowedAdmins.includes(user.email)) {
            authStatus.innerHTML = `Logged in: <b>${user.email}</b>`;
            authBtn.innerText = "Log Out";
            authBtn.onclick = window.logoutTeacher;
            sidebar.style.display = "flex";
            mainView.classList.add('edit-mode');
            window.loadInitialClasses();
        } else {
            alert(`Access Denied: The account (${user.email}) does not have admin privileges.`);
            window.logoutTeacher(); 
        }
    } else {
        authStatus.innerHTML = `Mode: View Only`;
        authBtn.innerText = "Teacher Login";
        authBtn.onclick = window.loginTeacher;
        sidebar.style.display = "none";
        mainView.classList.remove('edit-mode');
        document.getElementById('calendar-container').innerHTML = '';
        document.getElementById('date-range-display').innerText = "Please Log In";
    }
});

window.loadInitialClasses = async function() {
    document.getElementById('date-range-display').innerText = "Syncing...";
    const classSelect = document.getElementById('class-select');
    
    try {
        const snapshot = await get(ref(db, 'assignments'));
        if (snapshot.exists()) {
            const allData = snapshot.val();
            const uniqueClasses = new Set();
            Object.values(allData).forEach(a => { if (a.className) uniqueClasses.add(a.className); });

            classSelect.innerHTML = ''; 
            Array.from(uniqueClasses).sort().forEach(className => {
                const opt = document.createElement('option');
                opt.value = className;
                opt.innerText = className;
                classSelect.appendChild(opt);
            });
            window.fetchClassData(); 
        } else {
            classSelect.innerHTML = '<option>No classes found</option>';
            document.getElementById('date-range-display').innerText = "Database empty.";
        }
    } catch (error) { console.error("Error:", error); }
}

window.fetchClassData = async function() {
    const className = document.getElementById('class-select').value;
    if(!className || className === "Loading...") return;

    const periodMatch = className.match(/(P\d)/i);
    activePeriod = periodMatch ? periodMatch[0].toUpperCase() : "DEFAULT";
    
    document.getElementById('modal-title').innerText = `${activePeriod} Calendar Settings`;
    document.getElementById('current-period-label').innerText = activePeriod;
    
    const mainView = document.getElementById('main-view');
    const lowerClassName = className.toLowerCase();
    
    const isForensics = lowerClassName.includes('forensics') || activePeriod === 'P1';
    if (isForensics) {
        mainView.classList.add('hide-for-forensics');
    } else {
        mainView.classList.remove('hide-for-forensics');
    }

    let subject = null;
    if (lowerClassName.includes('chemistry')) {
        subject = 'Chemistry';
    } else if (lowerClassName.includes('physics')) {
        subject = 'Physics';
    }

    try {
        const configSnap = await get(ref(db, `calendarConfig/${activePeriod}`));
        currentCalendarConfig = configSnap.exists() ? configSnap.val() : {};

        if (subject) {
            const bellringerSnap = await get(ref(db, `bellringers/${subject}`));
            currentBellringers = bellringerSnap.exists() ? bellringerSnap.val() : {};
        } else {
            currentBellringers = {};
        }

        await window.updateMasterCalendarState([activePeriod]);

        if (unsubscribeAssignments) unsubscribeAssignments();

        const assignmentsRef = ref(db, 'assignments');
        unsubscribeAssignments = onValue(assignmentsRef, (assigSnap) => {
            currentClassData = {};
            
            if (assigSnap.exists()) {
                const allData = assigSnap.val();
                Object.entries(allData).forEach(([key, val]) => {
                    if (val.className && val.className.includes(activePeriod)) {
                        currentClassData[key] = val;
                    }
                });
            }

            if (!window.isDragging) {
                window.buildTopicDropdown();
                window.renderCalendar(); 
            }
        });

    } catch (error) { console.error("Error:", error); }
}

window.buildTopicDropdown = function() {
    const topicSelect = document.getElementById('topic-select');
    const selectedClass = document.getElementById('class-select').value;
    
    const currentSelection = topicSelect.value;
    
    topicSelect.innerHTML = '<option value="all">All Topics</option>'; 
    const uniqueTopics = new Set();
    
    Object.values(currentClassData).forEach(a => { 
        if (a.className === selectedClass && a.topicName && !a.isCustomNote) {
            uniqueTopics.add(a.topicName); 
        }
    });
    
    Array.from(uniqueTopics).sort().forEach(topic => {
        const opt = document.createElement('option'); 
        opt.value = topic; 
        opt.innerText = topic; 
        topicSelect.appendChild(opt);
    });

    const topicStillExists = Array.from(topicSelect.options).some(opt => opt.value === currentSelection);
    if (currentSelection && topicStillExists) {
        topicSelect.value = currentSelection;
    } else {
        topicSelect.value = 'all'; 
    }
}

window.renderCalendar = function() {
    const container = document.getElementById('calendar-container');
    const holdingTank = document.getElementById('holding-tank');
    
    container.innerHTML = ''; 
    holdingTank.innerHTML = ''; 
    
    const numWeeks = parseInt(document.getElementById('week-view-select').value) || 1;
    let renderDate = new Date(currentMonday);

    const endDate = new Date(currentMonday);
    endDate.setDate(currentMonday.getDate() + (numWeeks * 7) - 3); 
    document.getElementById('date-range-display').innerText = 
        `${currentMonday.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endDate.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}`;

    for (let w = 0; w < numWeeks; w++) {
        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-grid';

        for (let d = 0; d < 5; d++) {
            const dateStr = formatDateLocal(renderDate);
            const dayConfig = currentCalendarConfig[dateStr] || {};
            
            let isDouble = dayConfig.isDouble !== undefined ? dayConfig.isDouble : true;
            
            weekGrid.appendChild(window.createDayColumn(renderDate, isDouble, dateStr, dayConfig));
            
            renderDate.setDate(renderDate.getDate() + 1);
        }
        container.appendChild(weekGrid);
        renderDate.setDate(renderDate.getDate() + 2); 
    }

    window.initSortables();
    window.placeAssignments();
}

window.createDayColumn = function(dateObj, isDouble, dateStr, dayConfig) {
    const col = document.createElement('div');
    col.className = 'day-column';
    const displayDate = `${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getDate()}`;
    
    if (dayConfig && dayConfig.isDayOff) {
        col.innerHTML = `
            <div class="day-header">
                <span class="day-name">${dayNames[dateObj.getDay() - 1]}</span>
                <div class="day-date">${displayDate}</div>
            </div>
            <div class="day-off-banner">${dayConfig.name}</div>
            <div class="sortable-list day-list" id="${dateStr}" style="display: none;"></div>
        `;
    } else {
        let bannerHTML = '';
        if (dayConfig && dayConfig.name) {
            bannerHTML = `<div class="special-day-banner">${dayConfig.name}</div>`;
        }

        let bellringerHTML = '';
        const bellringerUrl = currentBellringers[dateStr];
        if (bellringerUrl) {
            bellringerHTML = `<div class="bellringer-container"><span onclick="window.open('${bellringerUrl}', '_blank')" style="color: #0056b3; font-weight: bold; text-decoration: underline; cursor: pointer;" title="Click to open Bellringer">BELLRINGER</span></div>`;
        } else {
            bellringerHTML = `<div class="bellringer-container"></div>`;
        }

        col.innerHTML = `
            <div class="day-header">
                <span class="day-name">${dayNames[dateObj.getDay() - 1]}</span>
                <div class="day-date">${displayDate}</div>
            </div>
            ${bannerHTML}
            ${bellringerHTML}
            <div class="sortable-list day-list" id="${dateStr}"></div>
            <div class="day-footer">
                <div class="period-badge-container">
                    <span class="period-text">${isDouble ? 'Double period' : 'Single period'}</span>
                    <button class="swap-btn" onclick="toggleFlip('${dateStr}')" title="Flip Sequence from here forward">⟳</button>
                </div>
                <button class="add-note-btn" onclick="addCustomNote('${dateStr}')" title="Add Draggable Note">➕📝</button>
            </div>
        `;
    }
    return col;
}

window.saveAllListOrders = async function() {
    const updates = {};
    document.querySelectorAll('.sortable-list').forEach(list => {
        const listId = list.id === 'holding-tank' ? 'holding-tank' : list.id;
        Array.from(list.children).forEach((item, index) => {
            const dbKey = item.getAttribute('data-db-key');
            updates[`/assignments/${dbKey}/dayOrder/${listId}`] = index;
            
            if (currentClassData[dbKey]) {
                if (!currentClassData[dbKey].dayOrder) currentClassData[dbKey].dayOrder = {};
                currentClassData[dbKey].dayOrder[listId] = index;
            }
        });
    });
    try {
        if(Object.keys(updates).length > 0) {
            await update(ref(db), updates);
        }
    } catch (e) { console.error("Order save failed", e); }
};

window.addCustomNote = async function(dateStr) {
    const text = prompt("Enter text for this draggable note:");
    if (!text || text.trim() === "") return;

    const currentClass = document.getElementById('class-select').value;
    const newNoteRef = push(ref(db, 'assignments')); 
    
    const noteData = {
        title: text.trim(),
        className: currentClass,
        topicName: "Custom Notes", 
        scheduledDates: [dateStr],
        isCustomNote: true,
        timestampCreated: Date.now()
    };

    try {
        await set(newNoteRef, noteData);
        window.fetchClassData(); 
    } catch (err) { console.error("Error adding note:", err); }
}

window.toggleFlip = async function(dateStr) {
    let isCurrentlyFlipped = false;
    if (currentCalendarConfig[dateStr] && currentCalendarConfig[dateStr].flipped) {
        isCurrentlyFlipped = true;
    }
    try {
        await update(ref(db), { [`/calendarConfig/${activePeriod}/${dateStr}/flipped`]: !isCurrentlyFlipped });
        if (!currentCalendarConfig[dateStr]) currentCalendarConfig[dateStr] = {};
        currentCalendarConfig[dateStr].flipped = !isCurrentlyFlipped;
        await window.updateMasterCalendarState([activePeriod]);
        window.renderCalendar(); 
    } catch (err) { console.error("Error saving flip:", err); }
};

window.placeAssignments = function() {
    const holdingTank = document.getElementById('holding-tank');
    const selectedTopic = document.getElementById('topic-select').value;
    const selectedClass = document.getElementById('class-select').value;

    const queues = { "holding-tank": [] };
    document.querySelectorAll('.day-list').forEach(list => queues[list.id] = []);

    Object.entries(currentClassData).forEach(([dbKey, assignment]) => {
        const dates = assignment.scheduledDates || ["unassigned"];
        const isUnassigned = dates.includes("unassigned") || dates.length === 0;

        if (isUnassigned) {
            if (assignment.className !== selectedClass) return; 
            if (selectedTopic !== 'all' && assignment.topicName !== selectedTopic && !assignment.isCustomNote) return; 
        }
        
        let itemHTML = '';

        if (assignment.isCustomNote) {
            itemHTML = `
                <div class="assignment-item custom-note-item" data-db-key="${dbKey}">
                    <span class="item-title" style="font-weight: bold;">${assignment.title}</span>
                    <div class="item-actions">
                        <button class="action-btn edit-custom-note-btn" title="Edit Note">✏️</button>
                        <button class="action-btn delete-btn" title="Delete Note">❌</button>
                    </div>
                </div>
            `;
        } else {
            const urlAttr = assignment.encodedUrl ? `data-url="${assignment.encodedUrl}"` : '';
            const titleAttr = assignment.encodedUrl ? `title="Click to open in Google Classroom, drag to move"` : `title="Drag to schedule"`;
            
            itemHTML = `
                <div class="assignment-item" data-db-key="${dbKey}" ${urlAttr} ${titleAttr} style="${assignment.encodedUrl ? 'cursor: pointer;' : ''}">
                    <span class="item-prefix">Complete assignment:</span>
                    <span class="item-title">${assignment.title}</span>
                    <span class="item-note" style="display: none;"></span> 
                    <div class="item-actions">
                        <button class="action-btn note-btn" title="Add/Edit Inline Note">📝</button>
                        <button class="action-btn delete-btn" title="Remove">❌</button>
                        <button class="action-btn duplicate-btn" title="Duplicate">➡️</button>
                    </div>
                </div>
            `;
        }

        if (isUnassigned) {
            let blockHTML = itemHTML;
            if (!assignment.isCustomNote && assignment.notes && assignment.notes["unassigned"]) {
                blockHTML = blockHTML.replace('<span class="item-note" style="display: none;"></span>', `<span class="item-note">Note: ${assignment.notes["unassigned"]}</span>`);
            }
            let order = (assignment.dayOrder && assignment.dayOrder["holding-tank"]) !== undefined ? assignment.dayOrder["holding-tank"] : 999;
            queues["holding-tank"].push({ html: blockHTML, order: order, key: dbKey });
        } else {
            dates.forEach(dateString => {
                if (queues[dateString]) { 
                    let blockHTML = itemHTML;
                    if (!assignment.isCustomNote && assignment.notes && assignment.notes[dateString]) {
                        blockHTML = blockHTML.replace('<span class="item-note" style="display: none;"></span>', `<span class="item-note">Note: ${assignment.notes[dateString]}</span>`);
                    }
                    let order = (assignment.dayOrder && assignment.dayOrder[dateString]) !== undefined ? assignment.dayOrder[dateString] : 999;
                    queues[dateString].push({ html: blockHTML, order: order, key: dbKey });
                }
            });
        }
    });

    Object.keys(queues).forEach(qId => {
        const targetList = document.getElementById(qId);
        if (targetList) {
            queues[qId].sort((a, b) => a.order - b.order).forEach(item => {
                targetList.insertAdjacentHTML('beforeend', item.html);
            });
        }
    });

    Object.keys(currentClassData).forEach(dbKey => {
        if (!currentClassData[dbKey].isCustomNote) window.updatePrefixes(dbKey);
    });
}

// --- UPDATED: Sortable logic captures fromId and toId for "The Mover" ---
window.initSortables = function() {
    const sortableOptions = {
        group: 'shared', animation: 150, ghostClass: 'sortable-ghost',
        onStart: function () { window.isDragging = true; }, 
        onEnd: function (evt) { 
            const dbKey = evt.item.getAttribute('data-db-key');
            const fromId = evt.from.id === 'holding-tank' ? 'unassigned' : evt.from.id;
            const toId = evt.to.id === 'holding-tank' ? 'unassigned' : evt.to.id;
            window.syncAssignmentToFirebase(dbKey, evt.item, fromId, toId); 
        }
    };
    new Sortable(document.getElementById('holding-tank'), sortableOptions);
    document.querySelectorAll('.day-list').forEach(list => new Sortable(list, sortableOptions));
}

// --- UPDATED: The Mover and The Janitor applied directly to the sync function ---
window.syncAssignmentToFirebase = async function(dbKey, visualItem = null, fromId = null, toId = null) {
    const visibleDatesOnGrid = Array.from(document.querySelectorAll('.day-list')).map(list => list.id);
    const oldDates = currentClassData[dbKey].scheduledDates || ["unassigned"];
    const preservedOffScreenDates = oldDates.filter(d => d !== "unassigned" && !visibleDatesOnGrid.includes(d));

    const allInstances = Array.from(document.querySelectorAll(`.assignment-item[data-db-key="${dbKey}"]`));
    let domDates = allInstances.map(inst => inst.closest('.sortable-list').id === 'holding-tank' ? 'unassigned' : inst.closest('.sortable-list').id);
    
    let newDatesArray = [...preservedOffScreenDates, ...domDates];
    newDatesArray = [...new Set(newDatesArray)].sort();
    
    if (newDatesArray.length > 1 && newDatesArray.includes("unassigned")) newDatesArray = newDatesArray.filter(d => d !== "unassigned");
    if (newDatesArray.length === 0) newDatesArray = ["unassigned"];

    if(currentClassData[dbKey]) currentClassData[dbKey].scheduledDates = newDatesArray;
    if(!currentClassData[dbKey].isCustomNote) window.updatePrefixes(dbKey);

    try {
        const updatePayload = {
            [`/assignments/${dbKey}/scheduledDates`]: newDatesArray
        };

        // --- THE MOVER: Transfer notes when dragged to a new day ---
        if (fromId && toId && fromId !== toId) {
            if (!currentClassData[dbKey].notes) currentClassData[dbKey].notes = {};
            
            if (currentClassData[dbKey].notes[fromId]) {
                const noteText = currentClassData[dbKey].notes[fromId];
                updatePayload[`/assignments/${dbKey}/notes/${toId}`] = noteText;
                currentClassData[dbKey].notes[toId] = noteText;
            } else {
                updatePayload[`/assignments/${dbKey}/notes/${toId}`] = null;
                delete currentClassData[dbKey].notes[toId];
            }
            updatePayload[`/assignments/${dbKey}/notes/${fromId}`] = null;
            delete currentClassData[dbKey].notes[fromId];
        }

        // --- THE JANITOR: Sweep up orphan dayOrder keys ---
        if (currentClassData[dbKey] && currentClassData[dbKey].dayOrder) {
            Object.keys(currentClassData[dbKey].dayOrder).forEach(dateKey => {
                if (dateKey !== 'holding-tank' && !newDatesArray.includes(dateKey)) {
                    updatePayload[`/assignments/${dbKey}/dayOrder/${dateKey}`] = null; 
                    delete currentClassData[dbKey].dayOrder[dateKey]; 
                }
            });
        }
        
        // --- THE JANITOR: Sweep up orphan notes keys ---
        if (currentClassData[dbKey] && currentClassData[dbKey].notes) {
            Object.keys(currentClassData[dbKey].notes).forEach(dateKey => {
                if (dateKey !== 'unassigned' && !newDatesArray.includes(dateKey)) {
                    updatePayload[`/assignments/${dbKey}/notes/${dateKey}`] = null; 
                    delete currentClassData[dbKey].notes[dateKey]; 
                }
            });
        }

        await update(ref(db), updatePayload);
        await window.saveAllListOrders(); 
        
        if (newDatesArray.length === 1 && newDatesArray[0] === "unassigned") {
            const selectedClass = document.getElementById('class-select').value;
            const selectedTopic = document.getElementById('topic-select').value;
            const assignment = currentClassData[dbKey];
            if (assignment.className !== selectedClass || (selectedTopic !== 'all' && assignment.topicName !== selectedTopic && !assignment.isCustomNote)) {
                if (visualItem) visualItem.remove(); 
            }
        }

        if (visualItem && document.body.contains(visualItem)) { 
            visualItem.style.backgroundColor = '#d4edda'; 
            setTimeout(() => visualItem.style.backgroundColor = visualItem.classList.contains('custom-note-item') ? '#fff3cd' : '#ffffff', 500); 
        }
    } catch (error) { 
        console.error("Save failed:", error); 
    } finally {
        setTimeout(() => { window.isDragging = false; }, 500);
    }
}

window.updatePrefixes = function(dbKey) {
    const assignment = currentClassData[dbKey];
    if (!assignment || assignment.isCustomNote) return;

    let dates = (assignment.scheduledDates || []).filter(d => d !== "unassigned").sort();
    
    const instances = document.querySelectorAll(`.assignment-item[data-db-key="${dbKey}"]`);
    instances.forEach(inst => {
        const list = inst.closest('.sortable-list');
        if (!list) return;
        const listId = list.id;
        const prefixSpan = inst.querySelector('.item-prefix');
        const dupBtn = inst.querySelector('.duplicate-btn');
        
        if (listId === 'holding-tank') {
            prefixSpan.innerText = 'Complete assignment:';
            if (dupBtn) dupBtn.disabled = true; 
        } else {
            if (dates.length <= 1) {
                prefixSpan.innerText = 'Complete assignment:';
            } else if (listId === dates[0]) {
                prefixSpan.innerText = 'Begin assignment:';
            } else if (listId === dates[dates.length - 1]) {
                prefixSpan.innerText = 'Finish assignment:';
            } else {
                prefixSpan.innerText = 'Continue assignment:';
            }
            
            if (dupBtn) {
                dupBtn.disabled = (dates.length > 0 && listId !== dates[dates.length - 1]);
            }
        }
    });
}

window.getNextValidDay = function(currentDateStr) {
    let currDate = new Date(currentDateStr + 'T12:00:00');
    currDate.setDate(currDate.getDate() + 1); 
    
    while (true) {
        let dStr = formatDateLocal(currDate);
        let dayOfWeek = currDate.getDay();
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        let isOff = currentCalendarConfig[dStr] && currentCalendarConfig[dStr].isDayOff;
        
        if (!isWeekend && !isOff) return dStr;
        currDate.setDate(currDate.getDate() + 1);
    }
}

document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.action-btn'); 
    
    if (btn && btn.classList.contains('delete-btn')) {
        const item = btn.closest('.assignment-item');
        const dbKey = item.getAttribute('data-db-key');
        
        if (currentClassData[dbKey] && currentClassData[dbKey].isCustomNote) {
            if(confirm("Delete this custom note permanently?")) {
                remove(ref(db, `/assignments/${dbKey}`));
                delete currentClassData[dbKey];
                item.remove();
                window.saveAllListOrders(); 
            }
            return;
        }

        if (item.closest('#holding-tank')) return; 
        item.remove(); 
        
        if (document.querySelectorAll(`.day-list .assignment-item[data-db-key="${dbKey}"]`).length === 0) {
            const selectedClass = document.getElementById('class-select').value;
            const selectedTopic = document.getElementById('topic-select').value;
            const assignment = currentClassData[dbKey];
            if (assignment.className === selectedClass && (selectedTopic === 'all' || assignment.topicName === selectedTopic || assignment.isCustomNote)) {
                document.getElementById('holding-tank').appendChild(item.cloneNode(true));
            }
        }
        window.syncAssignmentToFirebase(dbKey); 
        return; 
    }
    
    if (btn && btn.classList.contains('edit-custom-note-btn')) {
        const item = btn.closest('.assignment-item');
        const dbKey = item.getAttribute('data-db-key');
        const currentText = currentClassData[dbKey].title;
        
        const newText = prompt("Edit note:", currentText);
        if (newText !== null && newText.trim() !== "") {
            update(ref(db), { [`/assignments/${dbKey}/title`]: newText.trim() }).then(() => {
                currentClassData[dbKey].title = newText.trim();
                document.querySelectorAll('.assignment-item').forEach(el => el.remove());
                window.placeAssignments();
            });
        }
        return;
    }

    if (btn && btn.classList.contains('duplicate-btn') && !btn.disabled) {
        const item = btn.closest('.assignment-item');
        const currentList = item.closest('.day-list');
        if (!currentList) return;
        
        const dbKey = item.getAttribute('data-db-key');
        const currentDateStr = currentList.id; 
        
        const nextDayStr = window.getNextValidDay(currentDateStr);
        
        let dates = currentClassData[dbKey].scheduledDates || [];
        if (!dates.includes(nextDayStr)) {
            dates.push(nextDayStr);
            dates.sort();
        }
        
        currentClassData[dbKey].scheduledDates = dates;
        
        update(ref(db), { [`/assignments/${dbKey}/scheduledDates`]: dates }).then(() => {
            document.querySelectorAll('.assignment-item').forEach(el => el.remove());
            window.placeAssignments();
        }).catch(err => console.error("Error duplicating:", err));
        
        return; 
    }

    if (btn && btn.classList.contains('note-btn')) {
        const item = btn.closest('.assignment-item');
        const dbKey = item.getAttribute('data-db-key');
        const listId = item.closest('.sortable-list').id === 'holding-tank' ? 'unassigned' : item.closest('.sortable-list').id;
        
        const currentNotesObj = currentClassData[dbKey].notes || {};
        const currentNoteStr = currentNotesObj[listId] || "";
        
        const newNote = prompt("Add an inline note for this specific block (leave blank to remove):", currentNoteStr);
        
        if (newNote !== null) {
            const finalNote = newNote.trim();
            if (!currentClassData[dbKey].notes) currentClassData[dbKey].notes = {};
            currentClassData[dbKey].notes[listId] = finalNote;
            
            const updatePayload = {};
            if (finalNote === "") {
                updatePayload[`/assignments/${dbKey}/notes/${listId}`] = null; 
            } else {
                updatePayload[`/assignments/${dbKey}/notes/${listId}`] = finalNote;
            }

            update(ref(db), updatePayload).then(() => {
                document.querySelectorAll('.assignment-item').forEach(el => el.remove());
                window.placeAssignments();
            }).catch(err => console.error("Error saving note:", err));
        }
        return; 
    }

    const item = e.target.closest('.assignment-item');
    if (item && !btn && !item.classList.contains('custom-note-item')) { 
        const url = item.getAttribute('data-url');
        if (url) { window.open(url, '_blank'); }
    }
});

window.changeWeek = function(offset) { currentMonday.setDate(currentMonday.getDate() + (offset * 7)); window.renderCalendar(); }
window.handleTopicFilter = function() { document.querySelectorAll('.assignment-item').forEach(el => el.remove()); window.placeAssignments(); }

window.openSettingsModal = function() {
    document.getElementById('settings-modal').style.display = 'flex';
    window.populateConfigList();
}
window.closeSettingsModal = function() {
    document.getElementById('settings-modal').style.display = 'none';
}

window.getValidDaysArray = function(configObj, startDateStr, numDays = 800) {
    let validDays = [];
    let currDate = new Date(startDateStr + 'T12:00:00');
    while (validDays.length < numDays) {
        let dStr = formatDateLocal(currDate);
        let dayOfWeek = currDate.getDay();
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        let isOff = configObj[dStr] && configObj[dStr].isDayOff;
        if (!isWeekend && !isOff) validDays.push(dStr);
        currDate.setDate(currDate.getDate() + 1);
    }
    return validDays;
}

window.shiftAssignments = function(oldValidDays, newValidDays, startStr) {
    const assignmentUpdates = {};
    let assignmentsShifted = false;

    Object.entries(currentClassData).forEach(([dbKey, assignment]) => {
        if (assignment.scheduledDates && assignment.scheduledDates.length > 0) {
            let newDates = [];
            let changed = false;

            assignment.scheduledDates.forEach(dateStr => {
                if (dateStr !== "unassigned" && dateStr >= startStr) {
                    let oldIndex = oldValidDays.indexOf(dateStr);
                    if (oldIndex !== -1 && oldIndex < newValidDays.length) {
                        newDates.push(newValidDays[oldIndex]);
                        changed = true;
                    } else { newDates.push(dateStr); }
                } else { newDates.push(dateStr); }
            });

            if (changed) {
                newDates = [...new Set(newDates)].sort();
                assignmentUpdates[`/assignments/${dbKey}/scheduledDates`] = newDates;
                currentClassData[dbKey].scheduledDates = newDates;

                if (assignment.notes) {
                    let newNotes = {};
                    Object.keys(assignment.notes).forEach(oldKey => {
                        if (oldKey !== "unassigned" && oldKey >= startStr) {
                            let oldIndex = oldValidDays.indexOf(oldKey);
                            if (oldIndex !== -1 && oldIndex < newValidDays.length) {
                                newNotes[newValidDays[oldIndex]] = assignment.notes[oldKey];
                                assignmentUpdates[`/assignments/${dbKey}/notes/${oldKey}`] = null;
                                assignmentUpdates[`/assignments/${dbKey}/notes/${newValidDays[oldIndex]}`] = assignment.notes[oldKey];
                            } else { newNotes[oldKey] = assignment.notes[oldKey]; }
                        } else { newNotes[oldKey] = assignment.notes[oldKey]; }
                    });
                    currentClassData[dbKey].notes = newNotes;
                }

                if (assignment.dayOrder) {
                    let newOrder = {};
                    Object.keys(assignment.dayOrder).forEach(oldKey => {
                        if (oldKey !== "holding-tank" && oldKey !== "unassigned" && oldKey >= startStr) {
                            let oldIndex = oldValidDays.indexOf(oldKey);
                            if (oldIndex !== -1 && oldIndex < newValidDays.length) {
                                newOrder[newValidDays[oldIndex]] = assignment.dayOrder[oldKey];
                                assignmentUpdates[`/assignments/${dbKey}/dayOrder/${oldKey}`] = null;
                                assignmentUpdates[`/assignments/${dbKey}/dayOrder/${newValidDays[oldIndex]}`] = assignment.dayOrder[oldKey];
                            } else { newOrder[oldKey] = assignment.dayOrder[oldKey]; }
                        } else { newOrder[oldKey] = assignment.dayOrder[oldKey]; }
                    });
                    currentClassData[dbKey].dayOrder = newOrder;
                }
                assignmentsShifted = true;
            }
        }
    });
    return { updates: assignmentUpdates, shifted: assignmentsShifted };
}

window.saveCalendarConfig = async function() {
    const startStr = document.getElementById('special-date-start').value;
    const endStr = document.getElementById('special-date-end').value || startStr; 
    const applyAll = document.getElementById('apply-all-checkbox').checked;
    const finalName = document.getElementById('custom-type-input').value.trim();
    
    if (!startStr) return alert("Please select a Start Date.");
    if (!finalName) return alert("Please type an Event Name.");

    const isDayOff = document.querySelector('input[name="event-type"]:checked').value === "dayOff";

    let currDate = new Date(startStr + 'T12:00:00'); 
    let endDateObj = new Date(endStr + 'T12:00:00');
    if (currDate > endDateObj) return alert("End Date must be after Start Date.");

    const oldValidDays = window.getValidDaysArray(currentCalendarConfig, "2024-07-01", 800);
    const configUpdates = {};
    const newlyCreatedOffDays = []; 
    const targetPeriods = applyAll ? ['P1', 'P3', 'P6', 'P8'] : [activePeriod];
    
    while (currDate <= endDateObj) {
        if (currDate.getDay() !== 0 && currDate.getDay() !== 6) {
            const dateStr = formatDateLocal(currDate);
            let wasAlreadyOff = currentCalendarConfig[dateStr] && currentCalendarConfig[dateStr].isDayOff;
            
            targetPeriods.forEach(p => {
                configUpdates[`/calendarConfig/${p}/${dateStr}/name`] = finalName;
                configUpdates[`/calendarConfig/${p}/${dateStr}/isDayOff`] = isDayOff;
            });
            
            if (isDayOff && !wasAlreadyOff) newlyCreatedOffDays.push(dateStr);
            
            if (!currentCalendarConfig[dateStr]) currentCalendarConfig[dateStr] = {};
            currentCalendarConfig[dateStr].name = finalName;
            currentCalendarConfig[dateStr].isDayOff = isDayOff;
        }
        currDate.setDate(currDate.getDate() + 1);
    }
    
    try {
        await update(ref(db), configUpdates);
        
        if (newlyCreatedOffDays.length > 0) {
            const newValidDays = window.getValidDaysArray(currentCalendarConfig, "2024-07-01", 800);
            const shiftResult = window.shiftAssignments(oldValidDays, newValidDays, startStr);

            if (shiftResult.shifted) {
                await update(ref(db), shiftResult.updates);
            }
        }
        
        await window.updateMasterCalendarState(targetPeriods);
        document.getElementById('special-date-start').value = '';
        document.getElementById('special-date-end').value = '';
        document.getElementById('custom-type-input').value = '';
        
        window.populateConfigList();
        window.renderCalendar(); 
    } catch (error) { console.error("Config save failed", error); }
}

window.deleteConfig = async function(dateStr) {
    const wasDayOff = currentCalendarConfig[dateStr] && currentCalendarConfig[dateStr].isDayOff;
    
    const oldValidDays = window.getValidDaysArray(currentCalendarConfig, "2024-07-01", 800);

    try {
        const targetPeriods = ['P1', 'P3', 'P6', 'P8'];
        const deletePayload = {};
        targetPeriods.forEach(p => {
            deletePayload[`/calendarConfig/${p}/${dateStr}`] = null;
        });
        
        await update(ref(db), deletePayload);
        delete currentCalendarConfig[dateStr];

        if (wasDayOff) {
            const newValidDays = window.getValidDaysArray(currentCalendarConfig, "2024-07-01", 800);
            const shiftResult = window.shiftAssignments(oldValidDays, newValidDays, dateStr);

            if (shiftResult.shifted) {
                await update(ref(db), shiftResult.updates);
            }
        }

        await window.updateMasterCalendarState(['P1', 'P3', 'P6', 'P8']);
        window.populateConfigList();
        window.renderCalendar();
    } catch (error) { console.error("Config delete failed", error); }
}

window.populateConfigList = function() {
    const list = document.getElementById('saved-days-list');
    list.innerHTML = '';
    
    const sortedDates = Object.keys(currentCalendarConfig).sort();
    if(sortedDates.length === 0) {
        list.innerHTML = '<li style="padding: 10px; color: #888;">No special days saved yet.</li>';
        return;
    }

    sortedDates.forEach(dateStr => {
        const config = currentCalendarConfig[dateStr];
        const flipBadge = config.flipped ? '<span style="background: #007bff; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 5px;">FLIPPED</span>' : '';
        list.innerHTML += `
            <li class="config-item">
                <span><strong>${dateStr}</strong>: ${config.name || "Rule"} ${flipBadge}</span>
                <button class="action-btn delete-btn" onclick="deleteConfig('${dateStr}')" style="color: #dc3545; font-size: 1.1rem;">🗑️</button>
            </li>
        `;
    });
}