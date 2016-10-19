/**
 * webpack开发配置文件
 */

'use strict';

const path = require('path');
const fs = require('fs');
const fsx = require('fs-extra');
const uuid = require('node-uuid');
const babel = require('babel-core');
const _ = require('underscore');
const webpack = require('webpack');
const isProduction = (process.env['NODE_ENV'] == 'production') ? true : false;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const source_dir = path.resolve(__dirname, 'src');
const dist_dir = path.resolve(__dirname, '../',(isProduction ? 'dist' : 'build'));

const tmpPath = path.resolve(__dirname, uuid.v1() + '.js');
fsx.outputFileSync(tmpPath, babel.transformFileSync(path.resolve(__dirname, 'ibird.config.js'), {
    presets: ["react"]
}).code);
const config = require(tmpPath);
fsx.removeSync(tmpPath);//删除临时文件

const plugins = [
    new HtmlWebpackPlugin({
        title: 'ibird-client | ibird',
        template: path.resolve(__dirname, 'src/templates/index.ejs')
    }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        toastr: "toastr",
        "slimscroll": "jquery-slimscroll"
    }),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors' + (isProduction ? '.min.' : '.') + 'js'),
    new ExtractTextPlugin('style.css', {
        allChunks: true
    })
];

if (isProduction) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.DedupePlugin()
    );
}
const alias = {
    'bootstrap': path.resolve(__dirname, 'src/public/lib/bootstrap/js/bootstrap' + (isProduction ? '.min.' : '.') + 'js'),
    'adminlte': path.resolve(__dirname, 'src/public/lib/adminlte/js/AdminLTE' + (isProduction ? '.min.' : '.') + 'js'),
    'toastr': path.resolve(__dirname, 'src/public/plugins/toastr/toastr.min.js'),
    'icheck': path.resolve(__dirname, 'src/public/plugins/iCheck/icheck.js'),
    'datetimepicker': path.resolve(__dirname, 'src/public/plugins/datetimepicker/js/bootstrap-datetimepicker.min.js'),
    'select2': path.resolve(__dirname, 'src/public/plugins/select2/select2.full.js'),
    'jquery.fileupload': path.resolve(__dirname, 'src/public/plugins/jqueryFileUpload/jquery.fileupload.js'),
    'jquery.iframe-transport': path.resolve(__dirname, 'src/public/plugins/jqueryFileUpload/jquery.iframe-transport.js'),
    'jquery.ui.widget': path.resolve(__dirname, 'src/public/plugins/jqueryFileUpload/jquery.ui.widget.js'),
    'ibird.config': path.resolve(__dirname, 'ibird.config.js')
};
//设置自定义组件别名
if (config && config.components) {
    const components = config.components;
    const requires = [];
    const cases = [];
    components.forEach(function (item) {
        if (!item || !item.code || !item.name || !item.path) return;
        alias[item.code] = item.path;
        requires.push(`const ${item.name} = require('${item.code}');\n`);
        cases.push(`case '${item.code}':content=<${item.name} module={module} path={path} model={path} schema={schema} item={item} i={i}/>;break;`);
    });
    //修改RouteCatcher.react.jsx文件
    const src = path.resolve(__dirname, 'src/components/RouteCatcher.react.jsx.template');
    const dest = path.resolve(__dirname, 'src/components/RouteCatcher.react.jsx');
    fileTemplateReplace(src, dest, {
        requires: requires.join(''),
        cases: cases.join('')
    });


}

/**
 * 文件模板替换
 * @param tplpath 模板文件地址
 * @param destpath 模板文件地址
 * @param vars 变量内容对象
 */
function fileTemplateReplace(tplpath, destpath, vars) {
    let data;
    try {
        data = fs.readFileSync(tplpath);
    } catch (e) {
        return console.log(i18n.value('doc_template_error', [e.message]));
    }
    if (!data) return console.log(i18n.value('doc_template_error', [tplpath]));
    let content = data.toString();
    _.keys(vars).map(function (key) {
        if (!key) return;
        content = content.replace(new RegExp('\\${\\s*' + key + '\\s*}', 'g'), vars[key]);
    });
    fs.writeFileSync(destpath, content);
}

module.exports = {
    entry: {
        polyfill: ['babel-polyfill'],
        app: ['whatwg-fetch', path.resolve(__dirname, 'src/index.jsx')],
        vendors: ['react', 'react-router', 'flux', 'react-dom', 'jquery', 'node-uuid', 'object-assign', 'qs', 'underscore', 'moment']
    },
    output: {
        path: dist_dir,
        filename: '[name]' + (isProduction ? '.min.' : '.') + 'js'
    },
    module: {
        loaders: [
            {
                test: /\.(jsx|js)?$/,
                loader: 'babel',
                // include: source_dir,
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-3'],
                    compact: false
                }
            },
            {test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader')},
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!less-loader!postcss-loader')
            },
            {test: /\.json$/, include: source_dir, exclude: /node_modules/, loader: 'json'},
            {test: /\.png$/, loader: 'url?limit=8192&mimetype=image/png'},
            {test: /\.jpe?g$/, loader: 'url?limit=8192&mimetype=image/jpg'},
            {test: /\.gif$/, loader: 'url?limit=8192&mimetype=image/gif'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=image/svg+xml'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff2'},
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'}
        ]
    },
    plugins: plugins,
    resolve: {
        root: path.resolve('src'),
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx'],
        alias: alias
    },
    externals: {}
};
