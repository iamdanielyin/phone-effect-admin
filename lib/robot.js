/**
 * app模块
 * Created by yinfxs on 16-9-28.
 */

'use strict';

const sql = require('mssql');
const fetch = require('node-fetch');
const _ = require('lodash');
const schedule = require('node-schedule');

const utils = require('./utils');
const pkgjson = require('../package.json');
const app = {};

module.exports = app;

/*
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */
const rule = pkgjson.config.robot.rule, url = pkgjson.config.robot.url;

app.pre = function (data, callback) {
    sql.connect(pkgjson.config.db).then(function () {
        console.log('操作日志：数据库连接成功!');
        //1.查询机器人用户
        sql.query`select id,Openid,Nickname from WXUsers where Openid like 'robot-%'`.then(function (wxusers) {
            //2.查询商品信息
            sql.query`select id,Name from Products`.then(function (products) {
                if (!wxusers || wxusers.length == 0) return;
                if (!products || products.length == 0) return;
                data = {wxusers: wxusers, products: products};
                callback(data);
            }).catch(function (err) {
                console.error('操作日志：查询商品信息异常，' + err);
            });
        }).catch(function (err) {
            console.error('操作日志：查询机器人用户信息异常，' + err);
        });
    }).catch(function (err) {
        console.error('操作日志：数据库连接异常，' + err);
    });
};
