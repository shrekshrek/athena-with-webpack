
require('./@name@.less');

var view = BasePop.extend({
    id : "@name@-pop",

    init : function() {
        this.template = require('./@name@.html');
        this.render();
        view.__super__.init.apply(this);

        //以上三行代码是将模板加入场景,一般需要保留不用删除
    },

    destroy : function() {
        view.__super__.destroy.apply(this);
    },

    resize : function() {
        view.__super__.resize.apply(this);
    },

    transitionIn : function() {
        view.__super__.transitionIn.apply(this);

        //进场方式沿用了basePage中定义的统一方式,如果需要修改可以修改继承自Athena.Page,具体实现可以参考basePage
    },

    transitionInComplete: function(){
        view.__super__.transitionInComplete.apply(this);

        //coding here
    },

    transitionOut : function() {
        view.__super__.transitionOut.apply(this);

        //coding here
    },

    transitionOutComplete : function() {
        view.__super__.transitionOutComplete.apply(this);

        //coding here
    }

});

module.exports = view;
