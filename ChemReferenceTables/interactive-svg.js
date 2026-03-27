let currentZoom = 1;
let translateX = 0;
let translateY = 0;
let panning = false;
let startX = 0;
let startY = 0;

// Zoom Session Trackers (locks the pan to the scale)
let isZooming = false;
let zoomTimer = null;
let targetSvgX = 0;
let targetSvgY = 0;
let initialScreenX = 0;
let initialScreenY = 0;
let startZoom = 1;

// Animation Tracker (for the double-click reset)
let animationFrameId = null;

const zoomableSvg = document.querySelector('.zoomable-svg');
const container = document.querySelector('.svg-container');

// --- "SOFT WALLS" CLAMP ---
// This allows the image to slide into the black space immediately during a zoom,
// but physically prevents you from panning the SVG entirely off the screen.
function clampTranslation() {
    const baseW = zoomableSvg.clientWidth || container.clientWidth;
    const baseH = zoomableSvg.clientHeight || container.clientHeight;

    const scaledW = baseW * currentZoom;
    const scaledH = baseH * currentZoom;

    // Limit is set to half the scaled size to prevent losing the image
    const limitX = scaledW / 2;
    const limitY = scaledH / 2;

    translateX = Math.max(-limitX, Math.min(limitX, translateX));
    translateY = Math.max(-limitY, Math.min(limitY, translateY));
}

function updateTransform() {
    clampTranslation(); // Always check boundaries before applying the move
    zoomableSvg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

// ==========================================
// 1. MAIN ZOOM AND PAN LOGIC (TRACKPAD/WHEEL)
// ==========================================
container.addEventListener('wheel', (event) => {
    event.preventDefault();
    
    // Instantly cancel any running reset animation if you touch the trackpad
    cancelAnimationFrame(animationFrameId);

    if (event.ctrlKey) {
        
        // ---------------------------------------------------------
        // --- YOUR TWEAKABLE ZOOM CONTROLS ---
        // ---------------------------------------------------------
        
        // 1. ZOOM SPEED: How fast the image scales up/down.
        // Default: 0.04. (0.02 is slower, 0.08 is very fast)
        const zoomSpeed = 0.04; 
        
        // 2. SLIDE CONTROL: How much zoom is required to finish the journey to the center.
        // Lower number (e.g., 0.5) = Image slides to center very quickly.
        // Higher number (e.g., 5.0) = Zoom dominates; image scales up a lot before centering.
        const zoomAmountToCenter = 5.0; 
        
        // ---------------------------------------------------------

        const zoomAmount = event.deltaY * -zoomSpeed;
        const newZoom = Math.min(Math.max(1, currentZoom + zoomAmount), 10);

        const rect = container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - (rect.width / 2);
        const mouseY = event.clientY - rect.top - (rect.height / 2);

        // Lock onto the exact position the moment you touch the trackpad
        if (!isZooming) {
            isZooming = true;
            startZoom = currentZoom;
            
            // Where on the graphic are you pointing?
            targetSvgX = (mouseX - translateX) / currentZoom;
            targetSvgY = (mouseY - translateY) / currentZoom;

            // Where is that exact point on the screen right now?
            initialScreenX = targetSvgX * currentZoom + translateX;
            initialScreenY = targetSvgY * currentZoom + translateY;
        }

        // Debounce timer: If 200ms pass without trackpad movement, end the session
        clearTimeout(zoomTimer);
        zoomTimer = setTimeout(() => { isZooming = false; }, 200);

        // Calculate exactly how far we've zoomed since the session started
        const zoomJourney = newZoom - startZoom; 
        
        // Create a rigid 0.0 to 1.0 progress slider based on your zoomAmountToCenter
        const progress = Math.max(0, Math.min(zoomJourney / zoomAmountToCenter, 1.0));

        // Map the screen position linearly
        const currentDesiredScreenX = initialScreenX * (1 - progress);
        const currentDesiredScreenY = initialScreenY * (1 - progress);

        // Force the math to put our locked point at that exact spot
        translateX = currentDesiredScreenX - (targetSvgX * newZoom);
        translateY = currentDesiredScreenY - (targetSvgY * newZoom);

        currentZoom = newZoom;

        // Snap home perfectly if fully zoomed out
        if (currentZoom === 1) {
            translateX = 0;
            translateY = 0;
        }
    } else {
        // TWO-FINGER SWIPE TO PAN
        if (currentZoom > 1) {
            translateX -= event.deltaX;
            translateY -= event.deltaY;
        }
    }
    
    updateTransform();
}, { passive: false });


// ==========================================
// 2. DOUBLE-CLICK SMOOTH MORPH ANIMATION
// ==========================================
container.addEventListener('dblclick', (event) => {
    // Cancel any currently running animation so they don't overlap
    cancelAnimationFrame(animationFrameId);

    // ---------------------------------------------------------
    // --- YOUR MORPH CONTROLS ---
    // ---------------------------------------------------------
    const resetDuration = 1000; // Speed of the animation in milliseconds
    
    // How much should it zoom in when you double-click an element?
    // Adjust this so a single element's square fits perfectly on your screen.
    const morphZoomLevel = 8.0; 
    // ---------------------------------------------------------

    const startZoomLevel = currentZoom;
    const startTransX = translateX;
    const startTransY = translateY;
    const startTime = performance.now();

    let targetZoom;
    let targetTransX;
    let targetTransY;

    // TOGGLE LOGIC: 
    // If we are already zoomed in, double-click flies back out to 100%.
    if (currentZoom > 1.05) { // 1.05 accounts for tiny trackpad rounding errors
        targetZoom = 1;
        targetTransX = 0;
        targetTransY = 0;
    } 
    // If we are at 100%, double-click flies in to the mouse location.
    else {
        targetZoom = morphZoomLevel;

        // Figure out exactly where the mouse is pointing relative to the center
        const rect = container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - (rect.width / 2);
        const mouseY = event.clientY - rect.top - (rect.height / 2);

        // Calculate the exact translation needed to put that point dead center
        targetTransX = -mouseX * targetZoom;
        targetTransY = -mouseY * targetZoom;
    }

   function animateReset(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = elapsed / resetDuration;

        if (progress > 1.0) progress = 1.0;

        let easeCurve;
        
        // CHECK DIRECTION: Are we zooming IN or zooming OUT?
        if (targetZoom > startZoomLevel) {
            // WE ARE ZOOMING IN: Use the buttery "Ease-In-Out" curve
            easeCurve = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        } else {
            // WE ARE ZOOMING OUT: Use your original snappy "Ease-Out" curve
            easeCurve = 1 - Math.pow(1 - progress, 3);
        }

        // Interpolate smoothly between the start position and the target position
        currentZoom = startZoomLevel + ((targetZoom - startZoomLevel) * easeCurve);
        translateX = startTransX + ((targetTransX - startTransX) * easeCurve);
        translateY = startTransY + ((targetTransY - startTransY) * easeCurve);

        updateTransform();

        // If we haven't reached 100% yet, request the next frame
        if (progress < 1.0) {
            animationFrameId = requestAnimationFrame(animateReset);
        } else {
            // Guarantee it sits exactly on the target coordinates when finished
            currentZoom = targetZoom;
            translateX = targetTransX;
            translateY = targetTransY;
            updateTransform();
        }
    }
    // Kick off the animation
    animationFrameId = requestAnimationFrame(animateReset);
});



// ==========================================
// 3. CLICK-AND-DRAG PANNING (MOUSE/TOUCH)
// ==========================================
container.addEventListener('mousedown', (event) => {
    cancelAnimationFrame(animationFrameId); // Cancel animation if clicked

    if (event.button === 0 && currentZoom > 1) {
        panning = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        zoomableSvg.style.cursor = 'grabbing';
    }
});

window.addEventListener('mousemove', (event) => {
    if (panning) {
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        updateTransform();
    }
});

window.addEventListener('mouseup', () => {
    panning = false;
    zoomableSvg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
});

container.addEventListener('mouseleave', () => {
    panning = false;
    zoomableSvg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
});