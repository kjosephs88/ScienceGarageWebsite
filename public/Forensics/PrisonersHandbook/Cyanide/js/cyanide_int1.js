var sprites;
var bench, doorShut, doorOpen, refrig, jarCont, tray0, tray2, tray3, tray1Cont, hoverCut, knife, sideTrays, cut1Cont, cut2Cont, cut3Cont, open1;
var jarProps2 = {x:107.5, y:158, scaleX:0.353, scaleY:0.353};
var jarProps3 = {x:212, y:220, scaleX:0.9067, scaleY:0.9067};
var jarProps4 = {x:-90, y:-44, scaleX:1.2, scaleY:1.2};
var tray0Props2 = {x:237, y:490};
var tray0Props3 = {x:290, y:262};
var benchProps1 = {x:62, y:363, scaleY:0.735};
var benchProps3 = {x:-274, y:294, scaleY:1.15};
var benchProps4 = {x:-276,y:60, scaleY:2.52};
var knifeProps3 = {x:200, y:502, scaleX:1, scaleY:1, rotation:0};
var knifeProps4 = {x:212.5, y:448.5, scaleX:1, scaleY:1, rotation:0};
var knifeProps5 = {x:211.5, y:448.5, scaleX:-1, scaleY:1, rotation:0};

createjs.Ticker.setFPS(30);
createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

function init() {
	boxText = document.getElementById("instruct");

	var fgCanv = document.getElementById('fgCanvas');
	fgCanv.onselectstart = function(){return false;};
	fgCanv.onmousedown = function(){return false;};

	fgStage = new createjs.Stage(fgCanv);
	fgStage.enableMouseOver(15);
	createjs.Touch.enable(fgStage, true);
	if (isMSIETouch) { fgStage.addEventListener("stagemousemove", msieTouchHack2); } else { fgStage.mouseMoveOutside = true; }

	var manifest = [{src:"img/cyan1_sprites.png", id:"cyan1_sprites"},{src:"img/bench.png", id:"bench"}];
	var preload = new createjs.LoadQueue(true);
	preload.addEventListener("fileload", handleFileLoad);
	preload.addEventListener("complete", handleComplete);
	preload.loadManifest(manifest);

	var wall = new createjs.Shape();
	wall.graphics.f("#748288").dr(0, 0, 778, 340);
	fgStage.addChild(wall);

	var floor = new createjs.Shape();
	floor.graphics.f("#a5b1b7").dr(0, 340, 778, 148);
	fgStage.addChild(floor);

	fgStage.update();
}

function handleComplete(event) {
	document.getElementById("loader").className = "";

	sprites = new createjs.SpriteSheet({
		images:[assets["cyan1_sprites"]],
		frames:[[2,839,35,37],[168,876,99,101],[172,1067,138,159],[319,270,153,232],[2,906,40,256],[317,504,138,205],[312,1067,136,155],[2,31,315,414],[323,2,150,266],[2,2,319,27],[290,752,166,152],[290,711,183,39],[2,1164,164,35],[39,839,164,35],[269,906,161,159],[44,1031,126,124],[44,876,122,153],[2,642,286,195],[2,447,313,193]],
		animations:{cut1:0,cut2:1,cut3:2,door_closed:3,door_open:4,fluid_high:5,fluid_low:6,fridge:7,jar:8,knife:9,knife2:10,label1:11,label2:12,label3:13,opening1:14,opening2:15,stomach:16,stomach2:17,tray:18}
	});

	refrig = new createjs.Sprite(sprites, "fridge");
	fgStage.addChild(refrig);
	refrig.cursor = "pointer";
	resetRefrig();

	doorShut = new createjs.Sprite(sprites, "door_closed");
	doorShut.x = 20;
	doorShut.y = 96;
	doorShut.mouseEnabled = false;
	fgStage.addChild(doorShut);

	doorOpen = new createjs.Sprite(sprites, "door_open");
	doorOpen.x = -1;
	doorOpen.y = 96;
	fgStage.addChild(doorOpen);

	bench = new createjs.Bitmap(assets["bench"]);
	bench.set(benchProps1);
	fgStage.addChild(bench);

	tray0 = new createjs.Sprite(sprites, "tray");
	tray0.scaleX = 0.83;
	tray0.scaleY = 1.015;
	tray0.skewX = -2.5;
	tray0.visible = false;
	fgStage.addChild(tray0);

	stomach = new createjs.Sprite(sprites, "stomach");
	stomach.x = 18;
	stomach.y = 82;

	fluid_high = new createjs.Sprite(sprites, "fluid_high");
	fluid_high.x = 8;
	fluid_high.y = 52;

	fluid_low = new createjs.Sprite(sprites, "fluid_low");
	fluid_low.x = 6;
	fluid_low.y = 102;
	fluid_low.visible = false;

	jar = new createjs.Sprite(sprites, "jar");

	jarCont = new createjs.Container();
	jarCont.addChild(fluid_high, fluid_low, stomach, jar);
	jarCont.regX = jar.getBounds().width/2;
	jarCont.regY = jar.getBounds().height/2;
	jarCont.cursor = "pointer";
	jarCont.mouseEnabled = jarCont.mouseChildren = false;
	fgStage.addChild(jarCont);

	stomDrag = new createjs.Sprite(sprites, "stomach");
	stomDrag.regX = stomDrag.getBounds().width/2;
	stomDrag.regY = stomDrag.getBounds().height/2;
	stomDrag.x = 212;
	stomDrag.y = 245;
	stomDrag.rotation = 45;
	stomDrag.visible = false;
	stomDrag.cursor = "pointer";
	fgStage.addChild(stomDrag);


	var tray1 = new createjs.Sprite(sprites, "tray");
	tray1.scaleX = -1.242;
	tray1.scaleY = 1.532;
	tray1.skewX = 9.7;
	tray1.x = 432;
	tray1.y = 132;

	var trayStom1 = new createjs.Sprite(sprites, "stomach2");
	trayStom1.x = 66;
	trayStom1.y = 157;

	hoverCut = new createjs.Sprite(sprites, "cut2");
	hoverCut.x = 142;
	hoverCut.y = 222;
	hoverCut.scaleX = hoverCut.scaleY = 1.62;
	hoverCut.rotation = -14;
	hoverCut.alpha = 0.2;
	hoverCut.visible = false;

	var label1 = new createjs.Sprite(sprites, "label1");
	label1.x = 121;
	label1.y = 342;

	tray1Cont = new createjs.Container();
	tray1Cont.addChild(tray1, trayStom1, hoverCut, label1);
	tray1Cont.visible = false;
	fgStage.addChild(tray1Cont);



	var tray2 = new createjs.Sprite(sprites, "tray");
	tray2.x = 717;
	tray2.y = 31;
	tray2.scaleX = -0.972;
	tray2.scaleY = 1.18;
	tray2.skewX = 3;

	var trayStom2 = new createjs.Sprite(sprites, "stomach2");
	trayStom2.x = 446;
	trayStom2.y = 50;
	trayStom2.scaleX = trayStom2.scaleY = 0.784;

	var open2 = new createjs.Sprite(sprites, "opening2");
	open2.x = 523;
	open2.y = 67;

	var label2 = new createjs.Sprite(sprites, "label2");
	label2.x = 489;
	label2.y = 194;

	var tray3 = new createjs.Sprite(sprites, "tray");
	tray3.x = 777;
	tray3.y = 226;
	tray3.scaleX = -1.0361;
	tray3.scaleY = 1.2617;
	tray3.skewX = 3;

	var trayStom3 = new createjs.Sprite(sprites, "stomach2");
	trayStom3.x = 487;
	trayStom3.y = 246;
	trayStom3.scaleX = trayStom3.scaleY = 0.84;

	var open3 = new createjs.Sprite(sprites, "opening1");
	open3.x = 570;
	open3.y = 265;
	open3.scaleX = open3.scaleY = 0.8323;

	var label3 = new createjs.Sprite(sprites, "label3");
	label3.x = 540;
	label3.y = 401;

	sideTrays = new createjs.Container();
	sideTrays.addChild(tray2, trayStom2, open2, label2, tray3, trayStom3, open3, label3);
	sideTrays.visible = false;
	fgStage.addChild(sideTrays);



	var cut1 = new createjs.Sprite(sprites, "cut1");
	cut1.x = 265;
	cut1.y = 179;

	var knife1 = new createjs.Sprite(sprites, "knife2");
	knife1.x = 128;
	knife1.y = 44;

	cut1Cont = new createjs.Container();
	cut1Cont.addChild(cut1, knife1);
	cut1Cont.visible = false;
	fgStage.addChild(cut1Cont);

	var cut2 = new createjs.Sprite(sprites, "cut2");
	cut2.x = 202;
	cut2.y = 179;

	var knife2 = new createjs.Sprite(sprites, "knife2");
	knife2.x = 15;
	knife2.y = 172;
	knife2.rotation = -22;

	cut2Cont = new createjs.Container();
	cut2Cont.addChild(cut2, knife2);
	cut2Cont.visible = false;
	fgStage.addChild(cut2Cont);

	var cut3 = new createjs.Sprite(sprites, "cut3");
	cut3.x = 163;
	cut3.y = 179;

	var knife3 = new createjs.Sprite(sprites, "knife2");
	knife3.x = -39;
	knife3.y = 307;
	knife3.rotation = -38;

	cut3Cont = new createjs.Container();
	cut3Cont.addChild(cut3, knife3);
	cut3Cont.visible = false;
	fgStage.addChild(cut3Cont);



	open1 = new createjs.Sprite(sprites, "opening1");
	open1.x = 163;
	open1.y = 179;
	open1.visible = false;
	fgStage.addChild(open1);

	knife = new createjs.Sprite(sprites, "knife");
	knife.regX = knife.getBounds().width/2;
	knife.regY = knife.getBounds().height/2;
	knife.visible = false;
	knife.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-10,-15,342,80));
	knife.cursor = "pointer";
	knife.mouseEnabled = false;
	fgStage.addChild(knife);

	gotoScreen(1);
	createjs.Ticker.addEventListener("tick", tick);
}

function dragJar(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	var offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
	var dist;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX+offset.x;
		o.y = evt.stageY+offset.y;
		dist = Math.sqrt(Math.pow(o.x-107.5, 2)+Math.pow(o.y-158, 2));
		if (dist > 300) { dist = 300; }
		o.scaleX = o.scaleY = 0.353+((dist/300)*0.647);
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 95 && o.y > 265) { goNextScreen(); } else { jarCont.set(jarProps2); }
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragKnife(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.x = evt.stageX-35;
	o.y = evt.stageY-60;
	o.scaleX = o.scaleY = 0.75;
	o.rotation = 60;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		hoverCut.visible = (evt.stageX > 25 && evt.stageY > 75 && evt.stageX < 415 && evt.stageY < 400);
		o.x = evt.stageX-35;
		o.y = evt.stageY-60;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (hoverCut.visible) { goNextScreen(); }
		else {
			knife.set(knifeProps4);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragStomach(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	var s = stomDrag;
	s.x = evt.stageX;
	s.y = evt.stageY;
	s.visible = fluid_low.visible = true;
	fluid_high.visible = stomach.visible = false;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		s.x = evt.stageX;
		s.y = evt.stageY;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > 320 && evt.stageY > 175 && evt.stageX < 500 && evt.stageY < 400) { goNextScreen(); } else { resetStomach(); }
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function goPrevScreen() {
	if (!fgMoving) {
		if (curScreen > 1) {
			prvScreen = curScreen;
			gotoScreen(--curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = "cyanide13.html";
		}
	}
	return false;
}

function goNextScreen() {
	if (!fgMoving) {
		if (curScreen < 5) {
			prvScreen = curScreen;
			gotoScreen(++curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = "cyanide14.html";
		}
	}
	return false;
}

function resetStomach() {
	stomDrag.x = 212;
	stomDrag.y = 245;
	stomDrag.visible = fluid_low.visible = false;
	updateFG = jarCont.visible = stomach.visible = fluid_high.visible = tray0.visible = true;
}

function resetRefrig() {
	refrig.x = 7;
	refrig.y = -3;
}

function screenReady() {
	fgMoving = false;
	updateFG = true;
	if (curScreen == 3) {
		addMouseDown(jarCont, dragStomach, true);
		boxText.innerHTML = "CAREFULLY TAKE THE STOMACH FROM THE JAR AND PLACE IT IN THE TRAY.";
	} else if (curScreen == 4) {
		knife.origScale = knife.scaleX;
		addRollOver(knife, true);
		addMouseDown(knife, dragKnife);
		boxText.innerHTML = "CUT OPEN THE STOMACH BY DRAGGING THE KNIFE OVER IT AND RELEASING.";
	}
}

function cutDone() {
	cut3Cont.visible = fgMoving = false;
	updateFG = knife.visible = open1.visible = true;
	boxText.innerHTML = "THE STOMACH IS NOT SWOLLEN, DISCOLORED, OR STREAKED WITH MUCUS.<br>OUR VICTIM DOES NOT APPEAR TO HAVE INGESTED CYANIDE!";
}

function gotoScreen(n) {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	switch (n) {
		case 1:
		doorOpen.visible = jarCont.visible = false;
		doorShut.visible = true;
		deactivate(jarCont);
		addMouseDown(refrig, goNextScreen, true);
		boxText.innerHTML = "INSTRUCTIONS: OPEN THE ICE BOX TO BEGIN THE STOMACH EXAMINATION.";
		break;
		//- - - - - - - - - - - - - - - -
		case 2:
		if (curScreen > prvScreen) {
			deactivate(refrig);
			doorShut.visible = false;
			jarCont.visible = true;
		} else {
			deactivate(jarCont);
			resetRefrig();
			refrig.visible = doorOpen.visible = true;
			bench.set(benchProps1);
		}
		jarCont.set(jarProps2);
		jarCont.origScale = jarCont.scaleX;
		addRollOver(jarCont, true);
		addMouseDown(jarCont, dragJar);
		tray0.set(tray0Props2);
		doorOpen.visible = true;
		boxText.innerHTML = "REMOVE THE JAR AND PLACE IT ON THE LAB TABLE.";
		break;
		//- - - - - - - - - - - - - - - -
		case 3:
		if (curScreen > prvScreen) {
			//clearText();
			deactivate(jarCont);
			doorOpen.visible = false;
			tray0.visible = true;
			Twn.get(tray0).to(tray0Props3, 850, easeOut).call(screenReady);
			Twn.get(bench).to(benchProps3, 800, easeOut);
			Twn.get(jarCont).to(jarProps3, 800, easeOut);
			Twn.get(refrig).to({x:-316,y:-73}, 800, easeOut).set(invis);
			fgMoving = true;
		} else {
			tray1Cont.visible = sideTrays.visible = knife.visible = false;
			deactivate(knife);
			resetStomach();
			bench.set(benchProps3);
			jarCont.visible = true;
			jarCont.set(jarProps3);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 4:
		if (curScreen > prvScreen) {
			//clearText();
			fluid_high.visible = stomach.visible = stomDrag.visible = tray0.visible = false;
			fluid_low.visible = tray1Cont.visible = knife.visible = sideTrays.visible = true;
			deactivate(jarCont);
			tray1Cont.scaleX = tray1Cont.scaleY = 0.6675;
			tray1Cont.skewX = 17.4;
			tray1Cont.x = 348;
			tray1Cont.y = 178;
			Twn.get(tray1Cont).to({x:0,y:0,scaleX:1,scaleY:1,skewX:0}, 1050, easeOut).call(screenReady);
			Twn.get(bench).to(benchProps4, 1000, easeOut);
			Twn.get(jarCont).to(jarProps4, 1000, easeOut).set(invis);
			knife.set(knifeProps3);
			Twn.get(knife).to(knifeProps4, 1000, easeOut);
			sideTrays.x = 370;
			sideTrays.y = 235;
			Twn.get(sideTrays).to({x:0,y:0}, 1000, easeOut);
			fgMoving = true;
		} else {
			open1.visible = false;
			knife.set(knifeProps4);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 5:
		//clearText();
		hoverCut.visible = knife.visible = false;
		knife.set(knifeProps5);
		deactivate(knife);
		cut1Cont.alpha = 1;
		cut2Cont.alpha = cut3Cont.alpha = 0;
		cut1Cont.visible = cut2Cont.visible = cut3Cont.visible = true;
		Twn.get(cut1Cont).wait(300).to({alpha:0}, 100).set(invis);
		Twn.get(cut2Cont).wait(300).to({alpha:1}, 100).wait(300).to({alpha:0}, 100).set(invis);
		Twn.get(cut3Cont).wait(600).to({alpha:1}, 100).wait(300).call(cutDone);
		fgMoving = true;
	}
	updateFG = true;
}

function overObject(evt) {
	var o = evt.currentTarget;
	o.scaleX = o.scaleY = (o.origScale*1.05);
	updateFG = true;
}

function outObject(evt) {
	var o = evt.currentTarget;
	o.scaleX = o.scaleY = o.origScale;
	updateFG = true;
}
