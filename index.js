/**
 * 程序入口模块
 * Created by yinfxs on 16-9-25.
 */

'use strict';

const uuid = require('node-uuid');
const path = require('path');
const _ = require('underscore');
const moment = require('moment');
moment.locale('zh-cn');

const ibird = require('ibird');

//导入模块
const business = require('./modules/business');// 导入预置模块

ibird.initialize({
    "name": "手机效应后台管理",
    "public": path.resolve(__dirname, './public'),
    "menu": [

        {
            "code": "user",
            "label": "${menu_user}",
            "icon": "user",
            "uri": "/preset/user"
        },
        {
            "code": "robot",
            "label": "机器人",
            "uri": "/business/robot"
        }
    ],
    "config": {
        "port": 3001,
        "route": "/admin",
        "client": path.resolve(__dirname, 'client/dist/'),
        "ds": "mssql",
        "mssql": {
            user: 'sa',
            password: 'wosoft!Admin',
            server: '121.41.46.25',
            // database: 'ibird',
            database: 'PhoneEffect',
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        },
        "redis": "",
        "logpath": path.resolve(__dirname, "logs"),
        "ruprefix": '/api',
        "auth": {
            "expires_in": {
                "access_token": 7 * 24 * 60 * 60,//access_token过期时间，单位秒，0表示永久不过起
                "refresh_token": 0//refresh_token过期时间，单位秒，0表示永久不过起
            }
        },
        "cross-domain": false
    },
    "admins": [
        "admin"
    ],
    "modules": [
        business(ibird),
    ],

    "hooks": {
        "pre-start": function (app, configs, data) {
            //重置所有机器人状态
            ibird.mssql.query(`UPDATE [business_robot] SET [status]='0'`, () => console.log('操作日志：重置所有机器人状态成功！'), err => console.error('操作日志：重置所有机器人状态异常：' + err));
        }
    }
}).start();