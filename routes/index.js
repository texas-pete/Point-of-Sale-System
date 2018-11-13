var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");
var ObjectId = require('mongodb').ObjectId;

var currentTable = ""//is null b.c no table set.

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
  console.log("accessing guest index page, table " + req.body.tablenum);
  res.render("guest", { page: "Guest View", tablenum: req.body.tablenum });
});

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

//pay
router.get("/guest-pay", function(req, res){
  res.render("guest-pay");
});

//order
router.get("/guest-order", function(req, res){
  //res.render("guest-order");
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function(err, db){
    if(err){
      console.log("Unable to Connect to the MongoDB Server");
    }
    else{
      console.log("Connection established with MongoDB Server");

      var query = {table : currentTable};
      var collection = db.collection("active_orders");
      console.log("attempting " + query + " " + currentTable);
      collection.find(query).toArray(function(err, results){
        if(err){
          console.log(err);
        }
        else if(results.length){
          //want to send info to db
          res.render("guest-order", {order_items: results});
        }
        else{
          console.log("No results! ERROR");
        }
        db.close();
      });
    }
  });
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
});

router.post("/submitToOrder/:objId/:notes", function(req, res){
  console.log("Trying to submit to order with menu_items.objId " + req.params.objId + 
    " and notes as " + req.params.notes);

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
        //var objID = new ObjectId(req.params.objId);
        var itemId = req.params.objId
        var query = { table: currentTable.toString()};
        var collection = db.collection("active_orders");
        var newvalues = {$push: {items: {item: itemId, notes: req.params.notes}}};
        
        console.log("Running the query collection.update(table: " + currentTable.toString()
        + " $push: {items: {item: " + itemId + ", notes: " + req.params.notes);
        var itemId = req.params.objId
        var query = { table: currentTable.toString()};
        var collection = db.collection("active_orders");
        var newvalues = {$push: {items: {item: itemId, notes: req.params.notes}}};
        collection.update(query, newvalues, function(err, res){
          if(err) throw err;
          console.log("order updated");
          db.close();
        });
        /*collection.find(query).toArray(function(err, results) {
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
        });*/
      }
    }
  ); 
});

router.post("/validateCredentials", function (req, res) {
  var MongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(
    url,
    function (err, db) {
      if (err) {
        console.log("Unable to Connect to the Server", err);
      } else {
        console.log("Connection Established");

        var query = { terminal: req.body.username };
        var collection = db.collection("terminal_login");

        collection.find(query).toArray(function (err, results) {
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
            } else {
              //redirect to guest view we have 16 logins and if we get here they hit somethng. if we manage the db correctly we shouldn't have issues.
              var tableN = req.body.username;
              currentTable = tableN.substring(5, tableN.length);
              console.log("Table " + currentTable + " is active.");
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
