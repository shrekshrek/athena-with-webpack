define(['map', 'bone'], function(SiteMap) {
    var router = Bone.Router.extend({
        routes : {
            '*actions' : 'defaultRoute'
        },
        defaultRoute: function(actions) {
            switch (actions) {
            case null:
                if (Athena.getPage(SiteMap.header)) {
                    Athena.pageTo(SiteMap.home);
                } else {
                    Athena.pageTo([SiteMap.header, SiteMap.footer, SiteMap.home]);
                }
                break;
            default:
                var _action = actions.split('?')[0];
                $.each(SiteMap, function(index, obj) {
                    if (_action == obj.id) {
                        if (Athena.getPage(SiteMap.header)) {
                            Athena.pageTo(obj);
                        } else {
                            Athena.pageTo([SiteMap.header, SiteMap.footer, obj]);
                        }
                    }
                });
                break;
            }
        }
    });
    return new router;
});
