
require('./@name@.less');

var view = Athena.Page.extend({
    id : '@name@',
    className : 'page',

    init : function() {
        this.template = require('./@name@.html');
        this.render();
        view.__super__.init.apply(this);
        var _self = this;

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

        this.$el.css({
            width : Athena.stageRect().width,
            top : Athena.stageRect().height
        });
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
    }

});

module.exports = view;
