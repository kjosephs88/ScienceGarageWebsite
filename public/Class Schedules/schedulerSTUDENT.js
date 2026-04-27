import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Read the config from the HTML file
const CONFIG = window.STUDENT_CONFIG;

document.getElementById('calendar-title').innerText = CONFIG.title;
document.title = CONFIG.title;

function scaleUI() {
    const baseWidth = 1900; // Change this from 1400
    const wrapper = document.getElementById('scale-wrapper');
    const content = document.getElementById('scaled-content');

    const availableWidth = wrapper.clientWidth;
    let scale = availableWidth / baseWidth;

    // If the screen is wider than 1900px, don't keep growing (optional)
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
        if (!textSpan) return;

        let fontSize = 24;
        textSpan.style.fontSize = fontSize + 'px';

        while (textSpan.scrollWidth > (banner.clientWidth - 20)) {
            if (fontSize <= 1) break;
            fontSize--;
            textSpan.style.fontSize = fontSize + 'px';
        }
    });
}

const firebaseConfig = {
    apiKey: "AIzaSyCcpjuH1qv9IUDJJQR_5ms18TBRS8UFaV8",
    authDomain: "scigarage.firebaseapp.com",
    databaseURL: "https://scigarage-default-rtdb.firebaseio.com",
    projectId: "scigarage",
    storageBucket: "scigarage.firebasestorage.app",
    messagingSenderId: "768658065204",
    appId: "1:768658065204:web:31e0386ee9c9edfe3ac761"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

// Paste this missing function right here!
function formatDateLocal(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

async function fetchStudentData() {
    const scaledContent = document.getElementById('scaled-content');

    if (CONFIG.period === 'P1' || CONFIG.subject === 'Forensics') {
        scaledContent.classList.add('hide-for-forensics');
    }

    try {
        // 1. Fetch Bellringers (Static snapshot)
        if (CONFIG.subject === 'Chemistry' || CONFIG.subject === 'Physics') {
            const bellringerSnap = await get(ref(db, `bellringers/${CONFIG.subject}`));
            currentBellringers = bellringerSnap.exists() ? bellringerSnap.val() : {};
        }

        // 2. LIVE PIPELINE: Master Calendar State (Flips and Days Off)
        const configRef = ref(db, `calendarConfig/${CONFIG.period}`);
        onValue(configRef, (configSnap) => {
            currentCalendarConfig = configSnap.exists() ? configSnap.val() : {};
            window.renderCalendar();
        });

        // 3. LIVE PIPELINE: Assignments & Notes (UPDATED FOR NEW SCHEMA)
        const assignmentsRef = ref(db, 'schedulerAssignments');
        onValue(assignmentsRef, (assigSnap) => {
            currentClassData = {};
            if (assigSnap.exists()) {
                const allFolders = assigSnap.val();

                // Figure out the prefix we are looking for (e.g., "CH_P6_")
                let subj = "ZZ";
                let lowerSubj = CONFIG.subject.toLowerCase();
                if (lowerSubj.includes("chemistry")) subj = "CH";
                else if (lowerSubj.includes("physics")) subj = "PH";
                else if (lowerSubj.includes("forensic")) subj = "FS";

                const targetPrefix = `${subj}_${CONFIG.period}_`;

                // Find the specific class folder and load its assignments
                Object.keys(allFolders).forEach(folderName => {
                    if (folderName.startsWith(targetPrefix)) {
                        const classAssignments = allFolders[folderName];
                        // Merge the assignments into the local data object
                        Object.assign(currentClassData, classAssignments);
                    }
                });
            }
            window.renderCalendar();
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('date-range-display').innerText = "Error loading schedule.";
    }
}

window.renderCalendar = function () {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';

    const numWeeks = parseInt(document.getElementById('week-view-select').value) || 1;
    let renderDate = new Date(currentMonday);

    const endDate = new Date(currentMonday);
    endDate.setDate(currentMonday.getDate() + (numWeeks * 7) - 3);
    document.getElementById('date-range-display').innerText =
        `${currentMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    for (let w = 0; w < numWeeks; w++) {
        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-grid';

        for (let d = 0; d < 5; d++) {
            const dateStr = formatDateLocal(renderDate);
            const dayConfig = currentCalendarConfig[dateStr] || {};

            // THE BRAINLESS READ
            let isDouble = dayConfig.isDouble !== undefined ? dayConfig.isDouble : true;

            weekGrid.appendChild(createDayColumn(renderDate, isDouble, dateStr, dayConfig));

            renderDate.setDate(renderDate.getDate() + 1);
        }
        container.appendChild(weekGrid);
        renderDate.setDate(renderDate.getDate() + 2);
    }

    placeAssignments();
}

function createDayColumn(dateObj, isDouble, dateStr, dayConfig) {
    const col = document.createElement('div');
    col.className = 'day-column';
    const displayDate = `${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getDate()}`;

    if (dayConfig && (dayConfig.isDayOff || dayConfig.isClassDrop)) {
        col.innerHTML = `
            <div class="day-header">
                <span class="day-name">${dayNames[dateObj.getDay() - 1]}</span>
                <div class="day-date">${displayDate}</div>
            </div>
            <div class="day-off-banner"><span class="banner-text">${dayConfig.name}</span></div>
            <div class="day-list" id="${dateStr}" style="display: none;"></div>
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
            <div class="day-list" id="${dateStr}"></div>
            <div class="day-footer">
                <div class="period-badge-container">
                    <span class="period-text">${isDouble ? 'Double period' : 'Single period'}</span>
                </div>
            </div>
        `;
    }
    return col;
}

function placeAssignments() {
    const queues = {};
    document.querySelectorAll('.day-list').forEach(list => queues[list.id] = []);

    Object.entries(currentClassData).forEach(([dbKey, assignment]) => {
        const dates = assignment.scheduledDates || ["unassigned"];

        if (!dates.includes("unassigned") && dates.length > 0) {
            let itemHTML = '';

            if (assignment.isCustomNote) {
                itemHTML = `
                    <div class="assignment-item custom-note-item" data-db-key="${dbKey}">
                        <span class="item-title" style="font-weight: bold;">${assignment.title}</span>
                    </div>
                `;
            } else {
                const urlAttr = assignment.encodedUrl ? `data-url="${assignment.encodedUrl}"` : '';
                const titleAttr = assignment.encodedUrl ? `title="Click to open in Google Classroom"` : ``;

                itemHTML = `
                    <div class="assignment-item" data-db-key="${dbKey}" ${urlAttr} ${titleAttr} style="${assignment.encodedUrl ? 'cursor: pointer;' : ''}">
                        <span class="item-prefix">Complete assignment:</span>
                        <span class="item-title">${assignment.title}</span>
                        <span class="item-note" style="display: none;"></span> 
                    </div>
                `;
            }

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
        if (!currentClassData[dbKey].isCustomNote) updatePrefixes(dbKey);
    });

    scaleUI();
    setTimeout(fitDayOffText, 50);
}

function updatePrefixes(dbKey) {
    const assignment = currentClassData[dbKey];
    if (!assignment || assignment.isCustomNote) return;

    let dates = (assignment.scheduledDates || []).filter(d => d !== "unassigned").sort();

    const instances = document.querySelectorAll(`.assignment-item[data-db-key="${dbKey}"]`);
    instances.forEach(inst => {
        const list = inst.closest('.day-list');
        if (!list) return;
        const listId = list.id;
        const prefixSpan = inst.querySelector('.item-prefix');

        if (dates.length <= 1) {
            prefixSpan.innerText = 'Complete assignment:';
        } else if (listId === dates[0]) {
            prefixSpan.innerText = 'Begin assignment:';
        } else if (listId === dates[dates.length - 1]) {
            prefixSpan.innerText = 'Finish assignment:';
        } else {
            prefixSpan.innerText = 'Continue assignment:';
        }
    });
}

document.body.addEventListener('click', function (e) {
    const item = e.target.closest('.assignment-item');
    if (item && !item.classList.contains('custom-note-item')) {
        const url = item.getAttribute('data-url');
        if (url) { window.open(url, '_blank'); }
    }
});

window.changeWeek = function (offset) {
    currentMonday.setDate(currentMonday.getDate() + (offset * 7));
    window.renderCalendar();
}

fetchStudentData();
scaleUI();