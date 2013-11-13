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

		"mouseover .datagrid_body tr" : "_addHeightlight",

		"mouseout .datagrid_body tr" : "_removeHeightlight",

		"click .select_all" : "_clickSelectAll",

		"click .datagrid_body td input" : "_selectCheckbox"

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
		
			console.log("into url branch");
		
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
					
					if(!this.options.isFrontPagination && this.options.pager){
						
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

		// 根据参数showNumber,showCheckbox，判断是否添加checkbox列和序号列，
		// 如果添加则在表头行的左侧增加两个td
		var tableWidth = $(this.options.baseEl).parent().parent().find(".lazy_datagrid")[0].clientWidth;
		
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
		this._renderHeadingRow(headingRow,sortFirstColumn,firstHeading, tableWidth);

		this._renderTBody(container);

		$(this.options.baseEl).append(this.el);

		this.resizeTable();

		return this;

	},
	
	 /**
	  * 根据columns指定参数渲染列表表头行
	  */
	_renderHeadingRow:function(headingRow,sortFirstColumn,firstHeading, tableWidth){
	
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

					src : 'images/datagrid_sort_desc.gif'

				}) : $.el.img({

					src : 'images/datagrid_sort_asc.gif'

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
	_renderTBody:function(container){
	
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
	 * this.collection中增加一条数据时的执行逻辑
	 * @param model 表示新增的数据对象
	 * @param list 表示数据对象列表
	 * @param options 表示可选参数
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
	
	/**
	 * this.collection中修改一条数据时的执行逻辑
	 * @param model 表示更改的数据对象
	 */
	_onItemChanged : function(model) {
		
		//找到对应的视图对象
		var view = this.itemViews[model.cid];

		//如果该视图对象存在，重新渲染该视图对象
		if (!!view && view.el && view.el.parentNode) {

			view.render();

			this._ensureProperPosition(view);

		}

		//否则，渲染整个表格
		else {

			this.render();

		}

	},

	/**
	 * 从this.collection中删除一个数据对象时的处理逻辑
	 * 
	 * @param model 表示被删除的数据对象
	 */
	_onItemRemoved : function(model) {
		
		//找到对应的视图对象
		var view = this.itemViews[model.cid];
		
		//直接移除该视图对象
		if (!!view) {

			$(view).remove();

			delete (this.itemViews[model.cid]);

		}

		//移除后当前视图对象后，如果数据列表为空，则在页面上渲染'暂无数据'的提示信息
		if (!_(this.collection).exists() || this.collection.length === 0) {

			this._emptyContent = _(this.options.emptyContent).isFunction() ? this.options.emptyContent()
					: this.options.emptyContent;

			this._emptyContent = $.el.tr($.el.td(this._emptyContent));

			if (!!this._emptyContent) {

				this.collectionEl.appendChild(this._emptyContent);

			}

		}
		
		if (this.options.showCheckbox) {
		
			$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = false;
			
		}

	},

	/*
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
	*/
	
	/**
	 * 根据指定数据的视图对象，进行重新排序
	 *
	 */
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
	 * 目前工具栏只支持两种元素对象：searchbox和按钮
	 */
	_renderToolBar : function() {

		//若用户指定toolbar相关参数，则在列表上方进行工具栏渲染
		if (this.options.toolbar) {
			
			//创建放置工具栏的基础元素
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
	
	
	/**
	 * 根据数据对象即其在数据列表中的索引值进行解析，并返回相应的视图对象
	 * @param model 表示数据对象
	 * @param index 表示索引值
	 * @return view 表示返回的试图对象
	 */
	_renderItem : function(model, index) {

		var rowIndex = index;
		
		//创建代表一个数据行的tr对象
		var row = $.el.tr({

		// className : rowIndex % 2 == 0 ? '' : 'datagrid_row_even'

		});
		
		//初始化行对象相关属性
		row.model = model;

		row.selected = false;
	
		//计算表格宽度
		var tableWidth = $(this.options.baseEl).parent().parent().find(".lazy_datagrid")[0].clientWidth;

		var fix_width = parseInt(tableWidth * 3 * 0.01, 10) + "px";
		
		//渲染序号列
		if (this.options.showNumber) {

			var td = $.el.td({

			// style : 'width: 30px;max-width:30px'

			}, $.el.div({

				style : 'width: ' + fix_width,

				className : 'datagrid_cell_code'

			}, rowIndex + 1)).appendTo(row);

		}
	
		//渲染checkbox列
		if (this.options.showCheckbox) {

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

		
		//针对数据对象model，遍历columns中的每一列以生成相应内容
		_(this.options.columns).each(function(column, index, list) {
			
			//根据用户指定列宽百分比计算具体列宽
			var width = !!column.width ? parseInt(column.width * tableWidth * 0.01, 10) : null;

			var style = (column.align ? 'text-align:' + column.align + ';' : '') + (width ? 'width:' + width + 'px;' : '');
			
			//解析和设置当前列显示内容
			var content = this.resolveContent(model, column.content);

			if (column.formatter && _(column.formatter).isFunction()) {

				content = column.formatter(content, model.attributes, rowIndex);

			}

			//解析和绘制操作栏
			if (column.operations && _(column.operations).isFunction()) {

				$(row).append('<td><div class="datagrid_cell" style=' + style + '>' + column.operations(content, model.attributes, rowIndex) + '</div></td>');

			} else {

				row.appendChild($.el.td({

					}, $.el.div({

							className : 'datagrid_cell',

							style : style

					}, content))
				);

			}

		}, this);

		//绑定点击处理事件
		if (this.options.onItemClick && _(this.options.onItemClick).isFunction()) {

			$(row).children().click(_(function(e) {

				if (!$(e.currentTarget).children().find("input")[0]) {

					this._selectRow(row);

					this.options.onItemClick(model.attributes, rowIndex);

				}

			}).bind(this));

		}

		//右键操作，暂未实现
		if (this.options.onRightClick && _(this.options.onRightClick).isFunction()) {

		}

		this.itemViews[model.cid] = row;

		return row;

	},
	
	
	/**
	 * 根据指定列进行排序
	 * @param column 表示根据哪一列排序
	 */
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
	
	/**
	 * 显示高光
	 * @param e 表示触发事件
	 */
	_addHeightlight : function(e) {

		$(e.currentTarget).addClass("datagrid_over").siblings().removeClass("datagrid_over");

	},
	
	/**
	 * 隐藏高光
	 *  @param e 表示触发事件
	 */
	_removeHeightlight : function(e) {

		$(e.currentTarget).removeClass("datagrid_over");

	},

	/**
	 * 
	 * 判断是否全选
	 * 
	 */
	_checkSelectAll : function() {
		
		if(this.options.showCheckbox){
		
			var flag = true;

			_($(this.options.baseEl).parent().parent().find(".datagrid_body input[type='checkbox']")).each(function(elem) {

				if (!elem.checked) {

					flag = false;

				}

			});
		
			if (flag) {
			
				$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = true;
				
			} else {
				
				$(this.options.baseEl).parent().parent().find(".datagrid_header .select_all")[0].checked = false;
					
			}
		
		}

	},

	/**
	 * 
	 * 选中某一行时，进行样式渲染
	 * 
	 * @param row 表示被选中的数据行
	 * 
	 */

	_selectRow : function(row) {

		$(row).css({
		
			"background" : "#aeb5bb"
			
		}).siblings().css({
		
			"background" : ""
			
		});

	},

	
	/**
	 * 
	 * 点击某一行的checkbox时，进行样式渲染，同时判断是否全选
	 *  
	 * @param e
	 * 
	 */
	_selectCheckbox : function(e) {

		var elem = $(e.currentTarget)[0];

		if (elem.checked) {

			$(elem).parent().parent().parent().css({
				"background" : "#F0F2F7"
			});

		} else {

			$(elem).parent().parent().parent().css({
				"background" : ""
			});

		}

		this._checkSelectAll();

		if (this.options.onCheckboxClick && _(this.options.onCheckboxClick).isFunction()) {

			this.options.onCheckboxClick(this.getSelectedModels());

		}

	},

	
	/**
	 * 
	 * 添加或取消当前数据列表的全选状态
	 * @param e
	 * 
	 */
	_clickSelectAll : function(e) {
		
		//获取所有的checkbox元素
		var checboxes = $(this.options.baseEl).find("input[type=checkbox]");

		var elem = $(e.currentTarget)[0];

		//如果原来为全选，则全部取消；否则，全部选中
		if (elem.checked) {

			$(this.options.baseEl).parent().parent().find(".datagrid_body tr").css({
				"background" : "#F0F2F7"
			});

			_.each(checboxes, function(chbox) {

				chbox.checked = true;

			});

			_.each(this.itemViews, function(row) {

				row.selected = true;

			});

		} else {

			$(this.options.baseEl).parent().parent().find(".datagrid_body tr").css({

				"background" : ""

			});

			_.each(checboxes, function(chbox) {

				chbox.checked = false;

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
	 * 外调接口
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

	/**
	 * 重新设置表格尺寸
	 * 可外调
	 */
	resizeTable : function() {
	
		var columns = this.options.columns;

		$(this.options.baseEl).parent().parent().find(".lazy_datagrid").css("width", "100%");

		var divWidth = $(this.options.baseEl).parent().parent().find(".lazy_datagrid")[0].clientWidth;
		
		var tableWidth = divWidth - 20;
		
		var fix_width = parseInt(3 * tableWidth * 0.01, 10) - 8;
	
		var j = 0;
	
		var i = 0;
		
		if (this.options.showNumber) {
			
			j++;
			
			$(this.options.baseEl).parent().parent().find(".datagrid_header table th:eq(" + (j - 1) + ") div").css("width", fix_width);
			
			$(this.options.baseEl).parent().parent().find(".datagrid_body table tr").each(function() {
				
				$(this).find("td:eq(" + (j - 1) + ") div").css("width", fix_width);
				
			});

		}
		
		if (this.options.show) {
			
			j++;
			
			$(this.options.baseEl).parent().parent().find(".datagrid_header table th:eq(" + (j - 1) + ") div").css("width", fix_width);
			
			$(this.options.baseEl).parent().parent().find(".datagrid_body table tr").each(function() {
		
				$(this).find("td:eq(" + (j - 1) + ") div").css("width", fix_width);
			
			});
		}
		
		$(this.options.baseEl).parent().parent().find(".datagrid_header").width(divWidth);
		
		$(this.options.baseEl).parent().parent().find(".datagrid_body").width(divWidth);
		
		$(this.options.baseEl).parent().parent().find(".datagrid_header table").width(tableWidth);
		
		$(this.options.baseEl).parent().parent().find(".datagrid_body table").width(tableWidth);
		
		for (i, j; i < columns.length; i++, j++) {
			
			var width = !!columns[i].width ? parseInt(columns[i].width * tableWidth * 0.01, 10) - 8 : null;
			
			$(this.options.baseEl).parent().parent().find(".datagrid_header table th:eq(" + j + ") div").css("width",width);
			
			$(this.options.baseEl).parent().parent().find(".datagrid_body table tr").each(function() {

				$(this).find("td:eq(" + j + ") div").css("width", width);

			});
		}

	}

});