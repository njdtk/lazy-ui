/**
 * Lazy_DatePicker V2.0
 * 
 * @author 刘曦冉 2013.08
 *
 * updated by 颜佩琼 on 2013.11.15
 *
 * 
 */

 
/**
 *
 *公共方法定义
 */
var libMethod = {

	/**
	 * 判断是否是闰年
	 * (能被4整除但不能被100整除，或者能被400整除的为闰年)
	 */
	'isLeapYear' : function(year) {		
		return (year%4===0 && year%100!==0) || (year%400===0);
	},
	
	
	/**
	 * 根据日期判断是星期几 
	 * @param date string '2013-06-25' 
	 * @return weedDay int 0-6;
	 */
	'getWeekDay' : function(date) {
		
		//根据date获取4位年份、月份、世纪、2位年份、该月的第几天
		var year = parseInt(date.substring(0, 5));
		var century = parseInt(date.substring(0, 2));
		var year2bit = parseInt(date.substring(2, 4));
		var month = parseInt(date.substring(5, 7));
		var day = parseInt(date.substring(8, 10));
		
		//初始化返回值
		var weedDay = 0;
		
		if (month < 3) {
			year = year - 1;
			century = parseInt(year.toString().substring(0, 2));
			year2bit = parseInt(year.toString().substring(2, 4));
			switch (month) {
				case 1:
					month = 13;
					break;
				case 2:
					month = 14;
					break;
				default:
					break;
			}
		}
		
		//获取返回值
		weedDay = (year2bit + parseInt(year2bit / 4) + parseInt(century / 4) - 2 * century + parseInt(26 * (month + 1) / 10) + day - 1) % 7;
		
		return weedDay < 0 ? weedDay + 7 : weedDay;
		
	},
	
	
	/**
	 * 判断一个月有多少天 
	 * @param date string '2013-06-25' 
	 * @return days int 这个月的天数
	 */
	'getMonthDays' : function(date) {
	
		var days=0;
		var month = parseInt(date.substring(6, 8));
		var year = parseInt(date.substring(0, 5));
		
		if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
			days=31;
		} else if (month === 4 || month === 6 || month === 9 || month === 11) {
			days=30;
		} else {
			days=this.isLeapYear(year) ? 29 : 28;
		}
		
		return days;
		
	},
	
	
	/**
	 * 计算日期显示表格盘
	 * 用一个6*7的二维数组来表示，属于当前月的天用>=1的数值表示，非当前月的天用0表示
	 */
	'calCalendar' : function(date) {
		
		//先声明一维
		var calendar = new Array();
		
		//判断当前月的第一天是周几
		var firstWeekDay = this.getWeekDay(date.substring(0, 8) + '01'); 
		
		// 判断当前月有多少天
		var days = this.getMonthDays(date); 
		
		var daytemp = 0;
		//var daytempbefore = days;
		//var daytempafter = 1;
		
		//初始化二维数组（6*7）
		for ( var i = 0; i < 6; i++) {
			calendar[i] = new Array(); 
			for ( var j = 0; j < 7; j++) { 
				calendar[i][j] = 0;
			}
		}
		
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 7; j++) {
				if (i * 7 + j >= firstWeekDay && i * 7 + j < days + firstWeekDay) {
					calendar[i][j] = ++daytemp;
				}
			}
		}
		return calendar;
	}

};


/**
 * 日期控件视图对象定义
 *
 */
var	Lazy_DatePicker = Backbone.View.extend({
		
		/**
		 * 用户自定义参数
		 */
		options : {
		
			//指定控件显示位置，如‘#id’
			baseEl : '',
			
			//指定日期显示格式,支持三种格式，即'yyyy-mm-dd'，'yyyy/mm/dd','m/d/yyyy'
			formatter : 'yyyy-mm-dd'// 
			
			showInitDate : false,// 初始化时input框中是否有值 默认无false，true初始化为当前系统时间
			
			//是否显示时间控件
			showTimePicker : false
		},
		
		/**
		 * 初始化控件公共变量
		 */
		initialize : function() {
		
			_.bindAll(this, 'render', 'showCalendar');
			
			//触发日期控件的input元素
			this.el=this.options.baseEl;
			
			//初始化年、月、日，默认为当前时间
			this.year = new Date().getFullYear();
			
			this.month = new Date().getMonth() + 1;
			
			this.day = new Date().getDate();
			
			$(this.el).unbind('focus');
			
			//解析和绘制日期控件		
			this.render();
			
			//聚焦指定输入框时，显示日期控件
			$(this.el).bind('focus', this.showCalendar);
			
		},
		
		/**
		 * 解析和绘制日期控件
		 */
		render : function() {
		
			this.mainView = new mainPickerView(this.year, this.month, this.day, this.options);
			
			if (this.options.timePicker) {
				this.timePicker = new Lazy_TimePicker({
					'baseEl' : this.el+ '_time_body'
				});
			}
		},
		
		showCalendar : function() {
			
			this.mainView.container.show();
			if (!$(this.el).val()) {
				this.mainView.showCalendar(this.year, this.month, this.day.toString());
				if (this.timePicker) {
					this.timePicker.setValue();
				}
			} else {
				this.mainView.container.show();
			}

		}
	});
	
	/**
	 * 控件显示内容控制对象定义
	 */
	var mainPickerView = Backbone.View.extend({
			
				el : '',
				
				initialize : function(year, month, day, options) {
					
					this.options = options;
					
					this.el = options.baseEl;
					
					this.containerId = this.el.split("#")[1]+"_container";
					
					this.year = this.yearTemp = year || new Date().getFullYear();
					
					this.month = this.monthTemp = month || new Date().getMonth() + 1;
					
					this.day = this.dayTemp = day || new Date().getDate();
					
					//获取格式化的日期
					this.formattedDate = this.formattedDateTemp = this.options.showInitDate ? this.dateformatter(this.yearTemp,this.monthTemp, this.dayTemp, 1) 
							: this.dateformatter(this.yearTemp, this.monthTemp, this.dayTemp, 0);

					this.render();
					
					_.bindAll(this, 'render', 'setCalendarContent', 'bindEvents', 'closeBtnClick', 'showCalendar',
							'itemClick', 'todayBtnClick', 'okBtnClick', 'titleMove', 'dateformatter',
							'setTableContent', 'yearSelected', 'cssPosition');
				},
				
				render : function(year, month, formattedDate) {
				
					var renderyear = year || this.yearTemp;
					var rendermonth = month || this.monthTemp;
					var renderformattedDate = formattedDate || this.formattedDate;
					
					if ($('#'+this.containerId).length === 0) {
						//创建用户显示日期控件的容器
						this.container = $('<div id="'this.containerId+'" class="cs2c_date_picker"></div>');
						
						//往容器中添加两个元素：日期头部容器和日期主体容器
						this.container.append('<div class="date_title">'
									+ '<div id="date_move_left" class="date_move_left"></div>' 
									+ '<div id="date_title_content" class="date_title_content"></div>' 
									+ '<div id="date_move_right" class="date_move_right" style="float:right"></div>' 
								+ '</div>'
								+ '<div id="date_body" class="date_body">'
									+ '<div class="date_table_title"></div>' 
									+ '<div class="date_table_content"></div>'
								+ '</div>' 
								+ '<span id="time_body" class="spinner"></span>'
								+ '<div class="date_button">' 
									+ '<button id="date_button_today">今天</button>' 
									+ '<button id="date_button_ok" style="margin-left:10px">确定</button>'
									+ '<button id="date_button_off" style="margin-left:10px">关闭</button>'
								+ '</div>'
								+ '<div style="clear:both"></div>');
					} else {
						this.container = $('#'+this.containerId);
					}
					
					//将日期控件容器拼接到指定输入框之后
					$(this.el).parent().append(this.container);
					
					
					this.showCalendar(renderyear, rendermonth, renderformattedDate); //??
				},
				
				
				/**
				 * 格式化日期  1、例'2013-06-25' 2、例'2013/06/05' 3、例'6/5/2013' 
				 * @param year 当前年份
				 * @param month 当前月份
				 * @param day 当前日
				 * @param flag 是否在输入框中显示选中的日期
				 * 
				 * @return showDate 返回指定格式的日期
				 */
				dateformatter : function(year, month, day, flag) {
				
					var showDate='';
					
					switch (this.options.formatter) {
						case 'yyyy-mm-dd':
							if (month < 10) {
								if (day < 10) {
									showDate = '' + year + '-0' + month + '-0' + day + '';
								} else {
									showDate = '' + year + '-0' + month + '-' + day + '';
								}
							} else {
								if (day < 10) {
									showDate = '' + year + '-' + month + '-0' + day + '';
								} else {
									showDate = '' + year + '-' + month + '-' + day + '';
								}
							}
							break;
						case 'yyyy/mm/dd':
							month < 10 ? showDate = '' + year + '-0' + month + '/' + day + '' : showDate = '' + year + '/'
									+ month + '/' + day + '';
							break;
						case 'm/d/yyy':
							showDate = '' + month + '/' + day + '/' + year + '';
							break;
						default:
							break;
					}
					
					//根据flag字段设置输入框显示内容
					$(this.el).val(flag ? showDate : '');
					
					return showDate;
				},
				
				/**
				 * 调用setCalendarContent绘制日期控件所有显示内容
				 * 调用bindEvents绑定所有事件处理机制
				 */
				showCalendar : function(year, month, formattedDate) {
				
					//重新设置格式化后的日期
					var formattedDateTemp;
					if (formattedDate.length < 3) {
						formattedDateTemp = this.options.showInitDate ? this.dateformatter(year, month, formattedDate, true) 
							: this.dateformatter(year, month, formattedDate, false);
					} else {
						formattedDateTemp = formattedDate;
					}
					
					//设置日期控件显示位置
					this.cssPosition();
					
					//设置日期控件的所有显示内容及样式
					this.setCalendarContent(year, month, formattedDateTemp);
					
					this.bindEvents();
				},
				
				
				/**
				 * 设置日期控件的所有显示内容及样式
				 */
				setCalendarContent : function(year, month, formattedDate) {
					
					//定义日期头部显示内容
					var $dateTitle = $('<span><span id="cs2c_datepicker_year">2013</span>年<span id="cs2c_datepicker_month">6</span>月</span>'),
					
					//定义日期控件表格盘的基本显示内容
					var $dateBody = $('<div class="date_table_title">'
							+ '<table>'
								+ '<tr>'
									+ '<td>日</td>'
									+ '<td>一</td>'
									+ '<td>二</td>'
									+ '<td>三</td>'
									+ '<td>四</td>'
									+ '<td>五</td>'
									+ '<td>六</td>'
								+ '</tr>'
							+ '</table>'
							+ '</div>'
							+ '<div class="date_table_content">'
								+ '<table></table>' 
							+ '</div>');
					
					//将日期头部内容放到头部容器中
					$(this.container).find('#date_title_content').empty().append($dateTitle);
					
					//将日期表格盘基本内容放到主体容器中
					$(this.container).find('#date_body').empty().append($dateBody);
					
					//设置日期头部中的年份和月份信息
					$(this.container).find('#cs2c_datepicker_year').text(year);
					$(this.container).find('#cs2c_datepicker_month').text(month);
					
					//设置日期控件表格盘显示内容及样式
					this.setTableContent(formattedDate);
					
				},
				
				
				/**
				 * 控件事件绑定
				 */
				bindEvents : function() {
					
					//表格盘中方格点击处理逻辑绑定
					$('#date_table_content').find('td').unbind('click');
					$('#date_table_content').find('td').bind('click', this.itemClick);
					
					//'今天'按钮点击处理逻辑绑定
					$('#date_button_today').unbind('click');
					$('#date_button_today').bind('click', this.todayBtnClick);
					
					//‘确定’按钮点击处理逻辑绑定
					$('#date_button_ok').unbind('click');
					$('#date_button_ok').bind('click', this.okBtnClick);
					
					//‘关闭’按钮点击处理逻辑绑定
					$('#date_button_off').unbind('click');
					$('#date_button_off').bind('click', this.closeBtnClick);
					
					//左右选按钮点击处理逻辑绑定
					$('#date_move_left,#date_move_right').unbind('click');
					$('#date_move_left,#date_move_right').bind('click',this.titleMove);
					
				},
				
				
				
				/**
				 * 设置日期控件表格盘显示内容及样式
				 */
				setTableContent : function(date) {
					
					//计算控件表格盘（6x7）的初始状态：
					//即不属于当前月的天状态值为0，
					//属于当前月的天状态值为该月的第几天
					var calendar = libMethod.calCalendar(date);
					
					var month = parseInt(date.substring(5, 7));
					
					//清空表格盘内容
					$('#date_table_content').find('table').empty();
					
					//绘制表格盘显示内容，并设置样式
					for ( var i = 0; i < 6; i++) {
						var $tr = $('<tr></tr>');
						for ( var j = 0; j < 7; j++) {
							var $td = $('<td></td>');
							if (calendar[i][j] !== 0) {
								$td.addClass('calendar_item').html(calendar[i][j]);
								if (month === this.month && calendar[i][j] === this.day) {
									$td.addClass('date_today').addClass('date_selected');
								}
							}
							$tr.append($td);
						}
						
						$('#date_table_content').find('table').append($tr);
					}
				},
				
				/**
				 * 隐藏控件
				 */
				closeBtnClick : function() {
					this.container.hide();
				},
				
				
				/**
				 * 表格盘中方格点击处理
				 */
				itemClick : function(event) {
					var event = event || window.event;
					this.dayTemp = $(event.currentTarget).text();
					$(event.currentTarget).parent().parent().parent().find('td').removeClass('date_selected');
					$(event.currentTarget).addClass('date_selected');

				},
				
				/**
				 * '今天'按钮点击处理
				 */
				todayBtnClick : function() {
					this.options.timePicker ? this.dateformatter(this.year, this.month, this.day, 0)
						: this.dateformatter(this.year, this.month, this.day, 1);
					this.setCalendarContent(this.year, this.month, this.formattedDate, this.options);
				},
				
				
				/**
				 * '确认'按钮点击处理
				 */
				okBtnClick : function() {
					$(this.el).val("");
					this.dateformatter(this.yearTemp, this.monthTemp, this.dayTemp, 1);
					var val1 = $(this.el).val();
					if (this.options.timePicker) {
						var val2 = $('#time_body-spinner-arrow').val();
						$(this.el).val(val1 + " " + val2);
					} else {
						$(this.el).val(val1);
					}
					this.closeBtnClick();
				},
				
				/**
				 * 左右选择键点击处理
				 */
				titleMove : function(event) {
					var event = event || window.event;
					var moveFlag = $(event.currentTarget).attr('class');
					var monthTemp = this.monthTemp, yearTemp = this.yearTemp;
					switch (moveFlag) {
					case 'date_move_left':
						monthTemp--;
						if (monthTemp === 0) {
							monthTemp = 12;
							yearTemp--;
						}
						break;
					case 'date_move_right':
						monthTemp++;
						if (monthTemp === 13) {
							monthTemp = 1;
							yearTemp++;
						}
						break;
					default:
						break;
					}
					this.yearTemp = yearTemp;
					this.monthTemp = monthTemp;
					this.dayTemp = 1;
					this.formattedDateTemp = this.options.timePicker ? this.dateformatter(this.yearTemp, this.monthTemp,
							this.dayTemp, 0) : this.dateformatter(this.yearTemp, this.monthTemp, this.dayTemp, 1);
					this.setCalendarContent(this.yearTemp, this.monthTemp, this.formattedDateTemp, this.options);
					if (this.yearTemp !== this.year || this.monthTemp !== this.month) {
						$('#date_table_content').find('td').removeClass('date_today');
						$('#date_table_content').find('.calendar_item').eq(0).addClass('date_selected');
					}
				},
				
				yearSelected : function() {
					new monthSelectView(this.yearTemp, this.options);
				},
				
				/**
				 * 设置日期控件的显示位置
				 */
				cssPosition : function() {
					
					//根据输入框的位置和大小初始化日期控件的显示位置
					var p_y = $(this.el).position().top + $(this.el).height();
					var p_x = $(this.el).position().left;
					
					//设置日期控件的显示位置
					this.container.css({
						left : p_x,
						top : p_y
					});
				}
			});

			
			
var	monthSelectView = Backbone.View.extend({
		el : $('body'),
		initialize : function(year, options) {
			this.el=options.baseEl;
			this.datePickerOptions = options;
			_.bindAll(this, 'render', 'monthBodyForm', 'titleMove', 'monthSelectedDeal');
			this.year = new Date().getFullYear();
			this.month = new Date().getMonth() + 1;
			this.yearTemp = year || new Date().getFullYear();
			this.render(year);
		},
		
		render : function(year) {
			var $yearTitle = $('<span><span id="monthview_year">' + year+ '</span>年</span>');
			
			$('#date_title_content').empty().append($yearTitle);
			
			this.monthBodyForm(year);
		},
		
		monthBodyForm : function(year) {
			var $monthTable = $('<table id="date_month_body" class="date_month_body">' 
							+ '<tr>' 
								+ '<td>1月</td>' 
								+ '<td>2月</td>' 
								+ '<td>3月</td>' 
								+ '<td>4月</td>' 
							+ '</tr>' 
							+ '<tr>' 
								+ '<td>5月</td>' 
								+ '<td>6月</td>' 
								+ '<td>7月</td>'
								+ '<td>8月</td>' 
							+ '</tr>' 
							+ '<tr>' 
								+ '<td>9月</td>' 
								+ '<td>10月</td>' 
								+ '<td>11月</td>'
								+ '<td>12月</td>' 
							+ '</tr>' 
						+ '</table>');
			$('#date_body').empty().append($monthTable);
			if (year === this.year) {
				$('#date_month_body').find('td').eq(this.month - 1).addClass('month_current').addClass('month_selected');
			} else {
				$('#date_month_body').find('td').eq(0).addClass('month_current').addClass('month_selected');
			}
			$('#date_month_body').find('td').unbind('click');
			$('#date_month_body').find('td').bind('click', this.monthSelectedDeal);
		},
		
		
		titleMove : function(event) {
			event = event || window.event;
			var moveFlag = $(event.currentTarget).attr('class');
			var yearTemp = this.yearTemp;
			switch (moveFlag) {
			case 'date_move_left':
				yearTemp--;
				break;
			case 'date_move_right':
				yearTemp++;
				break;
			default:
				break;
			}
			this.yearTemp = yearTemp;
			$('#monthview_year').text(this.yearTemp);
			this.monthBodyForm(this.yearTemp);
		},
		monthSelectedDeal : function(event) {
			event = event || window.event;
			var strlength = $(event.currentTarget).text().length;
			this.monthSelected = $(event.currentTarget).text().substring(0, strlength - 1);
			// new mainPickerView(this.yearTemp, this.monthSelected, '',
			// this.datePickerOptions);
		}

	});


