/**
 * gulp文件
 * Created by yinfxs on 16-9-3.
 */

const gulp = require('gulp');
const gutil = require('gulp-util');
const assign = require('object-assign');
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require("webpack-dev-server");
const config = require('./webpack.config');
const port = 1220, serverPort = 3001;

// webpack
gulp.task('webpack', function (callback) {
    assign(config, {devtool: 'sourcemap', debug: true});
    webpack(config, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            color: true
        }));
        callback();
    });
});

// webpack-dev-server
gulp.task('webpack-dev-server', function (callback) {
    assign(config, {devtool: 'eval', debug: true});
    config.entry.app.unshift("webpack-dev-server/client?http://localhost:" + port, "webpack/hot/dev-server");
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    const compiler = webpack(config);
    new WebpackDevServer(compiler, {
        contentBase: config.output.path,
        hot: true,
        inline: true,
        stats: {
            color: true
        },
        proxy: {
            '/api/**/*': {
                target: 'http://127.0.0.1:' + serverPort,
                secure: false
            },
            '/public/**/*': {
                target: 'http://127.0.0.1:' + serverPort,
                secure: false
            }
        }
    }).listen(port, function (err) {
        if (err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]");
        callback();
    });
});


// 生产环境构建任务
gulp.task('webpack-deploy', function (callback) {
    fs.ensureDirSync('dist');
    fs.emptyDirSync('dist');
    webpack(config, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            color: true
        }));
        callback();
    });
});

gulp.task("build", ['webpack']);
gulp.task("hot", ['webpack', 'webpack-dev-server']);
gulp.task("deploy", ['webpack-deploy']);


// 注册默认任务
gulp.task('default', ['build']);