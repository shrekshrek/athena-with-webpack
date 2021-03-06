
var view = Athena.Page.extend({
    className : "pop",
    $main : null,
    $bg : null,

    events : {
        "click .pop-bg" : "closeHandler",
        "click .close" : "closeHandler"
    },

    init : function() {
        view.__super__.init.apply(this);

        this.$el.css({
            opacity: 0,
            visibility: 'hidden'
        });
    },

    resize : function() {
        view.__super__.resize.apply(this);

        this.$el.width(Athena.stageRect().width);
        this.$el.height(Athena.stageRect().height);
    },

    transitionIn : function() {
        view.__super__.transitionIn.apply(this);

        var _self = this;
        JT.to(this.$el, 0.3, {
            opacity : 1,
            onStart: function () {
                this.target.style.visibility = 'visible';
            },
            onEnd : function() {
                _self.transitionInComplete();
            }
        });
    },

    transitionOut : function() {
        view.__super__.transitionOut.apply(this);

        var _self = this;
        JT.to(this.$el, 0.3, {
            opacity : 0,
            onEnd : function() {
                this.target.style.visibility = 'hidden';
                _self.transitionOutComplete();
            }
        });
    },

    closeHandler : function() {
        Athena.pageOff(this.data);
    }

});

module.exports = view;
