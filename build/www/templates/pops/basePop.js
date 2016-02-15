
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

        this.$main = this.$el.find(".pop-main");
        this.$bg = this.$el.find(".pop-bg");
    },

    resize : function() {
        this.$el.width(Athena.stageRect().width);
        this.$el.height(Athena.stageRect().height);

        view.__super__.resize.apply(this);
    },

    closeHandler : function() {
        Athena.pageOff(this.data);
    }

});

module.exports = view;
