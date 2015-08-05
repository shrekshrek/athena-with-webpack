/*!
 * VERSION: 1.2.0
 * DATE: 2015-05-29
 * GIT:https://github.com/shrekshrek/athena-for-mobile
 *
 * @author: Shrek.wang, shrekshrek@gmail.com
 **/

(function(factory) {

    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global);

    define(['bone', 'jquery', 'exports'], function(Bone, $, exports) {
        root.Athena = factory(root, exports, Bone, $);
    });

}(function(root, Athena, Bone, $) {

    fixloader = require('fixloader');

    var previousAthena = root.Athena;

    Athena.VERSION = '1.2.0';

    Athena.noConflict = function() {
        root.Athena = previousAthena;
        return this;
    };


    // -------------------------------------------------------------------- 辅助方法
    function each(data, callback) {
        if(data.length === undefined){
            callback.call(data, 0, data);
        }else{
            for (var i = 0; i < data.length; i++){
                callback.call(data[i], i, data[i]);
            }
        }
    }


    // -------------------------------------------------------------------- 框架事件名，事件功能
    Bone.extend(Athena, Bone.Events, {
        PRELOAD_START : "preloadStart",
        PRELOAD_PROGRESS : "preloadProgress",
        PRELOAD_COMPLETE : "preloadComplete",
        TRANSITION_IN : "transitionIn",
        TRANSITION_IN_COMPLETE : "transitionInComplete",
        TRANSITION_OUT : "transitionOut",
        TRANSITION_OUT_COMPLETE : "transitionOutComplete",
        /*
         * 页面深度常量
         * preload 相当于 z-index = 1500
         * top 相当于 z-index = 1000
         * middle 相当于z-index = 500
         * bottom 相当于 z-index = 0
         */
        PRELOAD : "preload",
        TOP : "top",
        MIDDLE : "middle",
        BOTTOM : "bottom",
        /*
         * 页面切换方式常量 normal 为普通切换方式，1。当前页面退场。2。加载新页面。3。新页面进场。 preload
         * 为普通切换方式，1。加载新页面。2。当前页面退场。3。新页面进场。 reverse
         * 为普通切换方式，1。加载新页面。2。新页面进场。3。当前页面退场。 cross
         * 为普通切换方式，1。加载新页面。2。新页面进场。当前页面退场。同时进行。
         */
        NORMAL : "normal",
        // PRELOAD:"preload",
        REVERSE : "reverse",
        CROSS : "cross",
        /*
         * 页面间切换状态常量
         */
        FLOW_START : "flowStart",
        FLOW_COMPLETE : "flowComplete",
        WINDOW_RESIZE : "windowResize",
        PRELOAD_PREPARE : "preloadPrepare"
    });


    // -------------------------------------------------------------------- 框架主控制器逻辑
    var $body = null;
    var $stage = null;
    var $window = null;
    var $document = null;
    var _preloadFast = false;
    var _defaultFlow = null;
    var _isFlowing = false;
    var _isFullScreen = false;
    var _stageRect = {
        width : 0,
        height : 0
    };
    var _windowRect = {
        width : 0,
        height : 0
    };
    var _windowRectMin = {
        width : 1,
        height : 1
    };
    var _defaultDepths =[1500,1000,500,0];
    var _curPages = {};
    var _nextPages = {};
    var _actionQueue = [];
    var _preloader = null;
    var _nextData = null;
    var _nextFlowIndex = null;
    var _nextPreloadIndex = null;
    var _nextLoadedProgress = null;

    function init(stage) {
        $stage = stage || $("body");
        $body = $("body");
        $window = $(window);
        $document = $(document);

        _preloadFast = false;
        _defaultFlow = Athena.NORMAL;
        _curPages = {};
        _nextPages = {};
        _actionQueue = [];

        $window.resize(function() {
            resize();
        });
        resize();
    }

    function pageOn(data) {
        if (!$stage) throw "athena havn't stage, must be init!!!";

        var _data = _checkData(data);

        if(_checkLast('on', _data)) return;

        _actionQueue.push({action:"on", data:_data});

        if (_isFlowing) return;

        _playQueue();
    }

    function pageTo(data) {
        pageOn(data);
    }

    function pageOff(data) {
        if (!$stage) throw "athena havn't stage, must be init!!!";

        var _data = _checkData(data);

        if(_checkLast('off', _data)) return;

        _actionQueue.push({action:"off", data:_data});

        if (_isFlowing) return;

        _playQueue();
    }

    function _playQueue() {
        if (_actionQueue.length) {
            var _data = _actionQueue.shift();
            _nextData = _data.data;
            _isFlowing = true;
            switch(_data.action){
                case "on":
                    _nextFlowIndex = 0;
                    _nextPreloadIndex = 0;
                    _nextLoadedProgress = {};
                    each(_nextData, function(index, obj) {
                        _flowIn(obj);
                    });
                    Athena.trigger(Athena.FLOW_START, {
                        data : _nextData
                    });
                    break;
                case "off":
                    each(_nextData, function(index, obj) {
                        var _page = _curPages[obj.depth];
                        Athena.listenToOnce(_page, Athena.TRANSITION_OUT_COMPLETE, function() {
                            _flowOutComplete(obj);
                        });
                        _page.transitionOut();
                    });
                    break;
            }
        } else {
            _nextData = null;
            _isFlowing = false;
        }
    }

    function _checkLast(action, data){
        var _isSame = false;
        if(_actionQueue.length){
            var _last = _actionQueue[_actionQueue.length - 1];
            each(data, function(index, obj) {
                if(_last.action == action && _last.data == obj){
                    _isSame = true;
                }
            });
        }
        return _isSame;
    }

    function _checkData(data) {
        if (!data) throw "page data is undefined!";

        var _datas = [];
        each(data, function(index, obj) {
            if (typeof(obj) === 'number') {
                obj = _curPages[obj];
            } else if (typeof(obj) === 'string') {
                obj = _curPages[_checkDepth(obj)];
            }

            var _data = obj.data || obj;

            if (!_data.depth) throw "page data has wrong!!! must has 'data.depth'";

            _data.depth = _checkDepth(_data.depth);

            _datas.push(_data);
        });
        return _datas;
    }

    function calcDepth(depth) {
        return _checkDepth(depth);
    }

    function _checkDepth(depth) {
        var _depth = _defaultDepths[2];

        switch(typeof(depth)){
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
                        _depth = _defaultDepths[0];
                        break;
                    case Athena.TOP :
                        _depth = _defaultDepths[1];
                        break;
                    case Athena.MIDDLE :
                        _depth = _defaultDepths[2];
                        break;
                    case Athena.BOTTOM :
                        _depth = _defaultDepths[3];
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

    function _toLoadNext(data){
        _preloaderOn();

        fixloader({}, data, wpPageComplete);
    }

    function wpPageComplete(view, data, _data){
        var _nextPage = new view(data.data ? data : {data:_data});
        _nextPages[_data.depth] = _nextPage;
        $stage.append(_nextPage.el);
        _nextPage.init();
        _initPreloader(_data);
        Athena.listenToOnce(_nextPage, Athena.PRELOAD_COMPLETE, function() {
            _pageLoadComplete(_data);
        });
        _nextPage.preload(_preloadFast || _data.fast === "true");
    }

    function _flowIn(data) {
        var _data = data;
        var _curPage = _curPages[_data.depth];
        var _flow = _data.flow || _defaultFlow;
        switch (_flow) {
            case Athena.NORMAL :
                if (_curPage) {
                    Athena.listenToOnce(_curPage, Athena.TRANSITION_OUT_COMPLETE, function() {
                        _flowInComplete(_data);
                    });
                    _curPage.transitionOut();
                } else {
                    _flowInComplete(_data);
                }
                break;
            case Athena.PRELOAD :
            case Athena.REVERSE :
            case Athena.CROSS :
                _toLoadNext(_data);
                break;
        }
    }

    function _flowInComplete(data) {
        var _data = data;
        var _curPage = _curPages[_data.depth];
        var _nextPage = _nextPages[_data.depth];
        var _flow = _data.flow || _defaultFlow;
        switch (_flow) {
            case Athena.NORMAL :
                _toLoadNext(_data);
                break;
            case Athena.PRELOAD :
                if (_curPage) {
                    Athena.listenToOnce(_curPage, Athena.TRANSITION_OUT_COMPLETE, function() {
                        _flowOut(_data);
                    });
                    _curPage.transitionOut();
                } else {
                    _flowOut(_data);
                }
                break;
            case Athena.REVERSE :
                Athena.listenToOnce(_nextPage, Athena.TRANSITION_IN_COMPLETE, function() {
                    _flowOut(_data);
                });
                _nextPage.transitionIn();
                break;
            case Athena.CROSS :
                if (_curPage) {
                    _curPage.transitionOut();
                }
                _flowOut(_data);
                break;
        }
    }

    function _flowOut(data) {
        var _data = data;
        var _curPage = _curPages[_data.depth];
        var _nextPage = _nextPages[_data.depth];
        var _flow = _data.flow || _defaultFlow;
        switch (_flow) {
            case Athena.NORMAL :
            case Athena.PRELOAD :
            case Athena.CROSS :
                Athena.listenToOnce(_nextPage, Athena.TRANSITION_IN_COMPLETE, function() {
                    _flowOutComplete(_data);
                });
                _nextPage.transitionIn();
                break;
            case Athena.REVERSE :
                if (_curPage) {
                    Athena.listenToOnce(_curPage, Athena.TRANSITION_OUT_COMPLETE, function() {
                        _flowOutComplete(_data);
                    });
                    _curPage.transitionOut();
                } else {
                    _flowOutComplete(_data);
                }
                break;
        }
    }

    function _flowOutComplete(data) {
        var _data = data;
        var _curPage = _curPages[_data.depth];
        var _nextPage = _nextPages[_data.depth];

        if (_curPage)
            delete _curPages[_data.depth];

        if (_nextPage) {
            _curPages[_data.depth] = _nextPage;
            delete _nextPages[_data.depth];
        }

        if (_data.routing) document.title = _data.routing;

        _nextFlowIndex++;
        if (_nextFlowIndex >= _nextData.length) {
            Athena.trigger(Athena.FLOW_COMPLETE, {
                data : _nextData
            });
            _playQueue();
        }
    }

    function _pageLoadComplete(data) {
        var _data = data;
        var _flow = _data.flow || _defaultFlow;
        _nextFlowIndex++;
        if (_nextFlowIndex >= _nextData.length) {
            _nextFlowIndex = 0;
            each(_nextData, function(index, obj) {
                switch (_flow) {
                    case Athena.NORMAL :
                        _flowOut(obj);
                        break;
                    case Athena.PRELOAD :
                    case Athena.REVERSE :
                    case Athena.CROSS :
                        _flowInComplete(obj);
                        break;
                }
            });
        }
    }

    function preloader(data) {
        if (data) {
            if (!$stage) throw "athena havn't stage!!!";

            if (_preloader) {
                _preloader.destroy();
                _preloader = null;
            }

            var _data = data.data || data;
            _data.depth = _checkDepth(Athena.PRELOAD);

            fixloader(data, _data, wpPreloaderComplete);

            return _preloader;
        } else {
            return _preloader;
        }
    }

    function wpPreloaderComplete(view, data, _data){
        _preloader = new view(data.data ? data : {data:_data});
        $stage.append(_preloader.el);
        _preloader.init();
        Athena.trigger(Athena.PRELOAD_PREPARE);
    }

    function _initPreloader(data) {
        if (!_preloader) return;

        var _data = data;
        var _nextPage = _nextPages[_data.depth];
        Athena.listenTo(_nextPage, Athena.PRELOAD_PROGRESS, _preloaderProgress);
        Athena.listenTo(_nextPage, Athena.PRELOAD_COMPLETE, _preloaderOff);
    }

    function _clearPreloader(data) {
        if (!_preloader) return;

        var _data = data;
        var _nextPage = _nextPages[_data.depth];
        Athena.stopListening(_nextPage, Athena.PRELOAD_PROGRESS, _preloaderProgress);
        Athena.stopListening(_nextPage, Athena.PRELOAD_COMPLETE, _preloaderOff);
    }

    function _preloaderOn() {
        if (!_preloader) return;

        _nextPreloadIndex++;
        if (_nextPreloadIndex >= _nextData.length) {
            _nextPreloadIndex = 0;
            _preloader.transitionIn();
        }
    }

    function _preloaderProgress(data) {
        if (!_preloader) return;

        _nextLoadedProgress[data.data.depth] = data.progress;

        var _n = 0;
        for(var i in _nextLoadedProgress){
            _n += _nextLoadedProgress[i] / _nextData.length;
        }

        _preloader.progress({
            progress : _n
        });
    }

    function _preloaderOff(data) {
        if (!_preloader) return;

        _clearPreloader(data.data);

        _nextPreloadIndex++;
        if (_nextPreloadIndex >= _nextData.length) {
            _nextPreloadIndex = 0;
            _preloader.transitionOut();
        }
    }

    function getPage(data) {
        var _page = null;

        for(var i in _nextPages){
            if (_nextPages[i].data === data) {
                _page = _nextPages[i];
            }
        }

        if (!_page){
            for(var i in _curPages){
                if (_curPages[i].data === data) {
                    _page = _curPages[i];
                }
            }
        }

        return _page;
    }

    function getPageAt(depth) {
        var _depth = depth ? _checkDepth(depth) : _defaultDepths[2];

        var _page = _nextPages[_depth] || _curPages[_depth];

        return _page;
    }

    function fullScreen(bool) {
        if (bool) {
            if (typeof(bool) !== 'boolean') throw "setFullScreen params must be bool!!!";
            _isFullScreen = bool;
            resize();
        }
        return _isFullScreen;
    }

    function preloadFast(bool) {
        if (bool) {
            if (typeof(bool) !== 'boolean') throw "preloadFast params must be bool!!!";
            _preloadFast = bool;
        }
        return _preloadFast;
    }

    function isFlowing() {
        return _isFlowing;
    }

    function windowRect() {
        return _windowRect;
    }

    function windowRectMin(rect) {
        if (rect) {
            _windowRectMin.width = rect.width || _windowRectMin.width;
            _windowRectMin.height = rect.height || _windowRectMin.height;
            $stage.css({'min-width':_windowRectMin.width, 'min-height':_windowRectMin.height});
        }
        return _windowRectMin;
    }

    function stageRect() {
        return _stageRect;
    }

    function flow(str) {
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
        return _flow;
    }

    function resize() {
        _windowRect.width = $window.width();
        _windowRect.height = $window.height();

        if (_isFullScreen) {
            $stage.css({width:_windowRect.width, height:_windowRect.height});
        }

        _stageRect.width = $stage.width();
        _stageRect.height = $stage.height();

        Athena.trigger(Athena.WINDOW_RESIZE);
    }




    // -------------------------------------------------------------------- 将Athena的所有方法归纳到 Athena下
    Bone.extend(Athena, {
        init: init,
        pageTo: pageTo,
        pageOn: pageOn,
        pageOff: pageOff,
        calcDepth: calcDepth,
        preloader: preloader,
        getPage: getPage,
        getPageAt: getPageAt,
        fullScreen: fullScreen,
        preloadFast: preloadFast,
        isFlowing: isFlowing,
        windowRect: windowRect,
        windowRectMin: windowRectMin,
        stageRect: stageRect,
        flow: flow,
        resize: resize
    });


    /*
     * Athena.view下为本框架所有基本view类，包括View,Page。
     * View：所有视图类的基类，需要添加入本框架的视图元素都可以从此类扩展。
     * Page：所有页面类的基类，需要添加入本框架的页面元素都可以从此类扩展（sitemap中配置的就是网站所有页面）。
     */
    Athena.View = Bone.View.extend({
        template : null,
        parent : null,
        children : null,
        args : null,
        _isInited : null,
        events : {},
        initialize : function(args) {
            this.children = [];
            if (!args)
                return;
            this.args = args;
            if (args.template) {
                this.template = args.template;
                this.render();
            }
        },
        init : function(args) {
            if (this._isInited)
                return;
            this._isInited = true;
        },
        destroy : function() {
            this.parent = null;
            each(this.children, function(index, obj) {
                obj.destroy();
            });
            this.children = null;
            this.remove();
        },
        render : function() {
            if (this.template)
                this.$el.html(this.template);
        },
        resize : function() {

        },
        addChild : function(view, $dom) {
            each(this.children, function(index, obj) {
                if (obj === view)
                    return;
            });
            view.parent = this;
            this.children.push(view);
            if ($dom) {
                $dom.append(view.el);
                view.init();
            }
        },
        removeChild : function(view) {
            each(this.children, function(index, obj) {
                if (obj === view) {
                    this.children.splice(index, 1);
                    view.destroy();
                    return;
                }
            });
        }
    });

    Athena.Page = Athena.View.extend({
        _loadMax : null,
        _loaded : null,
        data : null,
        initialize : function(args) {
            Athena.Page.__super__.initialize.apply(this, [args]);
            this.data = args.data;
            this.$el.css({
                "z-index" : this.data.depth
            });

            var _assets = [];
            var _imgs = this.data.assets && this.data.assets.length !== undefined ? this.data.assets : [];
            each(_imgs, function(index, obj) {
                _assets.push($(new Image()).attr({
                    src : obj
                })[0].src);
            });
            this.data.assets = _assets;
        },
        init : function(args) {
            Athena.Page.__super__.init.apply(this, [args]);

            this.listenTo(Athena, Athena.WINDOW_RESIZE, function() {
                this.resize();
            });
        },
        destroy : function() {
            Athena.Page.__super__.destroy.apply(this);
        },
        preload : function(skip) {
            this.trigger(Athena.PRELOAD_START, {
                data : this.data
            });

            if (skip) {
                this.completeHandle();
                return;
            }

            var _self = this;

            var _imgs0 = this.$el.find("img");
            var _imgs = this.data.assets || [];
            for(var i = _imgs0.length-1; i>=0; i--){
                if(_imgs0[i].src && _imgs0[i].src !== '') _imgs.push(_imgs0[i].src);
            }
            this._loadMax = _imgs.length;
            this._loaded = 0;
            if (this._loadMax === 0) {
                this.progressHandle(1);
                this.completeHandle();
            } else {
                each(_imgs, function(index, url) {
                    $(new Image()).load(function() {
                        _self._assetLoadComplete();
                    }).error(function() {
                        _self._assetLoadComplete();
                    }).attr("src", url);
                });
            }
        },
        _assetLoadComplete : function() {
            this._loaded++;
            this.progressHandle(this._loaded / this._loadMax);
            if (this._loaded >= this._loadMax) {
                this.completeHandle();
            }
        },
        progressHandle : function(obj) {
            this.trigger(Athena.PRELOAD_PROGRESS, {
                data : this.data,
                progress : obj
            });
        },
        completeHandle : function() {
            this.trigger(Athena.PRELOAD_COMPLETE, {
                data : this.data
            });
        },
        transitionIn : function() {
            this.resize();
            this.trigger(Athena.TRANSITION_IN, {
                data : this.data
            });
        },
        transitionInComplete : function() {
            this.trigger(Athena.TRANSITION_IN_COMPLETE, {
                data : this.data
            });
        },
        transitionOut : function() {
            this.trigger(Athena.TRANSITION_OUT, {
                data : this.data
            });
        },
        transitionOutComplete : function() {
            this.destroy();
            this.trigger(Athena.TRANSITION_OUT_COMPLETE, {
                data : this.data
            });
        }
    });

    return Athena;
}));
