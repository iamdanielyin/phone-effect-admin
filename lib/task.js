/**
 * 任务测试
 *
 * 任务字符串格式规则

 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)

 * Created by yinfxs on 16-9-25.
 */

'use strict';

const schedule = require('node-schedule');
const utils = require('./utils');
// var i = 0;
//
// const j = schedule.scheduleJob("*/5 * * * * *", function(){
//     console.log('每1秒一次');
//     i++;
//     if(i == 5) j.cancel();
// });
console.log(utils.ip());