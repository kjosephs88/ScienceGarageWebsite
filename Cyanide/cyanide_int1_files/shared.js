var doubleTouchStartTimestamp = 0;
document.addEventListener("touchstart", function(evt) {
	var now = +(new Date());
	if (doubleTouchStartTimestamp+500 > now && evt.touches.length < 2) { evt.preventDefault(); }
	doubleTouchStartTimestamp = now;
});

//ugly workaround for surface tablet bug when using jquery lightbox, iframe, etc.
var isMSIETouch = window.navigator.msPointerEnabled;
function nearStageEdge(evt) { return (evt.stageX < 12 || evt.stageX > 766 || evt.stageY < 12 || evt.stageY > 485); }
function msieTouchHack() {
	fgStage.dispatchEvent("pressup");
	if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
	createjs.Touch.enable(fgStage, true);
}
function msieTouchHack2(evt) {
	if (nearStageEdge(evt) && !dragging) {
		if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
		document.location.reload();
	}
}
//end ugly

var assets = {};
var fgStage;
var updateFG = true;
var fgMoving = false;
var dragging = false; //for msie touch hack
var vis = {visible:true};
var invis = {visible:false};
var boxText;
var curScreen = 1, prvScreen = 1;

function handleFileLoad(event) { assets[event.item.id] = event.item.src; }

function tick(evt) {
	if (updateFG) {
		updateFG = false;
		fgStage.update(evt);
	} else if (fgMoving) { fgStage.update(evt); }
}

function addMouseDown(obj, func, enab) {
	obj.addEventListener("mousedown", func);
	if (enab) { obj.mouseEnabled = true; }
}

function addRollOver(obj, pulse) {
	if (pulse) {
		var origSclX = obj.scaleX;
		var origSclY = obj.scaleY;
		obj.scaleX = origSclX*0.92;
		obj.scaleY = origSclY*0.92;
		createjs.Tween.get(obj).to({scaleX:origSclX, scaleY:origSclY}, 600, createjs.Ease.getBackOut(4.5)).call(addRollOver2);
		fgMoving = true;
	} else {
		obj.addEventListener("rollover", overObject);
		obj.addEventListener("rollout", outObject);
		obj.mouseEnabled = true;
	}
}

function addRollOver2() {
	fgMoving = false;
	updateFG = true;
	this.addEventListener("rollover", overObject);
	this.addEventListener("rollout", outObject);
	this.mouseEnabled = true;
}

function deactivate(obj) {
	obj.removeAllEventListeners();
	obj.mouseEnabled = false;
}

function rmvRollover(obj) {
	obj.removeEventListener("rollover", overObject);
	obj.removeEventListener("rollout", outObject);
}

function removeDragListeners(obj) {
	if (isMSIETouch) { dragging = false; }
	obj.removeAllEventListeners("pressmove");
	obj.removeAllEventListeners("pressup");
}

function clearText() { boxText.innerHTML = ""; }
