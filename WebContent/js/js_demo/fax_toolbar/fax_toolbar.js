/**
 * Created by qq.yang on 14-3-25.
 * 传真的工具栏控件，可复用
 * 1、控制传真放大缩小工具
 * 2、获取传真上一步下一步的工具
 */

require("lib.lib")
$(function () {
    Util.namespace("View");

    View.FaxToolbarView = Backbone.View.extend({

        options: {
            baseEl: '',
            printHtmlID: '',
            optEl: ''
        },

        count: 0,
        reduceNum: 10,

        events: {
            'click .rotate': 'rotate',//旋转
            'click .scale': 'scale',//放大
            'click .reduce': 'reduce',//缩小
            'click .print': 'print'

        },

        initialize: function (options) {

            $.extend(this.options, options);

            $(this.el).addClass('fax-toolbar');
            $(this.el).addClass('tc');
            $(this.options.baseEl).append(this.el);

            $(this.el).append('<div class="fax-btn"><a class="rotate br" href="javascript:void(0);"><span class="rotate-icon"></span>旋转</a></div>');
            $(this.el).append('<div class="fax-btn "><a class="scale br" href="javascript:void(0);"><span class="scale-icon"></span>放大</a></div>');
            $(this.el).append('<div class="fax-btn "><a class="reduce br" href="javascript:void(0);"><span class="reduce-icon"></span>缩小</a></div>');
            $(this.el).append('<div class="fax-btn "><a class="print" href="javascript:void(0);"><span class="print-icon"></span>打印</a></div>');

        },

        render: function () {
            return this;
        },

        rotate: function (e) {
            this.count++;
            var deg = this.count * 90;
            var count = this.reduceNum / 10;
            this.matrixTransform(deg, count);

            //matrix(cosθ,sinθ,-sinθ,cosθ,0,0)
            // x' = x*cosθ-y*sinθ+0 = x*cosθ-y*sinθ
            // y' = x*sinθ+y*cosθ+0 = x*sinθ+y*cosθ
        },


        scale: function (e) {
            this.reduceNum++;
            var count = this.reduceNum / 10,
                deg = this.count * 90;

            this.matrixTransform(deg, count);
        },

        reduce: function (e) {
            if (this.reduceNum == 1) {
                return;
            }
            this.reduceNum--;
            var count = this.reduceNum / 10,
                deg = this.count * 90;

            this.matrixTransform(deg, count);
        },

        matrixTransform: function (deg, count) {
            $(this.options.optEl).css("transform", "rotate(" + deg + "deg)" + "scale(" + count + "," + count + ")");
            $(this.options.optEl).css("-moz-transform", "rotate(" + deg + "deg)" + "scale(" + count + "," + count + ")");
            $(this.options.optEl).css("-webkit-transform", "rotate(" + deg + "deg)" + "scale(" + count + "," + count + ")");
            $(this.options.optEl).css("-o-transform", "rotate(" + deg + "deg)" + "scale(" + count + "," + count + ")");

            // 用公式就很明白了，假设比例是s，则有matrix(s, 0, 0, s, 0, 0);，于是，套用公式，就有：
            // x' = ax+cy+e = s*x+0*y+0 = s*x;
            // y' = bx+dy+f = 0*x+s*y+0 = s*y;
            // 也就是matrix(sx, 0, 0, sy, 0, 0);，等同于scale(sx, sy);
        },

        print: function () {

            this.printdiv(this.options.printHtmlID);

        },

        printdiv: function (printpage) {
            var headstr = "<html><head><title>打印传真</title></head><body>",
                footstr = "</body>",
                newstr = document.all.item(printpage).innerHTML,
                newWin = window.open();

            newWin.document.body.innerHTML = headstr + newstr + footstr;
            newWin.print();
            return false;
        }



    });

    // new View.FaxToolbarView({
    //     baseEl:'#img-toolbar',
    //     printHtmlID:'print_con',
    //     optEl:'img'
    // });


    View.FaxStepPreView = Backbone.View.extend({

        options: {
            baseEl: '',
            initFaxId: ''
        },

        API: {
            UN_MATCH_FAX_INDEX: '/commission/audit/auditfax/queryUnMatchAuditFaxIndex.htm',
            PREV_NEXT_UN_MATCH_FAX: '/commission/audit/auditfax/queryRelatedUnMatchAuditFaxDetail.htm'
        },

        model: new Backbone.Model(),

        events: {
            'click .ui-btn-prev': 'prevAction',
            'click .ui-btn-next': 'nextAction'
        },


        initialize: function (options) {

            var self = this;
            self.options = options;
            self.faxId = self.options.initFaxId;

            $(self.options.baseEl).append(this.el);
            self.model.fetch({
                url: self.API.UN_MATCH_FAX_INDEX,
                data: {faxId: self.faxId}
            });

//            self.listenTo(this.model, 'change', this.render);

            self.model.on('sync', function () {
                self.render();
            });

            $(self.el).append('<div class="w30 tr"><input type="button" class="ui-btn ui-btn-medium ui-btn-prev" value="上一封" /></div>');
            $(self.el).append('<div class="w30 tc">第<span class="currentIndex">20</span>/<span class="unMatchToalCount">21</span>封</div>');
            $(self.el).append('<div class="w30 tl"><input type="button" class="ui-btn ui-btn-medium ui-btn-next" value="下一封" /></div>');

        },

        render: function () {
            var self = this,
                data = self.model.get('data') ? self.model.get('data') : {currentIndex: 0, unMatchToalCount: 0};

            self.$('.currentIndex').html(data.currentIndex);
            self.$('.unMatchToalCount').html(data.unMatchToalCount);

            self.$('.ui-btn-prev').removeClass('ui-btn-disabled');
            self.$('.ui-btn-next').removeClass('ui-btn-disabled');

            if (data.currentIndex == data.unMatchToalCount) {
                if (data.currentIndex <= 1) {
                    self.$('.ui-btn-prev').addClass('ui-btn-disabled');
                    self.$('.ui-btn-next').addClass('ui-btn-disabled');
                } else {
                    self.$('.ui-btn-next').addClass('ui-btn-disabled');//不能下一步
                }
            } else if (data.currentIndex <= 1) {
                self.$('.ui-btn-prev').addClass('ui-btn-disabled');
            }

            return this;
        },


        prevAction: function (e) {
            e ? e.preventDefault() : '';
            var self = this;
            self.prevOrNextFax(self.faxId, 1);
        },

        nextAction: function (e) {
            e ? e.preventDefault() : '';
            var self = this;
            self.prevOrNextFax(self.faxId, 2);
        },

        prevOrNextFax: function (faxIdTemp, type) {
            var self = this;
            $.ajax({
                url: self.API.PREV_NEXT_UN_MATCH_FAX,
                data: {
                    faxId: faxIdTemp,
                    type: type
                },
                dataType: "json",
                success: function (res) {
                    if (res.ret) {
                        $(self.options.imgEl)[0].src = res.data.faxPath;
                        self.faxId = res.data.faxId;
                        self.model.fetch({
                            url: self.API.UN_MATCH_FAX_INDEX,
                            data: {faxId: self.faxId}
                        });
                        self.stepSucAction(res.data);
                    } else {
                        alertDialog(res.errmsg);
                    }
                }
            });
        },

        //刷新传真界面，根据不同的情况，刷新显示的数据
        refreshStepBar: function () {
            var self = this,
                data = self.model.get('data') ? self.model.get('data') : {currentIndex: 0, unMatchToalCount: 0};

            if (data.currentIndex == data.unMatchToalCount) {
                if (data.currentIndex <= 1) {//没有传真
                    alertDialog('没有未匹配的传真！');
                } else {//可能是最后一封传真
                    self.prevAction();//显示上一封
                }
            } else if (data.currentIndex <= 1) {//可能是第一封传真
                self.nextAction();//显示下一封传真
            }
        },

        //上一步，下一步刷新成功之后，用户需要做的工作，此接口可被暴露出去
        stepSucAction: function (data) {
        }

    });

});