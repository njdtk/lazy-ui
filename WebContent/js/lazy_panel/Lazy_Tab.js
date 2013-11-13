Lazy_Tab = Backbone.View.extend({

	/* ---------- Private properties ---------------- */

	options : {

		baseEl : '',

		titles : [],

		// 该属性暂时不用，cs2c_tab的高度为100%，自适应(xiran)
		height : 150

	},

	events : {
		"click .cs2c_tab_btn" : "_changTab"
	},

	/* ---------- Private Methods ---------------- */

	render : function() {
		return this;
	},

	initialize : function() {

		$(this.el).addClass('cs2c_tab');

		// 在用户创建对话框内容位置创建对话框
		$(this.options.baseEl).parent().append(this.el);

		// 创建控件内容
		this._createTabs();
		this._createTabsBody();
	},

	/* 创建选项卡控件的选项标题集合 2013-1-9 */
	_createTabs : function() {

		$(this.el).append('<div class="cs2c_tab_title"></div>');

		// 设置Tab的标签的显示状态
		var titles = '';
		for ( var i = 0; i < this.options.titles.length; i++) {
			titles += '<span class="cs2c_tab_btn ' + (i == 0 ? 'cs2c_tabs_selected ' : '') + '" id="'
					+ (i == 0 ? 'tab_' + i : '') + '">' + this.options.titles[i] + '</span>';
		}

		$(this.el).find('.cs2c_tab_title').append(titles);
	},

	/* 创建选项卡控件的选项内容集合 2013-1-9 */
	_createTabsBody : function() {

		$(this.el).append($(this.options.baseEl));
		var tabsBody = $(this.el).find(this.options.baseEl);
		tabsBody.addClass('cs2c_tab_ctx');
		// tabsBody.height(this.options.height);//页面滚动条和自适应的需求，暂时屏蔽该语句（xiran）
		// 设置Tab的内容的显示状态
		tabsBody.children().eq(0).show().siblings().hide();
	},

	/* 鼠标点击选项卡标题事件 2013-11-12 @param e */
	_changTab : function(e) {

		// 同辈中的索引位置
		var index = $(e.currentTarget).index();

		// 需要在Tab的状态切换之前执行的状态
		if (!this.beforeToggleTabAction(index)) {
			return;
		}

		// 设置Tab的显示位置
		$(e.currentTarget).addClass('cs2c_tabs_selected').siblings().removeClass('cs2c_tabs_selected');
		$(e.currentTarget).attr("id", "tab_" + index).siblings().attr("id", "");

		// 控制Tab内容的显示
		$(this.options.baseEl).children().eq(index).show().siblings().hide();

		this.tabBtnAction(index);
	},

	/* ------------- Public Methods ---------------------- */

	/* 点击Tab按钮，执行操作 2013-11-12 @param index：需要进入的Tab的索引号 */
	tabBtnAction : function(index) {

	},

	/*
	 * Tab切换之前的逻辑判断，如返回值为true则成功进入新的tab页，否则停留在原来Tab页。默认返回true 2013-11-12 @param
	 * index：需要进入的Tab的索引号
	 */
	beforeToggleTabAction : function(index) {
		return true;
	},

	/* 设置Tab的显示状态 2013-11-12 @param index :显示Tab的索引号 */
	showTabIndex : function(index) {

		$(this.el).find(this.options.baseEl).children().eq(index).show().siblings().hide();
		$(this.el).find('.cs2c_tab_title span').eq(index).addClass('cs2c_tabs_selected').siblings().removeClass(
				'cs2c_tabs_selected');
	},

	/* 动态删除Tab页面 2013-11-12 @param index:显示Tab的索引号 */
	removeTabByIndex : function(index) {

		$(this.el).find(this.options.baseEl).children().eq(index).remove();
		$(this.el).find('.cs2c_tab_title span').eq(index).remove();
	}
});