/**
 * Lazy_RightMenu V2.0
 * @author peiqiong.yan
 * started on 2013.04.17 
 * completed on 2013.04.18
 * update on 2013.06.07
 * update on 2013.11.14
 */
 
 
 
 /**
  * 定义右键菜单组件
  */
 var Lazy_RightMenu = {
	
	/**
	 * 初始化操作
	 */
	initialize:function(paramObj){
		
		//初始化全局变量
		//初始化触发事件
		this.e = paramObj.e;
		
		//初始化对应的数据对象
		this.model = paramObj.model;
		
		//右键菜单显示项
		this.options = paramObj.options.list;
		
		//右键菜单项点击处理函数
		this.optFunc = paramObj.options.optFunc;
		
		//
		if( paramObj.options.optFilter && _(paramObj.options.optFilter).isFunction() ){
			
			this.optFilter = paramObj.options.optFilter;
			
		}
		
		//右键点击的有效区域
		this.prevEl=paramObj.el;
		
		//生成右键菜单项的el
		this.el=paramObj.el+"_rightMenu";
		
		//右键菜单渲染
		this.render();
	},
	
	/**
	 * 右键菜单解析和绘制
	 *
	 */
	render:function(){
		
		
		this._createMenu();
		
		//如果需要对右键菜单进行过滤，则执行该代码段
		if(this.optFilter){
			this.optFilter(this.model);
		}
		
		this._bindEvents();
		this._showMenu();
	},
	
	/**
	 * 创建菜单栏
	 *
	 */
	_createMenu:function(){
	
		//在body里拼接一个用于显示右键菜单的空容器
		$(this.el).remove();
		$("body").append("<div id='"+this.el.split("#")[1]+"' class='lazy_rightMenu'></div>");
		$(this.el).hide();
		
		//遍历自定义参数对象，逐步进行菜单项绘制
		for(var i=0; i<this.options.length; i++){
			if(i!=0){
				$(this.el).append("<span class='li_right_nline'>---------------</span><br>");
			}
			for(var j=0; j<this.options[i].length; j++){
				var curOption = this.options[i][j];
				$(this.el).append(this._eletmpl(curOption));
			}
		}
	},
	
	/**
	 * 事件绑定：
	 * 1）左击时隐藏右键菜单
	 * 2）鼠标移至菜单项之上时，添加突出该菜单项的样式
	 * 3）鼠标移出菜单项之上时，取消突出该菜单项的样式
	 */
	_bindEvents:function(){
		
		$(this.prevEl).unbind("click");
		
		$(this.prevEl).bind("click",_(function(e){
			$(this.el).hide();
		}).bind(this));
			
		
		$(this.el).find(".li_right_rline").bind("mouseover",_(function(e){
			$(e.currentTarget).addClass("node_mouseover");
			
		}).bind(this));
		
		$(this.el).find(".li_right_rline").bind("mouseout",_(function(e){
			$(e.currentTarget).removeClass("node_mouseover");
			
		}).bind(this));
	},
	
	
	/**
	 * 根据具体的菜单项参数，绘制菜单项元素，并绑定单击事件处理方法
	 */
	_eletmpl:function(option){
		//this.model.optParam=option.optFunc;
		var returnVal = "<span class='li_right_rline' name='li_"+option.optParam+"' onclick='javascript:"
					+"Lazy_RightMenu.optFunc("+JSON.stringify(option.optParam)+","+JSON.stringify(this.model)+")' >"+option.optName+"</span><br>";
		return returnVal;
	},
	
	/**
	 * 在右键点击处渲染菜单项内容
	 */
	_showMenu:function(){
		var e= this.e || window.event;
		var pos={};
		//console.log(e.button);
		if(e.button == "2"){
			document.oncontextmenu=false;
			pos.x=e.clientX+1;
			pos.y=e.clientY+1;			
			
			$(this.el)[0].style.left = pos.x+'px';
			$(this.el)[0].style.top = pos.y+'px';
			
			$(this.el).show();
			
			if (document.all) {
				window.event.returnValue = false;
			}// for IE
			else {
				e.preventDefault();
			}
		}
	}
 
 };