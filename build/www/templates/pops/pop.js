
require('./@name@.less');
var BasePop = require('./basePop.js');

var view = BasePop.extend({
    id : "@name@-pop",

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

    resize : function() {
        view.__super__.resize.apply(this);
    },

    transitionIn : function() {
        var _self = this;
        view.__super__.transitionIn.apply(this);
        JT.to(this.$el, 0.3, {
            opacity: 1,
            onStart: function () {
                this.target.style.visibility = 'visible';
            },
            onEnd: function () {
                _self.transitionInComplete();
            }
        });
    },

    transitionOut : function() {
        var _self = this;
        view.__super__.transitionOut.apply(this);
        JT.to(this.$el, 0.3, {
            opacity : 0,
            onEnd : function() {
                this.target.style.visibility = 'hidden';
                _self.transitionOutComplete();
            }
        });
    },

    closeHandler : function() {
        view.__super__.closeHandler.apply(this);
    }

});

module.exports = view;
