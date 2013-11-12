/**
 * 
 * 
 * 基于Backbone.js定义表格
 * update at 2013.07.2
 * update at 2013.11.07
 * 
 * author: peiqiong.yan
 * 
 */

var DatagridView = Backbone.View.extend({

	tagName : 'div', //表示datagrid DOM对象的元素标签 

	className : 'datagrid_wrap', //表示datagrid DOM对象的class名称

	itemViews : [], //表示item列表

	collectionEl : null, //表示存放item列表的DOM对象
	//searchKey : '',

	allModels : null, //代表当前获取到的所有数据对象，当需要进行前端分页时 allModels的数量>collection的数量

	collection : null, //代表当前页显示的所有数据对象

	/**
	 * 初始化函数：
	 * 1）获取数据，并映射到this.allModels和this.collection中
	 * 2）建立数据到视图的映像
	 * 3）渲染表格
	 * @param options
	 * 
	 */

	initialize : function(options) {

		// 共享options数据对象
		this.options = options;

		// 初始化collection
		this.collection = new Backbone.Collection();

		// 更新数据
		this.updateTable();

		// 建立数据到视图的映射

		if (this.collection) {

			this.collection.bind('add', this._onItemAdded, this);

			this.collection.bind('change', this._onItemChanged, this);

			this.collection.bind('remove', this._onItemRemoved, this);

			this.collection.bind('refresh', this.render, this);

			this.collection.bind('reset', this.render, this);

		}

		this._sortState = {

			reverse : true

		};
		
		//渲染表格
		this.render();

	},

	
	/**
	 * 
	 * 事件绑定
	 * 
	 */
	events : {

		"mouseover .datagrid_body tr" : "addHeightlight",

		"mouseout .datagrid_body tr" : "removeHeightlight",

		"click .select_all" : "selectAllRow",

		"click .datagrid_body td input" : "selectCheckbox"

	},

	
	/**
	 * 
	 * 封装getData方法和setCollection方法 用于刷新数据列表
	 * 
	 */
	updateTable : function() {

		//从远程(或本地)获取数据
		this.getData();

		//将数据映射到this.collection
		this.setCollection();

		this.resizeTable();

	},

	/**
	 * 
	 * 获取数据列表，并将其赋值给this.allModels 分如下两种情况：
	 * 
	 * 1）this.options.data 获取本地数据只需将本地数据全部赋值给this.allModels即可
	 * 
	 * 2）this.options.url 获取远程数据：
	 * 
	 * 2a）获取的是全部数据 即远程获取的是所有数据，并需要在前端进行前端分页需要将远程获取的数据全部赋值给this.allModels
	 * 
	 * 2b）获取的是分页后的数据
	 * 
	 * 即远程获取的是分页后的数据以及一个标志总共数据条数的tatal值 此时需要将分页数据全部赋值给this.allModels,
	 * 
	 * 同时根据total值给pagerModel赋值
	 * 
	 */

	getData : function() {

		// 如果指定了data参数，则将本地数据赋值给this.allModels
		if (this.options.data) {

			this.allModels = (_(function() {

				var data = [];

				_(this.options.data).each(function(item) {

					data.push(item);

				});

				return new Backbone.Collection(data);

			}).bind(this))();

		}

		//否则，根据参数url获取远程数据
		else if (this.options.url) {
		
			// 如果后端返回的是所有数据（包括需要前端分页和不需要分页两种情况）
			if(!this.options.isFrontPagination && this.options.pager){
			
				// 根据pagerModel设置新的url参数
				this.options.param.pageSize = this.options.pagerModel.get("pageSize");

				this.options.param.pageNo = this.options.pagerModel.get("pageNo");
					
			}
		
				
			//获取远程数据，并将数据解析为固定格式，然后再赋值给allModels
			this.allModels = (_(function() {

				var realList = null;

				$.ajaxSetup({

					async : false

				});

				// 根据用户指定url和param以及parse获取数据列表：
				// param指传递的参数
				// parse以{total:10,list:[1,2]}形式解析后的返回结果

				// $(this.options.baseEl).parent().parent().cs2c_Mask('正在获取数据，请稍侯...');

				$.getJSON(this.options.url, this.options.param, _(function(resp) {
						
					//将原始数据转换为{total，list:[1,2]}格式
					realList = this.options.parse(resp);
					
					if(!this.options.isFrontPagination && this.options.pager)){
						
						this.options.pagerModel.set({
						
							total:realList.total
						
						});
					
					}					

				}).bind(this))

				.error(_(function(resp) {

					//$(this.options.baseEl).parent().parent().cs2c_unMask();
					console.log("服务器错误！");

				}).bind(this));

				return new Backbone.Collection(realList.list);

			}).bind(this))();

		}

	},

	/**
	 * 
	 * 该函数的主要功能是将this.allModels根据需要全部或部分映射到this.collection: 
	 *  
	 * 1)需要前端进行逻辑分页
	 * 
	 * 根据this.options.pagerModel的值计算this.allModels中需要抽取的数据条数，以及数据起点和数据终点,
	 * 
	 * 并根据这些参数将符合条件的数据映射到this.collection,
	 * 
	 * 同时根据this.allModels的总长度给thisthis.options.pagerModel的total属性赋值
	 * 
	 * 2）不需要前端进行逻辑分页 
	 * 
	 * 具体包括两种情况：第一种是不使用分页控件；第二种是使用分页控件但是后端已完成物理分页，
	 *
	 * 只需要将this.allModels的所有数据都映射到this.collection即可
	 * 
	 */
	setCollection : function() {

		// 清空this.collection
		this.collection.remove(this.collection.models);

		if (this.options.isFrontPagination && this.options.pager) {

			// 当需要前端进行逻辑分页时（即后端没有进行分页，返回的是全部数据）

			this.options.pagerModel.set({

				total : this.allModels.length

			});

			var total = this.allModels.length;

			var pageNo = this.options.pagerModel.get("pageNo");

			var pageSize = this.options.pagerModel.get("pageSize");

			var startNo = (pageNo - 1) * pageSize;

			var endNo = (total < pageNo * pageSize) ? total : (pageNo	* pageSize - 1);

			for ( var i = 0; i < total; i++) {

				if (i >= startNo && i <= endNo) {

					this.collection.add(this.allModels.models[i]);

				}

			}

			// console.log(this.collection);

		} else {

			for ( var i = 0; i < this.allModels.length; i++) {

				this.collection.add(this.allModels.models[i]);

			}

		}

	},

	/**
	 * 
	 * 
	 * 渲染表格：
	 * 1）渲染表格上方的工具栏 ：_renderToolBar
	 * 2）渲染表格头部；_renderHeadingRow
	 * 3）渲染表格主体
	 * @returns {___anonymous84_20687}
	 * 
	 */

	//根据用户指定参数渲染表格
	render : function() {

		$(this.el).empty();

		this.itemViews = {};

		$(this.el).parent().prev().remove();
		
		//渲染列表上方的工具栏
		this._renderToolBar();

		var container = $.el.div({

			className : 'datagrid_body'

		},

		this.collectionEl = $.el.table({

			cellPadding : '0',

			cellSpacing : '0'

		}));

		$(this.el).toggleClass('clickable', this.options.onItemClick !== Backbone.UI.noop);

		//创建表格的表头行元素
		var headingRow = $.el.tr();

		var sortFirstColumn = false;

		var firstHeading = null;

		// 根据参数code,checkbox，判断是否添加checkbox列和序号列，
		// 如果添加则在表头行的左侧增加两个td
		var tableWidth = $(this.options.baseEl).parent().parent().find(".cs2c_datagrid")[0].clientWidth;
		
		var fixWidth = parseInt(tableWidth * 3 * 0.01, 10) + "px";

		if (this.options.showNumber) {

			var th = $.el.th({

			// style : 'width: 30px;max-width:30px'

			}, $.el.div({

				style : 'width: ' + fixWidth,

				className : 'datagrid_cell_code'

			})).appendTo(headingRow);

		}

		if (this.options.showCheckbox) {

			var th = $.el.th({

			// style : 'width: 34px;max-width:34px'

			}, $.el.div({
			
				style : 'width: ' + fixWidth,
				
				className : 'datagrid_cell'

			}, $.el.input({

				className : 'select_all',

				type : 'checkbox'

			}))).appendTo(headingRow);

		}

		//解析并渲染表格的表头
		this._renderHeadingRow(headingRow,firstHeading);

		this._renderTBody();

		$(this.options.baseEl).append(this.el);

		this.resizeTable();

		return this;

	},
	
	/**
	  * 渲染列表表头行
	  */
	_renderHeadingRow:function(headingRow,firstHeading){
	
		_(this.options.columns).each(_(function(column, index, list) {

			var label = _(column.title).isFunction() ? column.title() : column.title;

			var width = !!column.width ? parseInt(column.width * tableWidth * 0.01, 10) : null;

			var style = width ? 'width:' + width + 'px;' : '';

			style += column.sortable ? 'cursor: pointer; ' : '';

			column.comparator = _(column.comparator).isFunction() ? column.comparator : function(item1,item2) {

				return item1.get(column.content) < item2.get(column.content) ? -1 : item1.get(column.content) > item2.get(column.content) ? 1 : 0;

			};

			var firstSort = (sortFirstColumn && firstHeading === null);

			var sortHeader = this._sortState.content === column.content || firstSort;

			var sortLabel = $.el.span({

					className : 'datagrid_sort_icon'

				},

				sortHeader ? (this._sortState.reverse && !firstSort ? $.el.img({

					src : 'res/common/cs2c_datagrid/images/datagrid_sort_desc.gif'

				}) : $.el.img({

					src : 'res/common/cs2c_datagrid/images/datagrid_sort_asc.gif'

				})) : '');

			var onclick = column.sortable ? (_(column.onSort).isFunction() ? _(function(e) {

					column.onSort(column);

				}).bind(this)

				: _(function(e, silent) {

					this._sort(column, silent);

				}).bind(this))

				: Backbone.UI.noop;

			var th = $.el.th({

					className : 'datagrid_th',

					onclick : onclick

				},

				$.el.div({

						className : 'datagrid_cell',

						style : style

					},

					$.el.span({
	
						className : 'wrapper' + (sortHeader ? ' sorted' : '')

					}, label),

					column.sortable ? sortLabel : null
				)
				
			).appendTo(headingRow);

			if (firstHeading === null) {

				firstHeading = th;

			}

		}).bind(this));
		
		
		
		if (sortFirstColumn && !!firstHeading) {

			firstHeading.onclick(null, true);

		}

		//解析完成的headingrow拼接到该表格中，完成表头行的渲染
		this.el.appendChild($.el.div({

			className : 'datagrid_header'

		}, $.el.table({

			cellPadding : '0',

			cellSpacing : '0'

		}, headingRow)));
	
	},
	
	/**
	 *创建、解析和渲染表格主体部分
	 */
	_renderTBody:function(){
	
		//创建表格主体
		var tableBody = this.collectionEl;

		//如果this.collection无数据，则填充emptyContent指定的信息
		//否则逐条进行渲染
		if (!_(this.collection).exists() || this.collection.length === 0) {

			this._emptyContent = _(this.options.emptyContent).isFunction() ? this.options.emptyContent(): this.options.emptyContent;

			this._emptyContent = $.el.div({
			
				"class" : "nodata"
				
			}, this._emptyContent);

			if (!!this._emptyContent) {

				$(tableBody).css("border", 0);

				tableBody.appendChild(this._emptyContent);

			}

		}else {

			_(this.collection.models).each(function(model, index) {

				var item = this._renderItem(model, index);

				tableBody.appendChild(item);

			}, this);

		}

		//如果有设置最大高度，则将表格放在一个固定高度的滚动条框架里
		if (_(this.options.maxHeight).exists()) {

			var style = 'max-height:' + this.options.maxHeight + 'px';

			var scroller = new Backbone.UI.Scroller({

				content : $.el.div({

					style : style

				}, container)

			}).render();

			this.el.appendChild(scroller.el);

		} else {

			this.el.appendChild(container);

		}
	
	},

	/**
	 *this.collection中增加一条数据时的执行逻辑
	 *
	 */
	_onItemAdded : function(model, list, options) {
		
		//如果添加是已存在的数据则不执行该方法
		if (!!this.itemViews[model.cid]) {

			return;

		}

		//判断原表格中是否有数据，若无数据，则把“暂无数据”提示信息对应的元素从页面中移除
		if (!!this._emptyContent) {

			if (!!this._emptyContent.parentNode) {

				this._emptyContent.parentNode

				.removeChild(this._emptyContent);

			}

			this._emptyContent = null;

		}

		//根据添加的数据对象进行解析，并在表格中渲染
		var properIndex = list.indexOf(model);

		//根据新数据对象model解析出相应的DOM对象
		var el = this._renderItem(model, properIndex);

		//找到DOM对象的插入位置，完成新数据行的渲染
		var anchorNode = this.collectionEl.childNodes[properIndex];

		this.collectionEl.insertBefore(el,_(anchorNode).isUndefined() ? null : anchorNode);

		//如果存在checkbox列，则将取消全选状态
		if (this.options.showCheckbox) {
			$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = false;
		}

	},

	_onItemChanged : function(model) {

		var view = this.itemViews[model.cid];

		// re-render the individual item view if it's a backbone view

		if (!!view && view.el && view.el.parentNode) {

			view.render();

			this._ensureProperPosition(view);

		}

		// otherwise, we re-render the entire collection

		else {

			this.render();

		}

	},

	/**
	 * 删除一行
	 * 
	 * @param model
	 */
	_onItemRemoved : function(model) {

		var view = this.itemViews[model.cid];

		if (!!view) {

			$(view).remove();

			delete (this.itemViews[model.cid]);

			// this._updateClassNames();

		}

		// if the collection is empty, we render the empty content

		if (!_(this.collection).exists() || this.collection.length === 0) {

			this._emptyContent = _(this.options.emptyContent).isFunction() ? this.options.emptyContent()
					: this.options.emptyContent;

			this._emptyContent = $.el.tr($.el.td(this._emptyContent));

			if (!!this._emptyContent) {

				this.collectionEl.appendChild(this._emptyContent);

			}

		}
		if (this.options.checkbox) {
			$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = false;
		}

	},

	_updateClassNames : function() {

		var children = this.collectionEl.childNodes;

		if (children.length > 0) {

			_(children).each(function(child) {

				$(child).removeClass('first');

				$(child).removeClass('last');

			});

			$(children[0]).addClass('first');

			$(children[children.length - 1]).addClass('last');

		}

	},

	_ensureProperPosition : function(view) {

		if (_(this.model.comparator).isFunction()) {

			this.model.sort({

				silent : true

			});

			var itemEl = view.el.parentNode;

			var currentIndex = _(this.collectionEl.childNodes).indexOf(itemEl, true);

			var properIndex = this.model.indexOf(view.model);

			if (currentIndex !== properIndex) {

				itemEl.parentNode.removeChild(itemEl);

				var refNode = this.collectionEl.childNodes[properIndex];

				if (refNode) {

					this.collectionEl.insertBefore(itemEl, refNode);

				} else {

					this.collectionEl.appendChild(itemEl);

				}

			}

		}

	},

	/**
	 * 渲染列表上方的工具栏
	 */
	_renderToolBar : function() {

		// generate a div element with a table as childNode ++++++

		if (this.options.toolbar) {

			var toolbarContainer = $.el.div({

				className : 'datagrid_toolbar'

			});

			var toolSpan = '';

			_(this.options.toolbar).each(_(function(elem) {

				if (elem.type == "searchbox") {

					$.el.input({

						id : elem.id ? elem.id : '',

						className : 'cs2c_searchbox'

					}).appendTo(toolbarContainer);

				} else {

					var className = 'button';

					if (elem.disabled) {

						className = 'button_disabled';

					}

					var button = $.el.a({

						id : elem.id,

						className : className

					}, $.el.span({

						className : elem.iconCls

					}, elem.text)).appendTo(toolbarContainer);

					if (elem.handler && _(elem.handler).isFunction() && !elem.disabled) {

						$(button).click(_(elem.handler).bind(this));

					}

				}

			}).bind(this));

			$(this.options.baseEl).before(toolbarContainer);

			/*
			 * 
			 * //确定是否创建搜索框 if($(".cs2c_searchbox").size()>0){
			 * 
			 * _($(".cs2c_searchbox")).each(_(function(searchbox){ var
			 * 
			 * tempthis=this;
			 * 
			 * 
			 * 
			 * var demotest1 = new searchBoxView({
			 * 
			 * 'id':$(searchbox).attr("id"), 'url':'ajaxjson.json',
			 * 
			 * 'enterfunc':_(function(){
			 * 
			 * 
			 * 
			 * var filterValues=[]; var
			 * 
			 * searchValue=$('#'+$(searchbox).attr("id")).val();
			 * 
			 * $.ajaxSetup({async:false});
			 * 
			 * $.getJSON(this.options.url,function(data){
			 * 
			 * 
			 * 
			 * //var testPattern = eval( "/^"+searchValue+".*$/"); var
			 * 
			 * testPattern= new RegExp(''+searchValue);
			 * 
			 * $.each(data,function(index,obj){
			 * 
			 * if(testPattern.test(obj.name)){ filterValues.push(obj); }
			 * 
			 * }); }) this.allModels=new
			 * 
			 * Backbone.Collection(filterValues);
			 * 
			 * this.options.pagerModel.set({pageNo:1});
			 * 
			 * this.setCollection(); }).bind(this) }); }).bind(this)) }
			 * 
			 */

		}

	},

	_renderItem : function(model, index) {

		var rowIndex = index;

		var row = $.el.tr({

		// className : rowIndex % 2 == 0 ? '' : 'datagrid_row_even'

		});

		row.model = model;

		row.selected = false;

		// for each model, we walk through each column and generate the

		// content

		// 还是先解析frozenColumns参数，用来判断

		var tableWidth = $(this.options.baseEl).parent().parent().find(".cs2c_datagrid")[0].clientWidth;

		var fix_width = parseInt(tableWidth * 3 * 0.01, 10) + "px";

		if (this.options.code) {

			var td = $.el.td({

			// style : 'width: 30px;max-width:30px'

			}, $.el.div({

				style : 'width: ' + fix_width,

				className : 'datagrid_cell_code'

			}, rowIndex + 1)).appendTo(row);

		}

		if (this.options.checkbox) {

			var td = $.el.td({

			// style : 'width: 34px;max-width:34px'

			}, $.el.div({
				style : 'width: ' + fix_width,

				className : 'datagrid_cell'

			}, $.el.input({

				type : 'checkbox'

			// style : 'margin:0 6px;'

			}))).appendTo(row);

		}

		// 然后解析columns参数

		_(this.options.columns).each(
				function(column, index, list) {

					var width = !!column.width ? parseInt(column.width * tableWidth * 0.01, 10) : null;

					var style = (column.align ? 'text-align:' + column.align + ';' : '')
							+ (width ? 'width:' + width + 'px;' : '');

					var content = this.resolveContent(model, column.content);

					if (column.formatter && _(column.formatter).isFunction()) {

						content = column.formatter(content, model.attributes, rowIndex);

					}

					// 增加操作图标
					if (column.operations && _(column.operations).isFunction()) {

						$(row).append(
								'<td><div class="datagrid_cell" style=' + style + '>'
										+ column.operations(content, model.attributes, rowIndex) + '</div></td>');

					} else {

						row.appendChild($.el.td({

						}, $.el.div({

							className : 'datagrid_cell',

							style : style

						}, content)));

					}

				}, this);

		// bind the item click callback if given

		if (this.options.onItemClick && _(this.options.onItemClick).isFunction()) {

			$(row).children().click(_(function(e) {

				if (!$(e.currentTarget).children().find("input")[0]) {

					this.selectRow(row);

					this.options.onItemClick(model.attributes, rowIndex);

				}

			}).bind(this));

		}

		// bind right click events

		if (this.options.onRightClick && _(this.options.onRightClick).isFunction()) {

		}

		this.itemViews[model.cid] = row;

		return row;

	},

	_sort : function(column, silent) {

		this._sortState.reverse = !this._sortState.reverse;

		this._sortState.content = column.content;

		var comp = column.comparator;

		if (this._sortState.reverse) {

			comp = function(item1, item2) {

				return -column.comparator(item1, item2);

			};

		}

		this.collection.comparator = comp;

		this.collection.sort({

			silent : !!silent

		});

	},

	addHeightlight : function(e) {

		$(e.currentTarget).addClass("datagrid_over").siblings().removeClass("datagrid_over");

	},

	removeHeightlight : function(e) {

		$(e.currentTarget).removeClass("datagrid_over");

	},

	/**
	 * 
	 * 判断是否全选
	 * 
	 * 
	 * 
	 * @param elem
	 * 
	 */

	judgement : function(elem) {

		var flag = true;

		_($(this.options.baseEl).parent().parent().find(".datagrid_body input[type='checkbox']")).each(

		function(elem) {

			if (!elem.checked) {

				flag = false;

			}

			;

		});

		if (flag) {
			if (this.options.checkbox) {
				$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = true;
			}

		} else {
			if (this.options.checkbox) {
				$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = false;
			}

		}

	},

	/**
	 * 
	 * 选中某一行时，样式渲染
	 * 
	 * 
	 * 
	 * @param row
	 * 
	 */

	selectRow : function(row) {

		$(row).css({
			"background" : "#aeb5bb"
		}).siblings().css({
			"background" : ""
		});

	},

	/**
	 * 
	 * 选中某一行的checkbox时，进行样式渲染，同时判断是否全选
	 * 
	 * 
	 * 
	 * @param e
	 * 
	 */

	selectCheckbox : function(e) {

		var ck = $(e.currentTarget)[0];

		if (ck.checked) {

			$(ck).parent().parent().parent().css({
				"background" : "#F0F2F7"
			});

		} else {

			$(ck).parent().parent().parent().css({
				"background" : ""
			});

		}

		this.judgement();

		if (this.options.onCheckboxClick && _(this.options.onCheckboxClick).isFunction()) {

			this.options.onCheckboxClick(this.getSelectedModels());

		}

	},

	/**
	 * 
	 * 选择当前页所有行
	 * 
	 * 
	 * 
	 * @param e
	 * 
	 */

	selectAllRow : function(e) {

		var inputs = $(this.options.baseEl).find("input[type=checkbox]");// 获得所有的input元素

		var data = $(e.currentTarget)[0];

		// 如果原来为全选，则全部取消；否则，全部选中

		if (data.checked) {

			$(this.options.baseEl).parent().parent().find(".datagrid_body tr").css({
				"background" : "#F0F2F7"
			});

			_.each(inputs, function(input) {

				input.checked = true;

			});

			_.each(this.itemViews, function(row) {

				row.selected = true;

			});

		} else {

			$(this.options.baseEl).parent().parent().find(".datagrid_body tr").css({

				"background" : ""

			});

			_.each(inputs, function(input) {

				input.checked = false;

			});

			_.each(this.itemViews, function(row) {

				row.selected = false;

			});

		}

		if (this.options.onCheckboxClick && _(this.options.onCheckboxClick).isFunction()) {

			this.options.onCheckboxClick(this.getSelectedModels());

		}

	},

	/**
	 * 
	 * 获取选中的model列表
	 * 
	 * 
	 * 
	 * @returns {Array}
	 * 
	 */

	getSelectedModels : function() {

		var selectedModels = [];

		_.each(this.itemViews, function(row) {

			if ($(row).find("input[type='checkbox']")[0].checked) {

				selectedModels.push(row.model.attributes);

			}

		});

		return selectedModels;

	},

	resizeTable : function() {
		var cs = this.options.columns;

		// console.log($(this.options.baseEl).parent().parent())

		$(this.options.baseEl).parent().parent().find(".cs2c_datagrid").css("width", "100%");

		var divwidth = $(this.options.baseEl).parent().parent().find(".cs2c_datagrid")[0].clientWidth;
		// alert(
		// $(this.options.baseEl).parent().parent().find(".cs2c_datagrid")[0]);
		var tableWidth = divwidth - 20;
		var fix_width = parseInt(3 * tableWidth * 0.01, 10) - 8;
		var j = 0;
		var i = 0;
		if (this.options.code) {
			j++;
			$(this.options.baseEl).parent().parent().find(".datagrid_header table th:eq(" + (j - 1) + ") div").css(
					"width", fix_width);
			$(this.options.baseEl).parent().parent().find(".datagrid_body table tr").each(function() {
				// alert(this);
				$(this).find("td:eq(" + (j - 1) + ") div").css("width", fix_width);
			});

		}
		if (this.options.checkbox) {
			j++;
			$(this.options.baseEl).parent().parent().find(".datagrid_header table th:eq(" + (j - 1) + ") div").css(
					"width", fix_width);
			$(this.options.baseEl).parent().parent().find(".datagrid_body table tr").each(function() {
				$(this).find("td:eq(" + (j - 1) + ") div").css("width", fix_width);
			});
		}
		$(this.options.baseEl).parent().parent().find(".datagrid_header").width(divwidth);
		$(this.options.baseEl).parent().parent().find(".datagrid_body").width(divwidth);
		$(this.options.baseEl).parent().parent().find(".datagrid_header table").width(tableWidth);
		$(this.options.baseEl).parent().parent().find(".datagrid_body table").width(tableWidth);
		for (i, j; i < cs.length; i++, j++) {
			var width = !!cs[i].width ? parseInt(cs[i].width * tableWidth * 0.01, 10) - 8 : null;
			$(this.options.baseEl).parent().parent().find(".datagrid_header table th:eq(" + j + ") div").css("width",
					width);
			$(this.options.baseEl).parent().parent().find(".datagrid_body table tr").each(function() {

				$(this).find("td:eq(" + j + ") div").css("width", width);

			});
		}

	}

});