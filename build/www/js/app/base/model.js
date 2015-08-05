define(['bone'], function() {
    var model = Bone.extend({}, Bone.Events, {
        url: '',
        shareContent: '',
        shareUrl: '',
        shareImg: '',
        shareVideo: '',

        urlParam: null,

        init : function(){
            this.parseUrl();
        },

        parseUrl : function() {
            this.urlParam = {};
            var _n1 = window.location.href.indexOf("?");
            if (_n1 != -1) {
                var _hash = window.location.href.substr(_n1 + 1);
                var _n2 = _hash.indexOf("#");
                if (_n2 != -1)
                    _hash = _hash.substr(0, _n2);
                var _a = _hash.split("&");
                var _len = _a.length;
                for ( var i = 0; i < _len; i++) {
                    var _a2 = _a[i].split("=");
                    this.urlParam[_a2[0]] = _a2[1];
                }
            }
        }
    });
    return model;
});
