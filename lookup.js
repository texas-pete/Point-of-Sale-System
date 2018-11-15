var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");

var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/4quad";

MongoClient.connect(url, function(err, db)
{
    if (err) { //if we can't open our server, throw an error
        console.log("Unable to Connect to the Server", err);
    } else {
        console.log("Connection Opened"); //prints to the node.js command prompt

    var dbo = db.db("mydb");
    dbo.collection("orderNumbers").findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result.order);
        db.close();
  });
});