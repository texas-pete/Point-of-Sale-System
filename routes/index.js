var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");
var ObjectId = require('mongodb').ObjectId;

/* GET home page. Log onto our terminal*/
router.get("/", function(req, res) {
  res.render("terminal_login", { page: "Log in to the Terminal" });
});

// Terminal View for Waitstaff
router.get("/waitstaff", function(req, res) {
  res.render("waitstaff", { page: "Waitstaff View" });
});

// Terminal View for Kitchen Staff
router.get("/kitchenstaff", function(req, res) {
  res.render("kitchenstaff", { page: "Kitchen Staff View" });
});

// Terminal View for Management
router.get("/manager", function(req, res) {
  res.render("manager", { page: "Management View" });
});

// Terminal View for Guests
router.get("/guest", function(req, res) {
  res.render("guest", { page: "Guest View" });
});

//Guest pages
//appetizers
router.get("/guest-appetizers", function(req, res){
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function(err, db){
    if(err){
      console.log("Unable to Connect to the MongoDB Server");
    }
    else{
      console.log("Connection established with MongoDB Server");

      var query = {Category:"Appetizer"};
      var collection = db.collection("menu_items");
      console.log("attempting " + query);
      collection.find(query).toArray(function(err, results){
        if(err){
          console.log("in here");
          console.log(err);
        }
        else if(results.length){
          //want to send info to db
          res.render("appetizers", {menu_items: results});
        }
        else{
          console.log("No results! ERROR");
        }
        db.close();
      });
    }
  });
});

//games
router.get("/guest-games", function(req, res){
  res.render("guest-games");
});

//is used to retrieve the necessary information for the modal popup
router.post("/getMenuItemById/*", function(req, res) {
  console.log("Retrieving data from: " + req.params[0]);

  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  MongoClient.connect(
    url,
    function(err, db) {
      if(err){
        console.log("Unable to connect to the Server");
      }
      else{
        console.log("Connection established");
        var objID = new ObjectId(req.params[0]);
        var query = { _id: objID};
        var collection = db.collection("menu_items");

        collection.find(query).toArray(function(err, results) {
            if(err){
              console.log(err);
            }
            else if (results.length){//send the object to the page
              res.send(results);
            }
            else{
              console.log("Menu item not found!");
            }
            db.close();
            console.log("Connection closed");
        });
      }
    }
  );

  //res.send()
});

router.post("/validateCredentials", function(req, res) {
  var MongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(
    url,
    function(err, db) {
      if (err) {
        console.log("Unable to Connect to the Server", err);
      } else {
        console.log("Connection Established");

        var query = { terminal: req.body.username };
        var collection = db.collection("terminal_login");

        collection.find(query).toArray(function(err, results) {
          if (err) {
            console.log(err);
          } else if (results.length) {
            //if we get here, we know our input matches something inside our database
            //TODO change this to check the contents of the collection rather than the input
            if (req.body.username === "waitstaff") {
              // redirect to waitstaff view
              res.redirect("/waitstaff");
            } else if (req.body.username === "kitchenstaff") {
              //redirect to kitchen staff
              res.redirect("/kitchenstaff");
            } else if (req.body.username === "manager") {
              //redirect to manager
              res.redirect("/manager");
            } else if (req.body.username === "guest") {
              //redirect to guest view
              res.redirect("/guest");
            }
          } else {
            console.log("Login not found");
            res.redirect("/"); //redirect if we fail to validate input
          }
          db.close();
          console.log("Connection Closed");
        });
      }
    }
  );
});

module.exports = router;
