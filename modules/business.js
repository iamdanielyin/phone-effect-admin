/**
 * 业务模块
 * Created by yinfxs on 16-8-6.
 */
const uuid = require('node-uuid');
const _ = require('underscore');
const fetch = require('node-fetch');
const sql = require('mssql');
const robot = require('../lib/robot');
const utils = require('../lib/utils');
const moment = require('moment');
moment.locale('zh-cn');

const pkgjson = require('../package.json');
const url = pkgjson.config.robot.url;

/**
 * 过滤未选中的商品
 * @param data
 * @param selected
 * @returns {Array}
 */
function filterProducts(data, selected) {
    const result = [];
    selected = selected.split(',');
    if (!_.isArray(data) || selected.length == 0) return result;
    data.forEach(item => {
        if (selected.indexOf(item['id'] + '') == -1)  return;
        result.push(item);
    });
    return result;
}

module.exports = function (ibird) {
    return {
        "label": "业务模块",
        "code": "business",
        "schemas": [
            {
                "code": "products",
                "label": "商品",
                "create": false,
                "table": "Products",
                "fields": {
                    ID: {
                        type: String,
                        required: false,
                        mssql: {
                            type: sql.Int,
                            column: 'ID',
                            options: {nullable: false, primary: true}
                        }
                    },
                    Name: {
                        type: String,
                        label: "商品名称",
                        required: true,
                        mssql: {
                            type: sql.NVarChar(2048),
                            column: 'Name',
                            options: {nullable: true}
                        }
                    },
                    Price: {
                        type: Number,
                        label: "商品图片",
                        required: true,
                        mssql: {
                            type: sql.Decimal(18, 2),
                            column: 'Price',
                            options: {nullable: false}
                        }
                    }
                }
            },
            {
                "code": "robot",
                "label": "机器人",
                "fields": {
                    name: {
                        type: String,
                        label: "任务名称",
                        required: true
                    },
                    frequency: {
                        type: Number,
                        ctrltype: 'number',
                        label: "任务频率",
                        required: true
                    },
                    start: {
                        type: String,
                        label: "开始时间",
                        ctrltype: 'time',
                        format: 'hh:ii'
                    },
                    end: {
                        type: String,
                        label: "结束时间",
                        ctrltype: 'time',
                        format: 'hh:ii'
                    },
                    status: {
                        type: String,
                        label: "启动状态",
                        ctrltype: 'boolean-radios',
                        items: {
                            '0': '停止', '1': '运行中'
                        },
                        default: '0'
                    },
                    goods: {
                        type: [String],
                        label: "刷单商品",
                        ctrltype: 'boolean-checkbox',
                        display: {
                            table: false
                        },
                        ajax: {
                            ref: 'business-products',
                            url: '',
                            value: 'ID',
                            display: 'Name',
                            flag: 1//0分页，1全部
                        }
                    }
                }
            }
        ],
        "routes": {
            "/robot/start/:id": function (req, res) {
                const id = req.params.id;
                let task = ibird.tasks.get(id);
                if (task) return res.end();
                //查询对象信息
                ibird.mssql.query(`SELECT * FROM [business_robot] where [_id] = '${id}'`, function (robotData) {
                    if (robotData.length == 0) return res.json({error: '机器人不存在'});
                    robotData = robotData[0];
                    //构建任务对象
                    const start = robotData.start.split(':');
                    const end = robotData.end.split(':');
                    const spec = `*/${robotData.frequency} ${(start[1] == end[1]) ? start[1] : (start[1] + '-' + end[1])} ${(start[0] == end[0]) ? start[0] : (start[0] + '-' + end[0])} * * *`;
                    const item = {
                        name: id,
                        pre: robot.pre,
                        method: function (data) {
                            const wxusers = data.wxusers;
                            const products = filterProducts(data.products, robotData.goods);
                            console.log('--------------------------');
                            //构建请求对象
                            const user = wxusers[_.random(0, wxusers.length - 1)];
                            const product = products[_.random(0, products.length - 1)];
                            const reqObject = {
                                PID: product.id,
                                OpenId: user.Openid,
                                Count: _.random(1, 5),
                                IP: utils.ip()
                            };
                            //调用服务接口
                            console.log('操作日志：请求对象为' + JSON.stringify(reqObject));
                            fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(reqObject)
                            }).then(function (res) {
                                if(res.status == '500'){
                                    console.error('操作日志：接口异常，' + res.statusText);
                                }
                                return res.json();
                            }).then(function (json) {
                                console.log('操作日志：调用接口返回JSON为' + JSON.stringify(json));
                                if (!json || !json.Code || json.Code != 1) {
                                    console.error('操作日志：接口异常，' + json.Msg);
                                    return task.cancel();
                                }
                                console.log(`操作日志：刷单成功，用户${user.Nickname}购买了${product.Name + req.Count}人次`);
                                console.log('--------------------------');
                            }).catch(function (err) {
                                console.error('操作日志：接口异常，' + err);
                            });
                        },
                        spec: spec
                    };
                    //设置任务
                    ibird.tasks.set(item);
                    //更新状态
                    ibird.mssql.query(`UPDATE [business_robot] SET [status]='1' where [_id] = '${id}'`, () => res.json({}), err => res.json({error: err}));
                }, err => res.json({error: err}));
            },
            "/robot/stop/:id": function (req, res) {
                const id = req.params.id;
                let task = ibird.tasks.get(id);
                if (task) return task.job.cancel();
                //更新状态
                ibird.mssql.query(`UPDATE [business_robot] SET [status]='0' where [_id] = '${id}'`, () => res.json({}), err => res.json({error: err}));

            }
        }
    }
};