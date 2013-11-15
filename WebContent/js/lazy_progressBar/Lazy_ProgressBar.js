/*
 * Lazy_ProgressBar.js
 * Start by @author Hong.Yang on Date:2013-6-1
 * Update by @author QQ.Y on Data:2013-11-14
 */

(function($) {

	$.fn.Lazy_ProgressBar = function(options, param) {

		// 判断调用方法 or 直接赋值setValue
		if (typeof options == 'string') {
			var method = bar[options];
			if (method) {
				return method(this, param);
			}
		}

		// 初始化进度条的数据
		options = {
			"value" : options
		} || {};

		// 初始化数据缓存块，命名为progressbar
		var state = $.data(this[0], 'progressbar');

		if (state) {
			$.extend(state.options, options);
		} else {
			state = $.data(this[0], 'progressbar', {
				options : $.extend({}, bar.defaults, options)
			});
		}

		// 初始化数据进度条值
		bar["setValue"](this, state.options.value);

	};
	var bar = {

		progressbar : function(jq, param) {

			return $.data(jq, 'progressbar', {
				options : $.extend({}, this.defaults, {
					value : bar.oldValue
				}, {
					value : param
				}),
				bar : this.init(jq)
			});

		},

		init : function(jq) {
			$(jq).addClass('progressbar').html(
					'<div class="progressbar-text"></div><div class="progressbar-value">&nbsp;</div>');
			return $(jq);
		},

		defaults : {
			width : 'auto',
			value : 0, // percentage value
			text : '{value}%',
			onChange : function(newValue, oldValue) {
			}
		},

		setSize : function(target, width) {
			var opts = $.data(target, 'progressbar').options;
			var bar = $.data(target, 'progressbar').bar;
			if (width) {
				opts.width = width;
			}
			bar.outerWidth(opts.width);
			bar.find('div.progressbar-text').width(bar.width());
		},

		resize : function(jq, width) {
			return jq.each(function() {
				bar.setSize(this, width);
			});
		},

		getValue : function(jq) {
			return $.data(jq[0], 'progressbar').options.value;
		},

		setValue : function(jq, value) {
			if (value < 0) {
				value = 0;
			}
			if (value > 100) {
				value = 100;
			}
			return jq.each(function() {
				bar.progressbar(this, value);
				var opts = $.data(this, 'progressbar').options;
				var text = opts.text.replace(/{value}/, value);
				bar.oldValue = opts.value;
				opts.value = value;
				$(this).find('div.progressbar-value').width(value + '%');
				$(this).find('div.progressbar-text').width(value + '%').html(text);
				if (bar.oldValue != value) {
					opts.onChange.call(this, value, bar.oldValue);
				}
			});
		}

	};
})(jQuery);
