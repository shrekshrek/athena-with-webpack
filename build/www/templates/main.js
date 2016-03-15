
require('athena');
require('jstween');

require('map');
require('model');
require('router');

require('page');
require('pop');

$(function() {
    Athena.init();
    Athena.fullScreen(true);
    //Athena.windowRectMin({
    //    width : 1000,
    //    height : 600
    //});
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
        data : Map.preloader0,
        el : $("#preloader0")
    });


    function init() {

        Model.init();

        Bone.history.start({});
    }
});
