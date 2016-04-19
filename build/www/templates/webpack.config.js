var path = require('path');
var webpack = require('webpack');

var resolveBowerPath = function(componentPath) {
    return path.join(__dirname, '@path@', componentPath);
};

module.exports = {
    entry: "@path@js/main.js",
    output: {
        path: '@path@built',
        publicPath: '@path@built/',
        filename: "[name].js",
        chunkFilename: "[name].js"
    },
    resolve: {
        alias: {
            js: resolveBowerPath('js'),
            images: resolveBowerPath('images'),
            app: resolveBowerPath('js/app'),
            libs: resolveBowerPath('js/libs'),

            map: 'app/base/map.js',
            model: 'app/base/model.js',
            router: 'app/base/router.js',
            fixloader: 'app/base/fixloader.js',

            page: 'app/pages/basePage.js',
            pop: 'app/pops/basePop.js',

            athena: 'libs/athena/athena.js',
            //jquery: 'libs/jquery/jquery-2.1.3.min.js',
            jquery: 'libs/zepto/zepto.min.js',
            bone: 'libs/bone/bone.min.js',
            jstween: 'libs/jstween/jstween.min.js',
            csstween: 'libs/csstween/csstween.min.js',
            css3d: 'libs/css3d/css3d.min.js',
            json: 'libs/json/json2.min.js'
        }
    },
    externals: {
        jquery: '$'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: "jsx-loader?harmony" },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=102400'},
            { test: /\.html$/, loader: 'html-loader'}
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            Bone: 'bone',
            Athena: 'athena',
            JT: 'jstween',
            CT: 'csstween',
            C3D: 'css3d',
            Map: 'map',
            Model: 'model',
            Router: 'router',
            BasePage: 'page',
            BasePop: 'pop',
        })
    ]
};
