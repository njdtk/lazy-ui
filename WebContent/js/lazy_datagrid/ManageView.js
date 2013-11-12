/**
 * 
 * 定义表格组件
 *
 * Lazy_Table V2.0
 * 
 * 作者:颜佩琼
 *
 * 版本更新时间：2013.11.07
 * 
 */

var Lazy_Table = Backbone.View.extend({

	//el : 'body',

	options : {
		
		isFrontPagination : false, //是否需要前端分页

		baseEl : 'body', //指定表格控件渲染的位置
		
		url : null, 	//指定获取远程数据的url
		
		param : null, 	//指定获取远程数据时所需的参数
		
		parse : function(resp){return resp}, 	//指定解析元数据的方法，可重写，默认返回原始数据
		
		data : null,	//指定本地数据列表
		
		columns : [], 	//指定表格数据列的具体显示内容与格式
		
		showNumber : false, //指定是否显示序号咧

		showCheckbox : false, //指定是否显示checkbox列
		
		emptyContent : '暂无数据', //当无数据时的显示信息

		onItemClick : Backbone.UI.noop, //指定点击单行数据的处理逻辑

		onCheckboxClick : Backbone.UI.noop, //指定点击checkbox的处理逻辑
		
		pager : null,	//如需分页，指定分页控件参数对象

		sortable : false, //

		onSort : null,

		itemView : null, // refer to the element type and style of one item

		maxHeight : null, 

		pagerModel : null
	
	},

	datagridView : null, //表示数据列表对应的视图对象

	pagerView : null, //表示分页控件对应的视图对象

	/**
	 * 
	 * 根据参数options初始化pagerView对象和datagridView对象
	 * 
	 * pagerView、datagridView以及本对象共享一个数据对象options
	 * 
	 * 其中一个View改变options中的值，则其他的View也会相应地进行重新渲染
	 * 
	 * 由此完成pagerView和datagridView的一致性渲染
	 * 
	 */

	initialize : function() {

		//如果需要显示分页控件，则根据用户指定参数初始化分页对象pagerModel
		if (this.options.pager) {

			this.options.pagerModel = new PagerModel();

			this.options.pagerModel.set({

				pageNo : this.options.pager.pageNo,

				pageSize : this.options.pager.pageSize,

				pageList : this.options.pager.pageList,

				baseEl : this.options.baseEl

			});

		}

		//在用户指定的位置外包一层class名为'lazy_table'的div
		$(this.options.baseEl).wrap("<div class='lazy_table'></div>");

		//根据用户指定参数options初始化datagridView
		if (this.datagridView) {

			this.datagridView.undelegateEvents();

		}

		this.datagridView = new DatagridView(this.options);

		if (this.options.pager) {

			if (this.pagerView) {

				this.pagerView.undelegateEvents();

			}

			this.pagerView = new PagerView(this.options.pagerModel);

		}

		// 绑定事件

		this.bindEvents();
	},

	/**
	 * 
	 * 事件绑定
	 * 
	 */

	bindEvents : function() {

		if (this.options.pager) {

			// 分页控件上操作扭（如“上一步”、“下一步”、“首页”、“最后一页”、“刷新”）的事件处理绑定
			// console.log($(this.options.baseEl).next().find("a.clickabled"));
			$(this.options.baseEl).next().find("a.disabled").unbind("click");
			$(this.options.baseEl).next().find("a.clickabled").unbind("click").bind("click", _(function(e) {
				 //console.log("dopage")
				this.doPage(e);

			}).bind(this));

			// 分页控件上的pageSize改变时的事件处理绑定

			$(this.options.baseEl).next().find('select[class="pager_list"]').unbind("change").bind("change",
					_(function() {

						this.autoRefresh();

					}).bind(this));

		}

	},

	/**
	 * 
	 * 分页控件操作按钮处理函数：通过调用pagerView的同名函数doPage来完成
	 * 
	 */

	doPage : function(e) {

		// 重新计算pagerModel的各项属性值，并重新渲染分页控件
		// console.log($(e.currentTarget))
		this.pagerView.doPage(e);

		// 后端数据已经分好页了，执行该分支

		// 根据pagerModel重新获取数据，重置datagridView.allModels

		// this.options.pagerModel.set({{total:tal}});

		this.updateTable();

		// 相应样式添加

		// console.log($(this.options.baseEl).parent().next())
		if ($(this.options.baseEl).next().find(".pager_loading")) {

			$(this.options.baseEl).next().find(".pager_loading").removeClass("pager_loading");

		}

	},

	/**
	 * 
	 * 分页控件pageSize更改处理函数：通过调用pagerView的同名函数autoRefresh来完成
	 * 
	 */

	autoRefresh : function() {

		// 重新计算pagerModel的各项属性值，并重新渲染分页控件

		this.pagerView.autoRefresh();

		// 后端数据已经分好页了，执行该分支

		// 根据pagerModel重新获取数据，重置datagridView.allModels

		// this.options.pagerModel.set({{total:tal}});

		this.updateTable();

		// commonOpt.createDatagridScrollBar();//渲染表格滚动条(xiran)

	},

	/**
	 * 
	 * 获取选中的model列表
	 * 
	 * @returns 返回一个model数组
	 * 
	 */

	getSelectedModels : function() {

		return this.datagridView.getSelectedModels();

	},

	/**
	 * 
	 * 调用datagridView中的getData()和setCollection()方法重新获取数据并渲染表格
	 * 
	 */

	updateTable : function() {

		// if(this.options.pagination){

		this.datagridView.getData();

		// }

		this.datagridView.setCollection();

		this.datagridView.resizeTable();

		this.bindEvents();

	},

	/**
	 * 
	 * 判断当前页是否为最后一页
	 * 
	 * @returns
	 * 
	 */

	isLastPage : function() {

		return this.pagerView.isLastPage();

	}

});