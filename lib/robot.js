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

sql.connect(pkgjson.config.db).then(function () {
    console.log('操作日志：数据库连接成功!');
    //1.查询机器人用户
    sql.query`select id,Openid,Nickname from WXUsers where Openid like 'robot-%'`.then(function (wxusers) {
        //2.查询商品信息
        sql.query`select id,Name from Products`.then(function (products) {
            if (!wxusers || wxusers.length == 0) return;
            if (!products || products.length == 0) return;

            // console.log(JSON.stringify(wxusers, null, 2));
            // console.log(JSON.stringify(products, null, 2));
            console.log('--------------------------');
            const task = schedule.scheduleJob(rule, function () {
                //构建请求对象
                const user = wxusers[_.random(0, wxusers.length - 1)];
                const product = products[_.random(0, products.length - 1)];
                const req = {
                    PID: product.id,
                    OpenId: user.Openid,
                    Count: _.random(1, 5),
                    IP: utils.ip()
                };
                //调用服务接口
                console.log('操作日志：请求对象为' + JSON.stringify(req));
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(req)
                }).then(function (res) {
                    return res.json();
                }).then(function (json) {
                    console.log('操作日志：调用接口返回JSON为' + JSON.stringify(json));
                    if (!json || !json.Code || json.Code != 1) {
                        console.error('操作日志：接口异常，' + json.Msg);
                        return task.cancel();
                    }
                    console.log(`操作日志：刷单成功，用户${user.Nickname}购买了${product.Name + req.Count}人次`);
                    console.log('--------------------------');
                });
            });
        }).catch(function (err) {
            console.error('操作日志：查询商品信息异常，' + err);
        });
    }).catch(function (err) {
        console.error('操作日志：查询机器人用户信息异常，' + err);
    });
}).catch(function (err) {
    console.error('操作日志：数据库连接异常，' + err);
});