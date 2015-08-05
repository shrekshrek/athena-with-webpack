define(['./@name@.html', './@name@.css', './basePop', 'map', 'model', 'router'], function(html, css, BasePop, SiteMap, SiteModel, SiteRouter) {
    var view = BasePop.extend({
        id : "@name@-pop",

        init : function() {
            this.template = html.html || html;
            this.render();
            view.__super__.init.apply(this);
            var _self = this;

            this.$el.css({
                opacity : 0,
                visibility : 'hidden'
            });
        },

        resize : function() {
            view.__super__.resize.apply(this);
        },

        transitionIn : function() {
            var _self = this;
            view.__super__.transitionIn.apply(this);
            this.$el.css({
                visibility : 'visible'
            });
            JT.to(this.$el, 0.3, {
                opacity : 1,
                onEnd : function() {
                    _self.transitionInComplete();
                }
            });
        },

        transitionOut : function() {
            var _self = this;
            view.__super__.transitionOut.apply(this);
            JT.to(this.$el, 0.3, {
                opacity : 0,
                visibility : 'hidden',
                onEnd : function() {
                    _self.transitionOutComplete();
                }
            });
        },

        closeHandler : function() {
            view.__super__.closeHandler.apply(this);
        }

    });
    return view;
});
