var piece_color=["#ccc", "black"];


var player_side=["白子", "黑子"];



var JOIN = 0;
var START = 1;
var TURN = 2;
var DATA = 3;
var PLAYER = 4;

var msg_handler=[null, get_id, set_my_turn,display, show_players];

var canvas;
var array;
var near;
var my = {
   id : -1,
   turn : false,
};

MIN = -9E5;
MAX = 9E5;
MARK = [0, 1, 10, 90, 800, 7E3];
MSG = ["白方获胜", "黑方获胜", "平局.."];

Array.prototype.has = function(a) {
	for (var b = 0; b < this.length; b++) 
        if (this[b] == a) 
            return true;
	return false
};
Array.prototype.getMax_rand = function() {
	for (var a = MIN, b = 0, c = 0; c < this.length; c++) 
        this[c] > a ? (a = this[c], b = c) : this[c] == a && Math.random() > 0.5 && (b = c);
	return [b, a]
};
Array.prototype.getAverage = function() {
	for (var a = 0, b = 0; b < this.length; b++) 
        a += this[b] / this.length;
	return a
};
Array.prototype.extend = function(a) {
	for (var b = 0; b < this.length; b++) 
        this[b] == a && this.splice(b, 1);
	for (b = 0; b < func_list.length; b++) {
		var c = func_list[b](a);
		c != -1 && array[c] == 0 && !this.has(c) && this.push(c)
	}
};

var func_list = [x_next, x_prev, y_next, y_prev, slope_next, slope_prev, backslope_next, backslope_prev],
	x_list = [x_next, x_prev],
	y_list = [y_next, y_prev],
	slope_list = [slope_next, slope_prev],
	backslope_list = [backslope_next, backslope_prev];

function x_next(a) {
	a == -1 && alert("wrong! xn");
	return a % num == num - 1 ? -1 : a + 1
}
function y_next(a) {
	a == -1 && alert("wrong! yn");
	return Math.floor(a / num) == num - 1 ? -1 : a + num
}
function slope_next(a) {
	a == -1 && alert("wrong! sn");
	return Math.floor(a / num) == num - 1 || a % num == num - 1 ? -1 : a + num + 1
}

function backslope_next(a) {
	a == -1 && alert("wrong! rs");
	return Math.floor(a / num) == 0 || a % num == num - 1 ? -1 : a - num + 1
}
function x_prev(a) {
	a == -1 && alert("wrong! xp");
	return a % num == 0 ? -1 : a - 1
}
function y_prev(a) {
	a == -1 && alert("wrong! yp");
	return Math.floor(a / num) == 0 ? -1 : a - num
}
function slope_prev(a) {
	a == -1 && alert("wrong! sp");
	return Math.floor(a / num) == 0 || a % num == 0 ? -1 : a - num - 1
}
function backslope_prev(a) {
	a == -1 && alert("wrong! rp");
	return Math.floor(a / num) == num - 1 || a % num == 0 ? -1 : a + num - 1
};

function init() {
          
	/*
	if (canvas.getContext) {
		var a = canvas.getContext("2d");
		a.fillStyle = "#EEA";
		a.fillRect(grid, grid, (num - 1) * grid, (num - 1) * grid);
		a.strokeStyle = "#000";
		a.lineWidth = 3;
		a.strokeRect(grid, grid, (num - 1) * grid, (num - 1) * grid);
		a.strokeStyle = "#333";
		for (var b = a.lineWidth = 1; b < num; b++) a.beginPath(), a.moveTo(grid, b * grid), a.lineTo(num * grid, b * grid), a.closePath(), a.stroke(), a.beginPath(), a.moveTo(b * grid, grid), a.lineTo(b * grid, num * grid), a.closePath(), a.stroke();
	}*/
	drawMap();
	document.getElementById("map").addEventListener("click", boardClicked, 0);
	array = Array(num * num);
	for (b = 0; b < num * num; b++) array[b] = 0;

}

function drawMap()
{
	canvas = document.getElementById("map")
	canvas.setAttribute("height", grid * (num + 1));
	canvas.setAttribute("width", grid * (num + 1));

	map = canvas.getContext("2d"); 
	map.beginPath();
	for(var i=0;i<=num;i++){
		var p=i*grid;
		map.moveTo(p,0);
		map.lineTo(p,num*grid);
		map.moveTo(0,p);
		map.lineTo(num*grid,p);
	}
	map.strokeStyle="#fff";
	map.stroke();   
}


function start() {
   client.send(START,[]); 
}

function set_my_turn() {
    my.turn = true;
}

function display(data) {
	if(my.id < 2)
	{
		if(data[0].id != my.id)
		{
			addPiece(data[0].pos[0],data[0].pos[1], data[0].id);
			judge();
		}	
	}
	else
	{
       addPiece(data[0].pos[0],data[0].pos[1], data[0].id);
	   judge();
	} 
}

function get_id(data) {
    my.id = data[0].id;
    console.log("id", my.id);
    document.getElementById("start").disabled='disabled';
	if (my.id < 2)
	{
        $("#myName").html("你执"+player_side[my.id]);
        noticeSwitch(1);
	}	
	else
	{
        $("#myName").html("你是观众");
        $(".status_bar").html("待本局结束，刷新网页可加入");
	}
}

function show_players(data) {
	var player_str="玩家:\n";
	var watcher_str="观众:\n";
	for(i=0; i<data.length; i++)
	{
		if(i<2)
		   player_str += data[i]+"\n";
		else
		   watcher_str += data[i]+"\n";
	}
   
    $("#players").html(player_str);
    $("#watchers").html(watcher_str);
}
function boardClicked(e) {
	if (my.turn) {

		screenX = document.getElementById("map").offsetLeft; 
		screenY = document.getElementById("map").offsetTop; 

		a = (e.clientX - screenX )/grid;
		b = (e.clientY - screenY )/grid;
    
        //vaild range for click
        var th = 0.4;
        if (Math.abs(a-Math.round(a)) > th && Math.abs(b-Math.round(b)) > th)
            return;
        a = Math.round(a);
        b = Math.round(b);

        if (b >= 0 && b < num && a >= 0 && a < num && array[pos(a, b)] == 0) {
            addPiece(a, b, my.id); 
		    my.turn = false;
            sendData([a, b]);
            judge();
        }
	}
}

function addPiece(a,b, id) {
	var r = grid*0.32;
	var y = b * grid;
	var x = a * grid;

    piece = document.getElementById("map").getContext("2d"),

	//.save();
	//.translate(this.ox,this.ox);

	piece.beginPath();
	var gradient=piece.createRadialGradient((x-r/2),(y-r/2),0,x,y,r);
	gradient.addColorStop(0,"#fff");
	gradient.addColorStop(1,piece_color[id]);
	piece.arc(x,y,r,0,Math.PI*2);
	piece.fillStyle=gradient;
	piece.shadowOffsetX = 2;
	piece.shadowOffsetY = 2;
	piece.shadowBlur = 2;
	piece.shadowColor = "rgba(0, 0, 0, 0.5)";
	piece.fill();
	piece.restore();

	array[pos(a,b)] = id+1;
	noticeSwitch(id);
	/*
	var c = canvas.getContext("2d"),
	c.fillStyle = piece_color[id];
    console.log(c.fillStyle);

	c.beginPath();
	c.arc((e + 1) * grid, (f + 1) * grid, Math.floor(grid / 3), 0, Math.PI * 2, !0);
	c.fill();
	c.closePath();

	c.strokeStyle = "black";
	c.beginPath();
	c.arc((e + 1) * grid, (f + 1) * grid, Math.floor(grid / 3), 0, Math.PI * 2, !0);
	c.stroke();
	c.closePath();

	//near.extend(a);
	*/
   
	return;
}

function judge()
{
    if(judgeWhite())
    {
	    alert(MSG[0]);
    }
    else if(judgeBlack())
    {
	    alert(MSG[1]);
    }
    else if(judgeFull())
    {
	    alert(MSG[2]);
    }

}

function sendData(a)
{
   client.send(TURN, [{id:my.id, pos:a}]);
}

function pos(a, b) {
	return b * num + a;
}

function noticeSwitch(id) {
	$(".status_bar").removeClass("now");
    //sleep(100);
    $(".status_bar").addClass("now")     

	if(my.id < 2)
	{
		if (id !== my.id) 
			$(".status_bar").html("该你了");
		else
			$(".status_bar").html("等待对方落子"); 
	}
	else
	{
        $(".status_bar").html("等待"+player_side[(id+1)%2].slice(0,1) + "方行动"); 
	}

}

function judgeWhite() {
    return judgeEnd(1);
}

function judgeBlack() {
    return judgeEnd(2);
}



function judgeEnd(id) {
	return checkEnd(x_next, id) || checkEnd(y_next, id) || checkEnd(slope_next, id) || checkEnd(backslope_next, id); 
}
function judgeFull() {
	for (var a = 0; a < array.length; a++) if (array[a] == 0) return false;
	return true;
}

function checkEnd(a, b) {
	for (var c = 0; c < array.length;) {
		for (var f = c, e = 5; e && array[f] == b;) if (e--, f = a(f), f == -1) break;
		if (e == 0) return true;
		c++;
	}
	return false;
}


/*global Class, Maple */
var Test = Class(function() {
    Maple.Client(this, 30, 60);

}, Maple.Client, {

    started: function() {
        console.log('started');
    },

    update: function(t, tick) {
        //console.log(t, tick, this.getRandom());
    },

    render: function(t, dt, u) {

    },

    stopped: function() {
        console.log('stopped');
    },

    connected: function() {
        console.log('connected', this.id);
    },

    message: function(type, tick, data) {
        console.log('message:', type, tick, data);

        msg_handler[type](data);
        return true; // return true to mark this message as handled
    },

    syncedMessage: function(type, tick, data) {
        console.log('synced message:', type, tick, data);
    },

    closed: function(byRemote, errorCode) {
        console.log('Closed:', byRemote, errorCode);
    }

});
var client = new Test();

$(document).ready(function() {
        init();
        client.connect('10.1.83.81', 4000);
});

