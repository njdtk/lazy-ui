//创建一个匿名函数并执行
/**
 * @author xiran.liu 2014-10-29
 * support some common functions for lazy-ui-compones
 */
(function(){
	
	/**
	 * 指定验证块父元素，直接创建块中的所有验证框。
	 * 整块验证,页面创建元素时，需要给 class="cs2c_validatebox",datatype="common.validateReg中对应的属性名，比如name"
	 * @param parentEl 
	 * 		验证输入框所在复元素的选择器，比如：#id,.class etc.
	 * @returns validateObjs 数组
	 * 		验证框对象数组
	 */
	Lazy_CreateValidates = function(parentEl) {
		
		var that = this,
		 	 validates = $(parentEl).find(".cs2c_validatebox");
		
		//每次初始化的时候清空
		this.validates = [];
		$.each(validates, function(index, item) {

			var validateType = this.getAttribute("validatetype"),
			    validateParam = null,
				 reg_exp = null, 
				 tipmsg = "必填项";
			
			//参数处理,
			if(validateType.indexOf("[") >0){
				validateParam = validateType.substring(validateType.indexOf("[")+1,validateType.lastIndexOf("]")).split(",");
				
				validateType = validateType.substring(0,validateType.indexOf("["));
			}
			if (!!validateType) {
				reg_exp = Lazy_validateRule[validateType].validateReg;
				tipmsg = Lazy_validateRule[validateType].validateMsg;
			} 
			
			var validateItem = new Lazy_ValidateBox({
				"selector" : $(item),
				"tipmsg" : tipmsg,
				"relevant_param" : validateParam,
				"reg_exp" : reg_exp
			});
			that.validates.push(validateItem);
		});
		return that.validates;
	};

	/**
	 * 整块验证，与Lazy_CreateValidates配合使用，用作验证。
	 * @param validateObjs 对象
	 * 		Lazy_CreateValidates的返回值
	 * @returns validateFlag bool
	 * 			true - 验证通过；false - 验证不通过
	 */
	Lazy_BlockValidate = function(validateObjs) {
		var validateFlag = true;

		$.each(validateObjs, function(index, item) {

			return validateFlag = item.inputValidate();
		});

		return validateFlag;
	};
	
	/**
	 * 验证规则对象,使用验证组建时定义正则表达式或者验证方法。
	 */
	Lazy_validateRule = {
			name : {
				validateReg : /^[a-zA-Z][a-zA-Z0-9\_\-]{3,19}$/,
				validateMsg : "请勿输入除英文字母、数字、-、_之外的字符，且必须以英文字母开头，字符长度为4~20。"
			},
			passWord : {
				validateReg : /^[^\s]{6,20}$/,
				validateMsg :"请勿输入空格，字符长度为6~20。"
			},
			email : {
				validateReg : /^[a-zA-Z0-9]([a-zA-Z0-9\.]*[-_]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(([\.][a-zA-Z0-9]{2,8}){1,5}){1}?$/,
				validateMsg :"请输入有效的邮件地址。"
			},
			telephone : {
				validateReg : /^[1]\d{10}$/,
				validateMsg :"请输入有效的手机号码。"
			},
			number : {
				validateReg : /^[1]\d{10}$/,
				validateMsg :"请输入有效的手机号码。"
			},
			ip : {
				validateReg : /^([1-9]|[1-9]\d|1\d{2}|2[0-1]\d|22[0-3])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}$/,
				validateMsg :"请输入有效的IP地址。"
			},
			netmask : {
				validateReg : /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/,
				validateMsg :"请输入有效的掩码地址。"
			},
			port : {
				validateReg : /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
				validateMsg :"请输入0~65535的整数。"
			},
			mac : {
				validateReg : /[A-F\d\a-f]{2}:[A-F\d\a-f]{2}:[A-F\d\a-f]{2}:[A-F\d\a-f]{2}:[A-F\d\a-f]{2}:[A-F\d\a-f]{2}$/,
				validateMsg :"请输入有效的MAC地址。"
			},
			netSegment : {
				validateReg : /^([1-9]|[1-9]\d|1\d{2}|2[0-1]\d|22[0-3])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){2}\.0$/,
				validateMsg :"合法IP地址，且必须以0结尾。"
			},
			multiCastIp : {
				validateReg : /^(22[5-9]|23[0-9])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}$/,
				validateMsg :"D类多播地址，范围为225.0.0.0~239.255.255.255"
			},
			equalTo : {
				validateReg : function(value,param){
					return value === $(param[0]).val();
				},
				validateMsg :"请保持两次输入内容一致。"
			}
			
			
	};

	Lazy_EventDelay = function(t,fn,context){
		var t=t*1000,
	        d=setInterval(function(){
                    clearInterval(d);
                    fn.apply(context);
            },t);
	};
})();
