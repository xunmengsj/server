
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongodb = require('mongodb');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
var safe = {safe: true};
app.get('/add-city', function (req, res) {
    var server = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect: true});
    var db = new mongodb.Db('db', server , safe);
    db.open(function (err, db) {
        if(!err) {
            console.info("connect");
            db.collection("city", safe, function (err, collection) {
                if(err){
                    console.info(err);
                } else {
                    for(var i = 0; i < 1000; i++) {
                        var name = "北京" + i;
                        var city = {name: name};
                        collection.insert(city, safe, function (err, result) {
                            console.info(result);
                        });
                    }
                    res.send("add city successfully!")
                }
            })
        } else {
            console.info(err);
        }
    })
});
app.get('/city', function (req, res) {
    var total = parseInt(req.query.total);
    var nextPage = parseInt(req.query.nextPage);
    var server = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect: true});
    var db = new mongodb.Db('db', server , safe);
    db.open(function (err, db) {
        if(!err) {
            console.info("connect");
            db.collection("city", safe, function (err, collection) {
                if(err){
                    console.info(err);
                } else {
                    var skip = total * (nextPage - 1);
                    collection.find(null, {name: 1, _id: 0}).sort({_id:1}).limit(total).skip(skip).toArray(function (err, list) {
                        res.json(list);
                    });
                }
            })
        } else {
            console.info(err);
        }
    })
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
