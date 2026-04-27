import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, get, update, remove, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

// GLOBAL STATE
let currentMonday = (function () {
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
let currentClassFolder = "";
let currentSubject = "";
let unsubscribeAssignments = null;
let unsubscribeConfig = null;
window.isDragging = false;

const formatDateLocal = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// --- UI SCALING ---
function scaleUI() {
    const baseWidth = 1900;
    const wrapper = document.getElementById('scale-wrapper');
    const content = document.getElementById('scaled-content');
    if (!wrapper || !content) return;

    const availableWidth = wrapper.clientWidth;
    let scale = availableWidth / baseWidth;
    if (scale > 1) scale = 1;

    content.style.transform = `scale(${scale})`;

    setTimeout(() => {
        const scaledHeight = content.getBoundingClientRect().height;
        wrapper.style.height = `${scaledHeight}px`;
    }, 10);
}
window.addEventListener('resize', scaleUI);

function fitDayOffText() {
    document.querySelectorAll('.day-off-banner').forEach(banner => {
        const textSpan = banner.querySelector('.banner-text');
        if (!textSpan) {
            if (banner.childNodes.length === 1 && banner.childNodes[0].nodeType === 3) {
                const text = banner.innerText;
                banner.innerHTML = `<span class="banner-text">${text}</span>`;
            } else {
                return;
            }
        }
        const span = banner.querySelector('.banner-text');
        let fontSize = 24;
        span.style.fontSize = fontSize + 'px';
        while (span.scrollWidth > (banner.clientWidth - 20) && fontSize > 10) {
            fontSize--;
            span.style.fontSize = fontSize + 'px';
        }
    });
}

// --- AUTH & INITIALIZATION ---
window.loginTeacher = () => signInWithPopup(auth, provider);
window.logoutTeacher = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const sidebar = document.getElementById('teacher-sidebar');
    const mainView = document.getElementById('main-view');
    const authBtn = document.getElementById('auth-btn');
    const authStatus = document.getElementById('auth-status');

    if (user && ['pianodemon88@gmail.com', 'kjosephs@ocsdny.org'].includes(user.email)) {
        authStatus.innerHTML = `Logged in: <b>${user.email}</b>`;
        authBtn.innerText = "Log Out";
        authBtn.onclick = window.logoutTeacher;
        sidebar.style.display = "flex";
        mainView.classList.add('edit-mode');
        
        initEventListeners();
        window.loadInitialClasses();
    } else {
        sidebar.style.display = "none";
        mainView.classList.remove('edit-mode');
        authBtn.innerText = "Teacher Login";
        authBtn.onclick = window.loginTeacher;
    }
});

function initEventListeners() {
    const classSelect = document.getElementById('class-select');
    classSelect.onchange = (e) => {
        const folder = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        if (folder) window.fetchClassData(folder, name);
    };

    const topicSelect = document.getElementById('topic-select');
    topicSelect.onchange = window.renderCalendar;

    const weekViewSelect = document.getElementById('week-view-select');
    weekViewSelect.onchange = window.renderCalendar;

    document.getElementById('prev-week').onclick = () => {
        currentMonday.setDate(currentMonday.getDate() - 7);
        window.renderCalendar();
    };
    document.getElementById('next-week').onclick = () => {
        currentMonday.setDate(currentMonday.getDate() + 7);
        window.renderCalendar();
    };
    
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn.onclick = () => {
        window.openSettings();
    };
}

// --- DATA LOADING ---
window.loadInitialClasses = async function () {
    const classSelect = document.getElementById('class-select');
    try {
        const snapshot = await get(ref(db, 'schedulerAssignments'));
        if (snapshot.exists()) {
            const allFolders = snapshot.val();
            const uniqueClasses = [];
            Object.keys(allFolders).forEach(folderName => {
                const folderData = allFolders[folderName];
                const sample = Object.values(folderData).find(a => a && a.className);
                if (sample) uniqueClasses.push({ folder: folderName, name: sample.className });
            });
            classSelect.innerHTML = '<option value="">-- Select a Class --</option>';
            uniqueClasses.sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.folder; opt.textContent = c.name;
                classSelect.appendChild(opt);
            });
            
            if (uniqueClasses.length > 0) {
                classSelect.value = uniqueClasses[0].folder;
                window.fetchClassData(uniqueClasses[0].folder, uniqueClasses[0].name);
            }
        }
    } catch (e) { console.error("Initial load failed:", e); }
};

window.fetchClassData = async function (exactFolder, className) {
    currentClassFolder = exactFolder;
    const pMatch = className.match(/P\d/i) || exactFolder.match(/P\d/i);
    activePeriod = pMatch ? pMatch[0].toUpperCase() : "P0";
    
    if (className.toLowerCase().includes("chemistry")) currentSubject = "Chemistry";
    else if (className.toLowerCase().includes("physics")) currentSubject = "Physics";
    else if (className.toLowerCase().includes("forensic")) currentSubject = "Forensics";
    else currentSubject = "Science";

    document.getElementById('calendar-title').innerText = `${className} - ${activePeriod}`;

    if (unsubscribeAssignments) unsubscribeAssignments();
    if (unsubscribeConfig) unsubscribeConfig();

    try {
        const bellSnap = await get(ref(db, `bellringers/${currentSubject}`));
        currentBellringers = bellSnap.exists() ? bellSnap.val() : {};
    } catch (e) { console.error("Bellringer fetch failed", e); }

    unsubscribeConfig = onValue(ref(db, `calendarConfig/${activePeriod}`), (snap) => {
        currentCalendarConfig = snap.exists() ? snap.val() : {};
        window.renderCalendar();
        window.loadConfigList();
    });

    unsubscribeAssignments = onValue(ref(db, `schedulerAssignments/${exactFolder}`), (snap) => {
        currentClassData = {};
        if (snap.exists()) {
            Object.entries(snap.val()).forEach(([key, val]) => {
                if (val && typeof val === 'object') {
                    val._fbKey = key;
                    currentClassData[val.assignmentId || key] = val;
                }
            });
        }
        window.buildTopicDropdown();
        window.renderCalendar();
    });
};

window.buildTopicDropdown = function () {
    const topicSelect = document.getElementById('topic-select');
    const topics = new Set();
    Object.values(currentClassData).forEach(a => { if (a.topicName && !a.isCustomNote) topics.add(a.topicName); });
    topicSelect.innerHTML = '<option value="all">All Topics</option>';
    Array.from(topics).sort().forEach(t => {
        const opt = document.createElement('option'); opt.value = t; opt.textContent = t;
        topicSelect.appendChild(opt);
    });
};

// --- RENDER LOGIC ---
window.renderCalendar = function () {
    const container = document.getElementById('calendar-container');
    const tank = document.getElementById('holding-tank');
    if (!container || !tank) return;
    
    container.innerHTML = ''; 
    tank.innerHTML = '';

    let numWeeks = parseInt(document.getElementById('week-view-select').value) || 1;
    if (numWeeks > 3) numWeeks = 3;

    let renderDate = new Date(currentMonday);
    const dateRangeDisplay = document.getElementById('date-range-display');
    const startDateStr = renderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    for (let w = 0; w < numWeeks; w++) {
        const grid = document.createElement('div'); 
        grid.className = 'week-grid';
        for (let d = 0; d < 5; d++) {
            const dStr = formatDateLocal(renderDate);
            const conf = currentCalendarConfig[dStr] || {};
            grid.appendChild(window.createDayColumn(renderDate, conf.isDouble !== false, dStr, conf));
            renderDate.setDate(renderDate.getDate() + 1);
        }
        container.appendChild(grid);
        renderDate.setDate(renderDate.getDate() + 2);
    }

    const endDate = new Date(renderDate);
    endDate.setDate(renderDate.getDate() - 3);
    dateRangeDisplay.innerText = `${startDateStr} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    window.initSortables();
    window.placeAssignments();
    
    scaleUI();
    setTimeout(fitDayOffText, 50);
};

window.createDayColumn = (dateObj, isDouble, dStr, conf) => {
    const col = document.createElement('div'); 
    col.className = 'day-column';
    const display = `${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getDate()}`;
    const dayName = dayNames[dateObj.getDay() - 1];

    if (conf.isDayOff) {
        col.innerHTML = `
            <div class="day-header">
                <span class="day-name">${dayName}</span>
                <div class="day-date">${display}</div>
            </div>
            <div class="day-off-banner"><span class="banner-text">${conf.name || 'DAY OFF'}</span></div>
            <div class="day-list" id="${dStr}" style="display:none"></div>
        `;
    } else {
        let bannerHTML = conf.name ? `<div class="special-day-banner">${conf.name}</div>` : '';
        let bellringerHTML = '';
        const bellUrl = currentBellringers[dStr];
        if (bellUrl) {
            bellringerHTML = `<div class="bellringer-container"><a href="${bellUrl}" target="_blank" class="bellringer-link">🔔 BELLRINGER</a></div>`;
        } else {
            bellringerHTML = `<div class="bellringer-container"></div>`;
        }

        col.innerHTML = `
            <div class="day-header">
                <span class="day-name">${dayName}</span>
                <div class="day-date">${display}</div>
            </div>
            ${bannerHTML}
            ${bellringerHTML}
            <div class="day-list" id="${dStr}"></div>
            <div class="day-footer">
                <span class="period-text">${isDouble ? 'Double Period' : 'Single Period'}</span>
            </div>
        `;
    }
    return col;
};

// --- PLACE ASSIGNMENTS ---
window.placeAssignments = function () {
    const topic = document.getElementById('topic-select').value;
    const queues = { "holding-tank": [] };
    document.querySelectorAll('.day-list').forEach(l => queues[l.id] = []);

    Object.entries(currentClassData).forEach(([key, a]) => {
        if (!a) return;
        const tName = (a.topicName || "").toLowerCase();
        if (tName.includes("bellringer")) return;

        const dates = a.scheduledDates || ["unassigned"];
        const isUn = dates.includes("unassigned");
        if (isUn && topic !== 'all' && a.topicName !== topic && !a.isCustomNote) return;

        const html = `
            <div class="assignment-item ${a.isCustomNote ? 'custom-note-item' : ''}" data-db-key="${key}">
                ${!a.isCustomNote ? '<span class="item-prefix">Complete assignment:</span>' : ''}
                <span class="item-title">${a.title}</span>
            </div>`;
            
        dates.forEach(d => { 
            if (queues[d]) queues[d].push({ html, order: (a.dayOrder?.[d] ?? 999) }); 
        });
    });

    Object.keys(queues).forEach(id => {
        const el = document.getElementById(id);
        if (el) queues[id].sort((a, b) => a.order - b.order).forEach(i => el.insertAdjacentHTML('beforeend', i.html));
    });
};

window.initSortables = () => {
    const opt = {
        group: 'shared', 
        animation: 150, 
        onEnd: (evt) => {
            const key = evt.item.dataset.dbKey;
            const to = evt.to.id === 'holding-tank' ? 'unassigned' : evt.to.id;
            window.syncToFirebase(key, to);
        }
    };
    new Sortable(document.getElementById('holding-tank'), opt);
    document.querySelectorAll('.day-list').forEach(l => new Sortable(l, opt));
};

window.syncToFirebase = async (key, toId) => {
    const assig = currentClassData[key];
    if (!assig || !currentClassFolder) return;
    const path = `schedulerAssignments/${currentClassFolder}/${assig._fbKey}`;
    const newDates = toId === 'unassigned' ? ['unassigned'] : [toId];
    await update(ref(db), { [`${path}/scheduledDates`]: newDates });
};

// --- SETTINGS MODAL FUNCTIONS ---
window.openSettings = () => {
    document.getElementById('settings-period-name').innerText = activePeriod;
    document.getElementById('settings-modal').style.display = 'flex';
    window.loadConfigList();
};

window.closeSettings = () => {
    document.getElementById('settings-modal').style.display = 'none';
};

window.saveDayConfig = async () => {
    const date = document.getElementById('config-date').value;
    const name = document.getElementById('config-name').value;
    const isDayOff = document.getElementById('config-is-day-off').checked;
    const isDouble = document.getElementById('config-is-double').checked;

    if (!date) return alert("Please select a date.");

    const config = { name, isDayOff, isDouble };
    await set(ref(db, `calendarConfig/${activePeriod}/${date}`), config);
    alert("Configuration saved!");
    window.loadConfigList();
};

window.loadConfigList = () => {
    const list = document.getElementById('config-list');
    if (!list) return;
    list.innerHTML = '';

    Object.entries(currentCalendarConfig).sort().forEach(([date, conf]) => {
        const li = document.createElement('li');
        li.className = 'config-item';
        li.innerHTML = `
            <span><b>${date}</b>: ${conf.name || (conf.isDayOff ? 'Day Off' : 'Special')} (${conf.isDouble ? 'Double' : 'Single'})</span>
            <button class="delete-config-btn" onclick="window.deleteConfig('${date}')">&times;</button>
        `;
        list.appendChild(li);
    });
};

window.deleteConfig = async (date) => {
    if (confirm(`Delete configuration for ${date}?`)) {
        await remove(ref(db, `calendarConfig/${activePeriod}/${date}`));
        window.loadConfigList();
    }
};