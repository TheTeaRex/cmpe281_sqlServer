var fs = require('fs');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();
//app.use(express.bodyParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var ipUrl = "http://169.254.169.254/latest/meta-data/public-ipv4";

// getting the keys
var options = {
    key : fs.readFileSync('sqlserver.key'),
    cert : fs.readFileSync('sqlserver.crt')
}

var login = JSON.parse(fs.readFileSync("config.json"));
var connection = mysql.createConnection(login);
connection.connect(function(err){
    if(!err){
        console.log("Database is connected ... ");
        //app.listen(process.env.PORT || 80);
        https.createServer(options, app).listen(process.env.PORT || 443);
        console.log('SQL Server Started!');
    } else {
        console.log("Cannot connect to the database ... ");
    }
});

var updateDatabase = function(shorturl, longurl, callback){
    var q = 'INSERT INTO URL (ShortUrl, LongUrl) VALUES ("'+shorturl+'","'+longurl+'")'; 
    connection.query(q, function(err, rows, fields) {
        if (!err || err.code == "ER_DUP_ENTRY"){
            console.log('Rows: ', rows);
            console.log('Fields: ', fields);
            callback("success");
        }
        else{
            console.log('Cannot perform query.') ;
            console.log('Error: ' + err.code) ;
            callback("fail");
        }
    });
}

var readDataBase = function(shorturl, callback){
    var q = 'SELECT longurl from URL where shorturl = ?';
    connection.query(q, shorturl ,function(err, rows, fields) {
        if (!err && rows.length == 0){
            console.log("shorturl not found.");
            callback("not found",null);
        }else if (!err){
            console.log('The response is: ', rows);
            callback("success", rows[0].longurl);
        }else{
            console.log('Cannot perform query.') ;
            callback("fail", null);
        }
    });

}

var handle_post = function (req, res) {
    console.log("Post: ..." );
    console.log(req.body);
    if (req.body.action == 'update'){
        updateDatabase(req.body.shorturl, req.body.longurl, function(state){
            if (state == "success"){
                res.setHeader('Content-Type', 'application/json');
                var data = {status:state};
                res.json(data);
            }else {
                res.setHeader('Content-Type', 'application/json');
                var data = {status:state};
                res.json(data);
            }
        });
    }
    else if(req.body.action == 'read') {
        readDataBase(req.body.shorturl, function(state, longurl){
            if (state=="success"){
                res.setHeader('Content-Type', 'application/json');
                var data = {status:state, longurl: longurl};
                res.json(data);
            } else{
                res.setHeader('Content-Type', 'application/json');
                var data = {status:state};
                res.json(data);
            }
        });
    }
}

app.post("*", handle_post );
//app.listen(process.env.PORT || 80);
//console.log('SQL Server Started!');
//https.createServer(options, app).listen(process.env.PORT || 443);
