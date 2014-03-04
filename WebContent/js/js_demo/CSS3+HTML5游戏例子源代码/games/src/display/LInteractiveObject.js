/*
 * LInteractiveObject.js
 **/
function LInteractiveObject(){
	var s = this;
	base(s,LDisplayObject,[]);
	s.type = "LInteractiveObject";
	s.mouseChildren = true;
	s.frameList = new Array();
	s.mouseList = new Array();
}
p = {
	addEventListener:function(type,listener){
		var s = this;
		if(type == LEvent.ENTER_FRAME){
			s.frameList.push(listener);
		}else if(type.indexOf("mouse")>=0 || type.indexOf("touch")>=0){
			s.mouseList.push({listener:listener,type:type});
		}else{
			this._eventList.push({listener:listener,type:type});
		}
	},
	removeEventListener:function(type,listener){
		var s = this,i,length;
		if(type == LEvent.ENTER_FRAME){
			length = s.frameList.length;
			for(i=0;i<length;i++){
				if(type == LEvent.ENTER_FRAME && s.frameList[i] == listener){
					s.frameList.splice(i,1);
					return;
				}
			}
		}else if(type.indexOf("mouse")>=0 || type.indexOf("touch")>=0){
			length = s.mouseList.length;
			for(i=0;i<length;i++){
				if(type == s.mouseList[i].type && s.mouseList[i].listener == listener){
					s.mouseList.splice(i,1);
					return;
				}
			}
		}else{
			length = s._eventList.length;
			for(i=0;i<length;i++){
				if(type == s._eventList[i].type && s._eventList[i].listener == listener){
					s._eventList.splice(i,1);
					return;
				}
			}
		}
	},
	removeAllEventListener:function (){
		var s = this;
		s.frameList.length = 0;
		s.mouseList.length = 0;
		s._eventList.length = 0;
	},
	hasEventListener:function(type){
		var s = this,i,length;
		if(type == LEvent.ENTER_FRAME && s.frameList.length > 0)return true;
		if(type.indexOf("mouse")>=0 || type.indexOf("touch")>=0){
			length = s.mouseList.length;
			for(i=0;i<length;i++){
				if(type == s.mouseList[i].type)return true;
			}
		}else{
			length = s._eventList.length;
			for(i=0;i<length;i++){
				if(type == s._eventList[i].type)return true;
			}
		}
		return false;
	},
	toString:function(){
		return "[LInteractiveObject]";
	}
};
for(var k in p)LInteractiveObject.prototype[k]=p[k];