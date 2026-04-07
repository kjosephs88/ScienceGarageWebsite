var sprites, spritesLarge;
var bench, trayCont, flaskCont, knife, chunk1, chunk2, hoverCut, pool, cut1Cont, cut2Cont, cut3Cont, cut4Cont, hole, chunkDrag, botContA, dropTopA, dropBotA, botContH, dropTopH, dropBotH, dropDragCont, dripA1, dripA2, dripA3, splash, steamer, steamL, steamR, iceCont, cooled, pour, cork1, cork2, botContS, saltPour, flame, dripH1, dripH2, dripH3;
var trayProps1 = {x:21, y:15};
var chunkDProps2 = {x:275, y:188, scaleX:1, scaleY:1};
var benchProps1 = {x:-270, y:63, scaleX:1, scaleY:2.503};
var benchProps3 = {x:-498, y:145, scaleX:1, scaleY:2.034};
var benchProps5 = {x:-498, y:198, scaleX:1, scaleY:1.716};
var benchProps6 = {x:-498, y:136, scaleX:1, scaleY:2.075};
var knifeProps1 = {x:248, y:442, scaleX:1, scaleY:1, rotation:0};
var flaskProps1 = {x:638, y:239, scaleX:1, scaleY:1};
var flaskProps3 = {x:303, y:269, scaleX:0.872, scaleY:0.872};
var flaskProps4 = {x:190, y:231, scaleX:0.872, scaleY:0.872};
var flaskProps5a = {x:551, y:70, scaleX:0.872, scaleY:0.872};
var flaskProps5b = {x:243, y:164, scaleX:0.676661849, scaleY:0.676661849, rotation:0};
var flaskProps6 = {x:414, y:115, scaleX:0.676661849, scaleY:0.676661849, rotation:101};
var chunk1Props1 = {x:71, y:338, scaleX:1, scaleY:1};
var chunk1Props3 = {x:60, y:328, scaleX:1.146789, scaleY:1.146789};
var steamProps1 = {x:584, y:489};
var steamProps4 = {x:304, y:189, scaleX:1, scaleY:1};
var steamProps5 = {x:52, y:255, scaleX:0.777223944664, scaleY:0.777223944664, alpha:1};
var steamProps6 = {x:-340, y:255, scaleX:0.777223944664, scaleY:0.777223944664, alpha:0};
var burnProps1 = {x:759, y:205, scaleX:1.1, scaleY:1.1};
var burnProps6a = {x:438, y:23, scaleX:0.89472711, scaleY:0.89472711};
var burnProps6b = {x:297, y:53, scaleX:1, scaleY:1};
var iceProps1 = {x:779, y:178};
var iceProps5 = {x:447, y:178, alpha:1};
var iceProps6a = {x:47, y:178, alpha:1};
var iceProps6b = {x:47, y:490, alpha:0};
var saltProps1 = {x:827, y:308, rotation:0};
var saltProps6 = {x:642, y:308, rotation:0};
var saltProps7 = {x:537, y:67, rotation:265.5};

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

	var manifest = [{src:"img/cyan2_sprites_sm.png", id:"sprites_small"},{src:"img/cyan2_tubefill3.png", id:"tubefill3_img"},{src:"img/cyan2_sprites_lg.png", id:"sprites_large"},{src:"img/bench2.png", id:"bench"}];
	var preload = new createjs.LoadQueue(true);
	preload.addEventListener("fileload", handleFileLoad);
	preload.addEventListener("complete", handleComplete);
	preload.loadManifest(manifest);

	var wall = new createjs.Shape();
	wall.graphics.f("#748288").dr(0, 0, 778, 215);
	fgStage.addChild(wall);

	fgStage.update();
}

function handleComplete(event) {
	document.getElementById("loader").className = "";

	sprites = new createjs.SpriteSheet({
		images:[assets["sprites_small"]],
		frames:[[864,291,95,153],[941,3,107,235],[3,3,381,490],[1155,234,130,93],[1259,423,126,48],[1297,204,110,38],[1093,232,59,82],[1361,3,48,66],[652,439,37,13],[1093,428,86,53],[1311,342,93,77],[1178,342,130,78],[1399,72,11,54],[737,291,40,201],[1158,3,200,68],[780,291,81,171],[941,241,16,39],[387,3,262,454],[1158,149,136,82],[652,3,286,285],[387,460,347,29],[780,465,310,29],[1288,245,93,94],[652,353,81,83],[1092,342,83,83],[1158,74,146,72],[1307,134,100,67],[652,291,82,59],[1384,245,23,71],[1182,423,74,68],[1051,3,104,226],[962,241,127,220],[1361,72,35,59],[1307,74,35,40]],
		animations:{acid:0,bottle:1,burner:2,chunk:3,chunk2:4,cooled:5,cork1:6,cork2:7,cut1:8,cut2:9,cut3:10,cut4:11,drip:12,dropperB:13,dropperB2:14,dropperT:15,flame:16,flask:17,hole:18,iceBath:19,knife:20,knife2:21,labelAcid:22,labelHydro:23,labelSalts:24,pool:25,pour:26,salt:27,saltPour:28,splash:29,steamL:30,steamR:31,tubeFill1:32,tubeFill2:33}
	});

	spritesLarge = new createjs.SpriteSheet({images:[assets["sprites_large"]],frames:[[2,695,367,230],[2,389,434,303],[2,2,474,384]],animations:{lungs:0,steamer:1,tray:2}});

	bench = new createjs.Bitmap(assets["bench"]);
	bench.set(benchProps1);
	fgStage.addChild(bench);

	var tray = new createjs.Sprite(spritesLarge, "tray");

	var lungs = new createjs.Sprite(spritesLarge, "lungs");
	lungs.x = 50;
	lungs.y = 52;

	hole = new createjs.Sprite(sprites, "hole");
	hole.x = 186;
	hole.y = 131;
	hole.visible = false;

	trayCont = new createjs.Container();
	trayCont.addChild(tray, lungs, hole);
	trayCont.set(trayProps1);
	fgStage.addChild(trayCont);

	hoverCut = new createjs.Sprite(sprites, "cut4");
	hoverCut.x = 211;
	hoverCut.y = 156;
	hoverCut.alpha = 0.3;
	hoverCut.visible = false;
	fgStage.addChild(hoverCut);



	var cut1 = new createjs.Sprite(sprites, "cut1");
	cut1.x = 259;
	cut1.y = 156;

	var knife1 = new createjs.Sprite(sprites, "knife2");
	knife1.scaleX = knife1.scaleY = 0.88190048933029175;
	knife1.x = 107;
	knife1.y = -48.5;
	knife1.rotation = 49.216373443603516;

	cut1Cont = new createjs.Container();
	cut1Cont.addChild(cut1, knife1);
	cut1Cont.visible = false;
	fgStage.addChild(cut1Cont);

	var cut2 = new createjs.Sprite(sprites, "cut2");
	cut2.x = 211.5;
	cut2.y = 155;

	var knife2 = new createjs.Sprite(sprites, "knife2");
	knife2.scaleX = knife2.scaleY = 0.87085139751434326;
	knife2.x = -44;
	knife2.y = 154.25;
	knife2.rotation = 6.1712508201599121;

	cut2Cont = new createjs.Container();
	cut2Cont.addChild(cut2, knife2);
	cut2Cont.visible = false;
	fgStage.addChild(cut2Cont);

	var cut3 = new createjs.Sprite(sprites, "cut3");
	cut3.x = 211;
	cut3.y = 156;

	var knife3 = new createjs.Sprite(sprites, "knife2");
	knife3.scaleX = -0.87085139751434326;
	knife3.scaleY = 0.87085139751434326;
	knife3.x = 392;
	knife3.y = 7;
	knife3.rotation = 306.5960693359375;

	cut3Cont = new createjs.Container();
	cut3Cont.addChild(cut3, knife3);
	cut3Cont.visible = false;
	fgStage.addChild(cut3Cont);

	var cut4 = new createjs.Sprite(sprites, "cut4");
	cut4.x = 211;
	cut4.y = 156;

	var knife4 = new createjs.Sprite(sprites, "knife2");
	knife4.scaleX = knife4.scaleY = 0.87085139751434326;
	knife4.x = 412.25;
	knife4.y = -80.5;
	knife4.rotation = 109.44362640380859;

	cut4Cont = new createjs.Container();
	cut4Cont.addChild(cut4, knife4);
	cut4Cont.visible = false;
	fgStage.addChild(cut4Cont);



	var bottleA = new createjs.Sprite(sprites, "bottle");

	var acidA = new createjs.Sprite(sprites, "acid");
	acidA.x = 7;
	acidA.y = 74;

	dropBotA = new createjs.Sprite(sprites, "dropperB");
	dropBotA.x = 33;
	dropBotA.y = 17;

	dropTopA = new createjs.Sprite(sprites, "dropperT");
	dropTopA.x = 12;
	dropTopA.y = -149;

	var labelA = new createjs.Sprite(sprites, "labelAcid");
	labelA.x = 12;
	labelA.y = 88;

	botContA = new createjs.Container();
	botContA.addChild(dropBotA, bottleA, acidA, dropTopA, labelA);
	botContA.regX = bottleA.getBounds().width/2;
	botContA.regY = bottleA.getBounds().height/2;
	botContA.x = 834;
	botContA.y = 321;
	botContA.visible = false;
	botContA.cursor = "pointer";
	botContA.mouseEnabled = false;
	fgStage.addChild(botContA);



	var bottleH = new createjs.Sprite(sprites, "bottle");

	var acidH = new createjs.Sprite(sprites, "acid");
	acidH.x = 7;
	acidH.y = 74;

	dropBotH = new createjs.Sprite(sprites, "dropperB");
	dropBotH.x = 34;
	dropBotH.y = 17;

	dropTopH = new createjs.Sprite(sprites, "dropperT");
	dropTopH.x = 13;
	dropTopH.y = -149;

	var labelH = new createjs.Sprite(sprites, "labelHydro");
	labelH.scaleX = labelH.scaleY = 1.13845186518249;
	labelH.x = 13;
	labelH.y = 87;

	botContH = new createjs.Container();
	botContH.addChild(dropBotH, bottleH, acidH, dropTopH, labelH);
	botContH.regX = bottleH.getBounds().width/2;
	botContH.regY = bottleH.getBounds().height/2;
	botContH.scaleX = botContH.scaleY = 0.87838584184646606;
	botContH.x = -49;
	botContH.y = 308;
	botContH.visible = false;
	botContH.cursor = "pointer";
	botContH.mouseEnabled = false;
	fgStage.addChild(botContH);



	steamer = new createjs.Sprite(spritesLarge, "steamer");
	steamer.set(steamProps1);
	steamer.visible = false;
	fgStage.addChild(steamer);

	steamL = new createjs.Sprite(sprites, "steamL");
	steamL.x = 376;
	steamL.y = 30;
	steamL.visible = false;
	fgStage.addChild(steamL);

	steamR = new createjs.Sprite(sprites, "steamR");
	steamR.x = 625;
	steamR.y = 34;
	steamR.visible = false;
	fgStage.addChild(steamR);



	var iceBath = new createjs.Sprite(sprites, "iceBath");

	cooled = new createjs.Sprite(sprites, "cooled");
	cooled.x = 88;
	cooled.y = 180;
	cooled.visible = false;

	iceCont = new createjs.Container();
	iceCont.addChild(iceBath, cooled);
	iceCont.set(iceProps1);
	iceCont.visible = false;
	fgStage.addChild(iceCont);



	chunk1 = new createjs.Sprite(sprites, "chunk");
	chunk1.set(chunk1Props1);
	chunk1.visible = false;

	chunk2 = new createjs.Sprite(sprites, "chunk2");
	chunk2.scaleX = chunk2.scaleY = 1.14810320081057;
	chunk2.x = 62;
	chunk2.y = 360;
	chunk2.visible = false;

	pool = new createjs.Sprite(sprites, "pool");
	pool.scaleX = pool.scaleY = 1.14810320081057;
	pool.x = 50;
	pool.y = 357;
	pool.visible = false;

	flask = new createjs.Sprite(sprites, "flask");

	flaskCont = new createjs.Container();
	flaskCont.addChild(flask, chunk1, chunk2, pool);
	flaskCont.regX = flask.getBounds().width/2;
	flaskCont.regY = flask.getBounds().height/2;
	flaskCont.set(flaskProps1);
	flaskCont.cursor = "pointer";
	flaskCont.mouseEnabled = flaskCont.mouseChildren = false;
	fgStage.addChild(flaskCont);


	pour = new createjs.Sprite(sprites, "pour");
	pour.x = 463;
	pour.y = 153;
	pour.visible = false;
	fgStage.addChild(pour);



	knife = new createjs.Sprite(sprites, "knife");
	knife.regX = knife.getBounds().width/2;
	knife.regY = knife.getBounds().height/2;
	knife.set(knifeProps1);
	knife.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-10,-15,370,84));
	knife.cursor = "pointer";
	knife.mouseEnabled = false;
	fgStage.addChild(knife);

	chunkDrag = new createjs.Sprite(sprites, "chunk");
	chunkDrag.regX = chunkDrag.getBounds().width/2;
	chunkDrag.regY = chunkDrag.getBounds().height/2;
	chunkDrag.set(chunkDProps2);
	chunkDrag.cursor = "pointer";
	fgStage.addChild(chunkDrag);

	dripA1 = new createjs.Sprite(sprites, "drip");
	dripA1.scaleX = dripA1.scaleY = 0.9;
	dripA1.x = 299;
	dripA1.visible = false;
	fgStage.addChild(dripA1);

	dripA2 = new createjs.Sprite(sprites, "drip");
	dripA2.scaleX = dripA2.scaleY = 0.9;
	dripA2.x = 299;
	dripA2.visible = false;
	fgStage.addChild(dripA2);

	dripA3 = new createjs.Sprite(sprites, "drip");
	dripA3.scaleX = dripA3.scaleY = 0.9;
	dripA3.x = 299;
	dripA3.visible = false;
	fgStage.addChild(dripA3);

	splash = new createjs.Sprite(sprites, "splash");
	splash.x = 273;
	splash.y = 354;
	splash.visible = false;
	fgStage.addChild(splash);




	var burner = new createjs.Sprite(sprites, "burner");

	tubeFill1 = new createjs.Sprite(sprites, "tubeFill1");
	tubeFill1.x = 114;
	tubeFill1.y = 197;
	tubeFill1.visible = false;

	tubeFill2 = new createjs.Sprite(sprites, "tubeFill2");
	tubeFill2.x = 114;
	tubeFill2.y = 217;
	tubeFill2.visible = false;

	tubeFill3 = new createjs.Bitmap(assets["tubefill3_img"]);
	tubeFill3.x = 88;
	tubeFill3.y = 171;
	tubeFill3.visible = false;

	burnCont = new createjs.Container();
	burnCont.addChild(burner, tubeFill1, tubeFill2, tubeFill3);
	burnCont.set(burnProps1);
	burnCont.visible = false;
	fgStage.addChild(burnCont);



	cork2 = new createjs.Sprite(sprites, "cork2");
	cork2.x = 540;
	cork2.y = 337;
	cork2.visible = false;
	fgStage.addChild(cork2);


	var bottleS = new createjs.Sprite(sprites, "bottle");

	var salt = new createjs.Sprite(sprites, "salt");
	salt.scaleX = salt.scaleY = 1.12839727143507;
	salt.x = 7;
	salt.y = 160;
	salt.alpha = 0.9;

	var labelS = new createjs.Sprite(sprites, "labelSalts");
	labelS.scaleX = labelS.scaleY = 1.12839727143507;
	labelS.x = 13;
	labelS.y = 87;

	cork1 = new createjs.Sprite(sprites, "cork1");
	cork1.scaleX = cork1.scaleY = 0.89999997615814209;
	cork1.x = 27;
	cork1.y = -32;

	botContS = new createjs.Container();
	botContS.addChild(bottleS, salt, labelS, cork1);
	botContS.regX = bottleS.getBounds().width/2;
	botContS.regY = bottleS.getBounds().height/2;
	botContS.scaleX = botContS.scaleY = 0.88621270656585693;
	botContS.visible = false;
	botContS.cursor = "pointer";
	botContS.mouseEnabled = false;
	fgStage.addChild(botContS);



	saltPour = new createjs.Sprite(sprites, "saltPour");
	saltPour.x = 418;
	saltPour.visible = false;
	fgStage.addChild(saltPour);

	flame = new createjs.Sprite(sprites, "flame");
	flame.x = 418;
	flame.y = 362;
	flame.regY = flame.getBounds().height;
	flame.visible = false;
	fgStage.addChild(flame);



	dripH1 = new createjs.Sprite(sprites, "drip");
	dripH1.scaleX = 0.85;
	dripH1.scaleY = 0.95;
	dripH1.x = 424;
	dripH1.visible = false;
	fgStage.addChild(dripH1);

	dripH2 = new createjs.Sprite(sprites, "drip");
	dripH2.scaleX = 0.85;
	dripH2.scaleY = 0.95;
	dripH2.x = 424;
	dripH2.visible = false;
	fgStage.addChild(dripH2);

	dripH3 = new createjs.Sprite(sprites, "drip");
	dripH3.scaleX = 0.85;
	dripH3.scaleY = 0.95;
	dripH3.x = 424;
	dripH3.visible = false;
	fgStage.addChild(dripH3);



	var dropTopDrag1 = new createjs.Sprite(sprites, "dropperT");
	dropTopDrag1.rotation = 78.299476623535156;
	dropTopDrag1.x = 352;
	dropTopDrag1.y = -54;

	var dropBotDrag1 = new createjs.Sprite(sprites, "dropperB2");

	dropDragCont = new createjs.Container();
	dropDragCont.addChild(dropBotDrag1, dropTopDrag1);
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
	o.x = evt.stageX-120;
	o.y = evt.stageY-65;
	o.scaleX = o.scaleY = o.origScale;
	o.rotation = 30;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		hoverCut.visible = (evt.stageX < 480 && evt.stageY < 315);
		o.x = evt.stageX-120;
		o.y = evt.stageY-65;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (hoverCut.visible) { goNextScreen(); }
		else {
			o.set(knifeProps1);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragChunk(evt) {
	if (isMSIETouch) { dragging = true; }
	hole.visible = true;
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	var offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX+offset.x;
		o.y = evt.stageY+offset.y;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > 540) { goNextScreen(); }
		else {
			hole.visible = false;
			o.set(chunkDProps2);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragDrops1(evt) {
	if (isMSIETouch) { dragging = true; }
	dropBotA.visible = dropTopA.visible = false;
	dropDragCont.set({x:evt.stageX-171, y:evt.stageY-28, mouseEnabled:true, visible:true, scaleX:1, scaleY:1});
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		dropDragCont.x = evt.stageX-171;
		dropDragCont.y = evt.stageY-28;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > 295 && evt.stageY > 10 && evt.stageX < 530 && evt.stageY < 395) { goNextScreen(); }
		else {
			dropDragCont.visible = false;
			dropBotA.visible = dropTopA.visible = true;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragDrops2(evt) {
	if (isMSIETouch) { dragging = true; }
	dropBotH.visible = dropTopH.visible = false;
	dropDragCont.set({x:evt.stageX+145, y:evt.stageY-20, mouseEnabled:true, visible:true, scaleX:-0.8784, scaleY:0.8784});
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		dropDragCont.x = evt.stageX+145;
		dropDragCont.y = evt.stageY-20;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (evt.stageX > 140 && evt.stageY > 5 && evt.stageX < 400 && evt.stageY < 325) { goNextScreen(); }
		else {
			dropDragCont.visible = false;
			dropBotH.visible = dropTopH.visible = true;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragSalts(evt) {
	if (isMSIETouch) { dragging = true; }
	cork1.visible = false;
	cork2.visible = true;
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	o.x = evt.stageX-45;
	o.y = evt.stageY-21;
	o.rotation = 295;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX-45;
		o.y = evt.stageY-21;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 340 && o.y > 15 && o.x < 575 && o.y < 320) { goNextScreen(); }
		else {
			o.set(saltProps6);
			cork1.visible = true;
			cork2.visible = false;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragFlask4(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	var offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX+offset.x;
		o.y = evt.stageY+offset.y;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 370 && o.y > -25 && o.x < 680 && o.y < 290) { goNextScreen(); }
		else {
			o.set(flaskProps4);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragFlask5(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	o.x = evt.stageX;
	o.y = evt.stageY;
	o.rotation = 60;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX;
		o.y = evt.stageY;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 405 && o.y > 95 && o.x < 630 && o.y < 360) { goNextScreen(); }
		else {
			o.set(flaskProps5b);
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
			window.location = "cyanide17.html";
		}
	}
	return false;
}

function goNextScreen() {
	if (!fgMoving) {
		if (curScreen < 8) {
			prvScreen = curScreen;
			gotoScreen(++curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = "cyanide18.html";
		}
	}
	return false;
}

function cutDone() {
	fgMoving = false;
	updateFG = true;
	chunkDrag.origScale = chunkDrag.scaleX;
	addRollOver(chunkDrag, true);
	addMouseDown(chunkDrag, dragChunk);
	boxText.innerHTML = "PUT THE LUNG SAMPLE IN THE FLASK.";
}

function chunk1Done() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	botContA.visible = true;
	Twn.get(botContA).to({x:543}, 1025, easeOut).call(screenReady);
	Twn.get(trayCont).to({x:-475, y:15}, 1000, easeOut).set(invis);
	Twn.get(knife).to({x:248, y:503}, 1000, easeOut).set(invis);
	Twn.get(bench).to(benchProps3, 1000, easeOut);
	Twn.get(flaskCont).to(flaskProps3, 1000, easeOut);
	Twn.get(chunk1).to(chunk1Props3, 1000, easeOut);
}

function dripAcidDone() {
	var Twn = createjs.Tween;
	splash.visible = dropDragCont.visible = false;
	dropTopA.visible = dropBotA.visible = chunk2.visible = true;
	chunk2.alpha = 0;
	Twn.get(chunk1).to({alpha:0}, 1500).set(invis);
	Twn.get(chunk2).to({alpha:1}, 1500).wait(300).call(chunk2Done);
}

function chunk2Done() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	steamer.visible = true;
	Twn.get(botContA).to({x:834}, 750, easeOut).set(invis);
	Twn.get(flaskCont).to(flaskProps4, 1000, easeOut);
	Twn.get(steamer).to(steamProps4, 1025, easeOut).call(screenReady);
}

function poolDone() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	steamR.visible = steamL.visible = false;
	iceCont.visible = true;
	Twn.get(bench).to(benchProps5, 1000, easeOut);
	Twn.get(flaskCont).to(flaskProps5b, 1000, easeOut);
	Twn.get(steamer).to(steamProps5, 1000, easeOut);
	Twn.get(iceCont).to(iceProps5, 1025, easeOut).wait(100).call(screenReady);
	flaskCont.origScale = flaskProps5b.scaleX; // bug fix
}

function pourDone() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	tubeFill1.visible = burnCont.visible = true;
	tubeFill1.alpha = 0;
	Twn.get(flaskCont).to({x:-200, y:-77}, 1000, easeOut).set(invis);
	Twn.get(steamer).to(steamProps6, 1000, easeOut).set(invis);
	Twn.get(iceCont).to(iceProps6a, 1000, easeOut);
	Twn.get(burnCont).to(burnProps6a, 1000, easeOut).call(function(){boxText.innerHTML="THE CONTENTS OF THE FLASK ARE TRANSFERRED TO A TEST TUBE.";});
	Twn.get(tubeFill1).wait(1750).to({alpha:1}, 900);
	Twn.get(cooled).wait(1750).to({alpha:0}, 925).set(invis).wait(1700).call(tubeFillDone);
}

function tubeFillDone() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	clearText();
	botContH.visible = botContS.visible = true;
	botContS.set(saltProps1);
	Twn.get(bench).to(benchProps6, 1000, easeOut);
	Twn.get(burnCont).to(burnProps6b, 1000, easeOut);
	Twn.get(iceCont).to(iceProps6b, 900, easeOut).set(invis);
	Twn.get(botContH).to({x:151}, 1000, easeOut);
	Twn.get(botContS).to(saltProps6, 1100, easeOut).call(screenReady);
}

function saltPourDone() {
	var Twn = createjs.Tween;
	botContS.set(saltProps6);
	cork1.visible = flame.visible = tubeFill2.visible = true;
	cork2.visible = false;
	flame.scaleY = 0;
	tubeFill2.alpha = 0;
	Twn.get(flame).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 200).wait(1900).to({scaleY:0}, 250).set(invis);
	Twn.get(tubeFill1).wait(1000).to({alpha:0}, 1450).set(invis);
	Twn.get(tubeFill2).wait(1000).to({alpha:1}, 1500).wait(250).call(screenReady);
}

function dripHclDone() {
	var Twn = createjs.Tween;
	dropTopH.visible = dropBotH.visible = true;
	dropDragCont.visible = false;
	tubeFill3.visible = true;
	tubeFill3.alpha = 0;
	Twn.get(tubeFill2).to({alpha:0}, 1450).set(invis);
	Twn.get(tubeFill3).to({alpha:1}, 1500).call(screenReady);
}

function screenReady() {
	fgMoving = false;
	updateFG = true;
	if (curScreen == 3) {
		boxText.innerHTML = "PUT DROPS OF ACID IN THE FLASK. THIS WILL HELP BREAK DOWN THE TISSUE.";
		botContA.origScale = botContA.scaleX;
		addRollOver(botContA, true);
		addMouseDown(botContA, dragDrops1);
	} else if (curScreen == 4) {
		boxText.innerHTML = "THE SAMPLE NEEDS TO BE HEATED. PUT THE FLASK ON THE STEAMER.";
		flaskCont.origScale = flaskCont.scaleX;
		addRollOver(flaskCont, true);
		addMouseDown(flaskCont, dragFlask4);
	} else if (curScreen == 5) {
		boxText.innerHTML = "POUR THE CONTENTS OF THE FLASK INTO THE ICE BATH.";
		flaskCont.origScale = flaskCont.scaleX;
		addRollOver(flaskCont, true);
		addMouseDown(flaskCont, dragFlask5);
	} else if (curScreen == 6) {
		boxText.innerHTML = "THESE LAST STEPS ARE CALLED THE \"PRUSSIAN BLUE\" TEST. FIRST, ADD IRON-RICH SALTS TO THE SAMPLE IN THE TEST TUBE.";
		botContS.origScale = botContS.scaleX;
		addRollOver(botContS, true);
		addMouseDown(botContS, dragSalts);
	} else if (curScreen == 7) {
		boxText.innerHTML = "AFTER THE SAMPLE HAS BEEN HEATED AGAIN, IT'S TIME FOR THE FINAL STEP. YOU'RE LOOKING FOR A BLUE GLOW, WHICH WILL INDICATE CYANIDE POISONING. GO AHEAD AND PLACE A FEW DROPS OF ACID IN THE TEST TUBE.";
		botContH.origScale = botContH.scaleX;
		addRollOver(botContH, true);
		addMouseDown(botContH, dragDrops2);
	} else if (curScreen == 8) {
		boxText.innerHTML = "A-HA! THAT BLUE GLOW IS EVIDENCE OF THE PRESENCE OF CYANIDE IN THE LUNGS. YOU'VE DISCOVERED WHAT KILLED THE JACKSONS!";
	}
}

function gotoScreen(n) {
	var Twn = createjs.Tween;
	var easeIn = createjs.Ease.circIn;
	switch (n) {
		case 1:
		chunkDrag.visible = false;
		deactivate(chunkDrag);
		knife.origScale = knife.scaleX;
		addRollOver(knife, true);
		addMouseDown(knife, dragKnife);
		boxText.innerHTML = "INSTRUCTIONS: CARVE OUT A LUNG SAMPLE USING THE KNIFE.";
		break;
		//- - - - - - - - - - - - - - - -
		case 2:
		if (curScreen > prvScreen) {
			clearText();
			hoverCut.visible = knife.visible = false;
			knife.set(knifeProps1);
			deactivate(knife);
			cut1Cont.alpha = 1;
			cut2Cont.alpha = cut3Cont.alpha = cut4Cont.alpha = chunkDrag.alpha = 0;
			cut1Cont.visible = cut2Cont.visible = cut3Cont.visible = cut4Cont.visible = chunkDrag.visible = true;
			Twn.get(cut1Cont).wait(300).to({alpha:0}, 100).set(invis);
			Twn.get(cut2Cont).wait(300).to({alpha:1}, 100).wait(300).to({alpha:0}, 100).set(invis);
			Twn.get(cut3Cont).wait(600).to({alpha:1}, 100).wait(300).to({alpha:0}, 100).set(invis);
			Twn.get(cut4Cont).wait(900).to({alpha:1}, 100).wait(300).set(invis).set(vis, knife);
			Twn.get(chunkDrag).wait(1200).to({alpha:1}, 100).call(cutDone);
			fgMoving = true;
		} else {
			hole.visible = chunk1.visible = botContA.visible = false;
			chunkDrag.visible = flaskCont.visible = knife.visible = trayCont.visible = true;
			botContA.x = 834;
			deactivate(botContA);
			chunkDrag.set(chunkDProps2);
			chunk1.set(chunk1Props1);
			flaskCont.set(flaskProps1);
			bench.set(benchProps1);
			knife.set(knifeProps1);
			trayCont.set(trayProps1);
			cutDone();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 3:
		if (curScreen > prvScreen) {
			clearText();
			hole.visible = chunk1.visible = true;
			chunkDrag.visible = false;
			deactivate(chunkDrag);
			chunk1.set({x:75, y:336, scaleX:0.962, scaleY:1.011});
			Twn.get(chunk1).to({x:65.5, y:345.5, scaleX:1.079, scaleY:0.913}, 100).to({x:71, y:338, scaleX:1, scaleY:1}, 100).wait(300).call(chunk1Done);
			fgMoving = true;
		} else {
			chunk1.set({visible:true, alpha:1});
			chunk2.visible = steamer.visible = false;
			flaskCont.set(flaskProps3);
			deactivate(flaskCont);
			botContA.set({x:543, visible:true});
			steamer.set(steamProps1);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 4:
		if (curScreen > prvScreen) {
			//clearText();
			dropBotA.visible = dropTopA.visible = false;
			dropDragCont.set({x:301, y:52, mouseEnabled:false, visible:true});
			deactivate(botContA);
			dripA1.set({y:111, visible:true});
			dripA2.y = dripA3.y = 111;
			Twn.get(dripA1).to({y:347}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
			Twn.get(dripA2).wait(500).set(vis).to({y:347}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
			Twn.get(dripA3).wait(1000).set(vis).to({y:347}, 500, easeIn).set(invis).set(vis, splash).wait(200).call(dripAcidDone);
			fgMoving = true;
		} else {
			deactivate(flaskCont);
			iceCont.visible = pool.visible = false;
			chunk2.set({visible:true, alpha:1});
			iceCont.x = 779;
			flaskCont.set(flaskProps4);
			steamer.set(steamProps4);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 5:
		if (curScreen > prvScreen) {
			//clearText();
			deactivate(flaskCont);
			flaskCont.set(flaskProps5a);
			steamL.visible = steamR.visible = pool.visible = true;
			pool.alpha = 0;
			Twn.get(chunk2).to({alpha:0}, 1500).set(invis);
			Twn.get(pool).to({alpha:1}, 1500).wait(300).call(poolDone);
			fgMoving = true;
		} else {
			iceCont.visible = pool.visible = iceCont.visible = flaskCont.visible = steamer.visible = true;
			botContS.visible = botContH.visible = burnCont.visible = false;
			deactivate(botContS);
			bench.set(benchProps5);
			burnCont.set(burnProps1);
			botContH.x = -49;
			iceCont.set(iceProps5);
			flaskCont.set(flaskProps5b);
			steamer.set(steamProps5);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 6:
		if (curScreen > prvScreen) {
			//clearText();
			deactivate(flaskCont);
			flaskCont.set(flaskProps6);
			pool.visible = false;
			pour.visible = cooled.visible = true;
			cooled.alpha = 0;
			pour.alpha = 1;
			Twn.get(pour).to({alpha:0}, 1100).set(invis);
			Twn.get(cooled).to({alpha:0.9}, 1125).wait(300).call(pourDone);
			fgMoving = true;
		} else {
			deactivate(botContH);
			tubeFill1.set({visible:true, alpha:1});
			tubeFill2.visible = false;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 7:
		if (curScreen > prvScreen) {
			//clearText();
			cork1.visible = false;
			cork2.visible = true;
			deactivate(botContS);
			botContS.set(saltProps7);
			saltPour.set({y:112, visible:true, alpha:1});
			Twn.get(saltPour).to({y:205, alpha:0}, 1000).set(invis).wait(300).call(saltPourDone);
			fgMoving = true;
		} else {
			tubeFill2.set({visible:true, alpha:1});
			tubeFill3.visible = false;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 8:
		//clearText();
		dropBotH.visible = dropTopH.visible = false;
		dropDragCont.set({x:427, y:50, mouseEnabled:false, visible:true, scaleX:-0.8784, scaleY:0.8784});
		deactivate(botContH);
		dripH1.set({y:106, visible:true, alpha:1});
		dripH2.set({y:106, alpha:1});
		dripH3.set({y:106, alpha:1});
		Twn.get(dripH1).to({y:255, alpha:0}, 500, easeIn).set(invis);
		Twn.get(dripH2).wait(500).set(vis).to({y:255, alpha:0}, 500, easeIn).set(invis).call(clearText);
		Twn.get(dripH3).wait(1000).set(vis).to({y:255, alpha:0}, 500, easeIn).set(invis).wait(200).call(dripHclDone);
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