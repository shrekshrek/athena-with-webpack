define({
    PAGE : "page",
    EVENT : "event",
    all : function(type, s1, s2) {
        this.ga(type, s1, s2);
        this.gs(type, s1, s2);
    },

    //google
    ga : function(type, s1, s2) {
        switch (type) {
            case this.PAGE :
                ga('send', 'pageview', s1);
                break;
            case this.EVENT :
                ga('send', 'event', s1, s2);
                break;
        }
    },

    //国双
    gs : function(type, s1, s2) {
        window._CiQ46109 = window._CiQ46109 || [];
        switch (type) {
            case this.PAGE :
                window._CiQ46109.push(['_trackPageView', {
                    'urlPath' : s1,
                    'pageTitle' : s2
                }]);
                break;
            case this.EVENT :
                window._CiQ46109.push(['_trackEvent', {
                    type : 1,
                    labels : [{
                        '注册' : s1
                    }],
                    values : [{
                        '数量' : 1
                    }]
                }]);
                break;
        }
    }

});