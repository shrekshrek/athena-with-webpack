
require('./@name@.less');

var view = Athena.Page.extend({
    id: '@name@-page',
    className: 'page',

    init: function () {
        this.template = require('./@name@.html');
        this.render();
        view.__super__.init.apply(this);

        this.$el.css({
            opacity: 0,
            visibility: 'hidden'
        });
    },

    events: {},

    destroy: function () {
        view.__super__.destroy.apply(this);
    },

    resize: function () {
        view.__super__.resize.apply(this);

        this.$el.width(Athena.stageRect().width);
        this.$el.height(Athena.stageRect().height);
    },

    transitionIn: function () {
        var _self = this;
        view.__super__.transitionIn.apply(this);
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

    transitionOut: function () {
        var _self = this;
        view.__super__.transitionOut.apply(this);
        JT.to(this.$el, 0.5, {
            opacity: 0,
            onEnd: function () {
                this.target.style.visibility = 'hidden';
                _self.transitionOutComplete();
            }
        });
    }

});

module.exports = view;
