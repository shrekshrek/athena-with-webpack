define(['./@name@.html', './@name@.css', 'map', 'model', 'router'], function(html, css, SiteMap, SiteModel, SiteRouter) {
    var view = Athena.Page.extend({
        id : '@name@',
        className : 'page',

        init : function() {
            this.template = html.html || html;
            this.render();
            view.__super__.init.apply(this);
            var _self = this;

            $.each(this.$el.find('li'), function(index, obj) {
                $(obj).on('click', function() {
                    _self._navHandler(index);
                    return false;
                });
            });

            //监听流程结束事件，检查更新当前页面的导航按钮状态
            this.listenTo(Athena, Athena.FLOW_COMPLETE, function() {
                this._checkNav();
            });

            this.$el.css({
                opacity : 0,
                visibility : 'hidden'
            });
        },

        destroy : function() {
            view.__super__.destroy.apply(this);
        },

        resize : function() {
            view.__super__.resize.apply(this);

            this.$el.width(Athena.stageRect().width);

        },

        transitionIn : function() {
            var _self = this;
            view.__super__.transitionIn.apply(this);
            this.$el.css({
                visibility : 'visible'
            });
            JT.to(this.$el, 0.5, {
                opacity : 1,
                onEnd : function() {
                    _self.transitionInComplete();
                }
            });
        },

        transitionOut : function() {
            var _self = this;
            view.__super__.transitionOut.apply(this);
            JT.to(this.$el, 0.5, {
                opacity : 0,
                onEnd : function() {
                    _self.$el.css({
                        visibility : 'hidden'
                    });
                    _self.transitionOutComplete();
                }
            });
        },

        _checkNav : function() {
            var _page = Athena.getPageAt();
            var _id = 0;

            if (_page) {
                switch (_page.data) {
                case SiteMap.home :
                    _id = 0;
                    break;
                case SiteMap.work :
                    _id = 1;
                    break;
                }
            }

            $.each(this.$el.find('a'), function(index, obj) {
                if (index == _id) {
                    $(obj).addClass('selected');
                } else {
                    $(obj).removeClass('selected');
                }
            });
        },

        _navHandler : function(id) {
            switch (id) {
            case 0 :
                SiteRouter.navigate(SiteMap.home.id, {
                    trigger : true
                });
                break;
            case 1 :
                SiteRouter.navigate(SiteMap.work.id, {
                    trigger : true
                });
                break;
            case 2 :
                Athena.pageTo(SiteMap.tip1);
                break;
            }
        }

    });
    return view;
});
