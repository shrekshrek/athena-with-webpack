
require('athena');
require('jstween');

var SiteMap = require('map');
var SiteModel = require('model');
var SiteRouter = require('router');

$(function() {
    Athena.init();
    Athena.fullScreen(true);
    Athena.windowRectMin({
        width : 1000,
        height : 600
    });
    Athena.flow(Athena.NORMAL);
    Athena.preloadFast(false);

    //没有默认loading时使用以下代码
    //if (SiteMap.preloader) {
    //    Athena.once(Athena.PRELOAD_PREPARE, init);
    //    Athena.preloader(SiteMap.preloader);
    //} else {
    //    init();
    //}

    //有默认loading时使用一下代码
    Athena.once(Athena.PRELOAD_PREPARE, init);
    Athena.preloader({
        data : SiteMap.preloader0,
        el : $("#preloader0")
    });


    function init() {

        SiteModel.init();

        Bone.history.start({});
    }
});
