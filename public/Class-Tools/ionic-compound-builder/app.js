// --- STATE MANAGEMENT ---
let activeCation = null;
let activeAnion = null;
let groupIdCounter = 0;

// --- UTILITIES ---
function getSubscript(num) {
    const subs = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
    return num.toString().split('').map(d => subs[d]).join('');
}

// Calculates the Greatest Common Divisor to enforce empirical formulas
function getGCD(a, b) {
    return b === 0 ? a : getGCD(b, a % b);
}

// --- UI LOGIC ---
document.getElementById('left-toggle').addEventListener('click', function() {
    document.getElementById('left-sidebar').classList.toggle('collapsed');
    this.classList.toggle('collapsed'); 
});

document.getElementById('right-toggle').addEventListener('click', function() {
    document.getElementById('right-sidebar').classList.toggle('collapsed');
    this.classList.toggle('collapsed'); 
});

function resetWinUI() {
    const desc = document.getElementById('success-description');
    desc.style.visibility = 'hidden';
    desc.style.opacity = '0';
    
    document.getElementById('formula-section').style.display = 'none'; 
    document.getElementById('formula-checkbox').checked = false;
    document.getElementById('formula-display').style.display = 'none';
    document.getElementById('formula-display').textContent = '';
    
    // Also hide the modal just in case the board is cleared while it is open
    document.getElementById('formula-modal-overlay').style.display = 'none';
}

document.getElementById('clear-btn').addEventListener('click', function() {
    document.getElementById('playing-field').innerHTML = '';
    activeCation = null;
    activeAnion = null;
    resetWinUI();
});

// --- NEW: Modal Checkbox Interception Logic ---
document.getElementById('formula-checkbox').addEventListener('change', function(e) {
    if (this.checked) {
        // Prevent formula from showing instantly
        document.getElementById('formula-display').style.display = 'none';
        // Pop up the warning modal
        document.getElementById('formula-modal-overlay').style.display = 'flex';
    } else {
        // If unchecking, just hide the formula
        document.getElementById('formula-display').style.display = 'none';
    }
});

// Modal "Not Ready" Button -> Closes modal, unchecks box
document.getElementById('btn-not-ready').addEventListener('click', function() {
    document.getElementById('formula-modal-overlay').style.display = 'none';
    document.getElementById('formula-checkbox').checked = false;
});

// Modal "Ready" Button -> Closes modal, shows formula
document.getElementById('btn-ready').addEventListener('click', function() {
    document.getElementById('formula-modal-overlay').style.display = 'none';
    document.getElementById('formula-display').style.display = 'block';
});


// --- SVG FACTORY ---
function createIonShape(chargeStr, symbol) {
    const charge = parseInt(chargeStr);
    const absCharge = Math.abs(charge);
    const isCation = charge > 0;
    const unitHeight = 80; 
    const flatWidth = 100; 
    const toothWidth = 40; 
    const totalHeight = absCharge * unitHeight;
    const totalWidth = flatWidth + toothWidth;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", totalWidth);
    svg.setAttribute("height", totalHeight);
    svg.setAttribute("class", "ion-piece");
    svg.setAttribute("data-charge", charge);
    
    let pathD = "";
    if (isCation) {
        pathD = `M 0 0 L ${flatWidth} 0 `;
        for (let i = 0; i < absCharge; i++) {
            pathD += `L ${totalWidth} ${(i + 0.5) * unitHeight} `; 
            pathD += `L ${flatWidth} ${(i + 1) * unitHeight} `;    
        }
        pathD += `L 0 ${totalHeight} Z`;
    } else {
        pathD = `M 0 0 L ${totalWidth} 0 L ${totalWidth} ${totalHeight} L 0 ${totalHeight} `;
        for (let i = absCharge - 1; i >= 0; i--) {
            pathD += `L ${toothWidth} ${(i + 0.5) * unitHeight} `; 
            pathD += `L 0 ${i * unitHeight} `; 
        }
        pathD += "Z";
    }

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", isCation ? "#71BDE5" : "#F5C7A9"); 
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "2");

    const text = document.createElementNS(svgNS, "text");
    const textX = isCation ? flatWidth / 2 : toothWidth + (flatWidth / 2);
    text.setAttribute("x", textX);
    text.setAttribute("y", totalHeight / 2);
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-family", "sans-serif");
    text.setAttribute("font-size", "28px");
    text.setAttribute("font-weight", "bold");
    text.textContent = symbol;

    svg.appendChild(path);
    svg.appendChild(text);
    return svg;
}

// --- CLICK TO SPAWN LOGIC ---
document.querySelectorAll('.ion-menu-item').forEach(item => {
    item.addEventListener('click', function(event) {
        const charge = parseInt(this.dataset.charge);
        const symbol = this.dataset.symbol;
        const isCation = charge > 0;

        if (isCation) {
            if (activeCation !== null && activeCation !== symbol) {
                alert(`You are currently building with ${activeCation}. Double click ions to clear them or click 'Clear Board' to start over.`);
                return; 
            }
            activeCation = symbol;
        } else {
            if (activeAnion !== null && activeAnion !== symbol) {
                alert(`You are currently building with ${activeAnion}. Double click ions to clear them or click 'Clear Board' to start over.`);
                return; 
            }
            activeAnion = symbol;
        }

        const newIon = createIonShape(charge, symbol);
        newIon.setAttribute('data-base', this.dataset.base);
        newIon.setAttribute('data-poly', this.dataset.poly);
        newIon.setAttribute('data-symbol', symbol); 
        
        resetWinUI();

        const existingSameType = document.querySelectorAll(`.ion-piece[data-symbol="${symbol}"]`).length;
        const offset = (existingSameType * 20) % 120; 

        const leftSidebar = document.getElementById('left-sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const leftOffset = leftSidebar.classList.contains('collapsed') ? 0 : 150;
        const rightOffset = rightSidebar.classList.contains('collapsed') ? 0 : 150;

        let startX;
        if (isCation) {
            startX = leftOffset + 20 + offset;
        } else {
            const ionWidth = 140; 
            startX = window.innerWidth - rightOffset - ionWidth - 20 - offset;
        }
        
        const fieldHeight = document.getElementById('playing-field').offsetHeight;
        const ionHeight = Math.abs(charge) * 80; // 80px per charge unit
        const startY = (fieldHeight / 2) - (ionHeight / 2) + offset;
        
        newIon.style.transform = `translate(${startX}px, ${startY}px)`;
        newIon.setAttribute('data-x', startX);
        newIon.setAttribute('data-y', startY);
        newIon.setAttribute('data-group', `group_${groupIdCounter++}`);
        
        document.getElementById('playing-field').appendChild(newIon);
        makePieceDraggable(newIon);
    });
});

// --- MOVEMENT, BOUNDARIES, AND SNAPPING ---
function makePieceDraggable(element) {
    let pressTimer;

    element.addEventListener('pointerdown', (e) => {
        pressTimer = setTimeout(() => {
            element.setAttribute('data-group', `group_${groupIdCounter++}`);
            element.style.filter = "drop-shadow(0px 0px 10px yellow)"; 
            setTimeout(() => element.style.filter = "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))", 500);
            resetWinUI();
        }, 600); 
    });
    
    element.addEventListener('pointerup', () => clearTimeout(pressTimer));
    element.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    element.addEventListener('pointermove', () => clearTimeout(pressTimer));

    element.addEventListener('dblclick', function() {
        const charge = parseInt(this.getAttribute('data-charge'));
        const isCation = charge > 0;
        
        this.remove();
        
        if (isCation) {
            const hasCationsLeft = Array.from(document.querySelectorAll('.ion-piece')).some(el => parseInt(el.getAttribute('data-charge')) > 0);
            if (!hasCationsLeft) activeCation = null; 
        } else {
            const hasAnionsLeft = Array.from(document.querySelectorAll('.ion-piece')).some(el => parseInt(el.getAttribute('data-charge')) < 0);
            if (!hasAnionsLeft) activeAnion = null; 
        }
        
        resetWinUI();
        
        const remainingPieces = document.querySelectorAll('.ion-piece');
        if (remainingPieces.length > 0) {
            checkWinCondition(remainingPieces[0].getAttribute('data-group'));
        }
    });

    interact(element).draggable({
        listeners: {
            move(event) {
                const target = event.target;
                const groupId = target.getAttribute('data-group');
                const groupMembers = document.querySelectorAll(`[data-group="${groupId}"]`);
                
                let allowedDx = event.dx;
                let allowedDy = event.dy;

                const leftSidebar = document.getElementById('left-sidebar');
                const rightSidebar = document.getElementById('right-sidebar');
                const pfRect = document.getElementById('playing-field').getBoundingClientRect();
                
                const leftBoundary = leftSidebar.classList.contains('collapsed') ? pfRect.left : pfRect.left + 150;
                const rightBoundary = rightSidebar.classList.contains('collapsed') ? pfRect.right : pfRect.right - 150;
                const topBoundary = pfRect.top; 
                const bottomBoundary = pfRect.bottom;

                groupMembers.forEach(member => {
                    const rect = member.getBoundingClientRect();

                    if (rect.left + allowedDx < leftBoundary) allowedDx = leftBoundary - rect.left;
                    if (rect.right + allowedDx > rightBoundary) allowedDx = rightBoundary - rect.right;
                    if (rect.top + allowedDy < topBoundary) allowedDy = topBoundary - rect.top;
                    if (rect.bottom + allowedDy > bottomBoundary) allowedDy = bottomBoundary - rect.bottom;
                });

                groupMembers.forEach(member => {
                    const x = (parseFloat(member.getAttribute('data-x')) || 0) + allowedDx;
                    const y = (parseFloat(member.getAttribute('data-y')) || 0) + allowedDy;
                    member.style.transform = `translate(${x}px, ${y}px)`;
                    member.setAttribute('data-x', x);
                    member.setAttribute('data-y', y);
                });
            },
            end(event) {
                checkForSnaps(event.target);
            }
        }
    });
}

// --- PHYSICS ENGINE: SNAPPING ---
function checkForSnaps(movedElement) {
    const movedGroupId = movedElement.getAttribute('data-group');
    const allPieces = Array.from(document.querySelectorAll('.ion-piece'));
    const groupMembers = allPieces.filter(el => el.getAttribute('data-group') === movedGroupId);
    const otherPieces = allPieces.filter(el => el.getAttribute('data-group') !== movedGroupId);

    let snapped = false;
    let dx_snap = 0;
    let dy_snap = 0;
    let targetGroupId = null;

    for (let movingPiece of groupMembers) {
        if (snapped) break;
        const mCharge = parseInt(movingPiece.getAttribute('data-charge'));
        const mIsCat = mCharge > 0;
        const mx = parseFloat(movingPiece.getAttribute('data-x'));
        const my = parseFloat(movingPiece.getAttribute('data-y'));
        const mHeight = Math.abs(mCharge) * 80;

        for (let statPiece of otherPieces) {
            const sCharge = parseInt(statPiece.getAttribute('data-charge'));
            const sIsCat = sCharge > 0;
            const sx = parseFloat(statPiece.getAttribute('data-x'));
            const sy = parseFloat(statPiece.getAttribute('data-y'));
            const sHeight = Math.abs(sCharge) * 80;

            let validSnaps = [];

            if (mIsCat === sIsCat) {
                validSnaps.push({ x: sx, y: sy - mHeight }); 
                validSnaps.push({ x: sx, y: sy + sHeight }); 
            } else if (mIsCat && !sIsCat) {
                for(let k = -Math.abs(mCharge); k <= Math.abs(sCharge); k++) {
                    validSnaps.push({ x: sx - 100, y: sy + (k * 80) });
                }
            } else if (!mIsCat && sIsCat) {
                for(let k = -Math.abs(mCharge); k <= Math.abs(sCharge); k++) {
                    validSnaps.push({ x: sx + 100, y: sy + (k * 80) });
                }
            }

            for (let snapPt of validSnaps) {
                const dist = Math.sqrt(Math.pow(mx - snapPt.x, 2) + Math.pow(my - snapPt.y, 2));
                if (dist < 30) {
                    dx_snap = snapPt.x - mx;
                    dy_snap = snapPt.y - my;
                    targetGroupId = statPiece.getAttribute('data-group');
                    snapped = true;
                    break;
                }
            }
            if(snapped) break;
        }
    }

    if (snapped) {
        groupMembers.forEach(member => {
            const newX = parseFloat(member.getAttribute('data-x')) + dx_snap;
            const newY = parseFloat(member.getAttribute('data-y')) + dy_snap;
            member.style.transform = `translate(${newX}px, ${newY}px)`;
            member.setAttribute('data-x', newX);
            member.setAttribute('data-y', newY);
            member.setAttribute('data-group', targetGroupId); 
        });
        
        checkWinCondition(targetGroupId);
    }
}

// --- THE PERFECT RECTANGLE ALGORITHM & FORMULA GENERATOR ---
function checkWinCondition(groupId) {
    const groupPieces = Array.from(document.querySelectorAll(`[data-group="${groupId}"]`));
    const allPieces = document.querySelectorAll('.ion-piece');
    
    if (groupPieces.length !== allPieces.length || allPieces.length === 0) return;

    let cations = [];
    let anions = [];
    let netCharge = 0;

    groupPieces.forEach(p => {
        const c = parseInt(p.getAttribute('data-charge'));
        netCharge += c;
        if (c > 0) cations.push(p); else anions.push(p);
    });

    if (netCharge !== 0) return;
    if (cations.length === 0 || anions.length === 0) return;

    const catCount = cations.length;
    const anCount = anions.length;
    if (getGCD(catCount, anCount) > 1) {
        return; 
    }

    const getBounds = (pieces) => {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        let totalHeight = 0;
        pieces.forEach(p => {
            const x = parseFloat(p.getAttribute('data-x'));
            const y = parseFloat(p.getAttribute('data-y'));
            const h = Math.abs(parseInt(p.getAttribute('data-charge'))) * 80;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y + h > maxY) maxY = y + h;
            totalHeight += h;
        });
        return { minX, maxX, minY, maxY, totalHeight };
    };

    const cBounds = getBounds(cations);
    const aBounds = getBounds(anions);

    if (cBounds.minX !== cBounds.maxX) return; 
    if (aBounds.minX !== aBounds.maxX) return; 
    if (aBounds.minX !== cBounds.minX + 100) return;
    if (cBounds.maxY - cBounds.minY !== cBounds.totalHeight) return;
    if (aBounds.maxY - aBounds.minY !== aBounds.totalHeight) return;

    if (cBounds.minY === aBounds.minY && cBounds.maxY === aBounds.maxY) {
        
        const catBase = cations[0].getAttribute('data-base');
        const catPoly = cations[0].getAttribute('data-poly') === 'true';

        const anBase = anions[0].getAttribute('data-base');
        const anPoly = anions[0].getAttribute('data-poly') === 'true';

        let catStr = catBase;
        if (catCount > 1) {
            catStr = catPoly ? `(${catBase})${getSubscript(catCount)}` : `${catBase}${getSubscript(catCount)}`;
        }

        let anStr = anBase;
        if (anCount > 1) {
            anStr = anPoly ? `(${anBase})${getSubscript(anCount)}` : `${anBase}${getSubscript(anCount)}`;
        }

        document.getElementById('formula-display').textContent = catStr + anStr;

        const desc = document.getElementById('success-description');
        desc.style.visibility = 'visible';
        desc.style.opacity = '1';
        
        document.getElementById('formula-section').style.display = 'flex';
    }
}
