/*
 * Start by @author XIran.Liu on Date:2013-6-1
 * Update by @author QQ.Y on Data:2013-11-14
 *
 * Update by @author xiran.Liu on Date:2014-05-05
 * 创建验证组建时，可以只给baseEl属性，默认创建必填项输入框，即，带require属性，且不能为空的验证框。
 * 
 * Update by @author xiran.liu on Date:2014-05-16
 * 定义验证组件时，reg_exp属性支持直接定义方法，无需重写validateFunc方法。原有使用方式仍保留。
 * 
 * Update by @author xiran.liu on Date:2014-10-30
 * 定义组件时接收参数relevant_param:数组，定义验证相关参数用；reg_exp定义为方法时，
 * 自带value-input的输入值，param-定义的验证相关参数；tipmsg定义为方法时，自带value-input的输入值，param-定义的验证相关参数
 */
(function($) {
	
    Lazy_ValidateBox = Backbone.View.extend({
				
		/*--------------------- Private Properties ---------------------*/

		el : $("body"),
		
		options : {
			
			// 页面input输入框的id
			baseEl : null,
			
			// 提示信息
			tipmsg : "必填项",
			
			// 必填项提示信息
			reqmsg : "必填项",
			
			// 正则表达式或者方法
			reg_exp : null,
			
			//验证关联参数数组
			relevant_param :null,
			
			// JQuery obj指代元素本身
			selector : null
		
		},
		
		/*--------------------- Private Methods ---------------------*/

		initialize : function() {
			
			_.bindAll(this, "render", "inputValidate", "_inputFocus", "_inputBlur", "_inputMouseover",
					"validateFunc");
			this.baseEl = !!this.options.selector ? this.options.selector : $(this.options.baseEl);
			
			this.baseEl.unbind("input").bind("input", this.inputValidate);
			this.baseEl.unbind("focus").bind("focus", this._inputFocus);
			this.baseEl.unbind("blur").bind("blur", this._inputBlur);
			this.baseEl.unbind("mouseover").bind("mouseover", this._inputMouseover);
			this.baseEl.unbind("mouseout").bind("mouseout", this._inputBlur);
			
			this.render();
		},
		
		/** tip的页面元素 2013-11-14 */
		render : function() {
			
			if ($("body").find(".validate_tip").length === 0) {
				this.tip = $("<span class=\"validate_tip\"></span>");
				this.tip.append("<p></p><span class=\"validate_tip_arrow_border\">"+
					"</span><span class=\"validate_tip_arrow\"></span>");
				$("body").append(this.tip);
			} else {
				this.tip = $(".validate_tip");
			}
		},
		
		/** 用户输入鼠标离开校验输入框执行操作 2013-11-14 */
		_inputMouseover : function() {
			this.inputValidate();
		},
		
		/** 如果有额外focus的事件处理，需要重写该方法 2013-11-14 */
		_inputFocus : function() {
			this._inputMouseover();
		},
		
		/** 鼠标离开执行操作 2013-11-14 */
		_inputBlur : function() {
			this.tip.hide();
		},
		
		/** 定位显示Tip提示框的位置 2013-11-14 */
		_cssPosition : function() {
			var p_y = this.baseEl.offset().top,
				p_x = this.baseEl.offset().left + this.baseEl.width();
			this.tip.css({
				left : p_x,
				top : p_y
			});
		},
		
		/*--------------------- Public Methods ---------------------*/

		/**
		 * 对用户输入的值使用正则校验 2013-11-14
		 * 
		 * @returns
		 */
		inputValidate : function() {
			
			this.content = this.baseEl.val();
			
			var requireFlag = this.baseEl.attr("required"),
				disabledFlag = this.baseEl.attr("disabled");
			
			this.tip.hide();
			
			this._cssPosition();
			if(!!disabledFlag){
				return true;
			}else{
				if(!!this.content){//内容不为空
					//初始化tip
					typeof this.options.tipmsg === "function" ? 
						   this.tip.children().eq(0).text(this.options.tipmsg(this.content,this.options.relevant_param)) 
							: this.tip.children().eq(0).text(this.options.tipmsg);
					//判断是否符合验证条件
					if(typeof this.options.reg_exp === "function"){
						this.options.reg_exp(this.content,this.options.relevant_param) ? this.tip.hide() : this.tip.show();
						return this.options.reg_exp(this.content,this.options.relevant_param);
						
					}else{
						//兼容原始用法
						if(this.options.reg_exp === null){
							this.validateFunc() ? this.tip.hide() : this.tip.show();
							return this.validateFunc();
						}else{
							this.options.reg_exp.test(this.content) ? this.tip.hide() : this.tip.show();
							return this.options.reg_exp.test(this.content);
						}
					}
					
				}else{
					//初始化tip
					this.tip.children().eq(0).text(this.options.reqmsg);
					
					//判断是否必填
					if(requireFlag === undefined){//非必填
						this.tip.hide();
						return true;
					}else{
						this.tip.show();
						return false;
					}
				}
			}
		},
		
		/** 如果正则表达式不能完成校验功能，需要重写该方法，校验通过return {Boolean} 2013-11-14 */
		validateFunc : function() {
			return !!(this.baseEl.val().replace(/\s/g,""));
		}
	});
	
	/**
	 * TODO jQuery插件方法封装Lazy_ValidateBox
	 * 
	 * @author QQ.Y
	 */
	$.fn.Lazy_ValidateBox = function(tipmsg, reg_exp, required) {
		var data = null;
		if (required) {
			data = {
				baseEl : this.selector,
				tipmsg : tipmsg,
				reg_exp : reg_exp,
				reqmsg : '必填项'
			};
		} else {
			data = {
				baseEl : this.selector,
				tipmsg : tipmsg,
				reg_exp : reg_exp
			};
		}
		return new Lazy_ValidateBox(data);
	};
	
	
})(jQuery);

