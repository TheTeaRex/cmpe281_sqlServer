var fs = require('fs');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var sh = require('shorthash');
var mysql = require('mysql');
var request = require('request');

var app = express();
//app.use(express.bodyParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var ipUrl = "http://169.254.169.254/latest/meta-data/public-ipv4";

/*
// getting the keys
var options = {
    key : fs.readFileSync('../keys/cpserver.key'),
    cert : fs.readFileSync('../keys/cpserver.crt')
}
*/
/*
var convertURL = function(longurl, callback) {
    shorturl = shortDomain + sh.unique(longurl);
    sendMessageSQS(longurl, shorturl);
    callback(shorturl);
}

var getPublicIP = function(callback){
    request({
        url : ipUrl,
        method : "GET"
    }, function(error, response, body){
        console.log("getting IP: " + body);
        callback(body);
    })
}
*/
/*
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'team6rocks',
    database : 'bitly'
});
*/
var login = JSON.parse(fs.readFileSync("config.json"));
var connection = mysql.createConnection(login);

var updateDatabase = function(shorturl, longurl){
    connection.connect(function(err){
        if(!err){
            console.log("Database is connected ... \n");
        } else {
            console.log("Cannot connect to the database ... \n");
        }
    });
    
    var q = 'INSERT INTO URL (ShortUrl, LongUrl) VALUES ("'+shorturl+'","'+longurl+'")'; 
    connection.query(q, function(err, rows, fields) {
        connection.end();
        if (!err)
            console.log('The response is: ', rows);
        else
            console.log('Cannot perform query.') ;
    });
}

var readDataBase = function(shorturl){
    connection.connect(function(err){
        if(!err){
            console.log("Database is connected ... \n");
        } else {
            console.log("Cannot connect to the database ... \n");
        }
    });

    var q = 'SELECT longurl from URL where shorturl = ?';
    connection.query(q, shorturl ,function(err, rows, fields) {
        connection.end();
        if (!err)
            console.log('The response is: ', rows);
        else
            console.log('Cannot perform query.') ;
    });

}

var handle_post = function (req, res) {
    console.log("Post: ..." );
    console.log(req.body);
    if (req.body.action == 'update')
        updateDatabase(req.body.shorturl, req.body.longurl);
    else if(req.body.action == 'read')
        readDataBase(req.body.shorturl);
    res.type('text/plain');
    res.send("Got it!");
}

app.post("*", handle_post );
app.listen(process.env.PORT || 80);
console.log('SQL Server Started!');
//https.createServer(options, app).listen(process.env.PORT || 443);
