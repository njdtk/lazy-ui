/*
 * Lazy_ComboBox.js
 * Start by @author Xiran.Liu on Date:2013-6-1
 * Update by @author QQ.Y on Data:2013-11-14
 */
$(function() {
	Lazy_ComboBox = Backbone.View
			.extend({
				
				el : 'body',
				
				/*--------------------- Private Properties ---------------------*/

				options : {
					
					// div的 id
					baseEl : null,
					
					// 是否多选，默认为是，false，单选
					multiple : true,
					
					// 静态对象数组[{'showText':显示字段,'name':传值字段}]
					listData : null,
					
					// 是否必填
					required : null,
					
					// 初始化时input框中是否有提示，默认“--请选择--”，可以自定义，如果没有，给false
					// initInput:'--请选择--',
					
					// 远程请求数据
					remote : {
						
						// 请求地址
						url : null,
						
						// 请求参数
						url_param : null,
						
						// 解析远程URL返回的JSON对象
						parse : function(data) {
							return data;
						},
						
						name : null,
						
						showText : null
					
					},
					
					// 返回值的list字段
					// list : null,
					
					// 是否分页获取数据，默认false，不分页，要是分页，给true
					more : true,
					
					pageNo : 0,
					
					// 每页显示的条数
					pageSize : 5
				
				},
				
				/*--------------------- Private Methods ---------------------*/

				initialize : function() {
					_.bindAll(this, 'render', 'createComboBox', 'createListByData', 'eventBind');
					
					$(this.options.baseEl).addClass('cs2c_combobox');
					
					this.comboPager = 1;
					this.inputShowArray = [];
					this.inputDataArray = [];
					
					this.render();
				},
				
				render : function() {
					
					this.createComboBox();
					this.createListByData();
					
					this.eventBind();
					
					$(document).bind(
							'click',
							_(
									function(event) {// 点击输入框以外任意区域下拉框消失
										event = event || window.event;
										
										var x_left = this.comboInput.offset().left;
										var x_right = x_left + this.comboInput.width() + this.comboArrow.width();
										var y_top = this.comboInput.offset().top;
										var y_bottom = y_top + this.comboInput.height() + this.comboListDom.height();
										
										if (event.clientX < x_left || event.clientX > x_right || event.clientY < y_top
												|| event.clientY > y_bottom) {
											this.comboListDom.hide();
										}
									}).bind(this));
					
				},
				
				/** 创建ComboBoxd的DOM结构 2013-11-14 */
				createComboBox : function() {
					
					this.comboArrow = $('<div class="combobox_arrow"><img src="img/combo-arrow.png"></div>');
					this.comboInput = $('<input type="text" class="combobox_input" readonly="readonly" />');
					
					this.comboListDom = $('<div class="combobox_list"><div class="item_list"></div><div class="'
							+ (this.options.multiple ? 'more_multiple' : 'more_singal') + '"></div></div>');
					
					$(this.options.baseEl).append(this.comboInput);
					$(this.options.baseEl).append(this.comboArrow);
					$('body').append(this.comboListDom);
					
				},
				
				/** 通过数据绘制下拉列表 2013-11-14 */
				createListByData : function() {
					var listData = "", listTempArray = [];
					if (this.options.listData) {
						listData = this.comboListDomData ? this.comboListDomData : this.options.listData;
					} else {
						listData = this.comboListDomData ? this.comboListDomData : "";
					}
					
					if (listData) {
						for ( var i = 0; i < listData.list.length; i++) {
							var listItem = '<div class="combobox_list_item" name="' + listData.list[i].name + '">'
									+ listData.list[i].showText + '</div>';
							listTempArray.push(listItem);
						}
					}
					
					// if(this.options.initInput){
					// this.comboListDom.append('<div class="combobox_list_item"
					// style="text-align:center">-- 请选择 --</div>');
					// }
					
					this.comboListDom.find('.item_list').append(listTempArray.join(''));
					
					if (listData && listData.list.length > 0) {
						if (this.comboPager <= listData.count / 5 && this.options.more) {
							if (this.options.multiple) {
								this.comboListDom
										.find('.more_multiple')
										.empty()
										.append(
												'<span class="combo_select_all">全选</span><span class="combo_more" style="margin-left:40px">更多</span><span class="combo_select_clear" style="margin-left:40px">全不选</span>');
							} else {
								this.comboListDom.find('.more_singal').length > 0 ? this.comboListDom.find(
										'.more_singal').empty().append('<span class="combo_more">更多</span>')
										: this.comboListDom
												.append('<div class="more_singal"><span class="combo_more">更多</span></div>');
							}
						} else {
							if (this.options.multiple) {
								this.comboListDom
										.find('.more_multiple')
										.empty()
										.append(
												'<span class="combo_select_all" style="float:left">全选</span><span class="combo_select_clear" style="float:right">全不选</span>');
							} else {
								this.comboListDom.find('.more_singal').remove();
							}
						}
					}
				},
				
				/** 下拉框的下拉列表位置控制 2013-11-14 */
				cssPosition : function() {
					var p_y = this.comboInput.offset().top + this.comboInput.height() + 2;
					var p_x = this.comboInput.offset().left;
					this.comboListDom.css({
						left : p_x,
						top : p_y
					});
				},
				
				/** 事件绑定函数 2013-11-14 */
				eventBind : function() {
					
					$(this.options.baseEl).find('.combobox_arrow').unbind('click');
					this.comboListDom.find('.combobox_list_item').unbind('click');
					this.comboListDom.find('.combobox_list_item').unbind('mouseover');
					this.comboListDom.find('.combobox_list_item').unbind('mouseout');
					this.comboListDom.find('.combo_more').unbind('click');
					this.comboListDom.find('.combo_select_all').unbind('click');
					this.comboListDom.find('.combo_select_clear').unbind('click');
					
					$(this.options.baseEl).find('.combobox_arrow').bind('click', _(function(event) {
						this.cssPosition();
						this.comboListDom.find('.combobox_list_item').removeClass('list_item_hover');
						if (this.comboListDom.is(':hidden')) {
							this.comboListDom.show();
						} else {
							this.comboListDom.hide();
						}
						
					}).bind(this));
					
					this.comboListDom.find('.combobox_list_item').bind('click', _(function(event) {
						this.clickAction(event);
					}).bind(this));
					
					this.comboListDom.find('.combobox_list_item').bind('mouseover', _(function(event) {
						if (!$(event.currentTarget).hasClass('list_item_cover')) {
							$(event.currentTarget).addClass('list_item_hover');
						}
					}).bind(this));
					
					this.comboListDom.bind('mouseout', _(function(event) {
						this.comboListDom.find('.combobox_list_item').removeClass('list_item_hover');
					}).bind(this));
					
					this.comboListDom.find('.combo_more').bind('click', _(function(event) {
						
						this.moreAction();
					}).bind(this));
					this.comboListDom.find('.combo_select_all').bind('click', _(function(event) {
						this.selectAll();
					}).bind(this));
					this.comboListDom.find('.combo_select_clear').bind('click', _(function(event) {
						this.clearAll();
					}).bind(this));
					
				},
				
				/**
				 * 下拉框的Item选项的点击处理管理函数 2013-11-14
				 * 
				 * @param event
				 */
				clickAction : function(event) {
					
					if (this.options.multiple) {
						this.multipleClick(event);
					} else {
						this.singleClick(event);
					}
				},
				
				/**
				 * 单选模式点击处理函数 2013-11-14
				 * 
				 * @param event
				 */
				singleClick : function(event) {
					this.comboListDom.find('.combobox_list_item').removeClass('list_item_cover');
					$(event.currentTarget).addClass('list_item_cover');
					
					this.inputShowArray.pop();
					this.inputShowArray.push($(event.currentTarget).text());
					
					this.inputDataArray.pop();
					this.inputDataArray.push($(event.currentTarget).attr('name'));
					
					this.comboInput.val($(event.currentTarget).text());
					
					this.comboListDom.hide();
				},
				
				/**
				 * 多选模式点击处理函数 2013-11-14
				 * 
				 * @param event
				 */
				multipleClick : function(event) {
					if ($(event.currentTarget).hasClass('list_item_cover')) {
						$(event.currentTarget).removeClass('list_item_cover');
					} else {
						$(event.currentTarget).addClass('list_item_cover');
					}
					// 判断数组中是否已经包含选择的内容，如果没有，添加，如果有，删除
					if (this.inputShowArray.indexOf($(event.currentTarget).text()) < 0) {
						this.inputShowArray.push($(event.currentTarget).text());
						this.inputDataArray.push($(event.currentTarget).attr('name'));
					} else {
						this.inputShowArray = this.inputShowArray.slice(0,
								this.inputShowArray.indexOf($(event.currentTarget).text())).concat(
								this.inputShowArray.slice(
										this.inputShowArray.indexOf($(event.currentTarget).text()) + 1,
										this.inputShowArray.length));
						this.inputDataArray = this.inputDataArray.slice(0,
								this.inputDataArray.indexOf($(event.currentTarget).attr('name'))).concat(
								this.inputDataArray.slice(this.inputDataArray.indexOf($(event.currentTarget).attr(
										'name')) + 1, this.inputDataArray.length));
					}
					
					this.comboInput.val(this.inputShowArray.join('，'));
					
				},
				
				/** 重新渲染list数据下拉框区域 2013-11-14 */
				reRenderComboListDom : function() {
					this.comboPager = 1;
					this.comboInput.val('');
					this.comboListDom.find('.item_list').empty();
					
					if (this.options.remote.url) {
						this.dataAjax();
					}
					
				},
				
				/** 数据渲染函数 重新包装一下需要的字段 2013-11-14 */
				dataAjax : function() {
					this.comboListDomData = {
						'count' : null,
						'list' : []
					};
					// 判断是否分页
					if (this.options.more) {
						this.options.remote.url_param.pageNo = this.comboPager;
						this.options.remote.url_param.pageSize = this.options.pageSize;
					}
					
					$.getJSON(this.options.remote.url, this.options.remote.url_param, _(function(data) {
						
						var dataList = this.options.remote.parse(data);
						
						this.comboListDomData.count = dataList.length;
						
						$.each(dataList, _(function(i, list) {
							
							var itemObj = {
								name : list[this.options.remote.name],
								showText : list[this.options.remote.showText]
							};
							
							this.comboListDomData.list.push(itemObj);
							
						}).bind(this));
						
						this.createListByData();
						this.eventBind();
						
					}).bind(this)).error(function(data) {
						cs2c_Message(commonOpt.cs2c_error(data).errCode + commonOpt.cs2c_error(data).errMsg);
					});
				},
				
				/** 【更多】的处理函数 2013-11-14 */
				moreAction : function() {
					this.comboPager++;
					this.dataAjax();
					this.createListByData();
					this.eventBind();
				},
				
				/** 【全选】的处理函数 2013-11-14 */
				selectAll : function() {
					var itemList = this.comboListDom.find('.combobox_list_item');
					$.each(itemList, _(function(i, item) {
						$(item).addClass('list_item_cover');
						// 判断数组中是否已经包含选择的内容，如果没有，添加
						if (this.inputShowArray.indexOf($(item).text()) < 0) {
							this.inputShowArray.push($(item).text());
							this.inputDataArray.push($(item).attr('name'));
						}
						
					}).bind(this));
					this.comboInput.val(this.inputShowArray.join('，'));
				},
				
				/** 【全不选】的处理函数 2013-11-14 */
				clearAll : function() {
					var itemList = this.comboListDom.find('.combobox_list_item');
					$.each(itemList, _(function(i, item) {
						$(item).removeClass('list_item_cover');
						
					}).bind(this));
					// 清空数组
					this.inputShowArray = [];
					this.inputDataArray = [];
					
					this.comboInput.val('');
				},
				
				/**
				 * 获取combobox的输入选择的值 2013-11-14
				 * 
				 * @returns 逗号分隔的字符串
				 */
				getComboVal : function() {
					return this.inputDataArray.join(',');
				},
				
				/**
				 * 获取点击请求页数 2013-11-14
				 * 
				 * @returns {Number}
				 */
				getPageNo : function() {
					return this.comboPager;
				}
			
			});
	
}());