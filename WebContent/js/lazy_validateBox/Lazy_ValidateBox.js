/*
 * Lazy_Switch.js
 * Start by @author XIran.Liu on Date:2013-6-1
 * Update by @author QQ.Y on Data:2013-11-14
 */
(function($) {
	
	Lazy_ValidateBox = Backbone.View
			.extend({
				
				/*--------------------- Private Properties ---------------------*/

				el : $('body'),
				
				options : {
					
					// 页面input输入框的id
					baseEl : null,
					
					// 提示信息
					tipmsg : null,
					
					// 必填项提示信息
					reqmsg : '必填项',
					
					// 正则表达式,如果可以用正则表达式解决的，直接给出匹配的正则表达式，如果不能，此属性不定义，需要重写validateFunc方法。
					reg_exp : null
				
				},
				
				/*--------------------- Private Methods ---------------------*/

				initialize : function() {
					
					_.bindAll(this, 'render', 'inputValidate', '_inputFocus', '_inputBlur', '_inputMouseover',
							'validateFunc');
					
					$(this.options.baseEl).bind('input', this.inputValidate);
					$(this.options.baseEl).bind('focus', this._inputFocus);
					$(this.options.baseEl).bind('blur', this._inputBlur);
					$(this.options.baseEl).bind('mouseover', this._inputMouseover);
					$(this.options.baseEl).bind('mouseout', this._inputBlur);
					
					this.render();
				},
				
				/** tip的页面元素 2013-11-14 */
				render : function() {
					
					if ($('body').find('.validate_tip').length === 0) {
						this.tip = $('<span class="validate_tip"></span>');
						this.tip
								.append('<p></p><span class="validate_tip_arrow_border"></span><span class="validate_tip_arrow"></span>');
						$('body').append(this.tip);
					} else {
						this.tip = $('.validate_tip');
					}
				},
				
				/** 用户输入鼠标离开校验输入框执行操作 2013-11-14 */
				_inputMouseover : function() {
					
					$('.validate_tip').hide();
					
					var requireFlag = $(this.options.baseEl).attr('required');
					
					// 有值的时候
					if ($(this.options.baseEl).val()) {
						
						this.inputValidate();
						
					} else {
						if (requireFlag === undefined) {
							this.tip.hide();
						} else {
							this.tip.children().eq(0).text(this.options.tipmsg);
							// this.tip.children().eq(0).text(this.options.reqmsg);
							$(this.options.baseEl).attr("required") ? this.tip.show() : this.tip.hide();
							this._cssPosition();
						}
					}
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
					var p_y = $(this.options.baseEl).offset().top;
					var p_x = $(this.options.baseEl).offset().left + $(this.options.baseEl).width();
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
					
					this.content = $.trim($(this.options.baseEl).val());
					
					var requireFlag = $(this.options.baseEl).attr('required');
					
					this.tip.children().eq(0).text(this.options.tipmsg);
					this.tip.hide();
					
					this._cssPosition();
					
					if (requireFlag === undefined && this.content === "") {
						return true;
					} else {
						if (this.options.reg_exp) {
							this.options.reg_exp.test(this.content) ? this.tip.hide() : this.tip.show();
							return this.options.reg_exp.test(this.content);
						} else {
							this.validateFunc() ? this.tip.hide() : this.tip.show();
							return this.validateFunc();
						}
					}
					
				},
				
				/** 如果正则表达式不能完成校验功能，需要重写该方法，校验通过return {Boolean} 2013-11-14 */
				validateFunc : function() {
					return false;
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
