module.exports = {
    PAGE: "page",
    EVENT: "event",

    all: function (type, s1, s2) {
        this.ga(type, s1, s2);
        this.gs(type, s1, s2);
    },

    //google
    ga: function (type, s1, s2) {
        switch (type) {
            case this.PAGE :
                ga('send', 'pageview', s1);
                break;
            case this.EVENT :
                ga('send', 'event', s1, s2);
                break;
        }
    }

};
