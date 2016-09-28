/**
 * Created by yinfxs on 16-9-25.
 */
'use strict';

const sql = require('mssql');
sql.connect("mssql://sa:wosoft!Admin@121.41.46.25/PhoneEffect_Dev").then(function() {
    // Query

    // new sql.Request().query('select * from WXUsers').then(function(recordset) {
    //     console.dir(recordset);
    // }).catch(function(err) {
    //     // ... query error checks
    // });

    // Stored Procedure

    // new sql.Request()
    //     .input('input_parameter', sql.Int, value)
    //     .output('output_parameter', sql.VarChar(50))
    //     .execute('procedure_name').then(function(recordsets) {
    //     console.dir(recordsets);
    // }).catch(function(err) {
    //     // ... execute error checks
    // });

    // ES6 Tagged template literals (experimental)
    // const value = 1;
    // sql.query`select * from WXUsers where id = ${value}`.then(function(recordset) {
    //     recordset.forEach(function (item) {
    //         console.log(item);
    //     });
    //     // console.dir(recordset);
    // }).catch(function(err) {
    //     // ... query error checks
    // });
    sql.query`select @@version`.then(function(recordset) {
        recordset.forEach(function (item) {
            console.log(item);
        });
        // console.dir(recordset);
    }).catch(function(err) {
        // ... query error checks
    });
}).catch(function(err) {
    // ... connect error checks
});