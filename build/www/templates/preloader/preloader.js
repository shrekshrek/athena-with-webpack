define(['./@name@.html', './@name@.css', 'map', 'model', 'router'], function(html, css, SiteMap, SiteModel, SiteRouter) {
    var view = Athena.Page.extend({
        id : '@name@',
        className : 'pop',
        $bar : null,
        init : function() {
            this.template = html.html || html;
            this.render();
            view.__super__.init.apply(this);
            var _self = this;

            this.$bar = $(this.el).find('#loading-bar');

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
            JT.to(this.$el, 0.5, {
                opacity : 1,
                onEnd : function() {
                    _self.transitionInComplete();
                }
            });

            this.$bar.css({
                width : 0,
                left : '50%'
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

        transitionOutComplete : function() {
            this.trigger(Athena.TRANSITION_OUT_COMPLETE, {
                data : this.data
            });
        },

        progress : function(obj) {
            var _n = obj.progress ? obj.progress : 0;
            JT.to(this.$bar, 0.3, {
                width : _n * 100 + '%',
                left : (1 - _n) * 0.5 * 100 + '%'
            });
        }

    });
    return view;
});
