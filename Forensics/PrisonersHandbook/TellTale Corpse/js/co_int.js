var sprites;
var bench, syrCont, dishCont1, dishCont2, plunger, blood, body, lye1, lye2, rod1, rod3, pour1, pour2, pool1, pool2, pool3, pool3e, label1, label2, rod2Cont;
var syrProps1 = {x:415, y:441, rotation:90};
var syrProps2 = {x:312, y:159, rotation:51};
var syrProps3 = {x:540, y:160, rotation:27};
var syrProps4 = {x:627, y:428, rotation:90};
var plungProps1 = {x:-9, y:-74};
var plungProps2 = {x:-9, y:-160};
var bloodProps1 = {x:0, y:91};
var bloodProps2 = {x:0, y:8};
var rod1Props1 = {x:210, y:507};
var rod1Props2 = {x:212, y:426, rotation:0};
var rod3Props1 = {x:605, y:-2, rotation:112.8};
var rod3Props2 = {x:1114, y:-135, rotation:155};
var lyeProps1 = {x:-138, y:-83};
var lyeProps2 = {x:166, y:169, rotation:0};
var dish2Props1 = {x:779, y:193};
var dish2Props5 = {x:426, y:193};
var stirCnt = 0;

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

	var manifest = [{src:"img/co_sprites.png", id:"sprites"},{src:"img/co_body2.png", id:"body"},{src:"img/bench3.png", id:"bench"}];
	var preload = new createjs.LoadQueue(true);
	preload.addEventListener("fileload", handleFileLoad);
	preload.addEventListener("complete", handleComplete);
	preload.loadManifest(manifest);

	var wall = new createjs.Shape();
	wall.graphics.f("#748288").dr(0, 0, 778, 488);
	fgStage.addChild(wall);

	createjs.MotionGuidePlugin.install();

	fgStage.update();
}

function handleComplete(event) {
	document.getElementById("loader").className = "";

	sprites = new createjs.SpriteSheet({
		images:[assets["sprites"]],
		frames:[[570,3,70,241],[756,3,23,92],[3,293,259,197],[598,371,183,39],[570,247,183,39],[287,3,280,287],[3,3,281,287],[643,3,48,62],[643,98,50,120],[696,3,41,169],[696,175,64,39],[440,335,155,66],[265,335,172,79],[611,289,172,79],[265,455,361,35],[265,293,343,39],[265,417,361,35]],
		animations:{barrel:0,blood:1,dish:2,label_norm:3,label_vict:4,lye_can:5,lye_can2:6,lye_pour1:7,lye_pour2:8,plunger:9,pool1:10,pool2:11,pool3:12,pool3e:13,rod1:14,rod2:15,rod3:16}
	});

	bench = new createjs.Bitmap(assets["bench"]);
	bench.x = -4;
	bench.y = 138;
	fgStage.addChild(bench);

	body = new createjs.Bitmap(assets["body"]);
	body.y = 47;
	fgStage.addChild(body);


	var dish1 = new createjs.Sprite(sprites, "dish");

	pool1 = new createjs.Sprite(sprites, "pool1");
	pool1.x = 85;
	pool1.y = 99;
	pool1.visible = false;

	pool2 = new createjs.Sprite(sprites, "pool2");
	pool2.x = 38;
	pool2.y = 93;
	pool2.visible = false;

	pool3 = new createjs.Sprite(sprites, "pool3");
	pool3.x = 32;
	pool3.y = 80;
	pool3.visible = false;

	pool3e = new createjs.Sprite(sprites, "pool3e");
	pool3e.x = 32;
	pool3e.y = 80;
	pool3e.visible = false;

	dishCont1 = new createjs.Container();
	dishCont1.addChild(dish1, pool1, pool2, pool3, pool3e);
	dishCont1.x = 335;
	dishCont1.y = 193;
	fgStage.addChild(dishCont1);


	label1 = new createjs.Sprite(sprites, "label_vict");
	label1.x = 128;
	label1.y = 378;
	label1.visible = false;
	fgStage.addChild(label1);


	var dish2 = new createjs.Sprite(sprites, "dish");

	var poolNorm = new createjs.Sprite(sprites, "pool3");
	poolNorm.x = 32;
	poolNorm.y = 80;

	label2 = new createjs.Sprite(sprites, "label_norm");
	label2.x = 31;
	label2.y = 185;
	label2.visible = false;

	dishCont2 = new createjs.Container();
	dishCont2.addChild(dish2, poolNorm, label2);
	dishCont2.x = 779;
	dishCont2.y = 193;
	dishCont2.visible = false;
	dishCont2.set(dish2Props1);
	fgStage.addChild(dishCont2);


	lye1 = new createjs.Sprite(sprites, "lye_can");
	lye1.regX = lye1.getBounds().width/2;
	lye1.regY = lye1.getBounds().height/2;
	lye1.origScale = 1;
	lye1.cursor = "pointer";
	lye1.mouseEnabled = false;
	fgStage.addChild(lye1);

	blood = new createjs.Sprite(sprites, "blood");
	var bloodCont = new createjs.Container();
	bloodCont.addChild(blood);
	var graphics = new createjs.Graphics().f("#000").dr(0,0,23,92);
	var shape = new createjs.Shape(graphics);
	bloodCont.mask = shape;

	plunger = new createjs.Sprite(sprites, "plunger");

	var barrel = new createjs.Sprite(sprites, "barrel");
	barrel.x = -24;
	barrel.y = -36;

	syrCont = new createjs.Container();
	syrCont.addChild(bloodCont, plunger, barrel);
	syrCont.regX = 11.5;
	syrCont.regY = 46;
	syrCont.origScale = 1;
	syrCont.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-30,-85,92,305));
	syrCont.cursor = "pointer";
	syrCont.mouseChildren = false;
	fgStage.addChild(syrCont);


	rod1 = new createjs.Sprite(sprites, "rod1");
	rod1.regX = rod1.getBounds().width/2;
	rod1.regY = rod1.getBounds().height/2;
	rod1.origScale = 1;
	rod1.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-28,-25,412,95));
	rod1.cursor = "pointer";
	rod1.mouseEnabled = false;
	fgStage.addChild(rod1);

	var rod2 = new createjs.Sprite(sprites, "rod2");
	rod2.rotation = 112.8;
	rod2Cont = new createjs.Container();
	rod2Cont.addChild(rod2);
	rod2Cont.visible = false;
	fgStage.addChild(rod2Cont);

	rod3 = new createjs.Sprite(sprites, "rod3");
	rod3.set(rod3Props1);
	rod3.visible = false;
	fgStage.addChild(rod3);

	lye2 = new createjs.Sprite(sprites, "lye_can2");
	lye2.regX = lye2.getBounds().width/2;
	lye2.regY = lye2.getBounds().height/2;
	lye2.visible = false;
	fgStage.addChild(lye2);


	pour1 = new createjs.Sprite(sprites, "lye_pour1");
	pour1.x = 370;
	pour1.y = 191;
	pour1.visible = false;
	fgStage.addChild(pour1);

	pour2 = new createjs.Sprite(sprites, "lye_pour2");
	pour2.x = 370;
	pour2.y = 191;
	pour2.visible = false;
	fgStage.addChild(pour2);


	gotoScreen(1);
	createjs.Ticker.addEventListener("tick", tick);
}

function dragSyringe(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.x = evt.stageX;
	o.y = evt.stageY;
	o.scaleX = o.scaleY = o.origScale;
	o.rotation = 70;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX;
		o.y = evt.stageY;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageY < 315) { goNextScreen(); }
		else {
			o.set(syrProps1);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragRod(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	o.x = evt.stageX;
	o.y = evt.stageY-150;
	o.rotation = 90;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX;
		o.y = evt.stageY-150;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > 315 && evt.stageY > 90 && evt.stageX < 600 && evt.stageY < 370) { goNextScreen(); }
		else {
			o.set(rod1Props2);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragLye(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	o.visible = false;
	lye2.visible = true;
	lye2.rotation = 30;
	lye2.x = evt.stageX;
	lye2.y = evt.stageY;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		lye2.x = evt.stageX;
		lye2.y = evt.stageY;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > 235 && evt.stageY < 315) { goNextScreen(); }
		else {
			lye2.visible = false;
			o.set(lyeProps2);
			o.visible = true;
			addRollOver(o);
		}
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
			window.location = "co17.html";
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
			window.location = "co18.html";
		}
	}
	return false;
}

function drawBloodDone() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	lye1.visible = rod1.visible = dishCont1.visible = bench.visible = true;
	dishCont1.alpha = bench.alpha = 0;
	Twn.get(syrCont).to(syrProps3, 1500, easeOut);
	Twn.get(dishCont1).to({alpha:1}, 1500);
	Twn.get(rod1).to(rod1Props2, 1500, easeOut);
	Twn.get(body).to({alpha:0}, 1500).set(invis);
	Twn.get(bench).to({alpha:1}, 1500);
	Twn.get(lye1).to(lyeProps2, 1525, easeOut).call(screenReady);
}

function pourDone() {
	lye2.visible = pour1.visible = false;
	lye1.visible = true;
	lye1.set({x:304, y:129, rotation:35, visible:true});
	createjs.Tween.get(lye1).to(lyeProps2, 200).call(screenReady);
}

function squirtDone() { createjs.Tween.get(syrCont).to(syrProps4, 200).call(screenReady); }

function stirCycle() {
	if (++stirCnt == 2) {
		stirCnt = 0;
		var Twn = createjs.Tween;
		var easeOut = createjs.Ease.circOut;
		Twn.removeTweens(rod2Cont);
		rod2Cont.visible = false;
		label1.visible = label2.visible = dishCont2.visible = rod3.visible = true;
		label1.alpha = label2.alpha = 0
		Twn.get(rod3).to(rod3Props2, 1500, easeOut).set(invis);
		Twn.get(syrCont).to({y:526}, 1500, easeOut).set(invis);
		Twn.get(bench).to({x:-354}, 1500, easeOut);
		Twn.get(dishCont1).to({x:99}, 1500, easeOut);
		Twn.get(dishCont2).to({x:426}, 1500, easeOut);
		Twn.get(label1).wait(1200).to({alpha:1}, 200);
		Twn.get(label2).wait(1200).to({alpha:1}, 200);
		Twn.get(lye1).to(lyeProps1, 1525, easeOut).set(invis).call(screenReady);
	}
}

function screenReady() {
	fgMoving = false;
	updateFG = true;
	if (curScreen == 2) {
		addRollOver(syrCont, true);
		addMouseDown(syrCont, goNextScreen);
		boxText.innerHTML = "DEPRESS THE SYRINGE TO TRANSFER THE BLOOD SAMPLE TO THE DISH.";
	} else if (curScreen == 3) {
		addRollOver(lye1, true);
		addMouseDown(lye1, dragLye);
		boxText.innerHTML = "THIS BLOOD ALREADY SEEMS TOO BRIGHT: A TELLTALE SIGN OF CARBON MONOXIDE POISONING. BUT WE NEED TO BE SURE. SO, ADD SODIUM HYDROXIDE &mdash; ALSO KNOWN AS LYE &mdash; TO THE DISH.";
	} else if (curScreen == 4) {
		addRollOver(rod1, true);
		addMouseDown(rod1, dragRod);
		boxText.innerHTML = "HERE'S THE MOMENT OF TRUTH. STIR THE MIXTURE WITH THE ROD. IF IT STAYS A BRIGHT RED, WE'LL KNOW THE VICTIM DIED FROM CARBON MONOXIDE POISONING.";
	} else if (curScreen == 5) {
		boxText.innerHTML = "SEE THE DIFFERENCE? NORMAL BLOOD (AS ON THE RIGHT) TURNS DARK BROWN WHEN LYE IS ADDED TO IT. BUT THE VICTIM'S BRIGHT-RED BLOOD SHOWS THAT SHE DIED FROM CARBON MONOXIDE POISONING.";
	}
}

function gotoScreen(n) {
	var Twn = createjs.Tween;
	switch (n) {
		case 1:
		if (curScreen < prvScreen) { body.set({visible:true, alpha:1}); }
		lye1.visible = rod1.visible = dishCont1.visible = bench.visible = false;
		syrCont.set(syrProps1);
		blood.set(bloodProps1);
		plunger.set(plungProps1);
		lye1.set(lyeProps1);
		rod1.set(rod1Props1);
		deactivate(syrCont);
		addRollOver(syrCont, true);
		addMouseDown(syrCont, dragSyringe);
		boxText.innerHTML = "INSTRUCTIONS: PICK UP THE SYRINGE AND DRAW BLOOD FROM THE VICTIM'S ARM.";
		break;
		//- - - - - - - - - - - - - - - -
		case 2:
		if (curScreen > prvScreen) {
			clearText();
			syrCont.set(syrProps2);
			deactivate(syrCont);
			Twn.get(blood).wait(500).to(bloodProps2, 2000);
			Twn.get(plunger).wait(500).to(plungProps2, 2000).wait(1250).call(drawBloodDone);
			fgMoving = true;
		} else {
			deactivate(lye1);
			pool1.visible = pool2.visible = pool3.visible = false;
			syrCont.set(syrProps3);
			plunger.set(plungProps2);
			blood.set(bloodProps2);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 3:
		if (curScreen > prvScreen) {
			//clearText();
			syrCont.scaleX = syrCont.scaleY = 1;
			deactivate(syrCont);
			pool1.visible = pool2.visible = pool3.visible = true;
			pool1.alpha = pool2.alpha = pool3.alpha = 0;
			Twn.get(pool1).to({alpha:1}, 700);
			Twn.get(pool2).wait(700).to({alpha:1}, 700).set(invis, pool1);
			Twn.get(pool3).wait(1400).to({alpha:1}, 700).set(invis, pool2);
			Twn.get(plunger).to(plungProps1, 2100);
			Twn.get(blood).to(bloodProps1, 2100).wait(150).call(squirtDone);
			fgMoving = true;
		} else {
			deactivate(rod1);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 4:
		if (curScreen > prvScreen) {
			clearText();
			deactivate(lye1);
			lye1.visible = false;
			lye2.set({x:298, y:125, rotation:-297.5, visible:true});
			Twn.get(pour1).set(vis).wait(250).set(invis).wait(500).set(vis).wait(250).call(pourDone);
			Twn.get(pour2).wait(250).set(vis).wait(500).set(invis);
			fgMoving = true;
		} else {
			bench.x = -4;
			pool3.visible = rod1.visible = lye1.visible = syrCont.visible = true;
			pool3e.visible = label1.visible = dishCont2.visible = false;
			dishCont1.x = 335;
			dishCont2.set(dish2Props1);
			syrCont.set(syrProps4);
			lye1.set(lyeProps2);
			rod1.set(rod1Props2);
			rod3.set(rod3Props1);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 5:
		//clearText();
		rod1.visible = false;
		rod2Cont.visible = pool3e.visible = true;
		pool3e.alpha = 0;
		Twn.get(rod2Cont, {loop:true}).to({guide:{path:[608,0, 513,22,608,39, 665,23,608,0]}},3000).call(stirCycle);
		Twn.get(pool3e).to({alpha:1}, 5500).set(invis, pool3);
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