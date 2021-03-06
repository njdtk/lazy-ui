/*
 * Lazy_Tree V2.0
 * @author 颜佩琼
 * started on 2013.04.12 
 * update on 2013.11.13
 * completed on ***
 *
 */

var Lazy_Tree = Backbone.View.extend({
	
	/**
	 * 可设置参数
	 */
	options : {
		
		baseEl : "",
		
		list : null,
		
		showCheckbox : true,
		
		// objName: "dtree",
		
		onItemClick : function() {
		},
		
		rightMenu : null
	},
	
	/**
	 * 创建树形组件的初始化操作
	 * 
	 */
	initialize : function() {
		
		// 初始化全局变量
		this.el = this.options.baseEl;
		
		// 节点数据列表
		this.allNodes = this.options.list;
		
		// 根节点索引值
		this.rootNodeIndex = null;
		
		// this.objName=this.options.objName;
		
		// 被选中的节点
		this.selectedNode = null;
		
		// 有线条
		// this.icon = {
		// root : 'img/base.gif',
		//
		// folder : 'img/folder.gif',
		//
		// folderOpen : 'img/folderopen.gif',
		//
		// page : 'img/page.gif',
		//
		// empty : 'img/empty.gif',
		//
		// line : 'img/line.gif',
		//
		// join : 'img/join.gif',
		//
		// joinBottom : 'img/joinbottom.gif',
		//
		// plus : 'img/plus.gif',
		//
		// plusBottom : 'img/plusbottom.gif',
		//
		// minus : 'img/minus.gif',
		//
		// minusBottom : 'img/minusbottom.gif',
		//
		// nlPlus : 'img/nolines_plus.gif',
		//
		// nlMinus : 'img/nolines_minus.gif'
		// };
		
		// 无线条
		this.icon = {
			root : 'img/base.gif',
			
			folder : 'img/folder.gif',
			
			folderOpen : 'img/folderopen.gif',
			
			page : 'img/page.gif',
			
			empty : 'img/empty.gif',
			
			line : 'img/empty.gif',
			
			join : 'img/empty.gif',
			
			joinBottom : 'img/empty.gif',
			
			plus : 'img/tree_arrows_close.gif',
			
			plusBottom : 'img/tree_arrows_close.gif',
			
			minus : 'img/tree_arrows_open.gif',
			
			minusBottom : 'img/tree_arrows_open.gif',
			
			nlPlus : 'img/nolines_plus.gif',
			
			nlMinus : 'img/nolines_minus.gif'
		};
		
		// 解析并绘制树
		this.render();
		
	},
	
	/**
	 * 绑定事件
	 * 
	 */
	bindEvents : function() {
		
		// // 聚焦样式处理
		// $(this.el).find(".dtree_node span").unbind("mouseover");
		// $(this.el).find(".dtree_node span").bind("mouseover", _(function(e) {
		// this._addStyle(e);
		// }).bind(this));
		//		
		// // 失去焦点样式处理
		// $(this.el).find(".dtree_node span").unbind("mouseout");
		// $(this.el).find(".dtree_node span").bind("mouseout", _(function(e) {
		// this._removeStyle(e);
		// }).bind(this));
		
		// 节点点击事件处理
		$(this.el).find(".dtree_node span").unbind("click");
		$(this.el).find(".dtree_node span").bind("click", _(function(e) {
			this._onItemClick(e);
		}).bind(this));
		
		// 显示或隐藏孩子节点
		$(this.el).find(".dtree_node img").unbind("click");
		$(this.el).find(".dtree_node img").bind("click", _(function(e) {
			this._handleChildren(e);
		}).bind(this));
		
		// 处理选中状态
		$(this.el).find("input[type='checkbox']").unbind("click");
		$(this.el).find("input[type='checkbox']").bind("click", _(function(e) {
			this._handleSelectState(e);
		}).bind(this));
		
		if (this.options.rightMenu) {
			this._renderRightMenu();
		}
		
	},
	
	/**
	 * 渲染组件
	 */
	render : function() {
		
		$(this.el).empty();
		// 根据用户指定objName创建div
		// this.createDiv();
		
		// 确定根节点和层级关系
		this._setChildren();
		
		// 页面渲染
		$(this.el).append(this._eletmpl(this.rootNodeIndex, this._getCurImgs(this.rootNodeIndex)));
		this._showChildren(this.rootNodeIndex);
		// this._renderRightMenu();
	},
	
	/**
	 * 添加mouseover样式
	 */
	// _addStyle : function(e) {
	// $(e.currentTarget).addClass("node_mouseover");
	// //
	// $(e.currentTarget)[0].style.setProperty("text-decoration","underline");
	// // $(e.currentTarget)[0].style.setProperty("color","#0033FF");
	// },
	//	
	// /**
	// * 添加mouseout样式
	// */
	// _removeStyle : function(e) {
	// $(e.currentTarget).removeClass("node_mouseover");
	// // console.log($(e.currentTarget)[0])
	// // $(e.currentTarget)[0].style.setProperty("text-decoration","");
	// // $(e.currentTarget)[0].style.setProperty("color","");
	// },
	/**
	 * 凸显选中行样式
	 */
	_toggleSelectStyle : function(e) {
		
		var curIndex = this._getIndex($(e.currentTarget).parent());
		var eleType = $(e.currentTarget)[0].tagName;
		var divs = $(this.el).find("div.dtree_node");
		
		// console.log(eleType);
		
		// 分两种情况：
		// 1)如果是点击节点选中,是对当前点击行进行样式突出
		if (eleType == "SPAN") {
			for ( var i = 0; i < divs.length; i++) {
				$(divs[i]).removeClass("selected");
			}
			
			$(this.el).find("div[name='div_node_" + curIndex + "']").addClass("selected");
			
			// 如果是点击checkbox选中，则对所有选中行进行样式突出
		} else {
			// console.log(this.selectedNode);
			// if()
			// $(this.el).find("div[name='div_node_"+this.selectedNode+"']").removeClass("selected");
			if (this.allNodes[curIndex].checked) {
				$(this.el).find("div[name='div_node_" + curIndex + "']").addClass("selected");
			} else {
				$(this.el).find("div[name='div_node_" + curIndex + "']").removeClass("selected");
			}
		}
		
	},
	
	/**
	 * 
	 * 节点点击处理函数
	 */
	_onItemClick : function(e) {
		
		var curIndex = this._getIndex($(e.currentTarget).parent());
		// $(e.currentTarget)[0].style.setPropterty("background-color","#9F3");
		this.selectedNode = curIndex;
		this._toggleSelectStyle(e);
		
		if (this.options.onItemClick && _(this.options.onItemClick).isFunction()) {
			this.options.onItemClick(this.allNodes[curIndex]);
		}
		
	},
	
	/**
	 * 判断隐藏或显示子节点
	 */
	_handleChildren : function(e) {
		var curImg = $(e.currentTarget);
		var curIndex = this._getIndex($(curImg).parent());
		// 如果为非叶子节点，且当前当前为收缩状态，则显示该非叶子节点的一级孩子节点
		if ($(curImg).attr("src") === this.icon.plus || $(curImg).attr("src") === this.icon.plusBottom) {
			this._showChildren(curIndex);
			
		} else if ($(curImg).attr("src") === this.icon.minus || $(curImg).attr("src") === this.icon.minusBottom) {
			this._hideChildren(curIndex);
			
		}
	},
	
	/**
	 * 显示一级子节点
	 */
	_showChildren : function(curIndex) {
		
		if (this.allNodes[curIndex].childNum > 0) {
			
			var imgList = $($(this.el).find("div[name='div_node_" + curIndex + "']")).find('img');
			
			var curImg = imgList[imgList.length - 2];
			
			$(curImg).attr("src", this.icon.minus);
			
			$(curImg).next().attr("src", this.icon.folderOpen);
			
			// 逐级渲染
			this._renderNodes(curIndex);
		}
		
	},
	
	/**
	 * 
	 * 隐藏所有子孙节点
	 */
	_hideChildren : function(curIndex) {
		
		if (this.allNodes[curIndex].childNum > 0) {
			
			var imgList = $($(this.el).find("div[name='div_node_" + curIndex + "']")).find('img');
			
			var curImg = imgList[imgList.length - 2];
			
			$(curImg).attr("src", this.icon.plus);
			$(curImg).next().attr("src", this.icon.folder);
			
			// 递归删除子孙节点
			this._removeNodes(curIndex);
			
		}
		
	},
	
	/**
	 * 循环遍历this.allNodes，查找每个节点的孩子节点以及孩子个数 同时获取根节点索引（this.rootNodeIndex）
	 */
	_setChildren : function() {
		for ( var i = 0; i < this.allNodes.length; i++) {
			var childNum = 0;
			var childList = [];
			var isRoot = true;
			
			for ( var j = 0; j < this.allNodes.length; j++) {
				if (this.allNodes[i].id == this.allNodes[j].pid) {
					childNum++;
					childList.push(j);
					this.allNodes[j].pIndex = i;
				}
				
				if (this.allNodes[i].pid == this.allNodes[j].id) {
					// console.log(this.allNodes[i])
					isRoot = false;
				}
				
			}
			// console.log(this.allNodes[i])
			this.allNodes[i].childNum = childNum;
			this.allNodes[i].childList = childList;
			
			if (isRoot) {
				this.rootNodeIndex = i;
			}
			
			this.allNodes[i].model.index = i;
		}
		
		// console.log(this.allNodes)
		
	},
	
	/**
	 * 根据index渲染该节点的一级子节点
	 */
	_renderNodes : function(index) {
		var str = "";
		var prevImgs = this._getPrevImgs(index);
		var pos = $(this.el).find("div[name='div_node_" + index + "']");
		
		// console.log("render childs")
		/*
		 * if(index === this.rootNodeIndex){ str +=
		 * this._eletmpl(index,this._getCurImgs(index)); }
		 */
		for ( var i = 0; i < this.allNodes[index].childNum; i++) {
			
			var curChIndex = this.allNodes[index].childList[i];
			var curImgs = this._getCurImgs(curChIndex);
			var imgs = [];
			
			$(this.el).find("div[name='div_node_" + curChIndex + "']").remove();
			
			for ( var k = 0; k < prevImgs.length; k++) {
				imgs.push(prevImgs[k]);
			}
			
			for ( var j = 0; j < curImgs.length; j++) {
				imgs.push(curImgs[j]);
			}
			
			str += this._eletmpl(curChIndex, imgs);
		}
		
		$(pos).after(str);
		
		var newList = $(this.el).find(".new_node");
		
		var maximum = newList.length;
		
		var i = 0;
		
		var showNode = function() {
			
			$(newList[i]).show("normal");
			$(newList[i]).removeClass('new_node');
			
			if (i < maximum) {
				setTimeout(showNode, 200);
			}
			
			i++;
		}

		showNode();
		
		this.bindEvents();
	},
	
	/**
	 * 递归移除index指定的所有子孙节点
	 */
	_removeNodes : function(index) {
		
		for ( var i = 0; i < this.allNodes[index].childNum; i++) {
			var curIndex = this.allNodes[index].childList[i];
			var curNode = this.allNodes[curIndex];
			
			if (curNode.childNum > 0) {
				this._removeNodes(curIndex);
			}
			
			$(this.el).find("div[name='div_node_" + curIndex + "']").hide("slow");
			// var
			// temp=function(){$(this.el).find("div[name='div_node_"+curIndex+"']").remove();}
			
			// setTimeout(_(temp).bind(this),200);
			
		}
		
		// var maximum = newList.length;
		
		/*
		 * var removeNode=function(paramIndex){
		 * 
		 * var i=0; var curIndex = this.allNodes[paramIndex].childList[i]; var
		 * curNode = this.allNodes[curIndex];
		 * 
		 * if(curNode.childNum>0){ this._removeNodes(curIndex); } console.log(i)
		 * $(this.el).find("div[name='div_node_"+curIndex+"']").hide("normal");
		 * 
		 * $(this.el).find("div[name='div_node_"+curIndex+"']").remove();
		 * 
		 * if(i<this.allNodex[paramIndex].childNum){
		 * setTimeout(removeNode,200); }
		 * 
		 * i++; }
		 * 
		 * _(removeNode(index)).bind(this);
		 * 
		 */
	},
	
	/**
	 * 拼接节点元素
	 */
	_eletmpl : function(index, imgs) {
		var imgEles = "";
		var checkBoxEle = "";
		var returnVal = "";
		
		// var param=JSON.stringify(this.allNodes[index]);
		// var clickFun=this.options.onItemClick;
		
		for ( var i = 0; i < imgs.length; i++) {
			imgEles += '<img src="' + imgs[i] + '" />';
		}
		
		if (this.options.showCheckbox) {
			checkBoxEle = "<input type='checkbox'/>";
		}
		
		returnVal = "<div class='dtree_node new_node'  name='div_node_" + index + "' >" + imgEles + checkBoxEle
				+ "<span id='node_" + index + "' " + ">" + this.allNodes[index].content + '</span>' + '</div>';
		return returnVal;
	},
	
	/**
	 * 返回该节点的显示图片列表, 3个分支： 1)根节点； 2)非叶子节点（中间非叶子节点和最后一个非叶子节点）
	 * 3)叶子节点（中间叶子节点和最后一个叶子节点）
	 */
	_getCurImgs : function(index) {
		var returnVal = [];
		
		if (index === this.rootNodeIndex) {
			returnVal.push(this.icon.root);
			
			// 如果为非叶子节点
		} else if (this.allNodes[index].childNum > 0) {
			// 判断是否为父节点的最后一个孩子节点（非叶子）
			if (this._isLast(index)) {
				returnVal.push(this.icon.plusBottom);
				returnVal.push(this.icon.folder);
				// 为中间的非叶子节点
			} else {
				returnVal.push(this.icon.plus);
				returnVal.push(this.icon.folder);
			}
			
			// 如果为叶子节点
		} else {
			// 如果为父节点的最后一个孩子节点（叶子）
			if (this._isLast(index)) {
				returnVal.push(this.icon.joinBottom);
				returnVal.push(this.icon.page);
				
			} else {
				returnVal.push(this.icon.join);
				returnVal.push(this.icon.page);
			}
		}
		
		return returnVal;
	},
	
	/**
	 * 确定显示的图片列表
	 */
	_getPrevImgs : function(index) {
		
		var tempFlag = [];
		var grandIndex = index;
		var returnVal = [];
		
		while (grandIndex != this.rootNodeIndex) {
			
			if (this._isLast(grandIndex)) {
				tempFlag.push(0);
			} else {
				tempFlag.push(1);
			}
			
			grandIndex = this.allNodes[grandIndex].pIndex;
		}
		
		for ( var i = tempFlag.length - 1; i >= 0; i--) {
			if (tempFlag[i] === 0) {
				returnVal.push(this.icon.empty);
			} else {
				returnVal.push(this.icon.line);
			}
		}
		
		return returnVal;
		
	},
	
	/**
	 * 判断是否为父节点的最后一个孩子节点
	 */
	_isLast : function(index) {
		
		var pIndex = this.allNodes[index].pIndex;
		
		var returnVal = false;
		
		if (index == this.allNodes[pIndex].childList[this.allNodes[pIndex].childNum - 1]) {
			returnVal = true;
		}
		
		return returnVal;
	},
	
	/**
	 * 设置对象的selected属性值
	 */
	_handleSelectState : function(e) {
		
		var curIndex = this._getIndex($(e.currentTarget).parent());
		
		if ($(e.currentTarget)[0].checked) {
			this.allNodes[curIndex].checked = true;
		} else {
			this.allNodes[curIndex].checked = false;
		}
		
		this._toggleSelectStyle(e);
	},
	
	/**
	 * 根据触发元素确定节点索引值
	 */
	_getIndex : function(el) {
		// console.log("_getIndex");
		var tempList = $(el).attr("name").split("_");
		var curIndex = tempList[tempList.length - 1];
		
		return curIndex;
		
	},
	
	/**
	 * 重新渲染指定节点
	 */
	_itemRender : function(index) {
		$(this.el).find("span#node_" + index).html(this.allNodes[index].content);
		this.shine(index);
		
	},
	
	/**
	 * 渲染右键菜单： 1）为每一个节点绑定右键菜单处理事件，并把该节点对应的model作为参数传递给相应处理函数
	 * 2）使用闭包依次将节点对应的model作为参数传递到右键菜单rightMenuView
	 */
	_renderRightMenu : function() {
		
		var allSpans = $(this.el).find("span");
		var options = this.options.rightMenu;
		var el = this.el;
		
		for ( var i = 0; i < allSpans.length; i++) {
			
			var curIndex = this._getIndex($(allSpans[i]).parent());
			
			// 绑定右键处理方法
			allSpans[i].oncontextmenu = function(model) {
				return function(e) {
					// 显示右键菜单
					Lazy_RightMenu.initialize({
						"e" : e,
						"model" : model,
						"options" : options,
						"el" : el
					});
				};
			}(this.allNodes[curIndex].model);
		}
		
		if (window.Event) {
			document.captureEvents(Event.MOUSEUP);
		}
		
	},
	
	// /////////////////////////////////////////////////////////////////////////////////////////////////////////
	// -----------------------------附加函数，供用户调用-------------------------------------------------------------------------------------------------------
	
	/**
	 * 返回指定元素的一级子节点
	 * 
	 */
	getChildren : function(model) {
		var index = model.model.index;
		var childIndexList = this.allNodes[index].childList;
		var returnVal = [];
		for ( var i = 0; i < childIndexList.length; i++) {
			returnVal.push(this.allNodes[childIndexList[i]]);
		}
		
		return returnVal;
	},
	
	/**
	 * 返回指定元素的所有子孙节点
	 */
	getAllChildren : function(model) {
		var index = model.model.index;
		var childIndexList = this.allNodes[index].childList;
		var returnVal = [];
		for ( var i = 0; i < childIndexList.length; i++) {
			var curNode = this.allNodes[childIndexList[i]]
			returnVal.push(curNode);
			if (curNode.childNum > 0) {
				returnVal = returnVal.concat(this.getAllChildren(curNode));
			}
		}
		
		return returnVal;
	},
	
	/**
	 * 返回处于选中状态的所有节点
	 */
	getSelected : function() {
		var returnVal = [];
		
		for ( var i = 0; i < this.allNodes.length; i++) {
			if (this.allNodes[i].checked) {
				returnVal.push(this.allNodes[i]);
			}
		}
		
		return returnVal;
	},
	
	/**
	 * 动态添加新节点
	 */
	addNode : function(model) {
		
		// 表示待处理节点
		var handleList = [];
		
		// 将新节点添加到allNodes中
		this.allNodes.push(model);
		
		// 重新确定节点的层状关系
		this._setChildren();
		// console.log(this.allNodes);
		
		var showIndex = model.model.index;
		
		while ($(this.el).find("div[name='div_node_" + showIndex + "']").length == 0) {
			showIndex = this.allNodes[showIndex].pIndex;
			handleList.push(showIndex);
		}
		
		// console.log(handleList);
		// 主机渲染节点，直到渲染到新添加节点为止
		var curIndex = handleList.pop();
		
		// 隐藏首个可见祖节点的所有子孙节点
		this._hideChildren(curIndex);
		
		while (handleList.length > 0) {
			this._showChildren(curIndex);
			curIndex = handleList.pop();
		}
		
		this._showChildren(curIndex);
		
		// $(this.el).find("div[name='div_node_"+model.model.index+"']").addClass("selected");
		this.shine(model.model.index);
		
	},
	
	/**
	 * 批量删除指定节点，只可删除叶子节点
	 */
	deleteNodes : function(models) {
		// console.log(models);
		
		for ( var i = 0; i < models.length; i++) {
			if (models[i].childNum === 0) {
				for ( var j = 0; j < this.allNodes.length - 1; j++) {
					if (this.allNodes[j].model.index == models[i].model.index) {
						var temp = this.allNodes[j];
						this.allNodes[j] = this.allNodes[j + 1];
						this.allNodes[j + 1] = temp;
					}
				}
				
				this.allNodes.pop();
			}
			
		}
		
		this.openAll();
		
	},
	
	/**
	 * 更新数据
	 */
	updateNode : function(model) {
		console.log("update");
		var curIndex = model.model.index;
		
		this.allNodes[curIndex] = model;
		this._itemRender(curIndex);
		
		// console.log(this.allNodes[curIndex]);
		// this.a
		
	},
	
	/**
	 * 对指定行进行闪烁处理
	 */
	shine : function(index) {
		this.timerCount = 0;
		$(this.el).find(".dtree_node").removeClass("selected");
		this.timerId1 = window.setInterval(_(this.shining).bind(this), 1000, index);
		this.timerId2 = window.setInterval(_(this.closeShining).bind(this), 700, index);
	},
	
	/**
	 * 高亮显示
	 */
	shining : function(index) {
		console.log("shining")
		$(this.el).find("div[name='div_node_" + index + "']").addClass("selected");
		if (this.timerCount == 2) {
			window.clearInterval(this.timerId1);
			return;
		}
	},
	
	/**
	 * 取消高亮显示
	 */
	closeShining : function(index) {
		
		$(this.el).find("div[name='div_node_" + index + "']").removeClass("selected");
		this.timerCount++;
		if (this.timerCount == 2) {
			window.clearInterval(this.timerId2);
			return;
		}
	},
	
	/**
	 * 关闭树
	 */
	closeAll : function() {
		this.render();
		
	},
	
	/**
	 * 展开指定元素的所有子孙节点（广度优先算法）
	 */
	openAll : function() {
		var showList = [];
		this.render();
		this._hideChildren(this.rootNodeIndex);
		// this.renderAll(this.rootNodeIndex);
		showList.push(this.rootNodeIndex);
		while (showList.length > 0) {
			
			var curIndex = showList.shift();
			this._showChildren(curIndex);
			
			if (this.allNodes[curIndex].childNum > 0) {
				for ( var i = 0; i < this.allNodes[curIndex].childNum; i++) {
					showList.push(this.allNodes[curIndex].childList[i]);
				}
			}
		}
	}

});