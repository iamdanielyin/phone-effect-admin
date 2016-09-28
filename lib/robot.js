/**
 * app模块
 * Created by yinfxs on 16-9-28.
 */

'use strict';

const sql = require('mssql');

sql.connect('mssql://sa:wosoft!Admin@121.41.46.25/PhoneEffect_Dev').then(function () {
    console.log('数据库连接成功!');
    //1.查询机器人用户
    sql.query`select id,Nickname from WXUsers where Nickname like 'robot-%'`.then(function (wxusers) {
        //2.查询商品信息
        sql.query`select id,Name from Products`.then(function (products) {

            console.log(JSON.stringify(wxusers, null, 2));
            console.log(JSON.stringify(products, null, 2));

        }).catch(function (err) {
            console.error('查询商品信息异常：' + err);
        });
    }).catch(function (err) {
        console.error('查询机器人用户信息异常：' + err);
    });
}).catch(function (err) {
    console.error('数据库连接异常：' + err);
});