var list,nowBoxList,stageList=[],boxList=[],playerList=[];

var stageMenu = [
{x:0,y:0,step:0,times:0,index:0,open:true},
{x:1,y:0,step:0,times:0,index:1,open:false},
{x:2,y:0,step:0,times:0,index:2,open:false},
{x:0,y:1,step:0,times:0,index:3,open:false},
{x:1,y:1,step:0,times:0,index:4,open:false},
{x:2,y:1,step:0,times:0,index:5,open:false}
];
if(window.localStorage.getItem("lufylegend_box_stageMenu"))
stageMenu=JSON.parse(window.localStorage.getItem("lufylegend_box_stageMenu"));
var stage01 = [
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
[-1,-1, 1, 1, 1, 1, 1, 1,-1,-1,-1],
[-1,-1, 1, 0, 0, 0, 0, 1, 1,-1,-1],
[-1,-1, 1, 0, 0, 4, 0, 0, 1,-1,-1],
[-1,-1, 1, 4, 4, 0, 4, 4, 1,-1,-1],
[-1,-1, 1, 0, 0, 4, 0, 0, 1,-1,-1],
[-1,-1, 1, 1, 0, 0, 0, 0, 1,-1,-1],
[-1,-1,-1, 1, 1, 1, 1, 1, 1,-1,-1],
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
];
var box01 = [
{x:3,y:3},
{x:4,y:3},
{x:5,y:3},
{x:5,y:5},
{x:6,y:5},
{x:7,y:5}
];
stageList.push(stage01);
boxList.push(box01);
playerList.push({x:5,y:4});

var stage02 = [
[-1,-1, 1, 1, 1, 1, 1,-1,-1,-1,-1],
[-1,-1, 1, 0, 0, 0, 1, 1, 1,-1,-1],
[-1, 1, 1, 0, 1, 0, 0, 0, 1,-1,-1],
[-1, 1, 0, 4, 4, 0, 4, 0, 1,-1,-1],
[-1, 1, 0, 0, 0, 0, 0, 1, 1,-1,-1],
[-1, 1, 1, 1, 0, 1, 4, 1,-1,-1,-1],
[-1,-1,-1, 1, 0, 0, 0, 1,-1,-1,-1],
[-1,-1,-1, 1, 1, 1, 1, 1,-1,-1,-1],
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
];
var box02 = [
{x:3,y:2},
{x:6,y:2},
{x:4,y:3},
{x:6,y:4}
];
stageList.push(stage02);
boxList.push(box02);
playerList.push({x:5,y:3});

var stage03 = [
[-1,-1, 1, 1, 1, 1, 1, 1, 1, 1,-1],
[-1, 1, 1, 0, 0, 1, 0, 0, 0, 1,-1],
[-1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1],
[-1, 1, 0, 1, 0, 4, 0, 1, 0, 0, 1],
[-1, 1, 4, 4, 0, 4, 4, 0, 1, 0, 1],
[-1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
[-1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1],
[-1, 1, 0, 0, 0, 1, 1, 1, 1, 1,-1],
[-1, 1, 1, 1, 1, 1,-1,-1,-1,-1,-1]
];
var box03 = [
{x:5,y:3},
{x:4,y:5},
{x:5,y:5},
{x:7,y:5},
{x:8,y:5}
];
stageList.push(stage03);
boxList.push(box03);
playerList.push({x:6,y:3});

var stage04 = [
[-1,-1,-1, 1, 1, 1, 1, 1,-1,-1,-1],
[-1, 1, 1, 1, 0, 0, 0, 1, 1, 1,-1],
[-1, 1, 0, 0, 4, 0, 4, 0, 0, 1,-1],
[-1, 1, 0, 0, 4, 4, 4, 0, 0, 1,-1],
[-1, 1, 0, 0, 4, 0, 4, 0, 0, 1,-1],
[-1, 1, 1, 1, 0, 0, 0, 1, 1, 1,-1],
[-1,-1,-1, 1, 1, 1, 1, 1,-1,-1,-1],
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
];
var box04 = [
{x:3,y:2},
{x:3,y:4},
{x:5,y:2},
{x:5,y:3},
{x:5,y:4},
{x:7,y:2},
{x:7,y:4}
];
stageList.push(stage04);
boxList.push(box04);
playerList.push({x:8,y:3});

var stage05 = [
[-1,-1, 1, 1, 1, 1, 1, 1, 1,-1,-1],
[-1,-1, 1, 0, 0, 4, 0, 0, 1,-1,-1],
[-1, 1, 1, 0, 0, 4, 0, 0, 1, 1,-1],
[-1, 1, 0, 4, 4, 4, 4, 4, 0, 1,-1],
[-1, 1, 0, 0, 0, 4, 0, 0, 0, 1,-1],
[-1, 1, 0, 0, 0, 4, 0, 0, 0, 1,-1],
[-1, 1, 1, 1, 1, 1, 1, 1, 1, 1,-1],
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
];
var box05 = [
{x:3,y:2},
{x:4,y:2},
{x:6,y:2},
{x:7,y:2},
{x:5,y:3},
{x:3,y:4},
{x:4,y:4},
{x:6,y:4},
{x:7,y:4}
];
stageList.push(stage05);
boxList.push(box05);
playerList.push({x:7,y:1});

var stage06 = [
[-1, 1, 1, 1, 1, 1,-1,-1,-1,-1,-1],
[-1, 1, 0, 0, 0, 1,-1,-1,-1,-1,-1],
[-1, 1, 0, 0, 0, 1, 1, 1, 1, 1,-1],
[-1, 1, 0, 0, 4, 4, 4, 0, 0, 1,-1],
[-1, 1, 0, 0, 4, 4, 4, 0, 0, 1,-1],
[-1, 1, 0, 0, 4, 4, 4, 0, 0, 1,-1],
[-1, 1, 1, 1, 1, 1, 0, 0, 0, 1,-1],
[-1,-1,-1,-1,-1, 1, 0, 0, 0, 1,-1],
[-1,-1,-1,-1,-1, 1, 1, 1, 1, 1,-1]
];
var box06 = [
{x:3,y:2},
{x:3,y:3},
{x:3,y:4},
{x:4,y:2},
{x:7,y:3},
{x:7,y:4},
{x:7,y:5},
{x:7,y:6},
{x:6,y:6}
];
stageList.push(stage06);
boxList.push(box06);
playerList.push({x:6,y:7});