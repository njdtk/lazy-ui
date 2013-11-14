/*
 * Lazy_Switch.js
 * Start by @author Hong.Yang on Date:2013-6-1
 * Update by @author QQ.Y on Data:2013-11-14
 */
$(function() {
	Lazy_Switch = Backbone.View.extend({

		/*--------------------- Private Properties ---------------------*/

		el : $('body'),

		options : {

			// 页面input输入框的基础元素位置,
			baseEl : null,

			// 默认为关闭状态
			isOpen : false,

			// 用户可自定义点击开关时需要执行的操作
			action : function() {
			}
		},

		/*--------------------- Public Properties ---------------------*/

		val : false,

		/*--------------------- Private Methods ---------------------*/

		initialize : function() {

			_.bindAll(this, 'render', 'getValue');

			this.render();
		},

		render : function() {

			this.val = this.options.isOpen;
			var ele = '';

			if ($(this.options.baseEl).find("div").length === 0) {

				if (!this.val) {
					ele = '<div class="off">关 闭</div>';
				} else {
					ele = '<div class="on">开 启</div>';
				}
				$(this.options.baseEl).addClass("slide_btn").append(ele);

			} else {

				if (this.val) {
					$(this.options.baseEl).find("div").removeClass("off").addClass("on").html("开 启");
				} else {
					$(this.options.baseEl).find("div").removeClass("on").addClass("off").html("关 闭");

				}
			}
			$(this.options.baseEl).unbind('click').bind('click', this.getValue);
		},

		/* 获取开关状态 2013-11-14 */
		getValue : function() {

			if (!this.val) {
				$(this.options.baseEl).find("div").removeClass("off").addClass("on").html("开 启");
			} else {
				$(this.options.baseEl).find("div").removeClass("on").addClass("off").html("关 闭");

			}
			this.val = !this.val;
			this.options.action ? this.options.action() : null;
		}
	});
}());
