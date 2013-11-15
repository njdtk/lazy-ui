/*
 * lazy_timePicker.js
 * Start by @author Hong.Yang on Date:2013-6-1
 * Update by @author QQ.Y 【Add Comments and Modify the baseEl】on Data:2013-11-14
 */
var Selection = {
		
        init:function(input){
        	this.input = input;
        	this.isTA = this.input.nodeName.toLowerCase() == "input";
        },
        
        isStandard:function(){
        	// 创建的DOM元素【是否】支持【属性】“selectionStart”
        	return "selectionStart" in (document.createElement("input"));
        },
        
        isSupported:function(){
        	// document.selection 表示当前网页中的选中内容, document.selection.createRange()
			// 根据当前文字选择返回 TextRange 对象，或根据控件选择返回ControlRange 对象。
        	var oo=document.createElement("input");
        	return this.isStandard()||( oo = document.selection) && !!oo.createRange();
        },
        
        /* 设置光标位置 2013-11-15 @param start,end 光标的开始、结束位置 */
        setCaret : function(start, end){
            var o = this.input;
            if(this.isStandard){
            	o.setSelectionRange(start, end);
            }else if(this.isSupported){
                var t = this.input.createTextRange();
                end -= start + o.value.slice(start + 1, end).split("\n").length - 1;
                start -= o.value.slice(0, start).split("\n").length - 1;
                t.move("character", start), t.moveEnd("character", end), t.select();
            }
        },
        
        /* 获取光标位置 2013-11-15 @returns 光标的开始、结束位置 */
        getCaret: function(){
        	var o = this.input, d = document;
        	if(this.isStandard) {
        		return {start: o.selectionStart, end: o.selectionEnd};
        	} else if(this.isSupported){
                var s = (this.input.focus(), d.selection.createRange()), r, start, end, value;
                if(s.parentElement() != o) {
					return {start: 0, end: 0};
				}
                if(this.isTA ? (r = s.duplicate()).moveToElementText(o) : r = o.createTextRange(), !this.isTA) {
					return r.setEndPoint("EndToStart", s), {start: r.text.length, end: r.text.length + s.text.length};
				}
                for(var $ = "[###]"; (value = o.value).indexOf($) + 1; $ += $) {
					;
				}
                r.setEndPoint("StartToEnd", s), r.text = $ + r.text, end = o.value.indexOf($);
                s.text = $, start = o.value.indexOf($);
                if(d.execCommand && d.queryCommandSupported("Undo")) {
					for(r = 3; --r; d.execCommand("Undo")) {
						;
					}
				}
                return o.value = value, this.setCaret(start, end), {start: start, end: end};
            }
            return {start: 0, end: 0};
        },
        
        getText : function(){
    		var o = this.getCaret();
    		return this.input.value.slice(o.start, o.end);
        },
        
        setText : function(text){
        	var o = this.getCaret(), i = this.input, s = i.value;
        	i.value = s.slice(0, o.start) + text + s.slice(o.end);
        	this.setCaret(o.start += text.length, o.start);
        }	
};     	
Lazy_TimePicker = Backbone.View.extend({

	/* ---------- Private properties ---------------- */

	text : null,
	selection : null,
	min : null,
	max : null,

	options : {

		baseEl : null,

		// 初始化时input框中是否有值 默认无false，true初始化为当前系统时间
		showseconds : true,

		// true初始化为当前系统时间
		initVal : true,

		// 初始化时input框中最小值，默认无，true初始化为当前系统时间
		start : null,

		// 初始化时input框中最大值，默认无，true初始化为当前系统时间
		over : null

	},

	/* ---------- Private Methods ---------------- */

	initialize : function() {
		
		this.el = this.options.baseEl;
		_.bindAll(this, 'render', 'addTime', 'reduceTime');
		this.render();
	},
	
	render : function() {
		
		this.setDom();
		this.setValue();
		this.text.unbind("click").bind("click", _(function() {
			this.getSelect();
		}).bind(this));
		$(this.el).find('.spinner-arrow-up').unbind('click').bind('click', this.addTime);
		$(this.el).find('.spinner-arrow-down').unbind('click').bind('click', this.reduceTime);

	},
	
	/* 创建事件选择器的DOM结构 2013-11-15 */
	setDom : function() {
		
		var ele = '<input readonly="readonly" class="spinner-text" value=""/>';
		ele+='<span class="spinner-arrow"><span class="spinner-arrow-up"></span>';
		ele+='<span class="spinner-arrow-down"></span></span>';

		$(this.el).append(ele);
	},
	
	/* 根据不同的条件设置时间选择器显示的时间值 2013-11-15 */
	setValue : function() {
		
		var val = "";
		if (this.options.initVal) {
			val = this.getThisTime();
		}
		if (this.options.start) {
			this.min = val = this.options.start + ":00";
		}
		if (this.options.over) {
			this.max = this.options.over + ":00";
		}
		
		// 获取空间input的DOM
		this.text = $(this.el).find('input');
		// 初始化该input元素
		Selection.init(this.text[0]);
		// 【对象克隆】——>获取一个选择器的对象
		this.selection = $.extend(true, {}, Selection);
		
		if (this.options.initVal) {
			this.text.val(val);
		}
	},

	/* 时间格式化 2013-11-15 @param value:时间的值,type:时间的类型选择类型号 @returns 显示的时间值 */
	formatTime : function(value, type) {
		if (type === 0 && value > 23) {
			value = 0;
		}
		if (type === 0 && value < 0) {
			value = 23;
		}
		if ((type === 1 || type === 2) && value < 0) {
			value = 59;
		}
		if ((type === 1 || type === 2) && value > 59) {
			value = 0;
		}
		return (value < 10 ? "0" + value : value);
	},
	
	/* 解析时间字符串 2013-11-15 @param time:时间字符串 @returns 返回时间秒数 */
	parseTime : function(time) {
		var arr = time.split(":");
		return parseInt(arr[0] * 3600) + parseInt(arr[1]) * 60 + parseInt(arr[2]);
	},
	
	/* 获取当前时间 2013-11-15 */
	getThisTime : function() {
		var thisDay = new Date();
		this.hour = thisDay.getHours();// 获取当前小时数(0-23)
		this.minute = thisDay.getMinutes();// 获取当前分钟数(0-59)
		this.second = thisDay.getSeconds();// 获取当前秒数(0-59)
		return this.formatTime(this.hour) + ":" + this.formatTime(this.minute) + ":" + this.formatTime(this.second);
	},
	
	/* 向上箭头执行操作：增加时间 2013-11-15 */
	addTime : function() {
		
		// 选中要修改时间的控件【选中位置】
		var poz = this.formatPoz(this.selection.getCaret().start);
		this.getSelect(poz);
		
		var type = 1, sec = 60;
		if (poz < 3) {
			type = 0;
			sec = 3600;
		}
		if (poz > 5) {
			type = 2;
			sec = 1;
		}

		// 时间+1
		var val = this.formatTime(parseInt(this.selection.getText()) + 1, type);
		
		var flag = this.max && (this.parseTime(this.text.val()) + sec) < this.parseTime(this.max);
		
		if (flag || this.options.initVal) {
			this.selection.setText(val);
		} else {
			this.text.val(this.max);
		}
		
		// 修改时间选择控件的【选中区域的停留】位置
		this.selection.setCaret(poz - 1, poz + 1);
		this.text.focus();
	},
	
	/* 向下箭头执行操作：减少时间 2013-11-15 */
	reduceTime : function() {
		
		// 选中要修改时间的控件【选中位置】
		var poz = this.formatPoz(this.selection.getCaret().start);
		this.getSelect(poz);
		
		var type = 1, sec = 60;
		if (poz < 3) {
			type = 0;
			sec = 3600;
		}
		if (poz > 5) {
			type = 2;
			sec = 1;
		}
		 console.log("ggg:"+parseInt(this.selection.getText()));
		 // 时间-1
		var val = this.formatTime(parseInt(this.selection.getText(), 10) - 1, type);
		
		var flag = this.max && (this.parseTime(this.text.val()) - sec) > this.parseTime(this.max);
		
		if (flag || this.options.initVal) {
			this.selection.setText(val);
		} else {
			this.text.val(this.min);
		}
		
		// 修改时间选择控件的【选中区域的停留】位置
		this.selection.setCaret(poz - 1, poz + 1);
		this.text.focus();
	},
	
	/* 格式化位置的号码 2013-11-15 @param poz @returns */
	formatPoz : function(poz) {
		if (poz < 3) {
			poz = 1;
		} else if (poz > 5) {
			poz = 7;
		} else {
			poz = 4;
		}
		return poz;
	},

	/* ---------- Public Methods ---------------- */

	getSelect : function(poz) {
		if (!poz) {
			poz = this.formatPoz(this.selection.getCaret().start);
		}
		this.selection.setCaret(poz - 1, poz + 1);
		this.text.focus();
	}
});

	

