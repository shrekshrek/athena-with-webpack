var router = Bone.Router.extend({
    routes: {
        '*actions': 'defaultRoute'
    },

    defaultRoute: function (actions) {
        switch (actions) {
            case null:
                if (Athena.getPage(Map.header)) {
                    Athena.pageTo(Map.home);
                } else {
                    Athena.pageTo([Map.header, Map.footer, Map.home]);
                }
                break;
            default:
                var _action = actions.split('?')[0];
                $.each(Map, function (index, obj) {
                    if (_action == obj.id) {
                        if (Athena.getPage(Map.header)) {
                            Athena.pageTo(obj);
                        } else {
                            Athena.pageTo([Map.header, Map.footer, obj]);
                        }
                    }
                });
                break;
        }
    }
});

module.exports = new router;
