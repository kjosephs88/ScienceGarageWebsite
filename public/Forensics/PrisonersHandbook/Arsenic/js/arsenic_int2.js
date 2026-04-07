var spritesLo, spritesHi;
var acidCont, ammoCont, ammoPour, beakBackCont, beakFront, bgCont, burner, chunk, clamp, coppBeak, copper1, copper2a, copper2b, copper2c, copper2d, copper3, coppFall, deposit1a, deposit1b, deposit2a, deposit2b, dried1, dried2, drip1, drip2, drip3, dropDragCont, dropBotA, dropTopA, fire1, fire2, fire3, fire4, flame1, flame2, liquid1, liquid2, liquid3, liquid4, pool1, pool2, pool3, pourAmmo1, pourAmmo2, pourAmmo3, pourPowd1, pourPowd2, pourPowd3, pourPowd4, powdCont, splash, steamer, stopOn, stopOff, stopper2a, stopper2b, timer, tongCont, tongCont, tongsBeak, tube, pourPowd;
var powdProps1 = {x:467, y:271, rotation:0, alpha:1};
var acidProps1 = {x:650, y:361, scaleX:1, scaleY:1};
var acidProps2 = {x:664, y:326, scaleX:0.798, scaleY:0.798};
var beakBkProps1 = {x:89, y:103, scaleX:1, scaleY:1};
var beakBkProps2 = {x:153, y:41, scaleX:0.746, scaleY:0.746};
var beakFtProps1 = {x:89, y:136, scaleX:1, scaleY:1};
var beakFtProps2 = {x:153, y:65, scaleX:0.746, scaleY:0.746};
var tongProps1 = {x:556, y:502, rotation:90, scaleX:0.767, scaleY:0.767};
var tongProps2 = {x:556, y:433, rotation:90, scaleX:0.767, scaleY:0.767};
var tongProps3 = {x:365, y:-13, rotation:54};
var tongProps4 = {x:332, y:286, rotation:90, scaleX:0.767, scaleY:0.767};
var tongProps5 = {x:638, y:131, rotation:15.6};
var tongProps6 = {x:482, y:214, rotation:67.6, scaleX:1, scaleY:1};
var tongProps7 = {x:582, y:394, rotation:90};
var tongProps8 = {x:404, y:-40, rotation:50};
var ammoProps1 = {x:501, y:112, alpha:0};
var ammoProps2 = {x:501, y:302, alpha:1, rotation:0};
var coppBkProps1 = {x:66, y:67, scaleX:1, scaleY:1, rotation:-29};
var coppBkProps2 = {x:51, y:316, scaleX:1.152, scaleY:1.152, rotation:-4.1};
var copp3Props1 = {x:272, y:85, rotation:13.232};
var copp3Props2 = {x:258, y:184, rotation:0};
var burnProps1 = {x:-158, y:164, scaleX:0.842, scaleY:0.842};
var burnProps2 = {x:32, y:74, scaleX:0.842, scaleY:0.842};
var burnProps3 = {x:128, y:30, scaleX:1, scaleY:1};
var intvID, waitCnt;

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

	var manifest = [{src:"img/ars2_sprites_lo.png", id:"sprites_lo"}, {src:"img/ars2_sprites_hi.png", id:"sprites_hi"}];
	var preload = new createjs.LoadQueue(true);
	preload.addEventListener("fileload", handleFileLoad);
	preload.addEventListener("complete", handleComplete);
	preload.loadManifest(manifest);

	var wall = new createjs.Shape();
	wall.graphics.f("#a5b1b7").dr(0, -74, 778, 164);

	var floor = new createjs.Shape();
	floor.graphics.f("#586266").dr(0, 90, 778, 398);

	bgCont = new createjs.Container();
	bgCont.addChild(wall, floor);
	fgStage.addChild(bgCont);

	fgStage.update();
}

function handleComplete(event) {
	document.getElementById("loader").className = "";

	spritesLo = new createjs.SpriteSheet({images:[assets["sprites_lo"]], frames:[[591,751,84,136],[321,513,114,222],[399,963,166,35],[282,353,238,53],[282,3,238,347],[815,448,95,208],[3,3,276,509],[568,959,139,61],[939,748,55,32],[151,991,119,15],[886,669,110,42],[778,784,46,155],[729,761,46,155],[875,784,45,155],[827,784,45,155],[886,714,108,31],[3,972,145,42],[754,525,8,38],[754,576,37,182],[399,834,183,61],[322,825,74,156],[794,659,89,122],[171,515,147,316],[3,515,165,454],[815,280,160,165],[954,625,12,41],[815,229,29,46],[321,738,81,84],[405,751,183,80],[282,409,209,101],[438,525,245,223],[523,229,250,293],[857,942,144,62],[710,942,144,62],[399,898,144,62],[954,448,9,174],[678,758,48,152],[923,784,44,45],[494,409,23,64],[978,280,23,206],[913,448,38,218],[546,898,59,58],[850,3,141,274],[923,832,42,39],[523,3,324,223],[923,874,50,37],[886,748,50,33],[608,890,50,51],[171,834,148,154],[776,229,36,344],[686,525,65,230]], animations:{acid:0,ammonia:1,beakerBkBot:2,beakerBkTop:3,beakerFt:4,bottle:5,burner:6,chunk:7,clamp:8,copper1:9,copper2a:10,deposit1a:11,deposit1b:12,deposit2a:13,deposit2b:14,dried1:15,dried2:16,drip:17,dropperB:18,dropperB2:19,dropperT:20,fire1:21,fire2:22,fire3:23,fire4:24,flame1:25,flame2:26,labelHyrdo:27,liquid1:28,liquid2:29,liquid3:30,liquid4:31,pool1:32,pool2:33,pool3:34,pourAmmo1:35,pourAmmo2:36,pourAmmo3:37,pourPowd1:38,pourPowd2:39,pourPowd3:40,pourPowd4:41,powder:42,splash:43,steamer:44,stopper:45,stopper2a:46,stopper2b:47,timer:48,tongs:49,tube:50}});

	spritesHi = new createjs.SpriteSheet({images:[assets["sprites_hi"]], frames:[[2,90,110,42],[2,46,110,42],[2,2,110,42],[2,134,22,117]], animations:{copper2b:0,copper2c:1,copper2d:2,copper3:3}});


	timer = new createjs.Sprite(spritesLo, "timer");
	timer.x = 271;
	timer.visible = false;
	fgStage.addChild(timer);

	steamer = new createjs.Sprite(spritesLo, "steamer");
	steamer.y = 265;
	steamer.visible = false;
	fgStage.addChild(steamer);



	var bottleA = new createjs.Sprite(spritesLo, "bottle");

	var acid = new createjs.Sprite(spritesLo, "acid");
	acid.x = 6;
	acid.y = 64;

	dropBotA = new createjs.Sprite(spritesLo, "dropperB");
	dropBotA.x = 29;
	dropBotA.y = 15;

	dropTopA = new createjs.Sprite(spritesLo, "dropperT");
	dropTopA.x = 10;
	dropTopA.y = -138;

	var labelA = new createjs.Sprite(spritesLo, "labelHyrdo");
	labelA.x = 12;
	labelA.y = 79;

	acidCont = new createjs.Container();
	acidCont.addChild(dropBotA, bottleA, acid, dropTopA, labelA);
	acidCont.regX = bottleA.getBounds().width/2;
	acidCont.regY = bottleA.getBounds().height/2;
	acidCont.cursor = "pointer";
	acidCont.mouseEnabled = acidCont.mouseChildren = false;
	acidCont.origScale = 1;
	acidCont.set(acidProps1);
	fgStage.addChild(acidCont);


	// BEAKER SANDWICH START...

	var beakerBkTop = new createjs.Sprite(spritesLo, "beakerBkTop");

	var beakerBkBot = new createjs.Sprite(spritesLo, "beakerBkBot");
	beakerBkBot.x = 34;
	beakerBkBot.y = 304;

	liquid1 = new createjs.Sprite(spritesLo, "liquid1");
	liquid1.x = 29;
	liquid1.y = 289;
	liquid1.visible = false;

	tongsBeak = new createjs.Sprite(spritesLo, "tongs");
	tongsBeak.regX = tongsBeak.getBounds().width/2;
	tongsBeak.regY = tongsBeak.getBounds().height/2;
	tongsBeak.x = 172;
	tongsBeak.y = 146;
	tongsBeak.rotation = 11.4;
	tongsBeak.origScale = 1;
	tongsBeak.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-24,-22,85,390));
	tongsBeak.cursor = "pointer";
	tongsBeak.mouseEnabled = tongsBeak.mouseChildren = false;
	tongsBeak.visible = false;

	coppBeak = new createjs.Sprite(spritesLo, "copper1");
	coppBeak.visible = false;

	dried2 = new createjs.Sprite(spritesLo, "dried2");
	dried2.x = 49;
	dried2.y = 310;
	dried2.visible = false;

	beakBackCont = new createjs.Container();
	beakBackCont.addChild(beakerBkTop, beakerBkBot, liquid1, coppBeak, tongsBeak, dried2);
	beakBackCont.set(beakBkProps1);
	fgStage.addChild(beakBackCont);

	chunk = new createjs.Sprite(spritesLo, "chunk");
	chunk.x = 142;
	chunk.y = 394;
	fgStage.addChild(chunk);


	powdPour = new createjs.Sprite(spritesLo, "powder");
	powdPour.x = 287;
	powdPour.y = 147;
	powdPour.rotation = 261;
	powdPour.visible = false;
	fgStage.addChild(powdPour);

	pourPowd1 = new createjs.Sprite(spritesLo, "pourPowd1");
	pourPowd1.x = 265;
	pourPowd1.y = 82;
	pourPowd1.visible = false;
	fgStage.addChild(pourPowd1);

	pourPowd2 = new createjs.Sprite(spritesLo, "pourPowd2");
	pourPowd2.x = 267;
	pourPowd2.y = 88;
	pourPowd2.visible = false;
	fgStage.addChild(pourPowd2);

	pourPowd3 = new createjs.Sprite(spritesLo, "pourPowd3");
	pourPowd3.x = 250;
	pourPowd3.y = 197;
	pourPowd3.visible = false;
	fgStage.addChild(pourPowd3);

	pourPowd4 = new createjs.Sprite(spritesLo, "pourPowd4");
	pourPowd4.x = 228;
	pourPowd4.y = 393;
	pourPowd4.visible = false;
	fgStage.addChild(pourPowd4);


	ammoPour = new createjs.Sprite(spritesLo, "ammonia");
	ammoPour.x = 280;
	ammoPour.y = 91;
	ammoPour.rotation = 265;
	ammoPour.visible = false;
	fgStage.addChild(ammoPour);

	pourAmmo1 = new createjs.Sprite(spritesLo, "pourAmmo1");
	pourAmmo1.x = 277;
	pourAmmo1.y = 51;
	pourAmmo1.visible = false;
	fgStage.addChild(pourAmmo1);

	pourAmmo2 = new createjs.Sprite(spritesLo, "pourAmmo2");
	pourAmmo2.x = 253;
	pourAmmo2.y = 141;
	pourAmmo2.visible = false;
	fgStage.addChild(pourAmmo2);

	pourAmmo3 = new createjs.Sprite(spritesLo, "pourAmmo3");
	pourAmmo3.x = 252;
	pourAmmo3.y = 255;
	pourAmmo3.visible = false;
	fgStage.addChild(pourAmmo3);


	pool1 = new createjs.Sprite(spritesLo, "pool1");
	pool1.x = 137;
	pool1.y = 393;
	pool1.visible = false;
	fgStage.addChild(pool1);

	pool2 = new createjs.Sprite(spritesLo, "pool2");
	pool2.x = 137;
	pool2.y = 393;
	pool2.visible = false;
	fgStage.addChild(pool2);

	pool3 = new createjs.Sprite(spritesLo, "pool3");
	pool3.x = 137;
	pool3.y = 393;
	pool3.visible = false;
	fgStage.addChild(pool3);


	drip1 = new createjs.Sprite(spritesLo, "drip");
	drip1.visible = false;
	fgStage.addChild(drip1);

	drip2 = new createjs.Sprite(spritesLo, "drip");
	drip2.visible = false;
	fgStage.addChild(drip2);

	drip3 = new createjs.Sprite(spritesLo, "drip");
	drip3.visible = false;
	fgStage.addChild(drip3);

	splash = new createjs.Sprite(spritesLo, "splash");
	splash.visible = false;
	fgStage.addChild(splash);


	fire1 = new createjs.Sprite(spritesLo, "fire1");
	fire1.x = 177;
	fire1.y = 288;
	fire1.visible = false;
	fgStage.addChild(fire1);

	fire2 = new createjs.Sprite(spritesLo, "fire2");
	fire2.x = 135;
	fire2.y = 136;
	fire2.visible = false;
	fgStage.addChild(fire2);

	fire3 = new createjs.Sprite(spritesLo, "fire3");
	fire3.x = 129;
	fire3.y = 11;
	fire3.visible = false;
	fgStage.addChild(fire3);

	fire4 = new createjs.Sprite(spritesLo, "fire4");
	fire4.x = 134;
	fire4.y = 303;
	fire4.visible = false;
	fgStage.addChild(fire4);


	liquid2 = new createjs.Sprite(spritesLo, "liquid2");
	liquid2.x = 140;
	liquid2.y = 220;
	liquid2.visible = false;
	fgStage.addChild(liquid2);

	liquid3 = new createjs.Sprite(spritesLo, "liquid3");
	liquid3.x = 116;
	liquid3.y = 93;
	liquid3.visible = false;
	fgStage.addChild(liquid3);

	liquid4 = new createjs.Sprite(spritesLo, "liquid4");
	liquid4.x = 116;
	liquid4.y = 23;
	liquid4.visible = false;
	fgStage.addChild(liquid4);

	dried1 = new createjs.Sprite(spritesLo, "dried1");
	dried1.x = 190;
	dried1.y = 273;
	dried1.visible = false;
	fgStage.addChild(dried1);


	beakFront = new createjs.Sprite(spritesLo, "beakerFt");
	beakFront.set(beakFtProps1);
	beakFront.mouseEnabled = false;
	fgStage.addChild(beakFront);

	// ...BEAKER SANDWICH END



	stopOff = new createjs.Sprite(spritesLo, "stopper");
	stopOff.x = 342;
	stopOff.y = 402;
	stopOff.visible = false;
	fgStage.addChild(stopOff);


	var powder = new createjs.Sprite(spritesLo, "powder");

	stopOn = new createjs.Sprite(spritesLo, "stopper");
	stopOn.x = 47;
	stopOn.y = -24;

	powdCont = new createjs.Container();
	powdCont.addChild(powder, stopOn);
	powdCont.regX = powder.getBounds().width/2;
	powdCont.regY = powder.getBounds().height/2;
	powdCont.cursor = "pointer";
	powdCont.mouseEnabled = powdCont.mouseChildren = false;
	powdCont.origScale = 1;
	powdCont.set(powdProps1);
	fgStage.addChild(powdCont);



	var dropBotDrag = new createjs.Sprite(spritesLo, "dropperB2");

	var dropTopDrag = new createjs.Sprite(spritesLo, "dropperT");
	dropTopDrag.rotation = -282;
	dropTopDrag.x = 320;
	dropTopDrag.y = -50.5;

	dropDragCont = new createjs.Container();
	dropDragCont.addChild(dropBotDrag, dropTopDrag);
	dropDragCont.visible = false;
	dropDragCont.cursor = "pointer";
	fgStage.addChild(dropDragCont);



	burner = new createjs.Sprite(spritesLo, "burner");
	burner.visible = false;
	fgStage.addChild(burner);

	flame1 = new createjs.Sprite(spritesLo, "flame1");
	flame1.x = 259;
	flame1.y = 358;
	flame1.regY = flame1.getBounds().height;
	flame1.visible = false;
	fgStage.addChild(flame1);

	flame2 = new createjs.Sprite(spritesLo, "flame2");
	flame2.x = 251;
	flame2.y = 312;
	flame2.visible = false;
	fgStage.addChild(flame2);


	copper1 = new createjs.Sprite(spritesLo, "copper1");
	copper1.x = 432;
	copper1.visible = false;
	fgStage.addChild(copper1);



	tube = new createjs.Sprite(spritesLo, "tube");
	tube.x = 235;
	tube.y = 81;
	tube.visible = false;
	fgStage.addChild(tube);

	copper3 = new createjs.Sprite(spritesHi, "copper3");
	copper3.visible = false;
	fgStage.addChild(copper3);

	deposit1a = new createjs.Sprite(spritesLo, "deposit1a");
	deposit1a.x = 245;
	deposit1a.y = 154;
	deposit1a.visible = false;
	fgStage.addChild(deposit1a);

	deposit1b = new createjs.Sprite(spritesLo, "deposit1b");
	deposit1b.x = deposit1a.x;
	deposit1b.y = deposit1a.y;
	deposit1b.visible = false;
	fgStage.addChild(deposit1b);

	deposit2a = new createjs.Sprite(spritesLo, "deposit2a");
	deposit2a.x = deposit1a.x;
	deposit2a.y = deposit1a.y;
	deposit2a.visible = false;
	fgStage.addChild(deposit2a);

	deposit2b = new createjs.Sprite(spritesLo, "deposit2b");
	deposit2b.x = deposit1a.x;
	deposit2b.y = deposit1a.y;
	deposit2b.visible = false;
	fgStage.addChild(deposit2b);

	clamp = new createjs.Sprite(spritesLo, "clamp");
	clamp.x = 229;
	clamp.y = 193;
	clamp.visible = false;
	fgStage.addChild(clamp);


	var tongs = new createjs.Sprite(spritesLo, "tongs");

	copper2a = new createjs.Sprite(spritesLo, "copper2a");
	copper2a.x = -23;
	copper2a.y = 412;
	copper2a.rotation = -68.094;
	copper2a.visible = false;

	copper2b = new createjs.Sprite(spritesHi, "copper2b");
	copper2b.x = copper2a.x;
	copper2b.y = copper2a.y;
	copper2b.rotation = copper2a.rotation;
	copper2b.visible = false;

	copper2c = new createjs.Sprite(spritesHi, "copper2c");
	copper2c.x = copper2a.x;
	copper2c.y = copper2a.y;
	copper2c.rotation = copper2a.rotation;
	copper2c.visible = false;

	copper2d = new createjs.Sprite(spritesHi, "copper2d");
	copper2d.x = copper2a.x;
	copper2d.y = copper2a.y;
	copper2d.rotation = copper2a.rotation;
	copper2d.visible = false;

	tongCont = new createjs.Container();
	tongCont.addChild(tongs, copper2a, copper2b, copper2c, copper2d);
	tongCont.regX = tongs.getBounds().width/2;
	tongCont.regY = tongs.getBounds().height/2;
	tongCont.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-24,-22,85,390));
	tongCont.visible = false;
	tongCont.cursor = "pointer";
	tongCont.mouseEnabled = tongCont.mouseChildren = false;
	fgStage.addChild(tongCont);



	stopper2b = new createjs.Sprite(spritesLo, "stopper2b");
	stopper2b.x = 387;
	stopper2b.y = 359;
	stopper2b.visible = false;
	fgStage.addChild(stopper2b);

	var ammonia = new createjs.Sprite(spritesLo, "ammonia");

	stopper2a = new createjs.Sprite(spritesLo, "stopper2a");
	stopper2a.x = 32;
	stopper2a.y = -23;

	ammoCont = new createjs.Container();
	ammoCont.addChild(ammonia, stopper2a);
	ammoCont.regX = ammonia.getBounds().width/2;
	ammoCont.regY = ammonia.getBounds().height/2;
	ammoCont.origScale = 1;
	ammoCont.visible = false;
	ammoCont.cursor = "pointer";
	ammoCont.mouseEnabled = ammoCont.mouseChildren = false;
	fgStage.addChild(ammoCont);



	gotoScreen(1);
	createjs.Ticker.addEventListener("tick", tick);
}

function dragPowder(evt) {
	if (isMSIETouch) { dragging = true; }
	stopOn.visible = false;
	stopOff.visible = true;
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	o.x = evt.stageX;
	o.y = evt.stageY;
	o.rotation = 300;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX;
		o.y = evt.stageY;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 51 && o.y > 22 && o.x < 428 && o.y < 488) { goNextScreen(); }
		else {
			powdCont.set(powdProps1);
			stopOn.visible = true;
			stopOff.visible = false;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragDrops(evt) {
	if (isMSIETouch) { dragging = true; }
	dropBotA.visible = dropTopA.visible = false;
	if (curScreen == 4) { fgStage.swapChildren(ammoCont, dropDragCont); }
	var loX, hiX, hiY, offset, scaleAmt;
	if (curScreen == 2) {
		loX = -90;
		hiX = 330;
		hiY = 420;
		offset = {x:159, y:24};
		scaleAmt = 1;
	} else {
		loX = 45;
		hiX = 375;
		hiY = 310;
		offset = {x:122, y:18};
		scaleAmt = 0.775;
	}

	dropDragCont.set({x:evt.stageX-offset.x, y:evt.stageY-offset.y, scaleX:scaleAmt, scaleY:scaleAmt, mouseEnabled:true, visible:true});
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		dropDragCont.x = evt.stageX-offset.x;
		dropDragCont.y = evt.stageY-offset.y;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (curScreen == 4) { fgStage.swapChildren(ammoCont, dropDragCont); }
		if (dropDragCont.x > loX && dropDragCont.x < hiX && dropDragCont.y < hiY) { goNextScreen(); }
		else {
			dropDragCont.visible = false;
			dropBotA.visible = dropTopA.visible = true;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragAmmo(evt) {
	if (isMSIETouch) { dragging = true; }
	stopper2a.visible = false;
	stopper2b.visible = true;
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	o.x = evt.stageX;
	o.y = evt.stageY;
	o.rotation = 300;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX;
		o.y = evt.stageY;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 115 && o.y > 25 && o.x < 435 && o.y < 340) { goNextScreen(); }
		else {
			o.set(ammoProps2);
			addRollOver(o);
			stopper2a.visible = true;
			stopper2b.visible = false;
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragTongs(evt) {
	if (isMSIETouch) { dragging = true; }
	fgStage.swapChildren(ammoCont, tongCont);
	copper2a.visible = true;
	copper1.visible = false;
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	var offset = {x:72, y:-33};
	o.set({x:evt.stageX+offset.x, y:evt.stageY+offset.y, rotation:70});
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.set({x:evt.stageX+offset.x, y:evt.stageY+offset.y, rotation:70});
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 185 && o.x < 480 && o.y < 260) { goNextScreen(); }
		else {
			o.set(tongProps2);
			addRollOver(o);
			copper2a.visible = false;
			copper1.visible = true;
		}
		fgStage.swapChildren(ammoCont, tongCont);
		removeDragListeners(fgStage);
		updateFG = true;
	});
}

function dragTongs2(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = o.origScale;
	var offset = {x:72, y:-33};
	o.set({x:evt.stageX+offset.x, y:evt.stageY+offset.y, rotation:70});
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.set({x:evt.stageX+offset.x, y:evt.stageY+offset.y, rotation:70});
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 300 && o.x < 570 && o.y < 270) { goNextScreen(); }
		else {
			o.set(tongProps7);
			addRollOver(o);
		}
		removeDragListeners(fgStage);
		updateFG = true;
	});
}

function pressTongsBeak(evt) {
	var o = evt.currentTarget;
	deactivate(o);
	o.scaleX = o.scaleY = o.origScale;
	goNextScreen();
}

function heatCopper() {
	var Twn = createjs.Tween;
	tongCont.origScale = tongCont.scaleX;
	flame1.visible = copper2b.visible = copper2c.visible = copper2d.visible = true;
	copper2b.alpha = copper2c.alpha = copper2d.alpha = 0
	flame1.scaleY = 0;
	Twn.get(flame1).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 200).set(invis).set(vis, flame2);
	var fadeTm = 1500;
	var hangTm = 150;
	Twn.get(copper2a).wait(fadeTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(copper2b).wait(fadeTm).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(copper2c).wait((2*fadeTm)+hangTm).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(copper2d).wait((3*fadeTm)+(2*hangTm)).to({alpha:1}, fadeTm).wait(1000).call(heatCoppDone);

}

function heatCoppDone() {
	clearText();
	var Twn = createjs.Tween;
	flame1.visible = tube.visible = clamp.visible = true;
	flame2.visible = false;
	tube.alpha = clamp.alpha = 0;
	Twn.get(flame1).to({scaleY:0}, 250).set(invis);
	Twn.get(tongCont).wait(500).to(tongProps7, 525).call(screenReady);
	Twn.get(tube).wait(500).to({alpha:1}, 500);
	Twn.get(clamp).wait(500).to({alpha:1}, 500);
}

function heatTubeDone() {
	var Twn = createjs.Tween;
	if (window.location.href.indexOf("int2a") != -1) {
		deposit1a.visible = deposit1b.visible = true;
		deposit1a.alpha = deposit1b.alpha = 0;
		Twn.get(deposit1a).to({alpha:1}, 1250).wait(1000).to({alpha:0}, 250).set(invis);
		Twn.get(deposit1b).wait(1250).to({alpha:1}, 1250).call(screenReady);
	} else {
		deposit2a.visible = deposit2b.visible = true;
		deposit2a.alpha = deposit2b.alpha = 0;
		Twn.get(deposit2a).to({alpha:1}, 1250).to({alpha:0}, 1250).set(invis);
		Twn.get(deposit2b).wait(1250).to({alpha:1}, 1250).call(screenReady);
	}
}

function powdPourDone() {
	powdCont.set(powdProps1);
	stopOn.visible = powdCont.visible = true;
	stopOff.visible = powdPour.visible = false;
	screenReady();
}

function ammoPourDone() {
	ammoCont.set(ammoProps2);
	stopper2a.visible = ammoCont.visible = true;
	stopper2b.visible = ammoPour.visible = false;
	screenReady();
}

function dripAcidDone() {
	var Twn = createjs.Tween;
	splash.visible = dropDragCont.visible = false;
	dropTopA.visible = dropBotA.visible = true;
	if (curScreen == 3) {
		fire1.visible = fire2.visible = fire3.visible = fire4.visible = liquid1.visible = true;
		fire1.alpha = fire2.alpha = fire3.alpha = fire4.alpha = liquid1.alpha = 0;
		var fadeTm = 400;
		var hangTm = 250;
		Twn.get(fire1).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
		Twn.get(fire2).wait(fadeTm+hangTm).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
		Twn.get(fire3).wait(2*(fadeTm+hangTm)).to({alpha:1}, fadeTm).set(invis, chunk).set(invis, pool3).set(invis, pourPowd4).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
		Twn.get(fire4).wait(3*(fadeTm+hangTm)).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
		Twn.get(liquid1).wait(4*(fadeTm+hangTm)).to({alpha:1}, fadeTm).call(fireDone);
	} else {
		screenReady();
	}
}

function fireDone() {
	//clearText();
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	steamer.x = -323;
	steamer.visible = tongCont.visible = copper1.visible = ammoCont.visible = true;
	copper1.y = 526;
	ammoCont.set(ammoProps1);
	ammoCont.alpha = 0;
	tongCont.set(tongProps1);
	tongCont.origScale = tongCont.scaleX;
	Twn.get(beakBackCont).to(beakBkProps2, 1500, easeOut);
	Twn.get(beakFront).to(beakFtProps2, 1500, easeOut);
	Twn.get(steamer).to({x:57}, 1500, easeOut);
	Twn.get(tongCont).to(tongProps2, 1200, easeOut);
	Twn.get(copper1).to({y:457}, 1200, easeOut);
	Twn.get(powdCont).to({y:91, alpha:0}, 900).set(invis);
	Twn.get(ammoCont).wait(525).to(ammoProps2, 1000, easeOut).wait(750).call(boilLiquid);
	Twn.get(acidCont).to(acidProps2, 1300, easeOut);
	Twn.get(bgCont).to({y:72}, 1500, easeOut).call(function(){boxText.innerHTML="WE BOIL AWAY THE EXCESS CHLORINE AND...";});
}

function boilLiquid() {
	var Twn = createjs.Tween;
	liquid2.visible = liquid3.visible = liquid4.visible = dried1.visible = dried2.visible = true;
	liquid2.alpha = liquid3.alpha = liquid4.alpha = dried1.alpha = dried2.alpha = 0;
	var fadeTm = 400;
	var hangTm = 250;
	Twn.get(liquid1).to({alpha:0}, fadeTm).set(invis);
	Twn.get(liquid2).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(liquid3).wait(fadeTm+hangTm).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(liquid4).wait(2*(fadeTm+hangTm)).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(dried1).wait(3*(fadeTm+hangTm)).to({alpha:1}, fadeTm).wait(hangTm).to({alpha:0}, fadeTm).set(invis);
	Twn.get(dried2).wait(4*(fadeTm+hangTm)).to({alpha:1}, fadeTm).call(screenReady);
}

function burnerEnter() {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	burner.visible = timer.visible = true;
	burner.set(burnProps1);
	timer.y = -153;
	Twn.get(beakBackCont).to({x:513}, 1500, easeOut);
	Twn.get(beakFront).to({x:513}, 1500, easeOut);
	Twn.get(timer).to({y:92}, 1250, easeOut);
	Twn.get(burner).to(burnProps2, 1500, easeOut);
	Twn.get(tongCont).to(tongProps4, 1500, easeOut)
	Twn.get(acidCont).to({x:932}, 1500, easeOut).set(invis);
	Twn.get(ammoCont).to({x:837}, 1500, easeOut).set(invis);
	Twn.get(steamer).to({x:417}, 1525, easeOut).call(waitHours);
	boxText.innerHTML = "LEAVE THE STRIP THERE FOR A FEW HOURS. ";
}

function waitHours() {
	waitCnt = 0;
	intvID = setInterval(countHours, 1250);
}

function countHours() {
	if (++waitCnt < 4) { boxText.innerHTML += "WAITING... "; }
	else {
		clearInterval(intvID);
		screenReady();
	}
}

function goPrevScreen() {
	if (!fgMoving) {
		if (curScreen > 1) {
			prvScreen = curScreen;
			gotoScreen(--curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = (window.location.href.indexOf("int2a") != -1) ? "arsenic_int1a.html" : "arsenic_int1b.html";
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
			window.location = (window.location.href.indexOf("int2a") != -1) ? "arsenic05.html" : "arsenic13.html";;
		}
	}
	return false;
}

function screenReady() {
	fgMoving = false;
	updateFG = true;
	if (curScreen == 2) {
		boxText.innerHTML = "ADD A FEW DROPS OF HYDROCHLORIC ACID, AND THEN STAND BACK! THIS COMBINATION OF CHEMICALS WILL BURN, REDUCING THE TISSUE TO A YELLOW LIQUID.";
		acidCont.origScale = 1;
		addRollOver(acidCont, true);
		addMouseDown(acidCont, dragDrops);
	} else if (curScreen == 3) {
		boxText.innerHTML = "POUR SOME AMMONIA INTO THE BEAKER TO NEUTRALIZE THE MATERIAL.";
		addRollOver(ammoCont, true);
		addMouseDown(ammoCont, dragAmmo);
	} else if (curScreen == 4) {
		boxText.innerHTML = "ADD A FEW MORE DROPS OF HYDROCHLORIC ACID TO THE BEAKER TO MAKE IT SLIGHTLY MORE ACIDIC.";
		acidCont.origScale = 0.798;
		addRollOver(acidCont, true);
		addMouseDown(acidCont, dragDrops);
	} else if (curScreen == 5) {
		boxText.innerHTML = "USE THE TONGS TO PLACE THE COPPER STRIP INTO THE BROKEN-DOWN TISSUE SAMPLE.";
		addRollOver(tongCont, true);
		addMouseDown(tongCont, dragTongs);
	} else if (curScreen == 6) {
		boxText.innerHTML = "USE THE TONGS TO REMOVE THE COPPER STRIP FROM THE SAMPLE AND THEN HEAT IT WITH THE BUNSEN BURNER.";
		tongCont.visible = false;
		tongsBeak.visible = true;
		addRollOver(tongsBeak, true);
		addMouseDown(tongsBeak, pressTongsBeak);
	} else if (curScreen == 7) {
		boxText.innerHTML = "A-HA! THAT DARK LAYER ON THE COPPER STRIP INDICATES A POISON, BUT WHICH ONE? TO FIND OUT, PUT THE TARNISHED COPPER STRIP INTO A TEST TUBE, AND HEAT IT AGAIN.";
		addRollOver(tongCont, true);
		addMouseDown(tongCont, dragTongs2);
	} else if (curScreen == 8) {
		if (window.location.href.indexOf("int2a") != -1) { boxText.innerHTML = "THIS PROCESS TRANSFERS THE POISONOUS FILM FROM THE COPPER STRIP TO THE INTERIOR OF THE TEST TUBE. IN THIS CASE THE DARK COATING, WITH JUST A SPARKLE OR TWO, INDICATES TWO SUBSTANCES &mdash; BISMUTH AND LEAD &mdash; BUT NO ARSENIC."; }
		else { boxText.innerHTML = "THIS PROCESS TRANSFERS THE POISONOUS FILM FROM THE COPPER STRIP TO THE INTERIOR OF THE TEST TUBE. IN THIS CASE THE LIGHT COATING, FULL OF SPARKLING CRYSTALS, INDICATES ARSENIC! SO BOTH TESTS INDICATE HEAVY ARSENIC POISONING."; }
	}
}

function gotoScreen(n) {
	var Twn = createjs.Tween;
	var easeIn = createjs.Ease.circIn;
	var easeOut = createjs.Ease.circOut;
	switch (n) {
		case 1:
		addRollOver(powdCont, true);
		addMouseDown(powdCont, dragPowder);
		boxText.innerHTML = "REINSCH'S TEST IS A SECOND TEST FOR ARSENIC, TO DOUBLE-CHECK THE RESULTS OF THE MARSH TEST. FIRST, ADD POTASSIUM CHLORATE TO A DIFFERENT TISSUE SAMPLE.";
		if (curScreen < prvScreen) {
			deactivate(acidCont);
			pourPowd4.visible = false;
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 2:
		if (curScreen > prvScreen) {
			//clearText();
			stopOn.visible = powdCont.visible = false;
			stopOff.visible = powdPour.visible = pourPowd1.visible = pourPowd2.visible = pourPowd3.visible = pourPowd4.visible = true;
			pourPowd1.alpha = pourPowd2.alpha = pourPowd3.alpha = pourPowd4.alpha = 0;
			deactivate(powdCont);
			var intvl = 200;
			Twn.get(pourPowd1).to({alpha:1}, intvl).to({alpha:0}, intvl).set(invis);
			Twn.get(pourPowd2).wait(intvl).to({alpha:1}, intvl).to({alpha:0}, intvl).set(invis);
			Twn.get(pourPowd3).wait(2*intvl).to({alpha:1}, intvl).to({alpha:0}, intvl).set(invis);
			Twn.get(pourPowd4).wait(3*intvl).to({alpha:1}, intvl).call(powdPourDone);
			fgMoving = true;
		} else {
			deactivate(ammoCont);
			dried2.visible = steamer.visible = ammoCont.visible = tongCont.visible = copper1.visible = false;
			chunk.visible = pourPowd4.visible = acidCont.visible = powdCont.visible = true;
			acidCont.set(acidProps1);
			powdCont.set(powdProps1);
			beakBackCont.set(beakBkProps1);
			beakFront.set(beakFtProps1);
			bgCont.y = 0;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 3:
		deactivate(acidCont);
		if (curScreen > prvScreen) {
			//clearText();
			dropBotA.visible = dropTopA.visible = false;
			dropDragCont.set({x:218, y:72, mouseEnabled:false, visible:true});
			drip1.visible = true;
			drip1.x = drip2.x = drip3.x = 216;
			drip1.y = drip2.y = drip3.y = 127;
			drip1.scaleX = drip2.scaleX = drip3.scaleX = drip1.scaleY = drip2.scaleY = drip3.scaleY = 1;
			splash.x = 200;
			splash.y = 391;
			Twn.get(drip1).to({y:377}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash).set(vis, pool1);
			Twn.get(drip2).wait(500).set(vis).to({y:377}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash).set(invis, pool1).set(vis, pool2);
			Twn.get(drip3).wait(1000).set(vis).to({y:377}, 500, easeIn).set(invis).set(vis, splash).set(invis, pool2).set(vis, pool3).wait(200).call(dripAcidDone);
			fgMoving = true;
		} else {
			bgCont.y = 72;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 4:
		if (curScreen > prvScreen) {
			//clearText();
			stopper2a.visible = ammoCont.visible = false;
			stopper2b.visible = ammoPour.visible = true;
			deactivate(ammoCont);
			pourAmmo1.visible = pourAmmo2.visible = pourAmmo3.visible = true;
			pourAmmo1.alpha = pourAmmo2.alpha = pourAmmo3.alpha = 0;
			var intvl = 300;
			Twn.get(pourAmmo1).to({alpha:1}, intvl).to({alpha:0}, intvl).set(invis);
			Twn.get(pourAmmo2).wait(intvl).to({alpha:1}, intvl).to({alpha:0}, intvl).set(invis);
			Twn.get(pourAmmo3).wait(2*intvl).to({alpha:1}, intvl).to({alpha:0}, intvl).set(invis).call(ammoPourDone);
			fgMoving = true;
		} else {
			deactivate(tongCont);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 5:
		if (curScreen > prvScreen) {
			//clearText();
			dropBotA.visible = dropTopA.visible = false;
			dropDragCont.set({x:245, y:24, scaleX:0.775, scaleY:0.775, mouseEnabled:false, visible:true});
			deactivate(acidCont);
			drip1.visible = true;
			drip1.x = drip2.x = drip3.x = 243;
			drip1.y = drip2.y = drip3.y = 67;
			drip1.scaleX = drip2.scaleX = drip3.scaleX = drip1.scaleY = drip2.scaleY = drip3.scaleY = 0.75;
			splash.x = 227;
			splash.y = 266;
			Twn.get(drip1).to({y:261}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
			Twn.get(drip2).wait(500).set(vis).to({y:261}, 500, easeIn).set(invis).set(vis, splash).wait(200).set(invis, splash);
			Twn.get(drip3).wait(1000).set(vis).to({y:261}, 500, easeIn).set(invis).set(vis, splash).wait(200).call(dripAcidDone);
			fgMoving = true;
		} else {
			tongsBeak.visible = timer.visible = coppBeak.visible = burner.visible = false;
			tongCont.visible = copper1.visible = ammoCont.visible = acidCont.visible = true;
			steamer.x = 57;
			copper1.y = 457;
			deactivate(tongsBeak);
			ammoCont.set(ammoProps2);
			acidCont.set(acidProps2);
			tongCont.set(tongProps2);
			tongCont.origScale = tongCont.scaleX;
			beakBackCont.set(beakBkProps2);
			beakFront.set(beakFtProps2);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 6:
		deactivate(tongCont);
		if (curScreen > prvScreen) {
			//clearText();
			copper2a.visible = copper1.visible = false;
			coppBeak.visible = true;
			tongCont.set(tongProps3);
			coppBeak.set(coppBkProps1);
			Twn.get(coppBeak).to(coppBkProps2, 1000).wait(500).call(burnerEnter);
			fgMoving = true;
		} else {
			tongCont.visible = copper2d.visible = clamp.visible = tube.visible = false;
			steamer.visible = timer.visible = coppBeak.visible = tongsBeak.visible = beakBackCont.visible = beakFront.visible = true;
			steamer.x = 417;
			timer.y = 92;
			bgCont.y = 72;
			copper2a.alpha = 1;
			beakBackCont.x = beakFront.x = 513;
			burner.set(burnProps2);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 7:
		if (curScreen > prvScreen) {
			copper2a.visible = tongCont.visible = true;
			tongsBeak.visible = coppBeak.visible = false;
			tongCont.set(tongProps5);
			Twn.get(tongCont).to(tongProps6, 1525, easeOut).call(heatCopper);
			Twn.get(bgCont).to({y:0}, 1500, easeOut);
			Twn.get(burner).to(burnProps3, 1500, easeOut);
			Twn.get(steamer).to({x:778}, 1500, easeOut).set(invis);
			Twn.get(timer).to({y:-154}, 1250, easeOut).set(invis);
			Twn.get(beakBackCont).to({x:778}, 1500, easeOut).set(invis);
			Twn.get(beakFront).to({x:778}, 1500, easeOut).set(invis);
			fgMoving = true;
		} else {
			copper3.visible = deposit1b.visible = deposit2b.visible = false;
			copper2d.visible = true;
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 8:
		//clearText();
		deactivate(tongCont);
		copper2d.visible = false;
		copper3.visible = flame1.visible = true;
		flame1.scaleY = 0;
		tongCont.set(tongProps8);
		copper3.set(copp3Props1);
		Twn.get(copper3).to(copp3Props2, 500, easeOut).wait(250).set(tongProps7, tongCont);
		createjs.Tween.get(flame1).wait(1000).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 100).to({scaleY:0}, 100).to({scaleY:1}, 200).set(invis).set(vis, flame2).wait(3000).set(invis, flame2).set(vis).to({scaleY:0}, 250).set(invis).call(clearText).wait(1000).call(heatTubeDone);
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