/**
* lufylegend.ui
* @version 0.1.1
* @Explain HTML5开源引擎lufylegend的专用UI
* @author lufy(lufy_legend)
* @blog http://blog.csdn.net/lufy_Legend
* @email lufy.legend@gmail.com
* @homepage http://lufylegend.com/lufylegend
* @svn http://lufylegend.googlecode.com/svn/trunk/
*/
function LButtonSample1(name,size,font,color){
	var s = this;
	if(!size)size=16;
	if(!color)color = "white";
	if(!font)font = "黑体";
	s.backgroundCorl = "black";
	var btn_up = new LSprite();
	btn_up.shadow = new LSprite();
	btn_up.back = new LSprite();
	btn_up.addChild(btn_up.shadow);
	btn_up.addChild(btn_up.back);
	labelText = new LTextField();
	labelText.color = color;
	labelText.font = font;
	labelText.size = size;
	labelText.x = size*0.5;
	labelText.y = size*0.5;
	labelText.text = name;
	btn_up.back.addChild(labelText);
	var shadow = new LDropShadowFilter(4,45,"#000000",10);
	btn_up.shadow.filters = [shadow];

	var btn_down = new LSprite();
	btn_down.x = btn_down.y = 1;
	labelText = new LTextField();
	labelText.color = color;
	labelText.font = font;
	labelText.size = size;
	labelText.x = size*0.5;
	labelText.y = size*0.5;
	labelText.text = name;
	btn_down.addChild(labelText);
	base(s,LButton,[btn_up,btn_down]);
	s.width = labelText.getWidth() + size;
	s.height = 2.2*size;
	s.backgroundSet = null;
	btn_up.shadow.graphics.drawRoundRect(0,"#000000",[1,1,s.width-2,s.height-2,s.height*0.1],true,"#000000");
	s.addEventListener(LEvent.ENTER_FRAME,s._onDraw);
}
LButtonSample1.prototype._onDraw = function(s){
	var co = s.getRootCoordinate();
	if(s.backgroundSet == s.backgroundCorl && s.xSet == co.x && s.ySet == co.y)return;
	s.backgroundSet = s.backgroundCorl;
	s.xSet = co.x;
	s.ySet = co.y;
	var grd=LGlobal.canvas.createLinearGradient(0,co.y-s.height*0.5,0,co.y+s.height*2);
	grd.addColorStop(0,"white");
	grd.addColorStop(1,s.backgroundCorl);
	
	var grd2=LGlobal.canvas.createLinearGradient(0,co.y-s.height,0,co.y+s.height*2);
	grd2.addColorStop(0,"white");
	grd2.addColorStop(1,s.backgroundCorl);
	
	s.bitmap_up.back.graphics.clear();
	s.bitmap_over.graphics.clear();
	s.bitmap_up.back.graphics.drawRect(1,s.backgroundCorl,[0,0,s.width,s.height],true,grd);
	s.bitmap_up.back.graphics.drawRect(0,s.backgroundCorl,[1,s.height*0.5,s.width-2,s.height*0.5-1],true,grd2);
	s.bitmap_over.graphics.drawRect(1,s.backgroundCorl,[0,0,s.width,s.height],true,grd);
	s.bitmap_over.graphics.drawRect(0,s.backgroundCorl,[1,s.height*0.5,s.width-2,s.height*0.5-1],true,grd2);
};
function LButtonSample2(name,size,font,color){
	var s = this;
	base(s,LButtonSample1,[name,size,font,color]);
}
LButtonSample2.prototype._onDraw = function(s){
	var co = s.getRootCoordinate();
	if(s.backgroundSet == s.backgroundCorl && s.xSet == co.x && s.ySet == co.y)return;
	s.backgroundSet = s.backgroundCorl;
	s.xSet = co.x;
	s.ySet = co.y;
	var grd=LGlobal.canvas.createLinearGradient(0,co.y-s.height*0.5,0,co.y+s.height*2);
	grd.addColorStop(0,"white");
	grd.addColorStop(1,s.backgroundCorl);
	
	var grd2=LGlobal.canvas.createLinearGradient(0,co.y-s.height,0,co.y+s.height*2);
	grd2.addColorStop(0,"white");
	grd2.addColorStop(1,s.backgroundCorl);
	
	s.bitmap_up.back.graphics.clear();
	s.bitmap_over.graphics.clear();
	s.bitmap_up.back.graphics.drawRoundRect(1,s.backgroundCorl,[0,0,s.width,s.height,s.height*0.1],true,grd);
	s.bitmap_up.back.graphics.drawRoundRect(0,s.backgroundCorl,[1,s.height*0.5,s.width-2,s.height*0.5-1,s.height*0.1],true,grd2);
	s.bitmap_over.graphics.drawRoundRect(1,s.backgroundCorl,[0,0,s.width,s.height,s.height*0.1],true,grd);
	s.bitmap_over.graphics.drawRoundRect(0,s.backgroundCorl,[1,s.height*0.5,s.width-2,s.height*0.5-1,s.height*0.1],true,grd2);
};
function LRadioChild(value,layer,layerSelect){
	var s = this;
	base(s,LSprite,[]);
	s.value = value;
	
	if(!layer){
		layer = new LSprite();
		layer.graphics.drawArc(2,"#000000",[0,0,10,0,2*Math.PI],true,"#D3D3D3");
	}
	if(!layerSelect){
		layerSelect = new LSprite();
		layerSelect.graphics.drawArc(0,"#000000",[0,0,4,0,2*Math.PI],true,"#000000");
	}
	s.layer = layer;
	s.layerSelect = layerSelect;
	s.addChild(s.layer);
	s.addChild(s.layerSelect);
	s.layerSelect.visible = false;
	s.checked = false;
	s.addEventListener(LMouseEvent.MOUSE_UP,s._onChange);
}
LRadioChild.prototype._onChange = function(e,s){
	s.parent.setValue(s.value);
};
LRadioChild.prototype.setChecked = function(v){
	this.layerSelect.visible = this.checked = v;
};
function LRadio(){
	base(this,LSprite,[]);
}
LRadio.prototype.setChildRadio = function(value,x,y,layer,layerSelect){
	var s = this;
	var child = new LRadioChild(value,layer,layerSelect);
	child.x = x;
	child.y = y;
	s.addChild(child);
};
LRadio.prototype.push = function(value){
	this.addChild(value);
};
LRadio.prototype.setValue = function(value){
    var s=this,child,k=null;
    for(k in s.childList){
    	child = s.childList[k];
        child.setChecked(false);
        if(child.value == value){
        	s.value = value;
        	child.setChecked(true);
        }
    }
};

function LCheckBox(layer,layerSelect){
	var s = this;
	base(s,LSprite,[]);
	
	if(!layer){
		layer = new LSprite();
		layer.graphics.drawRect(2,"#000000",[0,0,20,20],true,"#D3D3D3");
	}
	if(!layerSelect){
		layerSelect = new LSprite();
		layerSelect.graphics.drawLine(5,"#000000",[2,10,10,18]);
		layerSelect.graphics.drawLine(5,"#000000",[10,18,18,2]);
	}
	s.layer = layer;
	s.layerSelect = layerSelect;
	s.addChild(s.layer);
	s.addChild(s.layerSelect);
	s.layerSelect.visible = s.checked = false;
	s.addEventListener(LMouseEvent.MOUSE_UP,s._onChange);
}
LCheckBox.prototype._onChange = function(e,s){
	s.checked = !s.checked;
	s.layerSelect.visible = s.checked;
};
LCheckBox.prototype.setChecked = function(value){
	s.checked = value;
	s.layerSelect.visible = s.checked;
};
function LComboBox(size,color,font,layer,layerUp,layerDown){
	var s = this;
	base(s,LSprite,[]);
	s.list = [];
	s.selectIndex = 0;
	s.value = null;
	s.selectWidth = 100;
	if(!size)size=16;
	if(!color)color = "black";
	if(!font)font = "黑体";
	s.size = size;
	s.color = color;
	s.font = font;
	s.refreshFlag = false;
	
	if(!layer){
		s.refreshFlag = true;
		layer = new LSprite();
		layerUp = new LSprite();
		layerDown = new LSprite();
		s.layer = layer;
		s.layerUp = layerUp;
		s.layerDown = layerDown;
		s.refresh();
	}
	s.addChild(layer);
	s.addChild(layerUp);
	s.addChild(layerDown);
	s.layer = layer;
	s.layerUp = layerUp;
	s.layerDown = layerDown;
	
	s.runing = false;
	
	s.textLayer = new LSprite();
	s.textLayer.x = 5;
	s.textLayer.y = s.size * 0.4;
	s.addChild(s.textLayer);
	s.layerUp.addEventListener(LMouseEvent.MOUSE_UP,s._onChangeUp);
	s.layerDown.addEventListener(LMouseEvent.MOUSE_UP,s._onChangeDown);
}
LComboBox.prototype.refresh = function(){
	var s = this,k=null;

	for(k in s.list){
		s.textLayer.childList[k].visible = false;
		if(s.value == s.list[k].value)s.textLayer.childList[k].visible = true;
		if(s.selectWidth < s.textLayer.childList[k].getWidth() + s.size){
			s.selectWidth = s.textLayer.childList[k].getWidth() + s.size;
		}
	}
	
	s.layer.graphics.clear();
	s.layerUp.graphics.clear();
	s.layerDown.graphics.clear();
	s.layer.graphics.drawRect(2,"#000000",[0,0,s.selectWidth,s.size*2],true,"#D3D3D3");
	s.layerUp.x = s.selectWidth;
	s.layerUp.graphics.drawRect(2,"#000000",[0,0,s.size*2,s.size]);
	s.layerUp.graphics.drawVertices(2,"#000000",[[s.size*0.5*2,s.size*0.2],[s.size*0.2*2,s.size*0.8],[s.size*0.8*2,s.size*0.8]],true,"#000000");
	s.layerDown.x = s.selectWidth;
	s.layerDown.y = s.size;
	s.layerDown.graphics.drawRect(2,"#000000",[0,0,s.size*2,s.size]);
	s.layerDown.graphics.drawVertices(2,"#000000",[[s.size*0.5*2,s.size*0.8],[s.size*0.2*2,s.size*0.2],[s.size*0.8*2,s.size*0.2]],true,"#000000");
};
LComboBox.prototype.setChild = function(child){
	var s = this;
	if(!child || !child.value || !child.label)trace("the child must be an object like:{label:a,value:b}");
	
	var text = new LTextField();
	text.size = s.size;
	text.color = s.color;
	text.font = s.font;
	text.text = child.label;
	text.y = (s.size * 1.5 >>> 0) * s.list.length;
	s.textLayer.addChild(text);
	if(s.list.length == 0){
		s.value = child.value;
	}
	s.list.push(child);
	s.selectWidth = 100;
	s.refresh();
	
};
LComboBox.prototype._onChangeDown = function(e,b){
	var s = b.parent;
	if(s.runing)return;
	if(s.selectIndex >= s.list.length - 1)return;
	s.runing = true;
	for(k in s.list){
		s.textLayer.childList[k].visible = true;
	}
	s.selectIndex++;
	s.value = s.list[s.selectIndex].value;
	var mask = new LSprite();
	mask.graphics.drawRect(2,"#000000",[0,0,s.selectWidth,s.size*2]);
	s.textLayer.mask = mask;
	var my = s.textLayer.y - (s.size * 1.5 >>> 0);
	var fun = function(layer){
		var s = layer.parent;
		layer.mask = null;
		s.runing = false;
		s.refresh();
	};
	LTweenLite.to(s.textLayer,0.3,
	{ 
		y:my,
		onComplete:fun,
		ease:Strong.easeOut
	});
};
LComboBox.prototype._onChangeUp = function(e,b){
	var s = b.parent;
	if(s.runing)return;
	if(s.selectIndex <= 0)return;
	s.runing = true;
	for(k in s.list){
		s.textLayer.childList[k].visible = true;
	}
	s.selectIndex--;
	s.value = s.list[s.selectIndex].value;
	var mask = new LSprite();
	mask.graphics.drawRect(2,"#000000",[0,0,s.selectWidth,s.size*2]);
	s.textLayer.mask = mask;
	var my = s.textLayer.y + (s.size * 1.5 >>> 0);
	var fun = function(layer){
		var s = layer.parent;
		layer.mask = null;
		s.runing = false;
		s.refresh();
	};
	LTweenLite.to(s.textLayer,0.3,
	{ 
		y:my,
		onComplete:fun,
		ease:Strong.easeOut
	});
};
function LScrollbar(showObject,maskW,maskH,scrollWidth,wVisible){
	var s = this;
	base(s,LSprite,[]);
	s._showLayer = new LSprite();
	s._mask = new LGraphics();
	s._mask.drawRect(1,"#ffffff",[0,0,maskW,maskH],true,"#ffffff");
	s._showLayer.graphics.drawRect(1,"#ffffff",[0,0,maskW,maskH],true,"#ffffff");
	s._wVisible = typeof wVisible == UNDEFINED?true:wVisible;
	s.addChild(s._showLayer);
	s._width = 0;
	s._height = 0;
	s._showObject = showObject;
	s._showLayer.addChild(showObject);
	s._showObject.mask = s._mask;
	s._scrollWidth = scrollWidth?scrollWidth:20;
	s._tager = {x:0,y:0};
	s.addEventListener(LEvent.ENTER_FRAME,s.onFrame);
}
LScrollbar.prototype.onFrame = function(s){
	if(s._wVisible && s._width != s._showObject.getWidth()){
		s._width = s._showObject.getWidth();
		if(s._width > s._mask.getWidth()){
			s.resizeWidth(true);
			s.moveLeft();
		}else{
			s.resizeWidth(false);
		}
	}
	if(s._height != s._showObject.getHeight()){
		s._height = s._showObject.getHeight();
		if(s._height > s._mask.getHeight()){
			s.resizeHeight(true);
			s.moveUp();
		}else{
			s.resizeHeight(false);
		}
	}
	if(s._key == null)return;
	if(s._key["up"]){
		s.moveUp();
	}
	if(s._key["down"]){
		s.moveDown();
	}
	if(s._key["left"]){
		s.moveLeft();
	}
	if(s._key["right"]){
		s.moveRight();
	}
};

LScrollbar.prototype.resizeWidth = function(value){
	var s = this;
	if(!value){
		if(s._scroll_w != null){
			s._scroll_w.parent.removeChild(s._scroll_w);
			s._scroll_w_bar.parent.removeChild(s._scroll_w_bar);
			s._scroll_w = null;
			s._scroll_w_bar = null;
		}
		return;
	}
	var i;
	if(s._scroll_w_bar == null){
		if(s._key == null)s._key = [];
		s._scroll_w = new LSprite();
		s._scroll_w_bar = new LSprite();
		s.addChild(s._scroll_w);
		s.addChild(s._scroll_w_bar);
		var ny = s._scrollWidth*1.5;
		s._scroll_w.x = 0;
		s._scroll_w.y = s._mask.getHeight();
		s._scroll_w_bar.x = s._scrollWidth;
		s._scroll_w_bar.y = s._mask.getHeight();
		s._scroll_w_bar.graphics.drawRect(1,"#000000",[0,0,ny,s._scrollWidth],true,"#cccccc");
		s._scroll_w_bar.graphics.drawLine(1,"#000000",[ny*0.5,s._scrollWidth*0.25,ny*0.5,s._scrollWidth*0.75]);
		s._scroll_w_bar.graphics.drawLine(1,"#000000",[ny*0.5-3,s._scrollWidth*0.25,ny*0.5-3,s._scrollWidth*0.75]);
		s._scroll_w_bar.graphics.drawLine(1,"#000000",[ny*0.5+3,s._scrollWidth*0.25,ny*0.5+3,s._scrollWidth*0.75]);
		s._scroll_w.graphics.drawRect(1,"#000000",[0,0,s._mask.getWidth(),s._scrollWidth],true,"#292929");
		s._scroll_w.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,s._scrollWidth],true,"#ffffff");
		s._scroll_w.graphics.drawRect(1,"#000000",[s._mask.getWidth() - s._scrollWidth,0,s._scrollWidth,s._scrollWidth],true,"#ffffff");
		s._scroll_w.graphics.drawVertices(1,"#000000",[[s._scrollWidth*0.75,s._scrollWidth*0.25],
			[s._scrollWidth*0.75,s._scrollWidth*0.75],
			[s._scrollWidth*0.25,s._scrollWidth*0.5]],true,"#000000");
		s._scroll_w.graphics.drawVertices(1,"#000000",[[s._mask.getWidth() - s._scrollWidth*0.75,s._scrollWidth*0.25],
			[s._mask.getWidth() - s._scrollWidth*0.75,s._scrollWidth*0.75],
			[s._mask.getWidth() - s._scrollWidth*0.25,s._scrollWidth*0.5]],true,"#000000");
		s._scroll_w.graphics.drawRect(1,"#000000",[0,0,s._mask.getWidth(),s._scrollWidth]);
		s._scroll_w.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,s._scrollWidth]);
		s._scroll_w.graphics.drawRect(1,"#000000",[s._mask.getWidth() - s._scrollWidth,0,s._scrollWidth,s._scrollWidth]);
		var mouseDownHave = false;
		for(i=0;i<s.mouseList.length;i++){
 			if(s.mouseList[i][0] == LMouseEvent.MOUSE_DOWN){
				mouseDownHave = true;
  				break;
			}
		}
    		if(!mouseDownHave)s.addEventListener(LMouseEvent.MOUSE_DOWN,s.mouseDown);
	}
};
LScrollbar.prototype.resizeHeight = function(value){
	var s = this;
	if(!value){
		if(s._scroll_h != null){
			s._scroll_h.parent.removeChild(s._scroll_h);
			s._scroll_h_bar.parent.removeChild(s._scroll_h_bar);
			s._scroll_h = null;
			s._scroll_h_bar = null;
		}
		return;
	}
	var i;
	if(s._scroll_h_bar == null){
		if(s._key == null)s._key = [];
		s._scroll_h = new LSprite();
		s._scroll_h_bar = new LSprite();
		s.addChild(s._scroll_h);
		s.addChild(s._scroll_h_bar);
		var ny = s._scrollWidth*1.5;
		s._scroll_h.x = s._mask.getWidth();
		s._scroll_h.y = 0;
		s._scroll_h_bar.x = s._mask.getWidth();
		s._scroll_h_bar.y = s._scrollWidth;
		s._scroll_h_bar.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,s._scrollWidth*1.5],true,"#cccccc");
		s._scroll_h_bar.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,ny]);
		s._scroll_h_bar.graphics.drawLine(1,"#000000",[s._scrollWidth*0.25,ny*0.5,s._scrollWidth*0.75,ny*0.5]);
		s._scroll_h_bar.graphics.drawLine(1,"#000000",[s._scrollWidth*0.25,ny*0.5-3,s._scrollWidth*0.75,ny*0.5-3]);
		s._scroll_h_bar.graphics.drawLine(1,"#000000",[s._scrollWidth*0.25,ny*0.5+3,s._scrollWidth*0.75,ny*0.5+3]);
		s._scroll_h.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,s._mask.getHeight()],true,"#292929");
		s._scroll_h.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,s._scrollWidth],true,"#ffffff");
		s._scroll_h.graphics.drawRect(1,"#000000",[0,s._mask.getHeight() - s._scrollWidth,s._scrollWidth,s._scrollWidth],true,"#ffffff");
		s._scroll_h.graphics.drawVertices(1,"#000000",[[s._scrollWidth/4,s._scrollWidth*0.75],
			[s._scrollWidth/2,s._scrollWidth/4],
			[s._scrollWidth*0.75,s._scrollWidth*0.75]],true,"#000000");
		s._scroll_h.graphics.drawVertices(1,"#000000",[[s._scrollWidth/4,s._mask.getHeight() - s._scrollWidth*0.75],
			[s._scrollWidth/2,s._mask.getHeight() - s._scrollWidth*0.25],
			[s._scrollWidth*0.75,s._mask.getHeight() - s._scrollWidth*0.75]],true,"#000000");
		s._scroll_h.graphics.drawRect(1,"#000000",[0,0,s._scrollWidth,s._mask.getHeight()]);
		s._scroll_h.graphics.drawRect(1,"#000000",[0,0,0,0,s._scrollWidth,s._scrollWidth]);
		s._scroll_h.graphics.drawRect(1,"#000000",[0,s._mask.getHeight() - s._scrollWidth,s._scrollWidth,s._scrollWidth]);
		var mouseDownHave = false;
  		for(i=0;i<s.mouseList.length;i++){
      			if(s.mouseList[i][0] == LMouseEvent.MOUSE_DOWN){
				mouseDownHave = true;
			}
		}
		if(!mouseDownHave){
			s.addEventListener(LMouseEvent.MOUSE_DOWN,s.mouseDown);
		}
	}
};
LScrollbar.prototype.moveLeft = function(){
	var s = this;
	if(!s._key["Dkey"] && s._showObject.x >= s._tager.x){
		s._key["left"] = false;
		s.setScroll_w();
		return;
	}else if(s._showObject.x >= 0){
		s._showObject.x = 0;
		s._key["left"] = false;
		s.setScroll_w();
		return;
	}
	if(s._key["Dkey"])s._speed = 5;
	s._showObject.x += s._speed;
	s.setScroll_w();
	s.setSpeed();
};
LScrollbar.prototype.setScroll_h = function(){
	var s = this;
	var sy = (s._mask.getHeight() - s._scrollWidth*3.5)*s._showObject.y/(s._mask.getHeight() - s._showObject.getHeight());
	if(s._scroll_h_bar){
		s._scroll_h_bar.x = s._mask.getWidth();
		s._scroll_h_bar.y = s._scrollWidth + sy;
	}
};
LScrollbar.prototype.setScroll_w = function(){
	var s = this;
	var sx = (s._mask.getWidth() - s._scrollWidth*3.5)*s._showObject.x/(s._mask.getWidth() - s._showObject.getWidth());
	if(s._scroll_w_bar){
		s._scroll_w_bar.x = s._scrollWidth + sx;
		s._scroll_w_bar.y = s._mask.getHeight();
	}
};
LScrollbar.prototype.moveUp = function(){
	var s = this;
	if(!s._key["Dkey"] && s._showObject.y >= s._tager.y){
		s._key["up"] = false;
		s.setScroll_h();
		return;
	}else if(s._showObject.y >= 0){
		s._showObject.y = 0;
		s._key["up"] = false;
		s.setScroll_h();
		return;
	}
	if(s._key["Dkey"])s._speed = 5;
	s._showObject.y += s._speed;
	s.setScroll_h();
	s.setSpeed();
};
LScrollbar.prototype.moveDown = function(){
	var s = this;
	if(!s._key["Dkey"] && s._showObject.y <= s._tager.y){
		s._key["down"] = false;
		s.setScroll_h();
		return;
	}else if(s._showObject.y <= s._mask.getHeight() - s._showObject.getHeight()){
		s._showObject.y = s._mask.getHeight() - s._showObject.getHeight();
		s._key["down"] = false;
		s.setScroll_h();
		return;
	}
	if(s._key["Dkey"])s._speed = 5;
	s._showObject.y -= s._speed;
	s.setScroll_h();
	s.setSpeed();
};
LScrollbar.prototype.getScrollY = function(){
	return this._showObject.y;
};
LScrollbar.prototype.setScrollY = function(value){
	this._showObject.y = value;
	this.setScroll_h();
};
LScrollbar.prototype.getScrollX = function(){
	return this._showObject.x;
};
LScrollbar.prototype.setScrollX = function(value){
	this._showObject.x = value;
	this.setScroll_w();
};
LScrollbar.prototype.scrollToTop = function(){
	this._showObject.y = 0;
	this.setScroll_h();
};
LScrollbar.prototype.scrollToBottom = function(){
	var s = this;
	s._showObject.y = s._showObject.getHeight()>s._mask.getHeight()?s._mask.getHeight()-s._showObject.getHeight():0;
	s.setScroll_h();
};
LScrollbar.prototype.scrollToLeft = function(){
	this._showObject.x = 0;
	this.setScroll_w();
};
LScrollbar.prototype.scrollToRight = function(){
	var s = this;
	s._showObject.x = s._showObject.getWidth()>s._mask.getWidth()?s._mask.getWidth()-s._showObject.getWidth():0;
	s.setScroll_w();
};
LScrollbar.prototype.moveRight = function(){
	var s = this;
	if(!s._key["Dkey"] && s._showObject.x <= s._tager.x){
		s._key["right"] = false;
		s.setScroll_w();
		return;
	}else if(s._showObject.x <= s._mask.getWidth() - s._showObject.getWidth()){
		s._showObject.x = s._mask.getWidth() - s._showObject.getWidth();
		s._key["right"] = false;
		s.setScroll_w();
		return;
	}
	if(s._key["Dkey"])s._speed = 5;
	s._showObject.x -= s._speed;
	s.setScroll_w();
	s.setSpeed();
};
LScrollbar.prototype.mouseDown = function(event,s){
	if(s._scroll_h != null && event.selfX >= s._scroll_h.x && event.selfX <= s._scroll_h.x + s._scrollWidth){
		s.mouseDownH(event,s);
	}
	if(s._scroll_w != null && event.selfY >= s._scroll_w.y && event.selfY <= s._scroll_w.y + s._scrollWidth){
		s.mouseDownW(event,s);
	}
};
LScrollbar.prototype.mouseMoveH = function(event,s){
	if(event.selfY < s._scrollWidth || event.selfY > s._mask.getHeight())return;
	var mx = event.selfY - s._key["scroll_y"];
	s._key["up"] = false;
	s._key["down"] = false;
	s._tager.y = (s._mask.getHeight() - s._showObject.getHeight())*(mx - s._scrollWidth)/(s._mask.getHeight() - s._scrollWidth*3.5);
	if(s._tager.y > s._showObject.y){
		s._key["up"] = true;
	}else{
		s._key["down"] = true;
	}
	s._speed = Math.abs(s._tager.y - s._showObject.y);
	s.setSpeed();
};
LScrollbar.prototype.mouseUpH = function(event,s){
	s.removeEventListener(LMouseEvent.MOUSE_UP,s.mouseUpH);
	if(s._key["Dkey"]){
		s._key["Dkey"] = false;
	}else{
		s.removeEventListener(LMouseEvent.MOUSE_MOVE,s.mouseMoveH);
		if(s._key["scroll_h"])s._key["scroll_h"] = false;
	}
};
LScrollbar.prototype.mouseUpW = function(event,s){
	s.removeEventListener(LMouseEvent.MOUSE_UP,s.mouseUpW);
	if(s._key["Dkey"]){
		s._key["Dkey"] = false;
	}else{
		s.removeEventListener(LMouseEvent.MOUSE_MOVE,s.mouseMoveW);
		if(s._key["scroll_w"])s._key["scroll_w"] = false;
	}
};
LScrollbar.prototype.mouseMoveW = function(event,s){
	if(event.selfX < s._scrollWidth || event.selfX > s._mask.getWidth())return;
	var my = event.selfX - s._key["scroll_x"];
	s._key["left"] = false;
	s._key["right"] = false;
	s._tager.x = (s._mask.getWidth()- s._showObject.getWidth())*(my - s._scrollWidth)/(s._mask.getWidth() - s._scrollWidth*3.5);
	if(s._tager.x > s._showObject.x){
		s._key["left"] = true;
	}else{
		s._key["right"] = true;
	}
	s._speed = Math.abs(s._tager.x - s._showObject.x);
	s.setSpeed();
};
LScrollbar.prototype.setSpeed = function(){
	var s = this;
	s._speed = Math.floor(s._speed/2);
	if(s._speed == 0)s._speed = 1;
};
LScrollbar.prototype.mouseDownW = function(event,s){
	if(event.selfX >= 0 && event.selfX <= s._scrollWidth){
		if(s._showObject.x >= 0 || s._key["left"])return;
		s._distance = 10;
		if(s._showObject.x + s._distance > 0)s._distance = s._showObject.x;
		s._tager.x = s._showObject.x + s._distance;
		s._key["left"] = true;
		s._key["right"] = false;
		s._key["Dkey"] = true;
		s._speed = s._distance;
		s.setSpeed();
		s.addEventListener(LMouseEvent.MOUSE_UP,s.mouseUpW);
	}else if(event.selfX >= s._mask.getWidth() - s._scrollWidth && event.selfX <= s._mask.getWidth()){
		if(s._showObject.x <= s._mask.getWidth() - s._showObject.getWidth() || s._key["left"])return;
		s._distance = 10;
		if(s._showObject.x-s._distance<s._mask.getWidth()-s._showObject.getWidth())s._distance = s._showObject.x - s._mask.getWidth() + s._showObject.getWidth();
		s._tager.x = s._showObject.x - s._distance;
		s._key["right"] = true;
		s._key["left"] = false;
		s._key["Dkey"] = true;
		s._speed = this._distance;
		s.setSpeed();
		s.addEventListener(LMouseEvent.MOUSE_UP,s.mouseUpW);
	}else if(event.selfX >= s._scroll_w_bar.x && event.selfX <= s._scroll_w_bar.x + s._scroll_w_bar.getWidth() && !s._key["scroll_w"]){
		s._key["scroll_w"] = true;
		s._key["scroll_x"] = event.selfX - s._scroll_w_bar.x;
		s._key["mouseX"] = event.selfX;
       		s.addEventListener(LMouseEvent.MOUSE_MOVE,s.mouseMoveW);
		s.addEventListener(LMouseEvent.MOUSE_UP,s.mouseUpW);
	}else if(event.selfX > 0 && event.selfX < s._mask.getWidth()){
		s._key["left"] = false;
		s._key["right"] = false;
		s._tager.x = (s._mask.getWidth() - s._showObject.getWidth())*(event.selfX - s._scrollWidth)/(s._mask.getWidth() - s._scrollWidth*3.5);
		if(s._tager.x > s._showObject.x){
			s._key["left"] = true;
		}else{
			s._key["right"] = true;
		}
		s._speed = Math.abs(s._tager.x - s._showObject.x);
		s.setSpeed();
	}
};
LScrollbar.prototype.mouseDownH = function(event,s){
	if(event.selfY >= 0 && event.selfY <= s._scrollWidth){
		if(s._showObject.y >= 0)return;
		s._distance = 10;
		if(s._showObject.y + s._distance > 0)s._distance = s._showObject.y;
		s._tager.y = s._showObject.y + s._distance;
		s._key["up"] = true;
		s._key["down"] = false;
		s._key["Dkey"] = true;
		s._speed = s._distance;
		s.setSpeed();
		s.addEventListener(LMouseEvent.MOUSE_UP,s.mouseUpH);
	}else if(event.selfY >= s._mask.getHeight() - s._scrollWidth && event.selfY <= s._mask.getHeight()){
		if(s._showObject.y <= s._mask.getHeight() - s._showObject.getHeight())return;
		s._distance = 10;
		if(s._showObject.y-s._distance<s._mask.getHeight()-s._showObject.getHeight())s._distance=s._showObject.y-s._mask.getHeight()+s._showObject.getHeight();
		s._tager.y = s._showObject.y - s._distance;
		s._key["down"] = true;
		s._key["up"] = false;
		s._key["Dkey"] = true;
		s._speed = s._distance;
		s.setSpeed();
		s.addEventListener(LMouseEvent.MOUSE_UP,s.mouseUpH);
	}else if(event.selfY >= s._scroll_h_bar.y && event.selfY <= s._scroll_h_bar.y + s._scroll_h_bar.getHeight() && !s._key["scroll_h"]){
		s._key["scroll_h"] = true;
		s._key["scroll_y"] = event.selfY - s._scroll_h_bar.y;
		s._key["mouseY"] = event.selfY;
		s.addEventListener(LMouseEvent.MOUSE_MOVE,s.mouseMoveH);
		s.addEventListener(LMouseEvent.MOUSE_UP,s.mouseUpH);
	}else if(event.selfY > 0 && event.selfY < s._mask.getHeight()){
		s._key["up"] = false;
		s._key["down"] = false;
		s._tager.y = (s._mask.getHeight() - s._showObject.getHeight())*(event.selfY - s._scrollWidth)/(s._mask.getHeight() - s._scrollWidth*3.5);
		if(s._tager.y > s._showObject.y){
			s._key["up"] = true;
		}else{
			s._key["down"] = true;
		}
		s._speed = Math.abs(s._tager.y - s._showObject.y);
		s.setSpeed();
	}
};