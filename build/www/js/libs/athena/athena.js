/*!
 * VERSION: 2.0.0
 * DATE: 2016-05-05
 * GIT:https://github.com/shrekshrek/athena-with-webpack
 *
 * @author: Shrek.wang, shrekshrek@gmail.com
 **/

var Bone = require('bone');
var $ = require('jquery');
var fixloader = require('fixloader');

// -------------------------------------------------------------------- 辅助方法
function each(data, callback) {
    if (data.length === undefined) {
        callback.call(data, 0, data);
    } else {
        var _len = data.length;
        for (var i = 0; i < _len; i++) {
            callback.call(data[i], i, data[i]);
        }
    }
}

// -------------------------------------------------------------------- 框架事件名，事件功能
Bone.extend(Athena, Bone.Events, {
    /*
     * 主流程加载相关常量
     */
    PRELOAD_START: "preloadStart",
    PRELOAD_PROGRESS: "preloadProgress",
    PRELOAD_COMPLETE: "preloadComplete",

    /*
     * 隐藏加载相关常量
     */
    BACKLOAD_COMPLETE: "backloadComplete",

    /*
     * 页面进出场常量
     */
    TRANSITION_IN: "transitionIn",
    TRANSITION_IN_COMPLETE: "transitionInComplete",
    TRANSITION_OUT: "transitionOut",
    TRANSITION_OUT_COMPLETE: "transitionOutComplete",

    /*
     * 页面深度常量
     * preload 相当于 z-index = 1500
     * top 相当于 z-index = 1000
     * middle 相当于z-index = 500
     * bottom 相当于 z-index = 0
     */
    PRELOAD: "preload",
    TOP: "top",
    MIDDLE: "middle",
    BOTTOM: "bottom",

    /*
     * 页面切换方式常量
     * normal 为普通切换方式，1。当前页面退场。2。加载新页面。3。新页面进场。
     * preload 为普通切换方式，1。加载新页面。2。当前页面退场。3。新页面进场。
     * reverse 为普通切换方式，1。加载新页面。2。新页面进场。3。当前页面退场。
     * cross 为普通切换方式，1。加载新页面。2。新页面进场。当前页面退场。同时进行。
     */
    NORMAL: "normal",
    // PRELOAD:"preload",
    REVERSE: "reverse",
    CROSS: "cross",

    /*
     * 页面间切换状态常量
     */
    FLOW_START: "flowStart",
    FLOW_COMPLETE: "flowComplete",

    WINDOW_RESIZE: "windowResize",

    /*
     * 页面间切换状态常量
     */
    PRELOAD_PREPARE: "preloadPrepare"
});

// -------------------------------------------------------------------- 框架主控制器逻辑
var $stage, $window, $document;
var defaultFlow = Athena.NORMAL;
var isFullScreen = false;
var stageRect = {
    width: 0,
    height: 0
};
var windowRect = {
    width: 0,
    height: 0
};
var windowRectMin = {
    width: 1,
    height: 1
};
var defaultDepths = [1500, 1000, 500, 0];
var curPages = {};
var nextPages = {};
var preloadPages = {};

// -------------------------------------------------------------------- preloader
var preloader = null;
var preloadMustIn = false;

function wpPreloaderComplete(view, data) {
    preloader = new view(data);
    $stage.append(preloader.el);
    preloader.init();
    Athena.trigger(Athena.PRELOAD_PREPARE);
}


function checkLast(action, data) {
    var _isSame = false;
    if (FlowCtrler.actionQueue.length) {
        var _last = FlowCtrler.actionQueue[FlowCtrler.actionQueue.length - 1];
        each(data, function (i, obj) {
            if (_last.action == action && _last.data == obj) {
                _isSame = true;
            }
        });
    }
    return _isSame;
}

function checkData(data) {
    if (!data) throw "page data is undefined!";

    var _datas = [];
    each(data, function (i, obj) {
        if (typeof(obj) === 'number') {
            obj = curPages[obj];
        } else if (typeof(obj) === 'string') {
            obj = curPages[checkDepth(obj)];
        }

        var _data = obj.data || obj;

        if (!_data.depth) throw "page data has wrong!!! must has 'data.depth'";

        _data.depth = checkDepth(_data.depth);

        _datas.push(_data);
    });
    return _datas;
}

function checkDepth(depth) {
    var _depth = defaultDepths[2];

    switch (typeof(depth)) {
        case 'string':
            depth = depth.toLowerCase();
            var _plus = "";
            var _num = 0;
            var _n = Math.max(depth.indexOf("+"), depth.indexOf("-"));

            if (_n > 0) {
                _depth = depth.substring(0, _n);
                _plus = depth.substring(_n, _n + 1);
                _num = parseInt(depth.substring(_n + 1));
            } else {
                _depth = depth;
            }

            switch (_depth) {
                case Athena.PRELOAD :
                    _depth = defaultDepths[0];
                    break;
                case Athena.TOP :
                    _depth = defaultDepths[1];
                    break;
                case Athena.MIDDLE :
                    _depth = defaultDepths[2];
                    break;
                case Athena.BOTTOM :
                    _depth = defaultDepths[3];
                    break;
                default:
                    _depth = defaultDepths[2];
                    break;
            }

            switch (_plus) {
                case "+" :
                    _depth += _num;
                    break;
                case "-" :
                    _depth -= _num;
                    break;
            }
            break;
        case 'number':
            _depth = Math.floor(depth);
            break;
    }

    return _depth;
}


var FlowCtrler = Bone.extend({}, Bone.Events, {
    isFlowing: false,
    actionQueue: [],

    curDatas: null,
    curIndex: 0,
    curMax: 0,

    pageIn: function (data) {
        this.actionQueue.push({action: "on", data: data});
        if (!this.isFlowing) this.playQueue();
    },

    pageOut: function (data) {
        this.actionQueue.push({action: "off", data: data});
        if (!this.isFlowing) this.playQueue();
    },

    playQueue: function () {
        var _self = this;
        if (this.actionQueue.length != 0) {
            var _actionData = this.actionQueue.shift();
            this.curDatas = _actionData.data;
            this.isFlowing = true;
            this.curIndex = 0;
            this.curMax = this.curDatas.length;

            Athena.trigger(Athena.FLOW_START, this.curDatas);

            switch (_actionData.action) {
                case "on":
                    each(this.curDatas, function (i, obj) {
                        FlowCtrler.flowIn(obj);
                    });
                    break;
                case "off":
                    each(this.curDatas, function (i, obj) {
                        var _page = curPages[obj.depth];
                        _self.listenToOnce(_page, Athena.TRANSITION_OUT_COMPLETE, function () {
                            FlowCtrler.flowOutComplete(obj);
                        });
                        _page.transitionOut();
                    });
                    break;
            }
        } else {
            this.curDatas = null;
            this.isFlowing = false;
        }
    },

    flowIn: function (data) {
        var _curPage = curPages[data.depth];
        var _flow = data.flow || defaultFlow;
        switch (_flow) {
            case Athena.NORMAL :
                if (_curPage) {
                    this.listenToOnce(_curPage, Athena.TRANSITION_OUT_COMPLETE, function () {
                        FlowCtrler.flowInComplete(data);
                    });
                    _curPage.transitionOut();
                } else {
                    this.flowInComplete(data);
                }
                break;
            case Athena.PRELOAD :
            case Athena.REVERSE :
            case Athena.CROSS :
                this.curIndex++;
                if (this.curIndex >= this.curMax) {
                    this.curIndex = 0;
                    this.listenToOnce(PreloadCtrler, Athena.PRELOAD_COMPLETE, function () {
                        each(this.curDatas, function (i, obj) {
                            FlowCtrler.flowInComplete(obj);
                        });
                    });
                    PreloadCtrler.load(this.curDatas);
                }
                break;
        }
    },

    flowInComplete: function (data) {
        var _curPage = curPages[data.depth];
        var _nextPage = nextPages[data.depth];
        var _flow = data.flow || defaultFlow;
        switch (_flow) {
            case Athena.NORMAL :
                this.curIndex++;
                if (this.curIndex >= this.curMax) {
                    this.curIndex = 0;
                    this.listenToOnce(PreloadCtrler, Athena.PRELOAD_COMPLETE, function () {
                        each(this.curDatas, function (i, obj) {
                            FlowCtrler.flowOut(obj);
                        });
                    });
                    PreloadCtrler.load(this.curDatas);
                }
                break;
            case Athena.PRELOAD :
                if (_curPage) {
                    this.listenToOnce(_curPage, Athena.TRANSITION_OUT_COMPLETE, function () {
                        FlowCtrler.flowOut(data);
                    });
                    _curPage.transitionOut();
                } else {
                    this.flowOut(data);
                }
                break;
            case Athena.REVERSE :
                this.listenToOnce(_nextPage, Athena.TRANSITION_IN_COMPLETE, function () {
                    FlowCtrler.flowOut(data);
                });
                _nextPage.transitionIn();
                break;
            case Athena.CROSS :
                if (_curPage) {
                    _curPage.transitionOut();
                }
                this.flowOut(data);
                break;
        }
    },

    flowOut: function (data) {
        var _curPage = curPages[data.depth];
        var _nextPage = nextPages[data.depth];
        var _flow = data.flow || defaultFlow;
        switch (_flow) {
            case Athena.NORMAL :
            case Athena.PRELOAD :
            case Athena.CROSS :
                this.listenToOnce(_nextPage, Athena.TRANSITION_IN_COMPLETE, function () {
                    FlowCtrler.flowOutComplete(data);
                });
                _nextPage.transitionIn();
                break;
            case Athena.REVERSE :
                if (_curPage) {
                    this.listenToOnce(_curPage, Athena.TRANSITION_OUT_COMPLETE, function () {
                        FlowCtrler.flowOutComplete(data);
                    });
                    _curPage.transitionOut();
                } else {
                    this.flowOutComplete(data);
                }
                break;
        }
    },

    flowOutComplete: function (data) {
        var _curPage = curPages[data.depth];
        var _nextPage = nextPages[data.depth];

        if (_curPage) {
            delete curPages[data.depth];
        }

        if (_nextPage) {
            curPages[data.depth] = _nextPage;
            delete nextPages[data.depth];
        }

        if (data.routing) document.title = data.routing;

        this.curIndex++;
        if (this.curIndex >= this.curMax) {
            Athena.trigger(Athena.FLOW_COMPLETE, this.curDatas);
            this.playQueue();
        }
    }

});


var PreloadCtrler = Bone.extend({}, Bone.Events, {
    curDatas: null,

    load: function (data) {
        var _self = this;

        this.listenTo(Athena, Athena.PRELOAD_PROGRESS, this.progressHandler);
        this.listenTo(Athena, Athena.PRELOAD_COMPLETE, this.completeHandler);

        if (preloader) {
            if (preloadMustIn) {
                this.listenToOnce(preloader, Athena.TRANSITION_IN_COMPLETE, function () {
                    _self.preload(data);
                });
                preloader.transitionIn();
            } else {
                preloader.transitionIn();
                this.preload(data);
            }
        } else {
            this.preload(data);
        }

    },

    progressHandler: function(n){
        if(preloader) preloader.progress(n);
    },

    completeHandler: function(){
        if(preloader) preloader.transitionOut();
        each(this.curDatas, function (i, obj) {
            var _page = preloadPages[obj.id];
            nextPages[obj.depth] = _page;
            delete preloadPages[obj.id];
            $stage.append(_page.el);
            _page.init();
        });

        this.stopListening(Athena, Athena.PRELOAD_PROGRESS, this.progressHandler);
        this.stopListening(Athena, Athena.PRELOAD_COMPLETE, this.completeHandler);
        this.trigger(Athena.PRELOAD_COMPLETE);
    },

    preload: function (data) {
        this.curDatas = data;

        var _self = this;

        each(data, function (i, obj) {
            var _id = obj.id;
            if (preloadPages[_id] == undefined) {
                preloadPages[_id] = 'p';
                fixloader({data: obj}, function(view, data){
                    var _page = new view(data);
                    preloadPages[data.data.id] = _page;
                    _self.complete();
                });
            }else{
                if(preloadPages[_id] != 'p')  _self.complete();
            }
        });
    },

    complete: function () {
        var _loaded = 0;
        var _loadMax = 0;

        each(this.curDatas, function (i, obj) {
            var _id = obj.id;
            if (preloadPages[_id] != undefined && preloadPages[_id] != 'p') _loaded++;
            _loadMax++;
        });

        Athena.trigger(Athena.PRELOAD_PROGRESS, _loaded/_loadMax);

        if (_loaded >= _loadMax) {
            Athena.trigger(Athena.PRELOAD_COMPLETE);
        }
    }

});

PreloadCtrler.progressHandler = PreloadCtrler.progressHandler.bind(PreloadCtrler);
PreloadCtrler.completeHandler = PreloadCtrler.completeHandler.bind(PreloadCtrler);

// -------------------------------------------------------------------- Athena的api
Bone.extend(Athena, {
    init: function (stage) {
        $stage = stage || $("body");
        $window = $(window);
        $document = $(document);

        curPages = {};
        nextPages = {};
        preloadPages = {};

        $window.resize(function () {
            Athena.resize();
        });
        this.resize();
    },

    preload: function (data) {
        var _data = checkData(data);
        PreloadCtrler.preload(_data);
    },

    pageTo: function (data) {
        this.pageOn(data);
    },

    pageOn: function (data) {
        if (!$stage) throw "athena havn't stage, must be init!!!";

        var _data = checkData(data);

        if (checkLast("on", _data)) return;

        FlowCtrler.pageIn(_data);
    },

    pageOff: function (data) {
        if (!$stage) throw "athena havn't stage, must be init!!!";

        var _data = checkData(data);

        if (checkLast('off', _data)) return;

        FlowCtrler.pageOut(_data);
    },

    calcDepth: function (depth) {
        return checkDepth(depth);
    },

    preloader: function (data) {
        if (data) {
            if (!$stage) throw "athena havn't stage!!!";

            if (preloader) {
                preloader.destroy();
                preloader = null;
            }

            var _data = data.data ? data : {data: data};
            _data.data.depth = checkDepth(Athena.PRELOAD);

            fixloader(_data, wpPreloaderComplete);

            return preloader;
        } else {
            return preloader;
        }
    },

    getPage: function (data) {
        var _pages = [nextPages, curPages];
        for (var i in _pages) {
            for (var j in _pages[i]) {
                if (_pages[i][j].data === data) {
                    return _pages[i][j];
                }
            }
        }
    },

    getPageAt: function (depth) {
        var _depth = depth ? checkDepth(depth) : defaultDepths[2];
        return nextPages[_depth] || curPages[_depth];
    },

    fullScreen: function (bool) {
        if (bool) {
            if (typeof(bool) !== 'boolean') throw "setFullScreen params must be bool!!!";
            isFullScreen = bool;
            this.resize();
        }
        return isFullScreen;
    },

    preloadMustIn: function (bool) {
        if (bool) {
            if (typeof(bool) !== 'boolean') throw "preloadMustIn params must be bool!!!";
            preloadMustIn = bool;
        }
        return preloadMustIn;
    },

    isFlowing: function () {
        return FlowCtrler.isFlowing;
    },

    windowRect: function () {
        return windowRect;
    },

    windowRectMin: function (rect) {
        if (rect) {
            windowRectMin.width = rect.width || windowRectMin.width;
            windowRectMin.height = rect.height || windowRectMin.height;
        }
        return windowRectMin;
    },

    stageRect: function () {
        return stageRect;
    },

    flow: function (str) {
        var _flow = defaultFlow;
        if (str) {
            str = str.toLowerCase();
            switch (str) {
                case Athena.NORMAL :
                case Athena.PRELOAD :
                case Athena.REVERSE :
                case Athena.CROSS :
                    _flow = str;
                    break;
            }
        }
        defaultFlow = _flow;
        return defaultFlow;
    },

    resize: function () {
        windowRect.width = $window.width();
        windowRect.height = $window.height();

        if (isFullScreen) {
            if (windowRect.width < windowRectMin.width) {
                $stage.css("overflow-x", "auto");
            } else {
                $stage.css("overflow-x", "hidden");
            }
            if (windowRect.height < windowRectMin.height) {
                $stage.css("overflow-y", "auto");
            } else {
                $stage.css("overflow-y", "hidden");
            }
            windowRect.width = $window.width();
            windowRect.height = $window.height();
            stageRect.width = Math.max(windowRect.width, windowRectMin.width);
            stageRect.height = Math.max(windowRect.height, windowRectMin.height);
            $stage.width(stageRect.width);
            $stage.height(stageRect.height);
        }else{
            $stage.css("overflow", "auto");
            windowRect.width = $window.width();
            windowRect.height = $window.height();
            stageRect.width = $document.width();
            stageRect.height = $document.height();
        }

        Athena.trigger(Athena.WINDOW_RESIZE);
    }
});


/*
 * Page：所有页面类的基类，需要添加入本框架的页面元素都可以从此类扩展（sitemap中配置的就是网站所有页面）。
 */
Athena.Page = Bone.View.extend({
    _progress: null,
    data: null,
    template: null,
    initialize: function (options) {
        this.data = options.data;

        if (options.template) {
            this.template = options.template;
            this.render();
        }

        this.$el.css({
            "z-index": this.data.depth
        });
    },
    render: function () {
        this.$el.html(this.template);
    },
    init: function () {
        this.listenTo(Athena, Athena.WINDOW_RESIZE, function () {
            this.resize();
        });
    },
    resize: function () {

    },
    destroy: function () {
        this.data = null;
        this.remove();
    },
    transitionIn: function () {
        this.resize();
        this.trigger(Athena.TRANSITION_IN, this.data);
    },
    transitionInComplete: function () {
        this.trigger(Athena.TRANSITION_IN_COMPLETE, this.data);
    },
    transitionOut: function () {
        this.trigger(Athena.TRANSITION_OUT, this.data);
    },
    transitionOutComplete: function () {
        this.trigger(Athena.TRANSITION_OUT_COMPLETE, this.data);
        this.destroy();
    }
});

module.exports = Athena;
