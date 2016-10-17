/**
 * ibird配置文件
 * Created by yinfxs on 16-10-11.
 */

'use strict';

const path = require('path');
const React = require('react');
const RouteUtils = require('./src/utils/RouteUtils');
const ToastrUtils = require('./src/utils/ToastrUtils');

module.exports = {
    models: {
        'business-robot': {
            'actions': [
                {
                    render: function (ctx) {
                        return <button className="btn btn-default btn-xs" key={ctx.key} data-aid={ctx.aid}
                                       onClick={ctx.action}>启动</button>;
                    },
                    action: function (ctx) {
                        const $this = ctx.$this;
                        fetch(RouteUtils.CUSTOM('/' + $this.state.moduleCode + '/robot/start/' + ctx.data._id), {
                            method: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "access_token": $this.state.access_token
                            }
                        }).then(res => res.json()).then(function (json) {
                            if (json.err) return toastr.error(json.err.message, null, ToastrUtils.defaultOptions);
                            toastr.info('启动成功', null, ToastrUtils.defaultOptions);
                            $this.fetchModelData();
                        });
                    }
                },
                {
                    render: function (ctx) {
                        return <button className="btn btn-default btn-xs" key={ctx.key} data-aid={ctx.aid}
                                       onClick={ctx.action}>停止</button>;
                    },
                    action: function (ctx) {
                        const $this = ctx.$this;
                        fetch(RouteUtils.CUSTOM('/' + $this.state.moduleCode + '/robot/stop/' + ctx.data._id), {
                            method: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "access_token": $this.state.access_token
                            }
                        }).then(res => res.json()).then(function (json) {
                            if (json.err) return toastr.error(json.err.message, null, ToastrUtils.defaultOptions);
                            toastr.info('停止成功', null, ToastrUtils.defaultOptions);
                            $this.fetchModelData();
                        });
                    }
                }
            ],
            'fields': {
                'status': {
                    row: function (ctx) {
                        // ctx.row.status
                        return (
                            <div style={{
                                color: ctx.row.status == 0 ? 'red' : 'green',
                                textAlign: 'center'
                            }}>{ctx.data}</div>
                        );
                    }
                }
            }
        }
    },
    components: []
};
