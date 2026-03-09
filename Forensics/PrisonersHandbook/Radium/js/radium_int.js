var glob = this;
var sprites, spritesLarge, spritesCal;
var intvID, timID, list6, idx6, bench1, bench2, brush, wall1, wall2, floor, bonesPot, bone1, bone2, bone3, bone4, clean1, clean2, clean3, clean4, wrap1, wrap2, wrap3, wrap4, pot, tongs1, tongs2, papCont, papLg1, papLg2, papLg3, papLg4, papLgFld, calCont, day1, day2, day3, day4, day5, day6, day7, day8, day9, day10, trayCont, film4, film3, film2, film1, devel, line, pin1, pin2, pin3, pin4, lineCont, hangCont, holdDots1, holdDots2, holdDots3, holdDots4, dotsTray2, dotsTray3, dotsTray4, hungFilm1, hungFilm2, hungFilm3, hungFilm4, hungDots1, hungDots2, hungDots3, hungDots4, trayLit;
var numDrops, curItem;
var cleaned = [];
var potProps1 = {x:218, y:21};
var potProps2 = {x:-332, y:438};

var trayProps1 = {x:-404, y:110, scaleX:1, scaleY:1};
var trayProps2 = {x:11, y:110, scaleX:1, scaleY:1};
var trayProps3 = {x:510, y:253, scaleX:0.617, scaleY:0.617};

var bone1Props1 = {x:107, y:303, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone1Props2 = {x:410, y:206, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone1Props3 = {x:124, y:338};
var bone1Props4 = {x:102, y:362};
var bone1Props5 = {x:382, y:308, scaleX:0.9, scaleY:0.9};
var bone1Props6 = {x:186, y:308, rotation:0};
var bone1Props7 = {x:648, y:290, rotation:0};
var bone1Props8 = {x:843, y:259, rotation:-55};
var bone2Props1 = {x:67, y:206, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone2Props2 = {x:341, y:184, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone2Props3 = {x:496, y:359};
var bone2Props4 = {x:117, y:184};
var bone2Props5 = {x:365, y:294, scaleX:0.9, scaleY:0.9};
var bone2Props6 = {x:212, y:322, rotation:0};
var bone2Props7 = {x:587, y:187, rotation:0};
var bone2Props8 = {x:826, y:64, rotation:31.56};
var bone3Props1 = {x:201, y:431, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone3Props2 = {x:471, y:204, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone3Props3 = {x:677, y:365};
var bone3Props4 = {x:140, y:430};
var bone3Props5 = {x:352, y:315, scaleX:0.9, scaleY:0.9};
var bone3Props6 = {x:197, y:297, rotation:0};
var bone3Props7 = {x:703, y:396, rotation:0};
var bone3Props8 = {x:815, y:482, rotation:32.8};
var bone4Props1 = {x:136, y:390, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone4Props2 = {x:410, y:141, scaleX:1, scaleY:1, rotation:0, alpha:1};
var bone4Props3 = {x:322, y:368, rotation:0};
var bone4Props4 = {x:52, y:255, rotation:-23};
var bone4Props5 = {x:356, y:315, scaleX:0.9, scaleY:0.9, rotation:-23};
var bone4Props6 = {x:244, y:312, rotation:-23};
var bone4Props7 = {x:529, y:342, rotation:-23};
var bone4Props8 = {x:800, y:355, rotation:-10.227};

var brushProps1 = {x:886, y:168};
var brushProps2 = {x:647, y:168};

var tongs1Props1 = {x:673, y:644};
var tongs1Props2 = {x:673, y:319, rotation:0};
var tongs1Props3 = {x:863, y:589, rotation:-20};

var tongs2Props1 = {x:0, y:577};
var tongs2Props2 = {x:468, y:389};

var papContProps1 = {x:802, y:173};
var papContProps2 = {x:74, y:169};
var papContProps3 = {x:457, y:197};
var papContProps4 = {x:451, y:192};

var pap1Props1 = {skewX:-0.8};
var pap1Props2 = {skewX:-0.9};
var pap1Props3 = {skewX:-0.8, scaleX:0.8876, scaleY:0.8876};
var pap2Props1 = {x:-10, y:-9, skewX:-0.3};
var pap2Props2 = {x:-38, y:-13, skewX:-0.7};
var pap2Props3 = {x:-29, y:-12, scaleX:0.8844, scaleY:0.8844};
var pap3Props1 = {x:-20, y:9, skewX:-1.8};
var pap3Props2 = {x:-27, y:15, skewX:-0.8};
var pap3Props3 = {x:-21, y:13, scaleX:0.8844, scaleY:0.8844};
var pap4Props1 = {x:-30, y:1, skewX:-1.9};
var pap4Props2 = {x:-60, y:3, skewX:-0.9};
var pap4Props3 = {x:-53, y:3, scaleX:0.8874, scaleY:0.8874};

var benchProps1 = {y:136, scaleY:1};
var benchProps2 = {y:157, scaleY:0.94};
var benchProps3 = {y:285, scaleY:0.58};

var wrap1Props1 = {x:389, y:303};
var wrap1Props2 = {x:658, y:300};
var wrap1Props3 = {x:193, y:303, scaleX:0.9, scaleY:0.9};
var wrap2Props1 = {x:367, y:292};
var wrap2Props2 = {x:598, y:185};
var wrap2Props3 = {x:217, y:321, scaleX:0.9, scaleY:0.9};
var wrap3Props1 = {x:363, y:317};
var wrap3Props2 = {x:710, y:403};
var wrap3Props3 = {x:199, y:301, scaleX:0.9, scaleY:0.9};
var wrap4Props1 = {x:353, y:316};
var wrap4Props2 = {x:517, y:340};
var wrap4Props3 = {x:241, y:313, scaleX:0.9, scaleY:0.9};

var foldProps1 = {x:210, y:111, rotation:0};
var foldProps2 = {x:200, y:103};
var foldProps3 = {x:191, y:123, rotation:-0.7};
var foldProps4 = {x:185, y:115, rotation:-1};
var foldProps5 = {x:14, y:112, rotation:0};
var foldProps6 = {x:47, y:122};
var foldProps7 = {x:36, y:96};
var foldProps8 = {x:74, y:108};

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

	var manifest = [{src:"img/rad_sprites_sm.png", id:"sprites_small"},{src:"img/rad_sprites_lg.png", id:"sprites_large"},{src:"img/bench4.png", id:"bench4"},{src:"img/bench4_lit.png", id:"bench4lit"},{src:"img/calend_sprites.png", id:"sprites_cal"}];
	var preload = new createjs.LoadQueue(true);
	preload.addEventListener("fileload", handleFileLoad);
	preload.addEventListener("complete", handleComplete);
	preload.loadManifest(manifest);

	wall1 = new createjs.Shape();
	wall1.graphics.f("#748288").dr(0, 0, 778, 288);
	fgStage.addChild(wall1);

	wall2 = new createjs.Shape();
	wall2.graphics.f("#504144").dr(0, 0, 778, 488);
	wall2.visible = false;
	fgStage.addChild(wall2);

	floor = new createjs.Shape();
	floor.graphics.f("#434a48").dr(0, 153, 778, 335);
	fgStage.addChild(floor);

	fgStage.update();
}

function handleComplete(event) {
	document.getElementById("loader").className = "";

	sprites = new createjs.SpriteSheet({images:[assets["sprites_small"]],frames:[[706,247,168,236],[535,247,168,236],[292,477,168,236],[877,318,137,142],[877,173,137,142],[2,496,200,266],[643,486,113,138],[527,486,113,138],[761,36,113,138],[596,745,60,89],[463,599,60,89],[877,2,143,168],[505,766,88,68],[93,765,88,68],[2,765,88,68],[381,222,41,41],[337,222,41,41],[526,627,120,102],[922,463,61,170],[858,486,61,170],[463,426,61,170],[809,659,73,122],[733,641,73,122],[437,222,95,201],[337,36,238,183],[292,716,210,115],[675,766,74,63],[885,725,74,63],[885,659,74,63],[761,177,74,63],[759,486,96,152],[2,19,779,14],[2,2,779,14],[254,266,180,208],[578,36,180,208],[2,36,332,227],[986,463,13,60],[838,177,13,60],[659,745,13,60],[184,765,13,60],[205,496,84,308],[962,636,52,176],[649,627,81,115],[2,266,249,227]],animations:{bone1:0,bone1clean:1,bone1dark:2,bone1dots:3,bone1dots_lit:4,bone1wrap:5,bone2:6,bone2clean:7,bone2dark:8,bone2dots:9,bone2dots_lit:10,bone2wrap:11,bone3:12,bone3clean:13,bone3dark:14,bone3dots:15,bone3dots_lit:16,bone3wrap:17,bone4:18,bone4clean:19,bone4dark:20,bone4dots:21,bone4dots_lit:22,bone4wrap:23,bones_pot:24,brush:25,devel_dots:30,line:31,line_lit:32,pap_hang:33,pap_hang_lit:34,pap_tray2:35,pin1:36,pin1_lit:37,pin2:38,pin2_lit:39,tongs:40,tongs2:41,tongs3:42,tray_lit:43,boil:{frames:[26,27,28,29],next:false,speed:0.4}}});

	spritesLarge = new createjs.SpriteSheet({images:[assets["sprites_large"]],frames:[[1,473,345,297],[384,373,328,359],[1,1,380,469],[384,1,404,369]],animations:{pap_lg1:0,pap_lg2:1,pot:2,tray:3}});

	spritesCal = new createjs.SpriteSheet({images:[assets["sprites_cal"]],frames:[[0,0,370,334],[412,164,40,40],[371,164,40,40],[412,123,40,40],[371,123,40,40],[412,82,40,40],[371,82,40,40],[412,41,40,40],[371,41,40,40],[412,0,40,40],[371,0,40,40]],animations:{calendar:0,day1:1,day10:2,day2:3,day3:4,day4:5,day5:6,day6:7,day7:8,day8:9,day9:10}});

	bench1 = new createjs.Bitmap(assets["bench4"]);
	bench1.set(benchProps1);
	bench1.visible = false;
	fgStage.addChild(bench1);

	bench2 = new createjs.Bitmap(assets["bench4lit"]);
	bench2.set(benchProps3);
	bench2.visible = false;
	fgStage.addChild(bench2);

	trayLit = new createjs.Sprite(sprites, "tray_lit");
	trayLit.x = 510;
	trayLit.y = 253;
	trayLit.visible = false;
	fgStage.addChild(trayLit);


	tongs2 = new createjs.Sprite(sprites, "tongs2");
	tongs2.regX = tongs2.getBounds().width/2;
	tongs2.regY = tongs2.getBounds().height/2;
	tongs2.visible = false;
	tongs2.cursor = "pointer";
	tongs2.mouseEnabled = false;
	tongs2.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-14,-20,307,200));
	fgStage.addChild(tongs2);


	pot = new createjs.Sprite(spritesLarge, "pot");
	pot.set(potProps1);
	fgStage.addChild(pot);


	bub1 = new createjs.Sprite(sprites, "boil");
	bub1.x = 375;
	bub1.y = 183;
	bub1.visible = false;
	fgStage.addChild(bub1);

	bub2 = new createjs.Sprite(sprites, "boil");
	bub2.x = 287;
	bub2.y = 153;
	bub2.visible = false;
	fgStage.addChild(bub2);

	bub3 = new createjs.Sprite(sprites, "boil");
	bub3.x = 451;
	bub3.y = 143;
	bub3.visible = false;
	fgStage.addChild(bub3);

	bub4 = new createjs.Sprite(sprites, "boil");
	bub4.x = 300;
	bub4.y = 94;
	bub4.visible = false;
	fgStage.addChild(bub4);

	bub5 = new createjs.Sprite(sprites, "boil");
	bub5.x = 365;
	bub5.y = 128;
	bub5.visible = false;
	fgStage.addChild(bub5);

	bub6 = new createjs.Sprite(sprites, "boil");
	bub6.x = 422;
	bub6.y = 86;
	bub6.visible = false;
	fgStage.addChild(bub6);


	var tray = new createjs.Sprite(spritesLarge, "tray");
	fgStage.addChild(tray);

	film4 = new createjs.Sprite(sprites, "pap_tray2");
	film4.x = 54;
	film4.y = 55;

	film3 = new createjs.Sprite(sprites, "pap_tray2");
	film3.x = 40;
	film3.y = 64;
	film3.scaleY = .9879;
	film3.skewX = -2.3;

	film2 = new createjs.Sprite(sprites, "pap_tray2");
	film2.x = 67;
	film2.y = 61;
	film2.scaleX = .9689;
	film2.scaleY = .9583;
	film2.rotation = 0.42;
	film2.skewX = 1.6;

	film1 = new createjs.Sprite(sprites, "pap_tray2");
	film1.x = 54;
	film1.y = 48;
	film1.scaleX = .9513;
	film1.rotation = 0.68;
	film1.skewX = -4.4;

	devel = new createjs.Sprite(sprites, "devel_dots");
	devel.x = 162;
	devel.y = 97;
	devel.visible = false;

	trayCont = new createjs.Container();
	trayCont.addChild(tray, film4, film3, film2, film1, devel);
	trayCont.visible = false;
	fgStage.addChild(trayCont);


	dotsTray2 = new createjs.Sprite(sprites, "bone1dots");
	dotsTray2.x = 594;
	dotsTray2.y = 296;
	dotsTray2.scaleX = dotsTray2.scaleY = 0.874;
	dotsTray2.rotation = 7.5;
	dotsTray2.visible = false;
	fgStage.addChild(dotsTray2);

	dotsTray3 = new createjs.Sprite(sprites, "bone3dots");
	dotsTray3.x = 639;
	dotsTray3.y = 340;
	dotsTray3.scaleX = dotsTray2.scaleY = 0.9;
	dotsTray3.rotation = 25.5;
	dotsTray3.visible = false;
	fgStage.addChild(dotsTray3);

	dotsTray4 = new createjs.Sprite(sprites, "bone2dots");
	dotsTray4.x = 621;
	dotsTray4.y = 321;
	dotsTray4.scaleX = dotsTray2.scaleY = 0.9;
	dotsTray4.rotation = 5.6;
	dotsTray4.visible = false;
	fgStage.addChild(dotsTray4);



	papLg4 = new createjs.Sprite(spritesLarge, "pap_lg1");
	fgStage.addChild(papLg4);

	papLg3 = new createjs.Sprite(spritesLarge, "pap_lg1");
	fgStage.addChild(papLg3);

	papLg2 = new createjs.Sprite(spritesLarge, "pap_lg1");
	fgStage.addChild(papLg2);

	papLg1 = new createjs.Sprite(spritesLarge, "pap_lg1");
	fgStage.addChild(papLg1);

	papCont = new createjs.Container();
	papCont.addChild(papLg4, papLg3, papLg2, papLg1);
	papCont.name = "films";
	papCont.visible = false;
	papCont.cursor = "pointer";
	papCont.mouseEnabled = papCont.mouseChildren = false;
	fgStage.addChild(papCont);


	papLgFld = new createjs.Sprite(spritesLarge, "pap_lg2");
	papLgFld.visible = false;
	fgStage.addChild(papLgFld);


	wrap1 = new createjs.Sprite(sprites, "bone1wrap");
	wrap1.regX = wrap1.getBounds().width/2;
	wrap1.regY = wrap1.getBounds().height/2;
	wrap1.hlProps = wrap1Props3;
	wrap1.visible = false;
	wrap1.cursor = "pointer";
	wrap1.mouseEnabled = false;
	fgStage.addChild(wrap1);

	wrap2 = new createjs.Sprite(sprites, "bone2wrap");
	wrap2.regX = wrap2.getBounds().width/2;
	wrap2.regY = wrap2.getBounds().height/2;
	wrap2.hlProps = wrap2Props3;
	wrap2.visible = false;
	wrap2.cursor = "pointer";
	wrap2.mouseEnabled = false;
	fgStage.addChild(wrap2);

	wrap3 = new createjs.Sprite(sprites, "bone3wrap");
	wrap3.regX = wrap3.getBounds().width/2;
	wrap3.regY = wrap3.getBounds().height/2;
	wrap3.hlProps = wrap3Props3;
	wrap3.visible = false;
	wrap3.cursor = "pointer";
	wrap3.mouseEnabled = false;
	fgStage.addChild(wrap3);

	wrap4 = new createjs.Sprite(sprites, "bone4wrap");
	wrap4.regX = wrap4.getBounds().width/2;
	wrap4.regY = wrap4.getBounds().height/2;
	wrap4.hlProps = wrap4Props3;
	wrap4.visible = false;
	wrap4.cursor = "pointer";
	wrap4.mouseEnabled = false;
	fgStage.addChild(wrap4);


	bone1 = new createjs.Sprite(sprites, "bone1");
	bone1.regX = bone1.getBounds().width/2;
	bone1.regY = bone1.getBounds().height/2;
	bone1.origProps = bone1Props1;
	bone1.hlProps = bone1Props5;
	bone1.cursor = "pointer";
	bone1.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").mt(0,132).lt(126,0).lt(168,0).lt(168,55).lt(36,235).cp());
	fgStage.addChild(bone1);

	bone2 = new createjs.Sprite(sprites, "bone2");
	var b2w = bone2.getBounds().width;
	var b2h = bone2.getBounds().height;
	bone2.regX = b2w/2;
	bone2.regY = b2h/2;
	bone2.origProps = bone2Props1;
	bone2.hlProps = bone2Props5;
	bone2.cursor = "pointer";
	bone2.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(0,0,b2w,b2h));
	fgStage.addChild(bone2);

	bone3 = new createjs.Sprite(sprites, "bone3");
	bone3.regX = bone3.getBounds().width/2;
	bone3.regY = bone3.getBounds().height/2;
	bone3.origProps = bone3Props1;
	bone3.hlProps = bone3Props5;
	bone3.cursor = "pointer";
	bone3.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(0,0,94,93));
	fgStage.addChild(bone3);

	bone4 = new createjs.Sprite(sprites, "bone4");
	bone4.regX = bone4.getBounds().width/2;
	bone4.regY = bone4.getBounds().height/2;
	bone4.origProps = bone4Props1;
	bone4.hlProps = bone4Props5;
	bone4.cursor = "pointer";
	bone4.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").mt(0,190).lt(0,125).lt(25,0).lt(61,0).lt(61,50).lt(33,190).cp());
	fgStage.addChild(bone4);


	var calend = new createjs.Sprite(spritesCal, "calendar");

	day1 = new createjs.Sprite(spritesCal, "day1");
	day1.x = 14;
	day1.y = 80;
	day2 = new createjs.Sprite(spritesCal, "day2");
	day2.x = 64;
	day2.y = 80;
	day3 = new createjs.Sprite(spritesCal, "day3");
	day3.x = 114;
	day3.y = 80;
	day4 = new createjs.Sprite(spritesCal, "day4");
	day4.x = 164;
	day4.y = 80;
	day5 = new createjs.Sprite(spritesCal, "day5");
	day5.x = 215;
	day5.y = 80;
	day6 = new createjs.Sprite(spritesCal, "day6");
	day6.x = 265;
	day6.y = 80;
	day7 = new createjs.Sprite(spritesCal, "day7");
	day7.x = 316;
	day7.y = 80;
	day8 = new createjs.Sprite(spritesCal, "day8");
	day8.x = 15;
	day8.y = 130;
	day9 = new createjs.Sprite(spritesCal, "day9");
	day9.x = 64;
	day9.y = 130;
	day10 = new createjs.Sprite(spritesCal, "day10");
	day10.x = 114;
	day10.y = 130;

	resetCalDays();

	calCont = new createjs.Container();
	calCont.addChild(calend, day1, day2, day3, day4, day5, day6, day7, day8, day9, day10);
	calCont.visible = false;
	calCont.y = 104;
	fgStage.addChild(calCont);


	bonesPot = new createjs.Sprite(sprites, "bones_pot");
	bonesPot.x = 284;
	bonesPot.y = 56;
	fgStage.addChild(bonesPot);


	brush = new createjs.Sprite(sprites, "brush");
	brush.regX = brush.getBounds().width/2;
	brush.regY = brush.getBounds().height/2;
	brush.set(brushProps1);
	brush.visible = false;
	brush.cursor = "pointer";
	brush.mouseEnabled = false;
	fgStage.addChild(brush);


	tongs1 = new createjs.Sprite(sprites, "tongs");
	tongs1.regX = tongs1.getBounds().width/2;
	tongs1.regY = tongs1.getBounds().height/2;
	tongs1.visible = false;
	tongs1.cursor = "pointer";
	tongs1.mouseEnabled = false;
	tongs1.hitArea = new createjs.Shape(new createjs.Graphics().f("#000").dr(-4,-4,92,330));
	fgStage.addChild(tongs1);



	hungFilm1 = new createjs.Sprite(sprites, "pap_hang");
	hungFilm1.x = 20;
	hungFilm1.y = 26;
	hungFilm1.visible = false;
	fgStage.addChild(hungFilm1);

	hungDots1 = new createjs.Sprite(sprites, "bone4dots");
	hungDots1.x = 66;
	hungDots1.y = 78;
	hungDots1.visible = false;
	fgStage.addChild(hungDots1);

	hungFilm2 = new createjs.Sprite(sprites, "pap_hang");
	hungFilm2.x = 211;
	hungFilm2.y = 9;
	hungFilm2.rotation = 14.9;
	hungFilm2.visible = false;
	fgStage.addChild(hungFilm2);

	hungDots2 = new createjs.Sprite(sprites, "bone1dots");
	hungDots2.x = 196;
	hungDots2.y = 60;
	hungDots2.visible = false;
	fgStage.addChild(hungDots2);

	hungFilm3 = new createjs.Sprite(sprites, "pap_hang");
	hungFilm3.x = 370;
	hungFilm3.y = 34;
	hungFilm3.rotation = -2.8;
	hungFilm3.visible = false;
	fgStage.addChild(hungFilm3);

	hungDots3 = new createjs.Sprite(sprites, "bone3dots");
	hungDots3.x = 439;
	hungDots3.y = 114;
	hungDots3.visible = false;
	fgStage.addChild(hungDots3);

	hungFilm4 = new createjs.Sprite(sprites, "pap_hang");
	hungFilm4.x = 584;
	hungFilm4.y = 4;
	hungFilm4.rotation = 14.8;
	hungFilm4.visible = false;
	fgStage.addChild(hungFilm4);

	hungDots4 = new createjs.Sprite(sprites, "bone2dots");
	hungDots4.x = 619;
	hungDots4.y = 82;
	hungDots4.rotation = 9.4;
	hungDots4.visible = false;
	fgStage.addChild(hungDots4);



	line = new createjs.Sprite(sprites, "line");

	pin1 = new createjs.Sprite(sprites, "pin1");
	pin1.x = 85;
	pin1.y = -21;
	pin1.rotation = 6.86;

	pin2 = new createjs.Sprite(sprites, "pin1");
	pin2.x = 268;
	pin2.y = -15;

	pin3 = new createjs.Sprite(sprites, "pin1");
	pin3.x = 455;
	pin3.y = -16;
	pin3.rotation = -0.684344;

	pin4 = new createjs.Sprite(sprites, "pin1");
	pin4.x = 654.25;
	pin4.y = -21;
	pin4.rotation = 7.1926;

	lineCont = new createjs.Container();
	lineCont.addChild(line, pin1, pin2, pin3, pin4);
	lineCont.x = -1;
	lineCont.visible = false;
	fgStage.addChild(lineCont);


	var holdFilm = new createjs.Sprite(sprites, "pap_hang");
	holdFilm.scaleX = holdFilm.scaleY = 1.092;
	holdFilm.rotation = 9.1;

	var tongs3 = new createjs.Sprite(sprites, "tongs3");
	tongs3.x = 85;
	tongs3.y = -57;

	holdDots1 = new createjs.Sprite(sprites, "bone4dots");
	holdDots1.x = 40;
	holdDots1.y = 66;
	holdDots1.rotation = 9.5;
	holdDots1.scaleX = holdDots1.scaleY = 1.1;

	holdDots2 = new createjs.Sprite(sprites, "bone1dots");
	holdDots2.x = -11;
	holdDots2.y = 60;
	holdDots2.rotation = -3.7;
	holdDots2.scaleX = holdDots2.scaleY = 1.1;

	holdDots3 = new createjs.Sprite(sprites, "bone3dots");
	holdDots3.x = 51;
	holdDots3.y = 110;
	holdDots3.scaleX = holdDots3.scaleY = 1.1;

	holdDots4 = new createjs.Sprite(sprites, "bone2dots");
	holdDots4.x = 45;
	holdDots4.y = 85;
	holdDots4.rotation = 6;
	holdDots4.scaleX = holdDots4.scaleY = 1.1;

	hangCont = new createjs.Container();
	hangCont.addChild(holdFilm, tongs3, holdDots1, holdDots2, holdDots3, holdDots4);
	hangCont.visible = false;
	fgStage.addChild(hangCont);


	list6 = [2,3,4,1,5,6,2,4,5,1,3,6,5,3,2,4,1,6,3,2,6,5,1,4];
	idx6 = 0;

	gotoScreen(1);
	createjs.Ticker.addEventListener("tick", tick);
}

function startBubble(spr) {
	if (Math.random() < 0.9) {
		var n = list6[idx6];
		idx6 = (idx6 < 23) ? idx6+1 : 0;
		var spr = glob["bub"+n];
		spr.visible = true;
		spr.gotoAndPlay("boil");
	}
}

function endBubble(evt) { evt.currentTarget.visible = false; }

function dragFilms(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = 1;
	o.set(papContProps3)
	var offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX+offset.x;
		o.y = evt.stageY+offset.y;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x < 270) { goNextScreen(); }
		else {
			o.set(papContProps3);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragTongs1(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = 1;
	o.x = evt.stageX-83;
	o.y = evt.stageY-46;
	o.rotation = -60;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX-83;
		o.y = evt.stageY-46;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 230 && o.y > 15 && o.x < 635 && o.y < 435) { goNextScreen(); }
		else {
			o.set(tongs1Props2);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function hangFilm() {
	glob["holdDots"+curItem].visible = false;
	hangCont.visible = false;
	glob["hungFilm"+curItem].visible = glob["hungDots"+curItem].visible = true;
	glob["pin"+curItem].gotoAndStop("pin2");
	if (++curItem < 5) {
		tongs2.visible = true;
		addRollOver(tongs2, true);
		glob["holdDots"+curItem].visible = true;
	} else {
		clearText();
		deactivate(tongs2);
		timID = setTimeout(goNextScreen, 666);
	}
	updateFG = true;
}

function lightsOn() {
	boxText.innerHTML = "HERE'S THE PROOF! THESE BONES ARE RADIOACTIVE! EACH OF THOSE LITTLE WHITE DOTS SHOWS WHERE A SUBATOMIC PARTICLE FLEW OUT OF THE BONE AND STRUCK THE FILM. (THEY ALSO INDICATE WHERE ANOTHER HOLE WAS CREATED IN THE BONE.)";
	wall2.visible = bench1.visible = trayCont.visible = false;
	wall1.visible = bench2.visible = trayLit.visible = true;
	line.gotoAndStop("line_lit");
	pin1.gotoAndStop("pin2_lit");
	pin2.gotoAndStop("pin2_lit");
	pin3.gotoAndStop("pin2_lit");
	pin4.gotoAndStop("pin2_lit");
	hungFilm1.gotoAndStop("pap_hang_lit");
	hungFilm2.gotoAndStop("pap_hang_lit");
	hungFilm3.gotoAndStop("pap_hang_lit");
	hungFilm4.gotoAndStop("pap_hang_lit");
	hungDots1.gotoAndStop("bone4dots_lit");
	hungDots2.gotoAndStop("bone1dots_lit");
	hungDots3.gotoAndStop("bone3dots_lit");
	hungDots4.gotoAndStop("bone2dots_lit");
	updateFG = true;
}

function lightsOff() {
	wall2.visible = bench1.visible = trayCont.visible = true;
	wall1.visible = bench2.visible = trayLit.visible = false;
	line.gotoAndStop("line");
	pin1.gotoAndStop("pin1");
	pin2.gotoAndStop("pin1");
	pin3.gotoAndStop("pin1");
	pin4.gotoAndStop("pin1");
	hungFilm1.gotoAndStop("pap_hang");
	hungFilm2.gotoAndStop("pap_hang");
	hungFilm3.gotoAndStop("pap_hang");
	hungFilm4.gotoAndStop("pap_hang");
	hungDots1.gotoAndStop("bone4dots");
	hungDots2.gotoAndStop("bone1dots");
	hungDots3.gotoAndStop("bone3dots");
	hungDots4.gotoAndStop("bone2dots");
}

function dragHang(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = 1;
	o.visible = glob["film"+curItem].visible = false;
	if (curItem == 1) { devel.visible = false; } else { glob["dotsTray"+curItem].visible = false; }
	if (curItem < 4) { glob["dotsTray"+(curItem+1)].visible = true; }
	hangCont.visible = true;
	hangCont.x = evt.stageX-80;
	hangCont.y = evt.stageY-60;
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		hangCont.x = evt.stageX-80;
		hangCont.y = evt.stageY-60;
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (hangCont.y < 100) { hangFilm(); }
		else {
			if (curItem == 1) { devel.visible = true; } else { glob["dotsTray"+curItem].visible = true; }
			if (curItem < 4) { glob["dotsTray"+(curItem+1)].visible = false; }
			glob["film"+curItem].visible = true;
			hangCont.visible = false;
			o.visible = true;
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function dragBone(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	if (o != bone4) { fgStage.swapChildren(o, bone4); }
	if (bone1.mouseEnabled) { rmvRollover(bone1); }
	if (bone2.mouseEnabled) { rmvRollover(bone2); }
	if (bone3.mouseEnabled) { rmvRollover(bone3); }
	if (bone4.mouseEnabled) { rmvRollover(bone4); }
	o.scaleX = o.scaleY = 1;
	var offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX+offset.x;
		o.y = evt.stageY+offset.y;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (o.x > 250 && o.x < 575 && o.y < 330) { dropBone(o); }
		else {
			if (o != bone4) { fgStage.swapChildren(o, bone4); }
			o.set(o.origProps);
			enabBones();
		}
		removeDragListeners(fgStage);
	});
}

function tapBone(evt) {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	var o = evt.currentTarget;
	deactivate(o);
	o.scaleX = o.scaleY = 1;
	glob["papLg"+curItem].visible = false;
	papLgFld.set(glob["foldProps"+curItem]);
	papLgFld.visible = true;
	var wrap = glob["wrap"+curItem];
	Twn.get(o).wait(200).set(invis, papLgFld).set(invis).set(vis, wrap);
	if (curItem < 4) {
		Twn.get(wrap).wait(350).to(glob["wrap"+curItem+"Props2"], 750, easeOut).call(hiliteBone, [glob["bone"+(curItem+1)]]);
		curItem++;
	} else {
		papCont.visible = false;
		Twn.get(wrap).wait(350).to(glob["wrap"+curItem+"Props2"], 750, easeOut).call(goNextScreen);
		clearText();
	}
	fgMoving = true;
}

function enabBones() {
	if (bone1.mouseEnabled) { addRollOver(bone1); }
	if (bone2.mouseEnabled) { addRollOver(bone2); }
	if (bone3.mouseEnabled) { addRollOver(bone3); }
	if (bone4.mouseEnabled) { addRollOver(bone4); }
}

function tapWrap(evt) {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	var o = evt.currentTarget;
	o.scaleX = o.scaleY = 1;
	o.visible = false;
	deactivate(o);
	var bone = glob["bone"+curItem];
	papLgFld.set(glob["foldProps"+(4+curItem)]);
	bone.visible = papLgFld.visible = true;
	Twn.get(papLgFld).wait(200).set(invis).set(vis, glob["papLg"+(5-curItem)]);
	if (curItem < 4) {
		Twn.get(bone).wait(350).to(glob["bone"+curItem+"Props7"], 750, easeOut).call(hiliteBone, [glob["wrap"+(curItem+1)]]);
		curItem++;
	} else {
		Twn.get(bone).wait(350).to(glob["bone"+curItem+"Props7"], 750, easeOut).call(animDoneNext);
		clearText();
	}
	fgMoving = true;
}

function dropBone(bone) {
	if (bone != bone4) { fgStage.swapChildren(bone, bone4); }
	var Twn = createjs.Tween;
	deactivate(bone);
	bone.x = 405;
	bone.y = 176;
	Twn.get(bone).to({scaleX:0.75, scaleY:0.75, rotation:-50, alpha:0}, 500).set(invis);
	if (++numDrops == 4) { goNextScreen(); } else { enabBones();	}
}

function tongs1Enter() {
	clearText();
	tongs1.visible = true;
	createjs.Tween.get(tongs1).to(tongs1Props2, 765, createjs.Ease.circOut).call(screenReady);
}

function dragBrush(evt) {
	if (isMSIETouch) { dragging = true; }
	var o = evt.currentTarget;
	rmvRollover(o);
	o.scaleX = o.scaleY = 1;
	var offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
	updateFG = true;

	fgStage.addEventListener("pressmove", function(evt) {
		if (isMSIETouch && nearStageEdge(evt)) { msieTouchHack(); return; }
		o.x = evt.stageX+offset.x;
		o.y = evt.stageY+offset.y;
		if (o.x < 220 && o.y > 174 && o.y < 415) {
			if (!cleaned[0]) {
				bone1.gotoAndStop("bone1clean");
				cleaned[0] = true;
			}
		} else if (o.x > 250 && o.x < 380 && o.y > 275 && o.y < 415) {
			if (!cleaned[1]) {
				bone4.gotoAndStop("bone4clean");
				cleaned[1] = true;
			}
		} else if (o.x > 410 && o.x < 560 && o.y > 280 && o.y < 400) {
			if (!cleaned[2]) {
				bone2.gotoAndStop("bone2clean");
				cleaned[2] = true;
			}
		} else if (o.x > 580 && o.x < 800 && o.y > 285 && o.y < 380) {
			if (!cleaned[3]) {
				bone3.gotoAndStop("bone3clean");
				cleaned[3] = true;
			}
		}
		updateFG = true;
	});

	fgStage.addEventListener("pressup", function(evt) {
		if (cleaned.indexOf(false) == -1) { goNextScreen(); }
		else {
			o.set(brushProps2);
			addRollOver(o);
		}
		updateFG = true;
		removeDragListeners(fgStage);
	});
}

function animDoneNext() {
	fgMoving = false;
	goNextScreen();
}

function hiliteBone(o) {
	o.set(o.hlProps);
	createjs.Tween.get(o).to({scaleX:1, scaleY:1}, 500, createjs.Ease.getBackOut(5)).call(screenReady);
}

function goPrevScreen() {
	if (timID != -1) { clearTimeout(timID); }
	if (!fgMoving || curScreen == 1 || curScreen == 5) {
		if (curScreen > 1) {
			prvScreen = curScreen;
			gotoScreen(--curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = "radium12.html";
		}
	}
	return false;
}

function goNextScreen() {
	if (!fgMoving || curScreen == 1 || curScreen == 4) {
		if (curScreen < 9) {
			prvScreen = curScreen;
			gotoScreen(++curScreen);
		} else {
			if (createjs.Touch.isSupported()) { createjs.Touch.disable(fgStage); }
			window.location = "radium13.html";
		}
	}
	return false;
}

function screenReady(ref) {
	fgMoving = false;
	updateFG = true;
	if (curScreen == 2) {
		addRollOver(tongs1, true);
		addMouseDown(tongs1, dragTongs1);
		boxText.innerHTML = "AFTER THEY'VE BOILED FOR THREE HOURS, USE THE TONGS TO REMOVE THE BONES FROM THE CLEANING SOLUTION.";
	} else if (curScreen == 3) {
		addRollOver(brush, true);
		addMouseDown(brush, dragBrush);
		boxText.innerHTML = "NOW GRAB THE BRUSH AND SCRUB EACH BONE TO A DAZZLING WHITE.";
	} else if (curScreen == 4) {
		var bone = glob["bone"+curItem];
		addRollOver(bone);
		addMouseDown(bone, tapBone);
		if (curItem == 1) { boxText.innerHTML = "NOW WE'RE IN A DARKROOM. WRAP EACH BONE IN X-RAY FILM AND BLACK SAFETY PAPER (TO KEEP LIGHT FROM GETTING IN)."; }
	} else if (curScreen == 6) {
		var wrap = glob["wrap"+curItem];
		addRollOver(wrap);
		addMouseDown(wrap, tapWrap);
		if (curItem == 1) { boxText.innerHTML = "REMOVE THE X-RAY FILM FROM EACH BONE."; }
	} else if (curScreen == 7) {
		addRollOver(papCont, true);
		addMouseDown(papCont, dragFilms);
		boxText.innerHTML = "SUBMERGE THE X-RAY FILMS IN THE FILM DEVELOPER LIQUID.";
	} else if (curScreen == 8) {
		curItem = 1;
		addRollOver(tongs2, true);
		addMouseDown(tongs2, dragHang);
		boxText.innerHTML = "USE TONGS TO REMOVE EACH SHEET OF FILM (AFTER YOU'VE \"FIXED\" IT TO STOP THE DEVELOPING PROCESS) AND HANG IT UP TO DRY.";
	}
}

function resetCalDays() { day1.visible = day2.visible = day3.visible = day4.visible = day5.visible = day6.visible = day7.visible = day8.visible = day9.visible = day10.visible = false; }

function develDone() {
	//clearText();
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	tongs2.set(tongs2Props1);
	lineCont.y = -47;
	tongs2.visible = lineCont.visible = true;
	Twn.get(bench1).to(benchProps3, 1500);
	Twn.get(trayCont).to(trayProps3, 1500, easeOut);
	Twn.get(tongs2).to(tongs2Props2, 1525, easeOut).call(screenReady);
	Twn.get(lineCont).to({y:28}, 1500, easeOut);
}

function gotoScreen(n) {
	var Twn = createjs.Tween;
	var easeOut = createjs.Ease.circOut;
	switch (n) {
		case 1:
		bub1.addEventListener("animationend", endBubble);
		bub2.addEventListener("animationend", endBubble);
		bub3.addEventListener("animationend", endBubble);
		bub4.addEventListener("animationend", endBubble);
		bub5.addEventListener("animationend", endBubble);
		bub6.addEventListener("animationend", endBubble);
		intvID = setInterval(startBubble, 250);
		bone1.visible = bone2.visible = bone3.visible = bone4.visible = true;
		bone1.set(bone1Props1);
		bone2.set(bone2Props1);
		bone3.set(bone3Props1);
		bone4.set(bone4Props1);
		addRollOver(bone1);
		addMouseDown(bone1, dragBone);
		addRollOver(bone2);
		addMouseDown(bone2, dragBone);
		addRollOver(bone3);
		addMouseDown(bone3, dragBone);
		addRollOver(bone4);
		addMouseDown(bone4, dragBone);
		bonesPot.visible = false;
		numDrops = 0;
		tongs1.set(tongs1Props1);
		deactivate(tongs1);
		boxText.innerHTML = "INSTRUCTIONS: TAKE A SELECTION OF BONES (ALREADY CLEARED OF BODY TISSUE) FROM THE VICTIM, AND PLACE THEM INTO A BOILING CLEANING SOLUTION.";
		fgMoving = true;
		break;
		//- - - - - - - - - - - - - - - -
		case 2:
		//clearText();
		if (curScreen > prvScreen) {
			var boilTime = 2000;
			if (numDrops < 4) {
				boilTime = 0;
				bone1.visible = bone2.visible = bone3.visible = bone4.visible = false;
				deactivate(bone1);
				deactivate(bone2);
				deactivate(bone3);
				deactivate(bone4);
			}
			bonesPot.visible = true;
			bonesPot.alpha = 0;
			Twn.get(bonesPot).wait(boilTime).call(function(){clearInterval(intvID);}).wait(500).call(tongs1Enter).to({alpha:1}, 740);
		} else {
			deactivate(brush);
			bone1.set(bone1Props2);
			bone2.set(bone2Props2);
			bone3.set(bone3Props2);
			bone4.set(bone4Props2);
			brush.visible = bone1.visible = bone2.visible = bone3.visible = bone4.visible = false;
			bonesPot.visible = pot.visible = tongs1.visible = true;
			brush.set(brushProps1);
			pot.set(potProps1);
			tongs1.set(tongs1Props2);
			screenReady();
		}

		break;
		//- - - - - - - - - - - - - - - -
		case 3:
		cleaned = [false, false, false, false];
		brush.visible = true;
		if (curScreen > prvScreen) {
			clearText();
			deactivate(tongs1);
			bonesPot.visible = false;
			bone1.visible = bone2.visible = bone3.visible = bone4.visible = true;
			bone1.set(bone1Props2);
			bone2.set(bone2Props2);
			bone3.set(bone3Props2);
			bone4.set(bone4Props2);
			Twn.get(brush).to(brushProps2, 1300, easeOut);
			Twn.get(bone1).to(bone1Props3, 1400, easeOut).call(screenReady);
			Twn.get(bone2).to(bone2Props3, 1400, easeOut);
			Twn.get(bone3).to(bone3Props3, 1400, easeOut);
			Twn.get(bone4).to(bone4Props3, 1400, easeOut);
			Twn.get(pot).to(potProps2, 1250, easeOut).set(invis);
			Twn.get(tongs1).to(tongs1Props3, 1000, easeOut).set(invis);
			fgMoving = true;
		} else {
			wall2.visible = bench1.visible = papCont.visible = wrap1.visible = wrap2.visible = wrap3.visible = wrap4.visible = false;
			floor.visible = wall1.visible = bone1.visible = bone2.visible = bone3.visible = bone4.visible = true;
			brush.set(brushProps2);
			bone1.set(bone1Props3);
			bone2.set(bone2Props3);
			bone3.set(bone3Props3);
			bone4.set(bone4Props3);
			bone1.gotoAndStop("bone1");
			bone2.gotoAndStop("bone2");
			bone3.gotoAndStop("bone3");
			bone4.gotoAndStop("bone4");
			deactivate(bone1);
			deactivate(bone2);
			deactivate(bone3);
			deactivate(bone4);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 4:
		curItem = 1;
		wrap1.set(wrap1Props1);
		wrap2.set(wrap2Props1);
		wrap3.set(wrap3Props1);
		wrap4.set(wrap4Props1);
		wrap1.visible = wrap2.visible = wrap3.visible = wrap4.visible = false;
		bone1.visible = bone2.visible = bone3.visible = bone4.visible = papCont.visible = papLg1.visible = papLg2.visible = papLg3.visible = papLg4.visible = true;
		papCont.set(papContProps1);
		papLg1.set(pap1Props1);
		papLg2.set(pap2Props1);
		papLg3.set(pap3Props1);
		papLg4.set(pap4Props1);
		if (curScreen > prvScreen) {
			clearText();
			floor.visible = wall1.visible = brush.visible = false;
			wall2.visible = bench1.visible = true;
			bone1.gotoAndStop("bone1dark");
			bone2.gotoAndStop("bone2dark");
			bone3.gotoAndStop("bone3dark");
			bone4.gotoAndStop("bone4dark");
			deactivate(brush);
			Twn.get(bone1).to(bone1Props4, 600, easeOut);
			Twn.get(bone2).to(bone2Props4, 1200, easeOut);
			Twn.get(bone3).to(bone3Props4, 1500, easeOut);
			Twn.get(bone4).to(bone4Props4, 900, easeOut);
		} else {
			Twn.removeAllTweens();
			calCont.x = -370;
			calCont.visible = false;
			bone1.set(bone1Props4);
			bone2.set(bone2Props4);
			bone3.set(bone3Props4);
			bone4.set(bone4Props4);
			deactivate(bone1);
			deactivate(bone2);
			deactivate(bone3);
			deactivate(bone4);
		}
		Twn.get(papCont).to({x:210}, 1600, easeOut).call(hiliteBone,[bone1]);
		fgMoving = true;
		break;
		//- - - - - - - - - - - - - - - -
		case 5:
		boxText.innerHTML = "LET THEM SIT IN THE DARKROOM FOR TEN DAYS...";
		wrap1.visible = wrap2.visible = wrap3.visible = wrap4.visible = true;
		bone1.visible = bone2.visible = bone3.visible = bone4.visible = papLgFld.visible = papCont.visible = false;
		deactivate(bone1);
		deactivate(bone2);
		deactivate(bone3);
		deactivate(bone4);
		wrap1.set(wrap1Props2);
		wrap2.set(wrap2Props2);
		wrap3.set(wrap3Props2);
		wrap4.set(wrap4Props2);
		deactivate(wrap1);
		deactivate(wrap2);
		deactivate(wrap3);
		deactivate(wrap4);
		Twn.removeAllTweens();
		resetCalDays();
		calCont.x = -370;
		calCont.visible = true;
		Twn.get(calCont).to({x:47}, 1000, easeOut).wait(333).set(vis,day1).wait(333).set(vis,day2).wait(333).set(vis,day3).wait(333).set(vis,day4).wait(333).set(vis,day5).wait(333).set(vis,day6).wait(333).set(vis,day7).wait(333).set(vis,day8).wait(333).set(vis,day9).wait(333).set(vis,day10).wait(1000).call(clearText).to({x:-370}, 1000, easeOut).set(invis).call(animDoneNext);
		fgMoving = true;
		break;
		//- - - - - - - - - - - - - - - -
		case 6:
		if (curScreen < prvScreen) {
			deactivate(papCont);
			wrap1.visible = wrap2.visible = wrap3.visible = wrap4.visible = true;
			bone1.visible = bone2.visible = bone3.visible = bone4.visible = trayCont.visible = false;
			bench1.set(benchProps1);
		}
		curItem = 1;
		papCont.set(papContProps2);
		papCont.visible = true;
		papLg1.visible = papLg2.visible = papLg3.visible = papLg4.visible = false;
		papLg1.set(pap1Props2);
		papLg2.set(pap2Props2);
		papLg3.set(pap3Props2);
		papLg4.set(pap4Props2);
		bone1.set(bone1Props6);
		bone2.set(bone2Props6);
		bone3.set(bone3Props6);
		bone4.set(bone4Props6);
		wrap1.set(wrap1Props2);
		wrap2.set(wrap2Props2);
		wrap3.set(wrap3Props2);
		wrap4.set(wrap4Props2);
		hiliteBone(wrap1);
		fgMoving = true;
		break;
		//- - - - - - - - - - - - - - - -
		case 7:
		papCont.visible = papLg1.visible = papLg2.visible = papLg3.visible = papLg4.visible = true;
		wrap1.visible = wrap2.visible = wrap3.visible = wrap4.visible = devel.visible = false;
		deactivate(wrap1);
		deactivate(wrap2);
		deactivate(wrap3);
		deactivate(wrap4);
		film1.visible = film2.visible = film3.visible = film4.visible = false;
		bone1.set(bone1Props7);
		bone2.set(bone2Props7);
		bone3.set(bone3Props7);
		bone4.set(bone4Props7);
		if (curScreen > prvScreen) {
			trayCont.set(trayProps1);
			trayCont.visible = bone1.visible = bone2.visible = bone3.visible = bone4.visible = true;
			Twn.get(bench1).to(benchProps2, 1500);
			Twn.get(trayCont).to(trayProps2, 1550, easeOut).call(screenReady);
			Twn.get(papCont).to(papContProps3, 1500, easeOut);
			Twn.get(papLg1).to(pap1Props3, 1500, easeOut);
			Twn.get(papLg2).to(pap2Props3, 1500, easeOut);
			Twn.get(papLg3).to(pap3Props3, 1500, easeOut);
			Twn.get(papLg4).to(pap4Props3, 1500, easeOut);
			Twn.get(bone1).to(bone1Props8, 1500, easeOut).set(invis);
			Twn.get(bone2).to(bone2Props8, 1500, easeOut).set(invis);
			Twn.get(bone3).to(bone3Props8, 1500, easeOut).set(invis);
			Twn.get(bone4).to(bone4Props8, 1500, easeOut).set(invis);
			fgMoving = true;
		} else {
			deactivate(tongs2);
			lineCont.visible = tongs2.visible = devel.visible = bench2.visible = dotsTray2.visible = dotsTray3.visible = dotsTray4.visible = hungFilm1.visible = hungFilm2.visible = hungFilm3.visible = hungFilm4.visible = hungDots1.visible = hungDots2.visible = hungDots3.visible = hungDots4.visible = false;
			papCont.set(papContProps3);
			papLg1.set(pap1Props3);
			papLg2.set(pap2Props3);
			papLg3.set(pap3Props3);
			papLg4.set(pap4Props3);
			trayCont.set(trayProps2);
			bench1.set(benchProps2);
			trayCont.set(trayProps2);
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 8:
		papCont.visible = holdDots2.visible = holdDots3.visible = holdDots4.visible = false;
		holdDots1.visible = devel.visible = film1.visible = film2.visible = film3.visible = film4.visible = true;
		if (curScreen > prvScreen) {
			boxText.innerHTML = "WAIT FOR THE FILMS TO DEVELOP...";
			deactivate(papCont);
			devel.alpha = 0;
			Twn.get(devel).to({alpha:1}, 5000).call(develDone);
			fgMoving = true;
			timID = -1;
		} else {
			hungFilm1.visible = hungFilm2.visible = hungFilm3.visible = hungFilm4.visible = hungDots1.visible = hungDots2.visible = hungDots3.visible = hungDots4.visible = false;
			tongs2.visible = true;
			clearText();
			lightsOff();
			screenReady();
		}
		break;
		//- - - - - - - - - - - - - - - -
		case 9:
		deactivate(tongs2);
		tongs2.visible = devel.visible = film1.visible = film2.visible = film3.visible = film4.visible = dotsTray2.visible = dotsTray3.visible = dotsTray4.visible = false;
		hungFilm1.visible = hungFilm2.visible = hungFilm3.visible = hungFilm4.visible = hungDots1.visible = hungDots2.visible = hungDots3.visible = hungDots4.visible = true;
		pin1.gotoAndStop("pin2");
		pin2.gotoAndStop("pin2");
		pin3.gotoAndStop("pin2");
		pin4.gotoAndStop("pin2");
		lightsOn();
	}
	updateFG = true;
}

function overObject(evt) {
	var o = evt.currentTarget;
	if (o.hasOwnProperty("name") && o.name == "films") {
		o.set(papContProps4);
		o.scaleX = o.scaleY = 1.033;
	} else { o.scaleX = o.scaleY = 1.05; }
	updateFG = true;
}

function outObject(evt) {
	var o = evt.currentTarget;
	if (o.hasOwnProperty("name") && o.name == "films") { o.set(papContProps3); }
	o.scaleX = o.scaleY = 1;
	updateFG = true;
}
