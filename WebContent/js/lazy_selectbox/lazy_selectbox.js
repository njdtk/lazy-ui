/**
 * 选择框组件 Lazy_SelectBox V2.0
 * 
 * @author 刘曦冉 on 2013.07
 * 
 * @modifier 颜佩琼 on 2013.11.14
 */
 
/**
 * 组件定义
 */
var	Lazy_SelectBox = Backbone.View.extend({
		
		options : {
		
			baseEl : null,	//指定控件渲染位置
			
			single : false,	//true,为单选择框模式; false,为双向选择框模式，默认为false			
			
			arrowAct:false,	//事件响应方式，默认false，点击行响应，true，只有点击箭头才响应
			
			/*UI相关参数*/
			areaTitle : null,	// 左右区域名，数组，显示的title,如果没有title，不填该属性
			
			areaHeight:110,	//框所在区域的高度
			
			areaWidth:165,	//框所在区域宽度
			
			/*数据相关*/
			leftData:null,//左侧数据，对象数组，渲染每条数据所属要的对象{'content':xxx,'name':''}
			
			rightData:null,//右侧数据，对象数组，渲染每条数据所属要的对象{'content':xxx,'name':''}
			
			/*获取数据相关参数*/
			getField:'content'//最终要获取的字段,text->显示字段；name->name属性，前提attrNum为2，即是该属性存在
			
		},
		
		/**
		 * 初始化方法
		 */
		initialize : function() {
			
			//选择框组件显示位置
			this.el=this.options.baseEl;
			
			//左侧选择框
			this.select_left_content = $('<div class="select-content select-left-content"></div>');
			
			//右侧选择框
			this.select_right_content = $('<div class="select-content select-right-content"></div>');
			
			this.clear_div = $('<div style="clear:both"></div>');
			
			_.bindAll(this, 'render','_itemClick','_itemMouseover','_itemMouseout','_parseData','_createContainer','_setCss','reRender','getList');
			
			this.render();
		},
		
		/**
		 * 渲染组件
		 */
		render : function() {//初始化页面元素
			
			this._createContainer();
			this._setCss();
			this._parseData();
				
		},
		
		/**
		 *
		 * 创建控件所需的DOM对象
		 */
		_createContainer : function(){//重定义UI
			
			//定义用于存放选择框头部显示区和主体数据显示区的DOM对象
			var select_left_container = $('<div class="select-area select-left-area"></div>');
			var select_right_container = $('<div class="select-area select-right-area"></div>');
			
			//定义选择框头部显示区DOM对象
			var select_left_title = $('<div class="select-title"></div>');
			var select_right_title = $('<div class="select-title"></div>');		
			
			var select_mark = $('<div class="select-mark"></div>');
			
			//绘制选择框头部显示区域内容
			//同时将绘制好的DOM对象拼接到外层容器container中
			if(this.options.areaTitle){
				if(!this.options.single){
					select_left_title.text(this.options.areaTitle[0]);
					select_right_title.text(this.options.areaTitle[1]);
					
					select_left_container.append(select_left_title);
					select_right_container.append(select_right_title);
				}else{
					select_right_title.text(this.options.areaTitle[0]);
					select_right_container.append(select_right_title);
				}
			}
			
			
			//将主体数据显示区DOM对象拼接到外层容器container中
			select_left_container.append(this.select_left_content);
			select_right_container.append(this.select_right_content);
			
			//给组件添加样式
			$(this.el).addClass('lazy_selectbox');
			
			//若为双向选择框，则在this.el表示的页面指定渲染左侧选择框和右侧选择框
			//否则只渲染一个右侧选择框
			if(!this.options.single){
				$(this.el).append(select_left_container);
				$(this.el).append(select_mark);
				$(this.el).append(select_right_container);
				$(this.el).append(this.clear_div);
			}else{
				$(this.el).append(select_right_container);
				$(this.el).append(this.clear_div);
			}
		},
		
		/**
		 *设置组件尺寸大小
		 *
		 */
		_setCss :function(){
			if(this.options.areaHeight){
				$('.select-content').css('height',this.options.areaHeight);
				$('.select-mark').css('margin-top',(this.options.areaHeight+12)/2);
			}
			if(this.options.areaWidth){
				$('.select-content').css('width',this.options.areaWidth);
			}
		},
		
		/**
		 *
		 * 数据解析与绘制
		 *
		 */
		_parseData : function(leftDataArray,rightDataArray){
		
			//设置this.leftList 和 this.rightList
			if( arguments[0] || arguments[1] ){
			
				this.leftList = leftDataArray;
				
				this.rightList = rightDataArray;
				
			}else{
			
				this.leftList = this.options.leftData;
				
				this.rightList = this.options.rightData;
			}
		
			//解析与绘制左侧选择栏
			if(this.leftList){
							
				for(var i=0; i<this.leftList.length; i++){
				
					var curData = this.leftList[i];
					
					var $leftItem = null;
					
					if(!!curData.name){
						
						$leftItem = $('<div class="select-body-item">'+
										'<p name="'+curData.name+'">'+curData.content+'</p>'+
										'<p class="select-left-arrow" style="display:none"></p>'+
									'</div>');
					
					}else{
					
						$leftItem = $('<div class="select-body-item">'+
										'<p>'+curData.content+'</p>'+
										'<p class="select-left-arrow" style="display:none"></p>'+
									'</div>');
					
					}
					
					this.select_left_content.append($leftItem);
						
				}
			}
			
			//解析绘制右侧选择栏
			if(this.rightList){
			
				for(var i=0;i<this.rightList.length;i++){
				
					var curData = this.rightList[i];
					
					var $righItem = null;
					
					if(!!curData.name){
						
						$righItem = $('<div class="select-body-item">'+
										'<p name="'+curData.name+'">'+curData.content+'</p>'+
										'<p class="select-right-arrow" style="display:none"></p>'+
									'</div>');
						
					}else{
					
						$righItem = $('<div class="select-body-item">'+
										'<p>'+curData.content+'</p>'+
										'<p class="select-right-arrow" style="display:none"></p>'+
									'</div>');
					}
					
					this.select_right_content.append($righItem);
									
				}
			}
			
			this._bindEvent();	
		},
		
		/**
		 * 绑定事件
		 *
		 */
		_bindEvent : function(){
		
			$('.select-body-item').unbind('click');
			$('.select-body-item').bind('click',this._itemClick);
			
			$('.select-body-item').unbind('mouseover');
			$('.select-body-item').bind('mouseover',this._itemMouseover);
			
			$('.select-body-item').unbind('mouseout');
			$('.select-body-item').bind('mouseout',this._itemMouseout);
			
		},
		
		/**
		 * 选择栏单项数据行点击处理
		 */
		_itemClick : function(event){
		
			var e = event || window.event;
			
			//判断是左侧栏还是右侧栏
			var curClass = $(e.currentTarget).children().eq(1).attr('class');
			switch(curClass){
			
				//若是左侧栏数据项，则将其移至右侧栏，并重置样式
				case 'select-left-arrow':
					$(e.currentTarget).children().eq(1).removeClass('select-left-arrow').addClass('select-right-arrow').hide();
					this.select_right_content.append($(e.currentTarget).clone(true));
					break;
				//若是右侧栏数据，则将其移至左侧栏，并重置样式
				case 'select-right-arrow':
					$(e.currentTarget).children().eq(1).removeClass('select-right-arrow').addClass('select-left-arrow').hide();
					if(!this.options.single){
						this.select_left_content.append($(e.currentTarget).clone(true));
					}
					break;
				default:break;
			}
			
			//将元素从原有栏中移除
			$(e.currentTarget).remove();
			
		},
		
		
		/**
		 *
		 * 鼠标移至数据项之上时的样式处理
		 */
		_itemMouseover : function(event){
			event = event || window.event;
			$(event.currentTarget).find('.select-left-arrow,.select-right-arrow').css('display','inline');
		},
		
		
		/**
		 *
		 * 鼠标移出数据项时的样式处理
		 */
		_itemMouseout : function(event){
			event = event || window.event;
			$(event.currentTarget).find('.select-left-arrow,.select-right-arrow').hide();
		},
	

///////////////////////////////////////////////对外接口/////////////////////////////////////////////////////////	

		/**
		 *
		 * 根据getField字段获取list值，对外接口,返回右侧框中需要所有list的需要字段组成的数组，
		 * 如有特定需求，用户可重写该接口以获取符合需求的数据列表
		 */
		getList : function(){
		
			var rightItems = this.select_right_content.find('.select-body-item');
			
			var returnVal = [];
			
			switch(this.options.getField){
				case 'content':
					for(var i=0;i<rightItems.length;i++){
						returnVal.push(rightItems.eq(i).children().eq(0).text());
					}
				break;
				case 'name':
					for(var i=0;i<rightItems.length;i++){
						returnVal.push(rightItems.eq(i).children().eq(0).attr('name'));
					}
				break;
				default:break;
			}
			
			return returnVal;
			
		},
		
		
		/**
		 *
		 * 重新渲染选择栏
		 * 外调接口
		 */
		reRender :function(leftData,rightData){
		
			this.select_left_content.empty();
		
			this.select_right_content.empty();
			
			this._parseData(leftData,rightData);
			
		},
		
		/**
		 *
		 * 往右侧栏中添加一行数据
		 */
		addToRight : function(item){
		
			var $righItem=null;
		
			if(!!item.name){
			
				$righItem = $('<div class="select-body-item">'+
									'<p name="'+item.name+'">'+item.showText+'</p>'+
									'<p class="select-right-arrow" style="display:none"></p>'+
								'</div>');			
			}else{
				
				$righItem = $('<div class="select-body-item">'+
									'<p>'+item.showText+'</p>'+
									'<p class="select-right-arrow" style="display:none"></p>'+
								'</div>');			
			}
			
			this.select_right_content.append($righItem);
			
			this._bindEvent();
		},
		
		/**
		 *
		 * 清空右侧选择栏
		 */
		clearRight : function(){
			this.select_right_content.empty();
		}
		
	});
