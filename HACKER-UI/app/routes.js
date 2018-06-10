var express = require('express');
var baseRoute = express();


//const users = [];

//const winston = require('winston');

const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// const tsFormat = () => (new Date()).toLocaleTimeString();
// const logger = new (winston.Logger)({
//     transports: [
//         // colorize the output to the console
//         new (winston.transports.Console)({
//             timestamp: tsFormat,
//             colorize: true,
//             level: 'info'
//         }),
//         new (require('winston-daily-rotate-file'))({
//             filename: `${logDir}/-results.log`,
//             timestamp: tsFormat,
//             datePattern: 'yyyy-MM-dd',
//             prepend: true,
//             level: env === 'development' ? 'verbose' : 'info'
//         })
//     ]
// });
// logger.debug('Debugging info');


module.exports = function (app) {


    baseRoute.get('/get-data-csv', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var csv = require("fast-csv");
        var dataArray=[];

        csv
            .fromPath("csv/xpo.csv")
            .on("data", function(data){
                data= data.map(function (d) {
                    return d.replace("'","").replace("'","").trim();
                });
                if(data[0].length>0)
                dataArray.push({
                    jcount:data[0],
                    date:data[1],
                    src:data[2],
                    to:data[3],
                    zip:data[4],
                    desc:data[5],
                    c:data[6]
                });
              })
            .on("end", function(){
                res.setHeader('Content-Type', 'application/json');
                res.send(dataArray);
            });


    });



    baseRoute.get('/get-estimate-data', function(req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.send([{
                rank:0,
                name:"Fridge",
                retailers:[{rank:0,name:"Q",count:10},{rank:1,name:"R",count:4}],
                average:30,
                count:10,
                trendLastMonths:[20,33,7,44,66,33,22,55,77,55,77,66]
            }]);
    }
    );
    app.use('/', baseRoute); // mount the sub app

};