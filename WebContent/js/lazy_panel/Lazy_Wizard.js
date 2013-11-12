Lazy_Wizard = Backbone.View
		.extend({

			// 使用的标志参数
			_pageNum : 1,

			options : {
				// 向导界面的位置
				baseEl : null,

				// 向导界面的高度
				height : 150,

				// 每一页是否显示完成按钮
				achievable : false,

				// 在上下步骤控制时，是否需要显示取消按钮
				cancelable : false,

				// 最后步骤，完成界面，是否显示上一步的按钮，（默认显示）
				okHasUp : true,

				// 是否需要导航显示条
				banner : true,

				// 向导步骤的显示名称
				steps : []

			},

			/* ------ Private Methods -------------- */

			initialize : function() {

				// 页面选择定位初始化
				this._pageNum = 1;

				$(this.el).addClass('cs2c_wizard');

				// 在用户创建对话框内容位置创建对话框
				$(this.options.baseEl).parent().append(this.el);

				if (this.options.banner) {
					// 创建导航
					this.createWizardBanner();
				}
				// 创建内容
				this.createWizardCtx();
				// 创建按钮集合
				this.createWizardButton();

			},

			events : {
				"click .cs2c_dialog_button a" : "buttonAction"
			},

			render : function() {

				// 只显示第一屏的内容
				$(this.el).find('.cs2c_wizard_dialog_ctx').children().children().eq(0).show().siblings().hide();

				$(this.el).find('.cs2c_wizard_dialog_banner').children().eq(0).addClass('redText').siblings()
						.removeClass('redText');
				return this;
			},

			/* 创建向导进度步骤条 2013-11-11 */
			createWizardBanner : function() {

				var bannerStepString = '';
				var lang = this.options.steps.length;
				var wid = 'style="width:' + 100 / lang + '%"';

				for ( var i = 0; i < lang; i++) {
					var redText = (i == 0 ? 'redText' : (i == lang - 1) ? "lastText" : "");
					bannerStepString += '<div ' + wid + ' class="cs2c_wizard_dialog_banner_span ' + redText
							+ '"><span>' + this.options.steps[i] + '</span></div>';
				}
				$(this.el).append('<div class="cs2c_wizard_dialog_banner">' + bannerStepString + '</div>');

			},

			/* 创建向导面板的内容 2013-11-11 */
			createWizardCtx : function() {
				$(this.el).append('<div class="cs2c_wizard_dialog_ctx"></div>');
				$(this.el).find('.cs2c_wizard_dialog_ctx').append($(this.options.baseEl));
				$(this.el).find('.cs2c_wizard_dialog_ctx').height(this.options.height);
			},

			/* 创建向导面板的button区域 2013-11-11 */
			createWizardButton : function() {
				$(this.el).append('<div class="cs2c_dialog_button"></div>');

				var dialog_btn = $(this.el).find('.cs2c_dialog_button');

				dialog_btn
						.prepend('<a class="l-btn cancel" href="javascript:void(0)"><span class="dialog-btn-left">取消</span></a>');
				dialog_btn
						.prepend('<a class="l-btn ok" href="javascript:void(0)"><span class="dialog-btn-left">完成</span></a>');

				if (dialog_btn.children().length <= 2) {
					dialog_btn
							.prepend('<a class="l-btn down" href="javascript:void(0)"><span class="dialog-btn-left">下一步</span></a>');
					dialog_btn
							.prepend('<a class="l-btn up" href="javascript:void(0)"><span class="dialog-btn-left">上一步</span></a>');
				} else {
					dialog_btn.find('.down').show();
				}

				dialog_btn.find('.up').hide();

				// 判断是否显示【完成】按钮
				this.options.achievable ? dialog_btn.find('.ok').show() : dialog_btn.find('.ok').hide();

				// 判断是否显示【取消】按钮
				this.options.cancelable ? dialog_btn.find('.cancel').show() : dialog_btn.find('.cancel').hide();
			},

			/* 控制向导面板的界面显示 2013-11-11 @param pageNum：从1开始 */
			componentDisplayController : function(pageNum) {

				var dialog_btn = $(this.el).find('.cs2c_dialog_button');

				// 1、控制步骤进度条的显示
				var banners = $(this.el).find('.cs2c_wizard_dialog_banner').children();
				banners.eq(pageNum - 1).addClass('redText').siblings().removeClass('redText');

				if (pageNum !== 1) {
					banners.eq(pageNum - 2).addClass('prevText').siblings().removeClass('prevText');
				} else {
					$(this.el).find(".prevText").removeClass('prevText');
				}

				// 2、控制界面内容切换的显示
				$(this.options.baseEl).children().eq(pageNum - 1).show().siblings().hide();

				// 3.控制按钮的显示：如果是最后一页，显示完成和取消按钮
				var wizardNum = $(this.el).find(".cs2c_wizard_dialog_ctx").children().children().length;

				// 判断每一步的按钮显示状态
				if (pageNum === wizardNum) {

					// 最终的完成界面是否显示【上一步】按钮
					this.options.okHasUp ? dialog_btn.find('.up').show() : dialog_btn.find('.up').hide();

					dialog_btn.find('.down').hide();
					dialog_btn.find('.ok').show();

				} else if (pageNum === 1) {

					dialog_btn.find('.up').hide();
					dialog_btn.find('.down').show();

					// 判断是否显示【完成】按钮
					this.options.achievable ? dialog_btn.find('.ok').show() : dialog_btn.find('.ok').hide();

				} else {

					dialog_btn.find('.up').show();
					dialog_btn.find('.down').show();

					// 判断是否显示【完成】按钮
					this.options.achievable ? dialog_btn.find('.ok').show() : dialog_btn.find('.ok').hide();
				}

				this.enterWizard(pageNum - 1);// 从0开始索引
			},

			/* 上下步、完成等的按钮的执行动作 2013-11-11 @param e：鼠标点击事件 */
			buttonAction : function(e) {

				var btnClass = e.currentTarget.className.split(" ")[1];

				switch (btnClass) {
				case 'up':
					this.prevPressed(this._pageNum - 1);
					this._pageNum--;
					break;
				case 'down':
					if (!this.nextPressed(this._pageNum - 1)) {
						return;
					}
					this._pageNum++;
					break;
				case 'cancel':
					this.cancelPressed();
					break;
				case 'ok':
					this.okPressed(this._pageNum - 1);
					return;
					break;
				default:
					break;
				}

				this.componentDisplayController(this._pageNum);

			},

			/* ------ Public Methods -------------- */

			/* 上一步按钮执行动作 2013-11-11 @param pageNum： 从0开始索引 */
			prevPressed : function(pageNum) {
			},

			/*
			 * 下一步按钮执行动作 2013-11-11 @returns {Boolean} @param pageNum
			 */
			nextPressed : function(pageNum) {
				return true;
			},

			/* 完成按钮执行操作 2013-11-11 @param pageNum */
			okPressed : function(pageNum) {
			},

			/* 取消按钮执行操作 2013-11-11 */
			cancelPressed : function() {
			},

			/* 显示向导需要显示第几步 2013-11-11 @param index：从0开始索引 */
			showWizardStep : function(index) {

				this._pageNum = index + 1;
				this.componentDisplayController(index + 1);
			},

			/* 隐藏向导的部分步骤（包括进度指示条以及内容） 2013-11-11 @param index：从0开始检索 */
			hideWizardStep : function(index) {

				// 1、控制步骤进度条的显示
				var banners = $(this.el).find('.cs2c_wizard_dialog_banner').children();
				banners.eq(index).hide();
				// 2、控制界面内容切换的显示
				$(this.options.baseEl).children().eq(index).hide();
			},

			/* 进入当前页显示的时候需要执行的动作 2013-11-11 @param pageNum */
			enterWizard : function(pageNum) {

			}

		});
