/**
 * TODO jQuery插件方法创建的遮罩方法
 */
(function($) {
	
	$.fn.Lazy_Mask = function(message) {
		
		var zIndex = 9000;
		
		// 创建遮罩的层
		this.append('<div class="dialog-mask"></div>');
		
		var mask = this.find('.dialog-mask');
		
		// 如果是对话框中的遮罩，宽度+24
		var width = this.parent().hasClass('cs2c_dialog') || this.hasClass('cs2c_dialog') ? (this.width() + 24) : this
				.width();
		mask.css({
			height : this.height(),
			width : width,
			zIndex : zIndex++
		});
		mask.show();
		
		// 显示的文字样式的层
		if (!!message) {
			
			this.append('<div class="dialog-mask-msg"></div>');
			
			var msg = this.find('.dialog-mask-msg');
			msg.append('<div class="dialog-mask-label">' + message + '</div>');
			msg.css({
				left : (this.width() - msg.outerWidth()) / 2,
				top : (this.height() - msg.outerHeight()) / 2,
				zIndex : zIndex++
			});
			msg.show();
		}
		
	};
	
	$.fn.Lazy_unMask = function() {
		this.find('.dialog-mask').remove();
		this.find('.dialog-mask-msg').remove();
	};
})(jQuery);

/**
 * TODO cs2c组建库的信息提示 by qianqian.yang 2013-4-1
 */
Lazy_Message = function(msg, posEl) {
	
	// 确定浏览器的可视界面的大小
	var pageWidth = window.innerWidth;
	if (typeof pageWidth != 'number') {
		if (document.compatMode == "CSS1Compat") {
			pageWidth = documnet.documentElment.clientWidth;
		} else {
			pageWidth = documnet.body.clientWidth;
		}
	}
	pageWidth = !!posEl ? posEl[0].scrollWidth : pageWidth;
	var message_body = document.createElement("div");
	message_body.className = "cs2c_message";
	message_body.style.zIndex = 10000;
	message_body.style.left = ((!!posEl ? posEl.offset().left : 0) + (pageWidth - 300) / 2) + "px";
	
	$('body').append(message_body);
	$(message_body).html(msg);
	$(message_body).fadeIn("slow");
	
	var interval = 3000;
	// 关闭该信息条
	timeout = setTimeout(function() {
		
		timerNum = timeout;
		$(message_body).remove();
		
		// 【同样的时间段内，setTimeout只能执行一次。在这里必须：调用n次MSG，即执行n次setTimeout，而且须根据条件停止多余调用】
		if (typeof timerNum == "undefined" || timerNum != timeout) {
			// arguments.callee是当前匿名函数的函数对象，在这里循环调用
			setTimeout(arguments.callee, interval);
		}
	}, interval);
	
	// 如果用户鼠标划过该区域，则【取消】关闭
	$(message_body).mouseover(function() {
		clearTimeout(timeout);
	});
	// 如果用户鼠标移除该区域，则【关闭】该提示条
	$(message_body).mouseout(function() {
		timeout2 = setTimeout(function() {
			$(message_body).remove();
			clearTimeout(timeout2);
		}, 1000);
	});
	
};