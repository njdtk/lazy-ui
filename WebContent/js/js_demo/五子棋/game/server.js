/**
  * Copyright (c) 2012 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */
var Maple = require('./Maple.js/Maple');

var players = [];
var watchers = [];
var all_data = [];
var max_players = 2;
var min_players = 2;

var game_started = false;
var player_num = 0;
var turn = 0;

//var JOIN = 1;
var START = 1;
var TURN = 2;
var DATA = 3;
var PLAYER = 4;

function player_list(){
}
// Test -----------------------------------------------------------------------
var Test = Maple.Class(function(clientClass) {
    Maple.Server(this, clientClass);

}, Maple.Server, {

    started: function() {
        console.log('Started');
    },

    update: function(t, tick) {
        //console.log(this.getClients().length, 'client(s) connected', t, tick, this.getRandom());
        //this.broadcast(5, ['Hello World']);
    },

    stopped: function() {
        console.log('Stopped');
    },

    connected: function(client) {
        console.log('Connected:', client.id);
        var len = players.push(client.id);

        console.log('New player arrived, current players num:', len);

        //this.broadcast(JOIN, [{num: len}]);

        //client.send(0, [1]);
        client.quit = function(){
            var idx = players.indexOf(this.id)
            players.splice(idx,1);

            //在游戏中的玩家推出后，游戏停止
            //观看玩家推出不影响游戏
            if(idx < player_num)
			{
                game_started = false;
				all_data = [];
			}
        }

		if(game_started)
		{
            client.send(START, [{id:len-1}]);
			for (i=0; i<all_data.length; i++) {
				client.send(DATA, all_data[i]);
			}

		}
       
		var list = [];
		this.getClients().forEach( 
				function(value){ list.push(value.id);}
				);
        this.broadcast(PLAYER, list);
        return;
    },

    message: function(client, type, tick, data) {
        console.log('Message:', client, type, tick);
        if(type == START && !game_started)
        {
			//获得参与玩家数量
            player_num = this.getClients().length;
            if( player_num < min_players)
            {
                return;
            }
            if( player_num >= max_players)
                player_num = max_players;

            game_started = true;
            turn = 0;

            for (i=0; i<this.getClients().length; i++) {
               this.getClients().getAt(i).send(START, [{id:i}])
            }

            this.getClients().getAt(turn).send(TURN, [])
        }
        else if(type == TURN)
        {
            this.broadcast(DATA, data);
			all_data.push(data);
			turn = (turn+1)%player_num;
            this.getClients().getAt(turn).send(TURN, [])
        }
    },

    requested: function(req, res) {
        console.log('HTTP Request');
    },

    disconnected: function(client) {
        console.log('Disconnected:', client.id);
        client.quit();

		var list = [];
		this.getClients().forEach( 
				function(value){ list.push(value.id);}
				);
        this.broadcast(PLAYER, list);
    }

});

var srv = new Test();
srv.start({
    port: 4000,
    logicRate: 10
});
