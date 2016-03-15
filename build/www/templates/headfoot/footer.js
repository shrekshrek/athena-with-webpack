
require('./@name@.less');

var view = Athena.Page.extend({
    id : '@name@',
    className : 'page',

    init : function() {
        this.template = require('./@name@.html');
        this.render();
        view.__super__.init.apply(this);

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
        view.__super__.transitionIn.apply(this);

        var _self = this;
        JT.to(this.$el, 0.5, {
            opacity: 1,
            onStart: function () {
                this.target.style.visibility = 'visible';
            },
            onEnd: function () {
                _self.transitionInComplete();
            }
        });
    },

    transitionInComplete: function(){
        view.__super__.transitionInComplete.apply(this);
    },

    transitionOut : function() {
        view.__super__.transitionOut.apply(this);

        var _self = this;
        JT.to(this.$el, 0.5, {
            opacity: 0,
            onEnd: function () {
                this.target.style.visibility = 'hidden';
                _self.transitionOutComplete();
            }
        });
    },

    transitionOutComplete : function() {
        view.__super__.transitionOutComplete.apply(this);
    }

});

module.exports = view;
