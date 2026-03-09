var sprites, spritesLarge;
var tray, burnCont, flaskCont, knife, knifeCont, botContA, dropTopA, dropBotA, dropDragCont, dripA1, dripA2, dripA3, splash, cork1, cork2, botContZ, zincPour, zincPile, flame1, flame2, tubeFill1, tubeFill2, tubeFill3, rod, rodStir, stopper, stopper2, labelA, gas1, gas2, gas3, gas4a, gas4b, gas4c, tissue1, tissue2, tissue3, stopper3;
var timID, knifeOver, knifeDropped;
var knifeProps1 = {x:304, y:434};
var burnProps1 = {x:441, y:15};
var burnProps2 = {x:81, y:82};
var burnProps3 = {x:343, y:82};
var tissProps1 = {x:103, y:195, scaleX:1, scaleY:1};
var tissProps2 = {x:542, y:148, scaleX:0.182, scaleY:1.069, alpha:0};
var zincProps1 = {x:827, y:205};
var zincProps2 = {x:420, y:296, rotation:0};
var zincProps3 = {x:309, y:71, rotation:265};
var zincProps4 = {x:607, y:296, rotation:0};
var zincProps5 = {x:249, y:49, rotation:265};
var acidProps1 = {x:826, y:399};
var acidProps2 = {x:571, y:329};
var acidProps3 = {x:713, y:329};

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

	var manifest = [{src:"img/ars1_sprites_sm.png", id:"sprites_small"},{src:"img/ars1_sprites_lg.png", id:"sprites_large"},{src:"img/bench5.png", id:"bench"}];
	var preload = new createjs.LoadQueue(true);
	preload.addEventListener("fileload", handleFileLoad);
	preload.addEventListener("complete", handleComplete);
	preload.loadManifest(manifest);

	var wall = new createjs.Shape();
	wall.graphics.f("#748288").dr(0, 0, 778, 215);
	fgStage.addChild(wall);

	createjs.MotionGuidePlugin.install();

	fgStage.update();
}

function handleComplete(event) {
	document.getElementById("loader").className = "";

	sprites = new createjs.SpriteSheet({images:[assets["sprites_small"]], frames:[[277,295,84,136],[2,600,95,208],[322,594,48,67],[377,677,48,66],[449,466,8,38],[364,295,37,182],[256,851,183,61],[2,811,74,156],[143,970,10,34],[404,408,24,39],[359,480,56,92],[357,2,92,220],[176,2,178,290],[2,2,171,306],[2,459,249,138],[418,466,28,149],[100,780,320,30],[340,915,81,84],[256,915,81,84],[292,693,82,84],[79,813,361,35],[443,225,14,238],[98,970,42,39],[357,225,79,67],[373,618,79,56],[50,970,45,43],[2,970,45,43],[100,694,189,83],[79,851,174,85],[100,600,184,91],[287,594,32,96],[254,459,32,129],[289,434,32,157],[324,434,32,149],[404,295,36,110],[2,311,272,145],[169,939,82,59],[79,939,87,28],[424,915,23,71]], animations:{acid:0,bottle:1,cork1:2,cork2:3,drip:4,dropperB:5,dropperB2:6,dropperT:7,flame1:8,flame2:9,gas1:10,gas2:11,gas3:12,gas4a:13,gas4b:14,gas4c:15,knife:16,labelHyrdo:17,labelSulf:18,labelZinc:19,rod:20,rodStir:21,splash:22,stopper:23,stopper2:24,stopper3a:25,stopper3b:26,tissue1:27,tissue2:28,tissue3:29,tubeFill1:30,tubeFill2:31,tubeFill3:32,tubeFill4:33,tubeFill5b:34,tubing:35,zinc:36,zincPile:37,zincPour:38}});

	spritesLarge = new createjs.SpriteSheet({images:[assets["sprites_large"]], frames:[[2, 295, 341, 439],[2, 736, 231, 366],[2, 2, 359, 291]], animations:{burner:0,flask:1,tray:2}});

	var bench = new createjs.Bitmap(assets["bench"]);
	bench.y = 65;
	fgStage.addChild(bench);

	tray = new createjs.Sprite(spritesLarge, "tray");
	tray.y = 97;
	fgStage.addChild(tray);


	var bottleA = new createjs.Sprite(sprites, "bottle");

	var acid = new createjs.Sprite(sprites, "acid");
	acid.x = 6;
	acid.y = 64;

	dropBotA = new createjs.Sprite(sprites, "dropperB");
	dropBotA.x = 29;
	dropBotA.y = 15;

	dropTopA = new createjs.Sprite(sprites, "dropperT");
	dropTopA.x = 10;
	dropTopA.y = -138;

	labelA = new createjs.Sprite(sprites, "labelSulf");
	labelA.x = 12;
	labelA.y = 78;

	botContA = new createjs.Container();
	botContA.addChild(dropBotA, bottleA, acid, dropTopA, labelA);
	botContA.regX = bottleA.getBounds().width/2;
	botContA.regY = bottleA.getBounds().height/2;
	botContA.cursor = "pointer";
	botContA.mouseEnabled = false;
	fgStage.addChild(botContA);


	dripA1 = new createjs.Sprite(sprites, "drip");
	dripA1.visible = false;
	fgStage.addChild(dripA1);

	dripA2 = new createjs.Sprite(sprites, "drip");
	dripA2.visible = false;
	fgStage.addChild(dripA2);

	dripA3 = new createjs.Sprite(sprites, "drip");
	dripA3.visible = false;
	fgStage.addChild(dripA3);


	tissue1 = new createjs.Sprite(sprites, "tissue1");
	tissue1.x = 102;
	tissue1.y = 198;
	fgStage.addChild(tissue1);

	tissue2 = new createjs.Sprite(sprites, "tissue2");
	tissue2.x = 107;
	tissue2.y = 200;
	tissue2.visible = false;
	fgStage.addChild(tissue2);

	tissue3 = new createjs.Sprite(sprites, "tissue3");
	tissue3.visible = false;
	fgStage.addChild(tissue3);


	rod = new createjs.Sprite(sprites, "rod");
	rod.x = 336;
	fgStage.addChild(rod);


	gas4b = new createjs.Sprite(sprites, "gas4b");
	gas4b.x = 213;
	gas4b.y = 40;
	gas4b.visible = false;
	fgStage.addChild(gas4b);

	gas4c = new createjs.Sprite(sprites, "gas4c");
	gas4c.x = 447;
	gas4c.y = 148;
	gas4c.visible = false;
	fgStage.addChild(gas4c);


	var burner = new createjs.Sprite(spritesLarge, "burner");

	tubeFill1 = new createjs.Sprite(sprites, "tubeFill1");
	tubeFill1.x = 102;
	tubeFill1.y = 134;

	tubeFill2 = new createjs.Sprite(sprites, "tubeFill2");
	tubeFill2.x = 102;
	tubeFill2.y = 102;
	tubeFill2.visible = false;

	tubeFill3 = new createjs.Sprite(sprites, "tubeFill3");
	tubeFill3.x = 102;
	tubeFill3.y = 74;
	tubeFill3.visible = false;

	tubeFill4 = new createjs.Sprite(sprites, "tubeFill4");
	tubeFill4.x = 102;
	tubeFill4.y = 82;
	tubeFill4.visible = false;

	tubeFill5 = new createjs.Sprite(sprites, "tubeFill5b");
	tubeFill5.x = 100;
	tubeFill5.y = 121;
	tubeFill5.visible = false;

	burnCont = new createjs.Container();
	burnCont.addChild(tubeFill1, tubeFill2, tubeFill3, tubeFill4, tubeFill5, burner);
	burnCont.set(burnProps1);
	fgStage.addChild(burnCont);

	//workaround for motion guide plugin
	knife = new createjs.Sprite(sprites, "knife");
	knifeCont = new createjs.Container();
	knifeCont.addChild(knife);
	knifeCont.regX = knife.regX = knife.x = knife.getBounds().width/2;
	knifeCont.regY = knife.regY = knife.y = knife.getBounds().height/2;
	knifeCont.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-10,-15,344,89));
	knifeCont.cursor = "pointer";
	knifeCont.mouseEnabled = knifeCont.mouseChildren = false;
	fgStage.addChild(knifeCont);

	rodStir = new createjs.Sprite(sprites, "rodStir");
	rodStir.y = -3;
	rodStir.visible = false;
	fgStage.addChild(rodStir);


	cork2 = new createjs.Sprite(sprites, "cork2");
	cork2.visible = false;
	fgStage.addChild(cork2);

	stopper = new createjs.Sprite(sprites, "stopper");
	stopper.y = 194;
	stopper.visible = false;
	fgStage.addChild(stopper);


	var flask = new createjs.Sprite(spritesLarge, "flask");

	stopper3 = new createjs.Sprite(sprites, "stopper3a");
	stopper3.x = 402;
	stopper3.y = 10;

	var tubing = new createjs.Sprite(sprites, "tubing");
	tubing.x = 175;
	tubing.y = -62;

	flaskCont = new createjs.Container();
	flaskCont.addChild(flask, stopper3, tubing);
	flaskCont.x = 36;
	flaskCont.visible = false;
	fgStage.addChild(flaskCont);


	stopper2 = new createjs.Sprite(sprites, "stopper2");
	stopper2.x = 110;
	stopper2.y = 72;
	stopper2.visible = false;
	fgStage.addChild(stopper2);

	zincPile = new createjs.Sprite(sprites, "zincPile");
	zincPile.x = 107;
	zincPile.y = 403;
	zincPile.visible = false;
	fgStage.addChild(zincPile);


	splash = new createjs.Sprite(sprites, "splash");
	splash.visible = false;
	fgStage.addChild(splash);


	gas1 = new createjs.Sprite(sprites, "gas1");
	gas1.x = 130;
	gas1.y = 319;
	gas1.visible = false;
	fgStage.addChild(gas1);

	gas2 = new createjs.Sprite(sprites, "gas2");
	gas2.x = 107;
	gas2.y = 195;
	gas2.visible = false;
	fgStage.addChild(gas2);

	gas3 = new createjs.Sprite(sprites, "gas3");
	gas3.x = 65;
	gas3.y = 155;
	gas3.visible = false;
	fgStage.addChild(gas3);

	gas4a = new createjs.Sprite(sprites, "gas4a");
	gas4a.x = 66;
	gas4a.y = 142;
	gas4a.visible = false;
	fgStage.addChild(gas4a);


	var bottleZ = new createjs.Sprite(sprites, "bottle");

	var zinc = new createjs.Sprite(sprites, "zinc");
	zinc.x = 7;
	zinc.y = 143;
	zinc.alpha = 0.9;

	var labelZ = new createjs.Sprite(sprites, "labelZinc");
	labelZ.x = 12;
	labelZ.y = 77;

	cork1 = new createjs.Sprite(sprites, "cork1");
	cork1.x = 24;
	cork1.y = -29;

	botContZ = new createjs.Container();
	botContZ.addChild(bottleZ, zinc, labelZ, cork1);
	botContZ.regX = bottleZ.getBounds().width/2;
	botContZ.regY = bottleZ.getBounds().height/2;
	botContZ.cursor = "pointer";
	botContZ.mouseEnabled = false;
	fgStage.addChild(botContZ);


	zincPour = new createjs.Sprite(sprites, "zincPour");
	zincPour.visible = false;
	fgStage.addChild(zincPour);

	flame1 = new createjs.Sprite(sprites, "flame1");
	flame1.x = 191;
	flame1.y = 358;
	flame1.regY = flame1.getBounds().height;
	flame1.visible = false;
	fgStage.addChild(flame1);

	flame2 = new createjs.Sprite(sprites, "flame2");
	flame2.x = 184;
	flame2.y = 319;
	flame2.visible = false;
	fgStage.addChild(flame2);


	var dropBotDrag = new createjs.Sprite(sprites, "dropperB2");

	var dropTopDrag = new createjs.Sprite(sprites, "dropperT");
	dropTopDrag.rotation = -282;
	dropTopDrag.x = 320;
	dropTopDrag.y = -50.5;

	dropDragCont = new createjs.Container();
	dropDragCont.addChild(dropBotDrag, dropTopDrag);
	dropDragCont.visible = false;
	dropDragCont.cursor = "pointer";
	fgStage.addChild(dropDragCont);


	gotoScreen(1);
	createjs.Ticker.addEventListener("tick", tick);
}

function dragKnife(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.x = evt.stageX+93;
	o.y = evt.stageY-40;
	o.scaleX = o.scaleY = 1;
	knife.rotation = -24;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		if (!knifeDropped) {
			o.x = evt.stageX+93;
			o.y = evt.stageY-40;
			if (o.x > 193 && o.y > 110 && o.x < 465 && o.y < 223) {
				if (!knifeOver) {
					knifeOver = true;
					timID = setTimeout(dropKnife, 2000);
				}
			} else {
				if (knifeOver) {
					knifeOver = false;
					clearTimeout(timID);
				}
			}
			updateFG = true;
		}
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (!knifeDropped) {
			if (o.x > 150 && o.y > 10 && o.x < 500 && o.y < 275) { dropKnife(); }
			else {
				o.set(knifeProps1);
				knife.rotation = 0;
				addRollOver(o);
			}
			updateFG = true;
		}
		removeDragListeners(fgStage);
	});
}

function dropKnife() {
	if (knifeOver) { clearTimeout(timID); }
	knifeDropped = true;
	goNextScreen();
}

function dragDrops(evt) {
	if (isMSIETouch) { dragging = true; }
	dropBotA.visible = dropTopA.visible = false;
	dropDragCont.set({x:evt.stageX-159, y:evt.stageY-24, mouseEnabled:true, visible:true});
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = 1;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		dropDragCont.x = evt.stageX-159;
		dropDragCont.y = evt.stageY-24;
		updateFG = true;
	});

	var loX, hiX, hiY;
	if (curScreen == 2) {
		loX = 180;
		hiX = 420;
		hiY = 330;
	} else {
		loX = 170;
		hiX = 425;
		hiY = 420;
	}
	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > loX && evt.stageX < hiX && evt.stageY < hiY) { goNextScreen(); }
		else {
			dropDragCont.visible = false;
			dropBotA.visible = dropTopA.visible = true;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragZinc(evt) {
	if (isMSIETouch) { dragging = true; }
	cork1.visible = false;
	cork2.visible = true;
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = 1;
	o.x = evt.stageX-43;
	o.y = evt.stageY-25;
	o.rotation = 295;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX-43;
		o.y = evt.stageY-25;
		updateFG = true;
	});

	var loX, loY, hiX, hiY, origProps;
	if (curScreen == 3) {
		loX = 120;
		loY = 54;
		hiX = 320;
		hiY = 340;
		origProps = zincProps2;
	} else {
		loX = 110;
		loY = 40;
		hiX = 365;
		hiY = 435;
		origProps = zincProps4;
	}
	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > loX && o.y > loY && o.x < hiX && o.y < hiY) { goNextScreen(); }
		else {
			o.set(origProps);
			cork1.visible = true;
			cork2.visible = false;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function minceDone() {
	var Twn = createjs.Tween;
	knifeCont.set(knifeProps1);
	knife.rotation = 0;
	tubeFill1.visible = true;
	tubeFill1.alpha = 0;
	Twn.get(tissue3).to(tissProps2, 1000).set(invis);
	Twn.get(tubeFill1).wait(250).to({alpha:1}, 750).wait(250).call(bottlesEnter);
}

function bottlesEnter() {
	clearText();
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	botContA.visible = botContZ.visible = rod.visible = true;
	botContA.set(acidProps1);
	botContZ.set(zincProps1);
	rod.y = 489;
	Twn.get(burnCont).to({guide:{path:[441,15,387,100,81,82]}}, 1525, easeOut).call(screenReady);
	Twn.get(tray).to({x:-360}, 1500, easeOut).set(invis);
	Twn.get(knifeCont).to({y:505}, 1000, easeOut).set(invis);
	Twn.get(botContZ).to(zincProps2, 1500, easeOut);
	Twn.get(botContA).wait(250).to(acidProps2, 1250, easeOut);
	Twn.get(rod).wait(1000).to({y:439}, 500, easeOut);
}

function zincPourDone() {
	cork1.visible = true;
	cork2.visible = false;
	if (curScreen == 4) {
		botContZ.set(zincProps2);
		rod.visible = false;
		rodStir.visible = true;
		rodStir.x = 182;
		createjs.Tween.get(rodStir).to({x:201}, 150).to({x:182}, 150).to({x:201}, 150).to({x:182}, 150).call(startBubbles).to({x:201}, 150).to({x:182}, 150).to({x:201}, 150).to({x:182}, 150).to({x:201}, 150).to({x:182}, 150).call(function(){rod.visible=true;rodStir.visible=false;});
	} else {
		botContZ.set(zincProps4);
		screenReady();
	}
}

function startBubbles() {
	var Twn = createjs.Tween;
	tubeFill2.visible = tubeFill3.visible = true;
	tubeFill2.alpha = tubeFill3.alpha = 0;
	Twn.get(tubeFill1).to({alpha:0}, 500).set(invis);
	Twn.get(tubeFill2).to({alpha:1}, 500).wait(500).to({alpha:0}, 500).wait(500).to({alpha:1}, 400).call(heatTube);
	Twn.get(tubeFill3).wait(1000).to({alpha:1}, 500).wait(500).to({alpha:0}, 400).set(invis);
}

function heatTube() {
	flame1.visible = true;
	flame1.scaleY = 0;
	createjs.Tween.get(flame1).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 200).set(invis).set(vis, flame2).wait(2000).set(vis).set(invis, flame2).to({scaleY:0}, 250).set(invis).wait(250).call(heatDone);
}

function heatDone() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	clearText();
	flaskCont.visible = stopper.visible = true;
	flaskCont.y = -131;
	stopper3.gotoAndStop("stopper3a");
	stopper.x = -79;
	flaskCont.alpha = 0;
	Twn.get(flaskCont).wait(325).to({y:99, alpha:1}, 1200, easeOut).call(screenReady);
	Twn.get(stopper).to({x:14}, 1500, easeOut).call(function(){stopper3.gotoAndStop("stopper3b");});
	Twn.get(burnCont).to(burnProps3, 1500, easeOut);
	Twn.get(botContZ).to(zincProps4, 1500, easeOut);
	Twn.get(botContA).to(acidProps3, 1500, easeOut);
	Twn.get(rod).to({y:489}, 750).set(invis).call(function(){labelA.gotoAndStop("labelHyrdo");});
}

function dripAcidDone() {
	splash.visible = dropDragCont.visible = false;
	dropTopA.visible = dropBotA.visible = true;
	if (curScreen == 3) { screenReady(); }
	else {
		stopper.visible = false;
		stopper2.visible = true;
		beginGas();
	}
}

function beginGas() {
	var Twn = createjs.Tween;
	gas1.visible = gas2.visible = gas3.visible = gas4a.visible = gas4b.visible = gas4c.visible = true;
	gas1.alpha = gas2.alpha = gas3.alpha = gas4a.alpha = gas4b.alpha = gas4c.alpha = 0;
	Twn.get(gas1).to({alpha:1}, 500).to({alpha:0}, 500).set(invis);
	Twn.get(gas2).wait(500).to({alpha:1}, 500).to({alpha:0}, 500).set(invis);
	Twn.get(gas3).wait(1000).to({alpha:1}, 500).to({alpha:0}, 500).set(invis);
	Twn.get(gas4a).wait(1500).to({alpha:1}, 500);
	Twn.get(gas4b).wait(1500).to({alpha:1}, 500);
	Twn.get(gas4c).wait(1500).to({alpha:1}, 525);
	Twn.get(tubeFill2).wait(1750).to({alpha:0}, 1000).set(invis);
	if (window.location.href.indexOf("int1a") != -1) {
		tubeFill4.alpha = 0;
		tubeFill4.visible = true;
		Twn.get(tubeFill4).wait(1750).to({alpha:1}, 1025).call(screenReady);
	} else {
		tubeFill5.alpha = 0;
		tubeFill5.visible = true;
		Twn.get(tubeFill5).wait(1750).to({alpha:1}, 1025).call(screenReady);
	}
}

function goPrevScreen() {
	if (!fgMoving) {
		if (curScreen > 1) {
			prvScreen = curScreen;
			gotoScreen(--curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = (window.location.href.indexOf("int1a") != -1) ? "arsenic04.html" : "arsenic12.html";
		}
	}
	return false;
}

function goNextScreen() {
	if (!fgMoving) {
		if (curScreen < 6) {
			prvScreen = curScreen;
			gotoScreen(++curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = (window.location.href.indexOf("int1a") != -1) ? "arsenic_int2a.html" : "arsenic_int2b.html";;
		}
	}
	return false;
}

function screenReady() {
	fgMoving = false;
	updateFG = true;
	if (curScreen == 2) {
		boxText.innerHTML = "PUT DROPS OF SULFURIC ACID IN THE TEST TUBE.";
		addRollOver(botContA, true);
		addMouseDown(botContA, dragDrops);
	} else if (curScreen == 3) {
		cork2.x = 313;
		cork2.y = 341;
		boxText.innerHTML = "NOW POUR IN SOME ZINC POWDER. STIR IT, AND HEAT IT.";
		addRollOver(botContZ, true);
		addMouseDown(botContZ, dragZinc);
	} else if (curScreen == 4) {
		cork2.x = 506;
		cork2.y = 323;
		boxText.innerHTML = "NOW WE NEED TO EXPOSE THE MIXTURE TO HYDROGEN GAS. TO CREATE IT, FIRST POUR SOME ZINC INTO THE OPEN FLASK ON THE LEFT.";
		addRollOver(botContZ, true);
		addMouseDown(botContZ, dragZinc);
	} else if (curScreen == 5) {
		boxText.innerHTML = "NOW ADD DROPS OF HYDROCHLORIC ACID TO THE FLASK TO CREATE HYDROGEN GAS.";
		addRollOver(botContA, true);
		addMouseDown(botContA, dragDrops);
	} else if (curScreen == 6) {
		if (window.location.href.indexOf("int1a") != -1) { boxText.innerHTML = "IF THERE'S ARSENIC IN THE SAMPLE, A BLACK \"ARSENIC MIRROR\" WILL COAT THE INSIDE OF THE TEST TUBE. IN THIS CASE, A FAINT COATING APPEARS, INDICATING A VERY SMALL AMOUNT OF ARSENIC. SO, NOW PROCEED TO THE SECOND TEST..."; }
		else { boxText.innerHTML = "IF THERE'S ARSENIC IN THE SAMPLE, A BLACK \"ARSENIC MIRROR\" WILL COAT THE INSIDE OF THE TEST TUBE. IN THIS CASE, A VERY DARK COATING APPEARS, INDICATING A LARGE AMOUNT OF ARSENIC. SO, NOW PROCEED TO THE SECOND TEST..."; }
	}
}

function gotoScreen(n) {
	var Twn = createjs.Tween;
	var easeIn = createjs.Ease.circIn;
	switch (n) {
		case 1:
		knifeOver = knifeDropped = false;
		botContA.visible = botContZ.visible = rod.visible = tubeFill1.visible = false;
		tray.x = 31;
		knifeCont.set(knifeProps1);
		burnCont.set(burnProps1);
		addRollOver(knifeCont, true);
		addMouseDown(knifeCont, dragKnife);
		boxText.innerHTML = "INSTRUCTIONS: IT'S TIME TO TEST FOR ARSENIC USING THE MARSH TEST! CUT THE TISSUE SAMPLE INTO SMALL PIECES BEFORE TRANSFERRING IT TO A TEST TUBE.";
		if (curScreen < prvScreen) {
			deactivate(botContA);
			tray.visible = true;
			tissue1.alpha = 1;
			tissue1.visible = knifeCont.visible = true;
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 2:
		if (curScreen > prvScreen) {
			//clearText();
			deactivate(knifeCont);
			knife.rotation = -36;
			tissue3.set(tissProps1);
			tissue2.alpha = tissue3.alpha = 0;
			tissue2.visible = tissue3.visible = true;
			Twn.get(knifeCont).to({guide:{path:[223,153,238,123,253,153,268,123,283,153,298,123,313,153,328,123,343,153,358,123,373,153,388,123,403,153]}}, 4000).call(minceDone);
			Twn.get(tissue1).wait(500).to({alpha:0}, 1000).set(invis);
			Twn.get(tissue2).wait(500).to({alpha:1}, 1000).wait(1000).to({alpha:0}, 1000).set(invis);
			Twn.get(tissue3).wait(2500).to({alpha:1}, 1000);
			fgMoving = true;
		} else {
			deactivate(botContZ);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 3:
		if (curScreen > prvScreen) {
			//clearText();
			dropBotA.visible = dropTopA.visible = false;
			dropDragCont.set({x:198, y:58, mouseEnabled:false, visible:true});
			deactivate(botContA);
			dripA1.visible = true;
			dripA1.x = dripA2.x = dripA3.x = 195;
			dripA1.y = dripA2.y = dripA3.y = 115;
			splash.x = 180;
			splash.y = 198;
			Twn.get(dripA1).to({y:181}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
			Twn.get(dripA2).wait(500).set(vis).to({y:181}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
			Twn.get(dripA3).wait(1000).set(vis).to({y:181}, 500, easeIn).set(invis).set(vis, splash).wait(200).call(dripAcidDone);
			fgMoving = true;
		} else {
			tubeFill2.visible = flaskCont.visible = stopper.visible = false;
			tubeFill1.visible = rod.visible = true;
			tubeFill1.alpha = 1;
			rod.y = 439;
			burnCont.set(burnProps2);
			botContA.set(acidProps2);
			botContZ.set(zincProps2);
			deactivate(botContZ);
			labelA.gotoAndStop("labelSulf");
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 4:
		if (curScreen > prvScreen) {
			cork1.visible = false;
			cork2.visible = true;
			deactivate(botContZ);
			botContZ.set(zincProps3);
			zincPour.set({x:189, y:107, visible:true, alpha:1});
			Twn.get(zincPour).to({y:187, alpha:0}, 1000).set(invis).wait(500).call(zincPourDone);
			fgMoving = true;
		} else {
			deactivate(botContA);
			zincPile.visible = false;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 5:
		if (curScreen > prvScreen) {
			//clearText();
			cork1.visible = false;
			cork2.visible = true;
			deactivate(botContZ);
			botContZ.set(zincProps5);
			zincPour.set({x:139, y:85, visible:true, alpha:1});
			Twn.get(zincPour).to({y:365}, 1100).set(invis).set(vis, zincPile).call(zincPourDone);
			fgMoving = true;
		} else {
			tubeFill4.visible = tubeFill5.visible = stopper2.visible = gas4a.visible = gas4b.visible = gas4c.visible = false;
			tubeFill2.visible = stopper.visible = true;
			tubeFill2.alpha = 1;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 6:
		//clearText();
		dropBotA.visible = dropTopA.visible = false;
		dropDragCont.set({x:150, y:26, mouseEnabled:false, visible:true});
		deactivate(botContA);
		dripA1.visible = true;
		dripA1.x = dripA2.x = dripA3.x = 149;
		dripA1.y = dripA2.y = dripA3.y = 84;
		splash.x = 134;
		splash.y = 397;
		Twn.get(dripA1).to({y:382}, 750, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
		Twn.get(dripA2).wait(750).set(vis).to({y:382}, 750, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
		Twn.get(dripA3).wait(1500).set(vis).to({y:382}, 750, easeIn).set(invis).set(vis, splash).wait(200).call(dripAcidDone);
		fgMoving = true;
	}
	updateFG = true;
}

function overObject(evt) {
	var o = evt.currentTarget;
	o.scaleX = o.scaleY = 1.05;
	updateFG = true;
}

function outObject(evt) {
	var o = evt.currentTarget;
	o.scaleX = o.scaleY = 1;
	updateFG = true;
}