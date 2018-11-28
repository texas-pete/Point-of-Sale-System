//const keyword rather than var due to standards
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const util = require('util');//to inspect objects

var currentTable = ""//is null b.c no table set.

const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/4quad";

/* GET home page. Log onto our terminal*/
router.get("/", function (req, res) {
  res.render("terminal_login", { page: "Log in to the Terminal" });
});

// Terminal View for Waitstaff
router.get("/waitstaff", function (req, res) {
  let serviceRequests = {};

  MongoClient.connect(url, function (err, db) {
    if (err) { //if we can't open our server, throw an error
      console.log("Unable to Connect to the Server", err);
    } else {
      console.log("Connection Opened"); //prints to the node.js command prompt

      // we only want the tableNumber
      let proj = { _id: 0, tableNum: 1 }

      db.collection("service_requests").find({}, proj).toArray(function (err, result) {
        if (err) throw err;
        serviceRequests = result;
        res.render("waitstaff", { page: "Waitstaff View", serviceReqs: serviceRequests });
        db.close();
      });
    }
  })
})

router.post("/getTableOrder/:tblNum", function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to the Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      var query = { table: req.params.tblNum }; //we need to pass the table number requesting
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          res.send(results); //send the object to the page.
        }
        else {
          console.log("No orders on record for table " + req.params.tblNum);
          res.send(); //we need to send a response to our requester to ensure our content doesnt get stuck waiting.
        }
        console.log("Connection Closed"); //prints to the node.js command prompt
        db.close();
      });
    }
  });
});

router.post("/getItemName/:db_name", function (req, res) { //Verify the value is in our database.

  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  console.log(req.params.db_name.length)
  console.log(" LOOK AT ME OBJECT ID" + req.params.db_name);
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to the Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      if (req.params.db_name.length != 24) {
        res.sendStatus(404);
      }
      else {
        var objID = new ObjectId(req.params.db_name);
        var query = { "_id": objID }; //we need to pass the table number requesting
        var collection = db.collection("menu_items");
        console.log(" LOOK AT ME OBJECT ID" + req.params.db_name);
        collection.find(query).toArray(function (err, results) {
          if (err) {
            console.log(err);
          }
          else if (results.length) { //if we return a result
            res.send(results[0].Name); //send the name of the object to the page.
          }
          else {
            console.log("No menu items with this id " + req.params.db_name);
            res.sendStatus(404); //we need to send a response to our requester to ensure our content doesnt get stuck waiting.
          }
          console.log("Connection Closed"); //prints to the node.js command prompt
          db.close();
        });
      }
    }
  });
});

router.post("/fromNameToID/:db_name", function (req, res) {

  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to the Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      var query = { "Name": req.params.db_name };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) { //if we return a result
          res.send(results[0]._id); //send the name of the object to the page.
        }
        else {
          console.log("No menu items with this id " + req.params.db_name);
          res.sendStatus(404); //we need to send a response to our requester to ensure our content doesnt get stuck waiting.
        }
        console.log("Connection Closed"); //prints to the node.js command prompt
        db.close();
      });
    }
  });
});

router.post("/removeSubmitted/:item_name/:item_description/:table_num", function (req, res) {
  //this does not check the current table number. there is a possibility that the wrong table number will be deleted if the message is exactly the same
  //we need to go in and remove element
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to the Server");
    }
    else {

      var query = { table: req.params.table_num };
      var hide = { "table": 0 };
      var collection = db.collection("submitted_orders");
      var collectionID;
      collection.find(query, hide).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          collectionID = ObjectId(results[0]._id); //returns the element ID of a 
          //we have the ID, now we need to update our array by unsetting the value that matches.
          collection.update(
            { _id: collectionID },
            { $pull: { 'orderedItems': { item: req.params.item_name, notes: req.params.item_description } }, }, function (err, result) {
              if (err) {
                console.log(err);
                console.log("err");
              }
              else if (result.length) {
                res.sendStatus(200);
              }
              else {
                res.sendStatus(200); //we need to send a response to our requester to ensure our content doesnt get stuck waiting.
              }
            });
          // console.log(results[0].items[0].item); //this allows me to access the name of an object
        }
        else {
          console.log("No orders match this critera.");
          res.sendStatus(200); //we need to send a response to our requester to ensure our content doesnt get stuck waiting.
        }
        console.log("Connection Closed"); //prints to the node.js command prompt
        // db.close();
      })
    }
  });
});

router.post("/editSubmitted/:item_name/:item_description/:table_num/:newDescription", function (req, res) {
  //this does not check the current table number. there is a possibility that the wrong table number will be deleted if the message is exactly the same
  //we need to go in and remove element
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to the Server");
    }
    else {

      var query = { table: req.params.table_num };
      var hide = { "table": 0 };
      var collection = db.collection("submitted_orders");
      var collectionID;
      var newDescription = req.params.newDescription;
      collection.find(query, hide).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {

          collectionID = ObjectId(results[0]._id); //returns the element ID of a 
          //we have the ID, now we need to update our array by unsetting the value that matches.
          collection.update(
            { _id: collectionID }, //insert our new value
            { $push: { 'orderedItems': { item: req.params.item_name, notes: newDescription } }, });

          collection.update( //remove the old value
            { _id: collectionID },
            { $pull: { 'orderedItems': { item: req.params.item_name, notes: req.params.item_description } }, });

        }
        else {
          console.log("No orders match this critera.");
          res.sendStatus(200); //we need to send a response to our requester to ensure our content doesnt get stuck waiting.
        }
        console.log("Connection Closed"); //prints to the node.js command prompt
        // db.close();
        res.sendStatus(200);
      })
    }
  });
});

// Terminal View for Kitchen Staff
router.get("/kitchenstaff", function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("submitted_orders");
      collection.find({}).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          console.log(util.inspect(results[0], {showHidden:false, depth: null}));
          //Database access worked
          console.log("It worked!");
          res.render("kitchenstaff", { page: "Kitchen Staff View", orderItems: results});
        }
        else {
          console.log("No results! ERROR");
        }
    });
  }
});

});
  
// Terminal View for Management
router.get("/manager", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if(err){
      console.log("Could not connect to db")
    }
    else{
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("menu_items");
      collection.find({}).toArray(function (err, results) { //gets all menu items and stores in var menuItems
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          console.log('received menu items')
          console.log(results)
          var menuItems = results
          //--------------------------------------------------------------------------------------------------
          collection = db.collection('submitted_orders');
          collection.find({}).toArray(function(err, results){ //gets submitted items
            if(err){
              console.log(err);
            }
            else{
              console.log('received submitted orders')
              //console.log(results)
              var submittedOrders = results
              //--------------------------------------------------------------------------------------------------
              collection = db.collection('ingredients');
              collection.find({}).toArray(function(err, results){ //gets ingredients
                if(err){
                  console.log(err);
                }
                else if (results.length) {
                  console.log('received inventory stuff')
                  console.log(results)
                  var pulledIngredients = results
                  //--------------------------------------------------------------------------------------------------
                  collection = db.collection('archived_orders');
                  collection.find({}).toArray(function(err, results){ //gets archived_orders info
                    if(err){
                      console.log(err);
                    }
                    else if (results.length) {
                      console.log('received archived_orders stuff')
                      console.log(results)
                      var archivedOrders = results
                      //--------------------------------------------------------------------------------------------------
                    setTimeout(function () { //need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
                    res.render("manager", { page: 'Management View', items: menuItems, orders: submittedOrders, products: pulledIngredients, generals: archivedOrders });
                    }, 500);
                    }
                    else {
                      console.log("No results! ERROR");
                    }
                  });
                }
              });
            }
          });
        }
        else {
          console.log("No results! ERROR");
        }
      });
    }
  });
});

router.post("/inventoryD/:id", function(req, res){
  console.log('ok')
  MongoClient.connect(url, function (err, db) {
    if(err){
      console.log("Could not connect to db")
    }
    else{
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("ingredients");

      var objId = new ObjectId(req.params.id);

      collection.find({_id: objId}).toArray(function (err, results) {
        if(err){
          console.log(err)
        }
        else if(results.length){
          console.log('got results');
          //decrease quantity
          console.log(results[0].Quantity)
          var isQuantity = results[0].Quantity
          isQuantity = isQuantity - 1
          results[0].Quantity = isQuantity
          console.log(results[0].Quantity)

          console.log(results)
          collection.updateOne({_id: objId}, {$set: {'Quantity': isQuantity}}, function(){
            console.log('Successfully decreases by 1');
            res.send('ok')
          });
        }
        else{
          console.log('no results, should not happen!')
        }
      });
    }
  });
});

router.post("/inventoryI/:id", function(req, res){
  console.log('ok')
  MongoClient.connect(url, function (err, db) {
    if(err){
      console.log("Could not connect to db")
    }
    else{
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("ingredients");

      var objId = new ObjectId(req.params.id);

      collection.find({_id: objId}).toArray(function (err, results) {
        if(err){
          console.log(err)
        }
        else if(results.length){
          console.log('got results');
          //increase quantity
          console.log(results[0].Quantity)
          var isQuantity = results[0].Quantity
          isQuantity = isQuantity + 1
          results[0].Quantity = isQuantity
          console.log(results[0].Quantity)

          console.log(results)
          collection.updateOne({_id: objId}, {$set: {'Quantity': isQuantity}}, function(){
            console.log('Successfully increases by 1');
            res.send('ok')
          });
        }
        else{
          console.log('no results, should not happen!')
        }
      });
    }
  });
});

router.post("/hideMenuItem/:id", function(req, res){
  console.log('ok')
  MongoClient.connect(url, function (err, db) {
    if(err){
      console.log("Could not connect to db")
    }
    else{
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("menu_items");

      var objId = new ObjectId(req.params.id);

      collection.find({_id: objId}).toArray(function (err, results) {
        if(err){
          console.log(err)
        }
        else if(results.length){
          console.log('got results');
          //change from active to not active
          console.log(results[0].Active)
          var isActive = results[0].Active
          if(isActive == 'yes'){
            isActive = 'no'
          }
          else{
            isActive = 'yes'
          }
          results[0].active = isActive
          console.log(results[0].active)

          console.log(results)
          collection.updateOne({_id: objId}, {$set: {'Active': isActive}}, function(){
            console.log('Successfully removed or added a menu item');
            res.send('ok')
          });
        }
        else{
          console.log('no results,should not happen!')
        }
      });
    }
  });
});

router.post("/compensate/:id", function(req, res){
  console.log('compensating')
  MongoClient.connect(url, function (err, db) {
    if(err){
      console.log("Could not connect to db")
    }
    else{
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("submitted_orders");

      var objId = new ObjectId(req.params.id);

      collection.find({_id: objId}).toArray(function (err, results) {
        if(err){
          console.log(err)
        }
        else if(results.length){
          console.log('got results, setting price to zero');
          //change to zero
          console.log(results[0].orderedItems)
          for(var i = 0; i < results[0].orderedItems.length; i++){
            results[0].orderedItems[i].price = '0.00'
          }
          console.log(results[0].orderedItems)

            //update
            var priceChange = results[0].orderedItems
            collection.updateOne({_id: objId}, {$set: {'orderedItems': priceChange}}, function(){
              console.log('Successfully made the price = 0');
              res.send('ok')
            });           
        }
        else{
          console.log('no results,should not happen!')
        }
      });
    }
  });
});

router.post("/lookup/:id", function(req, res){
  console.log('loking up')
  MongoClient.connect(url, function (err, db) {
    if(err){
      console.log("Could not connect to db")
    }
    else{
      console.log("Connection established with MongoDB Server");
      var collection = db.collection("archived_orders"); //looking at archived orders
      var objId = req.params.id;
      
      collection.find({orderID: objId}).toArray(function (err, results) {
        if(err){
          console.log(err)
        }
        else if(results.length){
          console.log('got results, need to send to manager.ejs')           
          res.send(results)
        }
        else{
          console.log('can happen')
          res.send('empty')
        }
      });
    }
  });
});

//TODO: MAY NEED TABLE VARIABLE PASSED-IN FOR ALL?
// Terminal View for Guests
router.get("/guest", function (req, res) {
  var dt = new Date();
  var day = dt.getDay();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {
            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      console.log("The current day number is: " + day);
      //attempting and query
      if(day != 0 && day != 6){//if the day is a weekday, then get special 1
        var query = {
          $and: [
            { Category: "Special1" },
            { Active: "yes" }
          ]
        };
      }
      else{//weekend, get special2
        var query = {
          $and: [
            { Category: "Special2" },
            { Active: "yes" }
          ]
        };
      }
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("All drinks are: " + drinks);
          console.log("We are in: /guest");
          console.log("The current hour is: " + time + typeof time);
          console.log(util.inspect(results, { showHidden: false, depth: null }))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("guest", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("guest", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//appetizers
router.get("/guest-appetizers", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Appetizer" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-appetizesr");
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            console.log("All drinks are: " + drinks);
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//entrees
router.get("/guest-entrees", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Entree" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-eentrees");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//guest kid-meals
router.get("/guest-kids-meals", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Kids Meal" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-kids-meals");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});


//for guest desserts
router.get("/guest-desserts", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Dessert" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-kids-meals");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//for guest-drinks
router.get("/guest-drinks", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Drink" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-drinks");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});


//games
router.get("/guest-games", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
    res.render("guest-games", { hour: time, refill: drinks, tablenum: currentTable });
  }, 500);
});

router.get('/guest-pay', function(req, res, next){
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      var query = { table: currentTable };
      var collection = db.collection("submitted_orders");
      console.log("attempting " + query + " " + currentTable);
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//send the object to the page
         
           console.log(results[0].orderedItems[0].price); //this prints the PRICE of a returned result.
           console.log(results);
            //console.log(orderedItems[i].price); //this prints the PRICE of a returned result.
            res.render('guest-pay', {order_items: results, tablenum: currentTable});
        }
        else {
          console.log("Menu item not found!");
         // res.render('guest-pay', {order_items: results});
         res.send(404);
        }
        //db.close();     
      });
    }
  });
  });

//order
router.get("/guest-order", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //var query = {table : currentTable.toString()};
      var query = { table: currentTable.toString() };//, {"_id":0, "table":0};
      var hide = { "_id": 0, "table": 0 };
      var collection = db.collection("active_orders");
      //console.log("attempting " + query + " " + currentTable);
      collection.find(query, hide).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          t_notes = results[0].items
          console.log("T_notes: " + t_notes);
          MongoClient.connect(url, function (err, db) {
            if (err) {
              console.log("Unable to connecto to the MongoDB Server");
            }
            else {
              console.log("Connection established with MongoDB Server");

              console.log("made it here");
              //have to go over array of objects to find items
              //console.log(util.inspect(results, {showHidden:false, depth: null}));
              console.log(results[0]);//.items[0]);
              if (results[0].items.length >= 2) {
                var t_collection = db.collection("menu_items");
                var t_query = [];//creates an empty array to push objects into
                console.log("pushing to query " + results[0].items.length + " times");
                for (var i = 0; i < results[0].items.length; i++) {
                  console.log("pushed " + results[0].items[i].item);
                  t_query.push({ _id: new ObjectId(results[0].items[i].item) })
                }
                //run or query
                t_collection.find({ $or: t_query }).toArray(function (err, results) {
                  if (err) {
                    console.log(err);
                  }
                  else if (results.length) {
                    //console.log("woo, success!");
                    //console.log("length is: " + results.length);
                    //console.log(util.inspect(results, {showHidden:false, depth: null}));
                    //util console log results
                    res.render("guest-order", { order_items: results, notes: t_notes, refill: drinks, tablenum: currentTable });
                  }
                  else {
                    //no elements, should not happen
                  }
                  db.close();
                });
              }
              else if (results[0].items.length == 1) {
                console.log("Running single item query");
                //single object
                //console.log(util.inspect(results[0].items[0], {showHidden:false, depth: null}));
                //just the object's item.
                //console.log(util.inspect(results[0].items[0].item, {showHidden:false, depth: null}));

                //run single query
                var t_collection = db.collection("menu_items");
                var t_query = { _id: new ObjectId(results[0].items[0].item) };

                t_collection.find(t_query).toArray(function (err, results) {
                  if (err) {
                    console.log(err);
                  }
                  else if (results.length) {
                    console.log("Got results");
                    res.render("guest-order", { order_items: results, notes: t_notes, tablenum: currentTable, refill: drinks })
                  }
                  else {
                    console.log("No results, should not happen.")
                  }
                });
              }
              else {
                //no elements, render empty page
                console.log("Rendering empty order page");
                res.render("guest-order", { order_items: [], notes: [], tablenum: currentTable, refill: drinks });
              }
            }
          });
        }
        else {
          console.log("No results! ERROR");

        }
        db.close();
      });
    }
  });
});

//is used to retrieve the necessary information for the modal popup
router.post("/getMenuItemById/*", function (req, res) {
  console.log("Retrieving data from: " + req.params[0]);
  console.log("Something should print here!")
  MongoClient.connect(
    url,
    function (err, db) {
      if (err) {
        console.log("Unable to connect to the Server");
      }
      else {
        console.log("Connection established");
        var objID = new ObjectId(req.params[0]);
        var query = { _id: objID };
        var collection = db.collection("menu_items");

        collection.find(query).toArray(function (err, results) {
          if (err) {
            console.log(err);
          }
          else if (results.length) {//send the object to the page
            res.send(results);
          }
          else {
            console.log("Menu item not found!");
          }
          db.close();
          console.log("Connection closed");
        });
      }
    }
  );
});

//submites to 'active_orders' w/ the price (for happy-hour), notes, and objectID.
router.post("/submitToOrder/:objId/:notes/:price", function (req, res) {
  console.log("Trying to submit to order with menu_items.objId " + req.params.objId +
    " and notes as " + req.params.notes + " and price of $" + req.params.price);
  console.log(req.params.objId)
  if(req.params.objId == 0){
    console.log("ObjId is 0")
  }
  else{
    MongoClient.connect(
      url,
      function (err, db) {
        if (err) {
          console.log("Unable to connect to the Server");
        }
        else {
          var itemId = req.params.objId
          var query = { table: currentTable.toString() };
          var collection = db.collection("active_orders");
          var newvalues = { $push: { items: { item: itemId, notes: req.params.notes, price: req.params.price } } };
          console.log("Running the query collection.update(table: " + currentTable.toString()
            + " $push: {items: {item: " + itemId + ", notes: " + req.params.notes + " ,price: " + req.params.price);
          collection.update(query, newvalues, function (err, res) {
            if (err) throw err;
            console.log("Order updated");
            //res.send("Ok");
          });
        }
      }

    );
    
  }
});

//submits the active order to submited order db
router.post("/submitToDB", function (req, res) {
  console.log(currentTable + " is submitting their order!");

  MongoClient.connect(
    url,
    function (err, db) {
      if (err) {
        console.log("Unable to connect to the db server");
      }
      else {//attempt making query
        var query = { table: currentTable.toString() };
        var collection = db.collection("active_orders");

        collection.find(query).toArray(function (err, results) {
          if (err) {
            console.log(err);
          }
          else if (results.length) {//want to insert the values of the ordered items for the current table to submitted orders
            var t_insert = { table: results[0].table, orderedItems: results[0].items };
            //console.log(util.inspect(t_insert, {showHidden:false, depth: null}));

            var t_collection = db.collection("submitted_orders");
            t_collection.insert(t_insert, function (err) {
              if (err) {
                console.log(err);
              }
              else {//we want to clear out the current order
                collection.update({ table: currentTable.toString() }, { $set: { "items": [] } }, function (err) {
                  if (err) {
                    console.log(err);
                  }
                  db.close();
                  res.send("Ok");
                });
              }
            });
            //need to clear out contents
            //
          }
          else {
            console.log("Should not happen, a table should be instantiated for everyone.");
          }
        });
      }
    }
  );
});

//calls database, manipulates returned object and sets it to emulate a deletion
router.post("/removeFromOrder/:index", function (req, res) {
  console.log("Trying to remove index" + req.params.index);

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to server");
    }
    else {
      console.log("Connection established");

      //want to look for current table's items
      var query = { table: currentTable.toString() };
      var collection = db.collection("active_orders");

      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //we want to travers the results object for items
          console.log(util.inspect(results[0].items, { showHidden: false, depth: null }));
          //create a new array and add to that the items except for at the index
          var newOrder = [];

          //goes through objects, if index is not the same as one we want to delete, push to temp array
          for (var i = 0; i < results[0].items.length; i++) {
            if (i != req.params.index) {
              console.log("Pushing to arrray: ");
              console.log(util.inspect(results[0].items[i], { showHidden: false, depth: null }));
              newOrder.push(results[0].items[i]);
            }
          }

          //replace the current table's orders w/ that of removed item
          collection.update({ table: currentTable.toString() }, { $set: { "items": newOrder } }, function (err) {
            if (err) {
              console.log(err);
            }
            db.close();
            res.send("ok");
          });
        }
        else {
          console.log("Should never happen, x only displayed when items are here");
        }
      });
    }
  });
});

//pulls the current table's items, finds index and modifies notes for index
router.post("/editOrder/:index/:notes", function (req, res) {
  console.log("Trying to edit order at index " + req.params.index + " with the notes: " + req.params.notes);

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to connect to server");
    }
    else {
      console.log("Connection established");

      //want to look for current table's items
      var query = { table: currentTable.toString() };
      var collection = db.collection("active_orders");

      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //we want to travers the results object for items
          console.log(util.inspect(results[0].items, { showHidden: false, depth: null }));
          //create a new array and add to that the items except for at the index
          var newOrder = [];

          //goes through objects, if index is not the same as one we want to delete, push to temp array
          for (var i = 0; i < results[0].items.length; i++) {
            if (i == req.params.index) {//modifying the object
              console.log("Is edited");
              console.log("Pushing to arrray: ");
              results[0].items[i].notes = req.params.notes;
              console.log(util.inspect(results[0].items[i], { showHidden: false, depth: null }));
              newOrder.push(results[0].items[i]);
            }
            else {//pushing the unmodified object
              console.log("Pushing to array: ");
              console.log(util.inspect(results[0].items[i], { showHidden: false, depth: null }));
              newOrder.push(results[0].items[i]);
            }
          }

          //replace the current table's orders w/ that of edited item
          collection.update({ table: currentTable.toString() }, { $set: { "items": newOrder } }, function (err) {
            if (err) {
              console.log(err);
            }
            db.close();
            res.send("ok");
          });
        }
        else {
          console.log("Should never happen, edit only displayed when items are here");
        }
      });
    }
  });
});

router.post("/validateCredentials", function (req, res) {
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
            } else if (req.body.username === "takeout") {
              //redirect to takeout
              res.redirect("/takeout");
              currentTable = 0;
            } else {
              //redirect to guest view we have 16 logins and if we get here they hit somethng. if we manage the db correctly we shouldn't have issues.
              let tblNumber = req.body.username.replace("table", "");
              currentTable = tblNumber;
              var dt = new Date();
              var day = dt.getDay();
              var time = dt.getHours();
              var drinks = [];//empty drinks array
              MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
                if (err) {
                  console.log("Unable to Connect to the MongoDB Server");
                }
                else {
                  console.log("Drink connection to server successful");
                  console.log("In here");
                  console.log(currentTable)
                  var query = { table: currentTable.toString() }
                  var collection = db.collection("submitted_orders");
                  collection.find(query).toArray(function (err, results) {
                    //console.log(util.inspect(results[0].orderedItems, {showHidden:false, depth: null}));
                    if (err) {
                      console.log(err);
                    }
                    else if (results.length > 0 && results[0].orderedItems.length) {//not empty
                      //need to find all drinks and put in object
                      //results[0].items[i].item
                      console.log("The user does have orders, going through " + results[0].orderedItems.length + " iters");


                      //trying to fix here

                      for (var j = 0; j < results.length; j++) {

                        for (var i = 0; i < results[j].orderedItems.length; i++) {
                          ////console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
                          var t_query = {
                            $and: [
                              { Category: "Drink" },
                              { _id: new ObjectId(results[j].orderedItems[i].item) }
                            ]
                          };
                          var t_collection = db.collection("menu_items");
                          t_collection.find(t_query).toArray(function (err, drinkResults) {
                            if (err) {
                              console.log(err);
                            }
                            else if (drinkResults.length) {//if is a drink
                              //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                              //console.log("Found drink "+drinkResults[0].Name);
                              drinks.push(drinkResults[0].Name);
                            }
                            else {
                              console.log("Not a drink");
                            }
                          });
                        }

                      }



                      MongoClient.connect(url, function (err, db) {//grabs the menu items
                        if (err) {
                          console.log("Unable to Connect to the MongoDB Server");
                        }
                        else {
                          console.log("Connection established with MongoDB Server");

                          //attempting and query
                          if(day != 0 && day != 6){//if the day is a weekday, then get special 1
                            var query = {
                              $and: [
                                { Category: "Special1" },
                                { Active: "yes" }
                              ]
                            };
                          }
                          else{//weekend, get special2
                            var query = {
                              $and: [
                                { Category: "Special2" },
                                { Active: "yes" }
                              ]
                            };
                          }
                          var collection = db.collection("menu_items");
                          collection.find(query).toArray(function (err, results) {
                            if (err) {
                              console.log(err);
                            }
                            else if (results.length) {
                              //want to send info to db
                              console.log("All drinks are: " + drinks);
                              console.log("We are in: /validateCredentials");
                              console.log("The current hour is: " + time + typeof time);
                              console.log(util.inspect(results, { showHidden: false, depth: null }))
                              setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
                                res.render("guest", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
                              }, 500);
                            }
                            else {//still need to load page even if all items are not active
                              console.log("No results! ERROR");
                              console.log("All drinks are: " + drinks);
                              setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
                                res.render("guest", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
                              }, 500);
                            }
                            db.close();
                          });
                        }
                      });
                    }
                    else {//empty
                      MongoClient.connect(url, function (err, db) {//grabs the menu items
                        if (err) {
                          console.log("Unable to Connect to the MongoDB Server");
                        }
                        else {
                          console.log("Connection established with MongoDB Server");

                          //attempting and query
                          if(day != 0 && day != 6){//if the day is a weekday, then get special 1
                            var query = {
                              $and: [
                                { Category: "Special1" },
                                { Active: "yes" }
                              ]
                            };
                          }
                          else{//weekend, get special2
                            var query = {
                              $and: [
                                { Category: "Special2" },
                                { Active: "yes" }
                              ]
                            };
                          }
                          var collection = db.collection("menu_items");
                          collection.find(query).toArray(function (err, results) {
                            if (err) {
                              console.log(err);
                            }
                            else if (results.length) {
                              //want to send info to db
                              console.log("We are in: /guest-validateCredentials 2");
                              console.log("All drinks are: " + drinks);
                              console.log("The current hour is: " + time + typeof time);
                              console.log(util.inspect(results, { showHidden: false, depth: null }))
                              setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
                                res.render("guest", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
                              }, 500);
                            }
                            else {//still need to load page even if all items are not active
                              console.log("No results! ERROR");
                              console.log("All drinks are: " + drinks);
                              setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
                                res.render("guest", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
                              }, 500);
                            }
                            db.close();
                          });
                        }
                      });
                    }
                    //db.close();
                  });
                }
              });
              //var tableN = req.body.username;
              currentTable = tblNumber;//tableN.substring(5, tableN.length);
              console.log("Table " + currentTable + " is active.");
              //res.redirect("/guest");
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

router.get("/validateEmployee", function (req, res) {
  var prevAddress = req.headers.referer
  res.render("clock_login", { page: "Clock-In", prevAddress: prevAddress });

});

router.post("/validateEmpCredentials", function (req, res) { //accessed (POST REQUEST) via the clock_login.ejs file
  var retAddress = req.body.retAddress;


  MongoClient.connect( //create a database connection
    url,
    function (err, db) {
      if (err) { //if we can't open our server, throw an error
        console.log("Unable to Connect to the Server", err);
      } else {
        console.log("Connection Opened"); //prints to the node.js command prompt

        var query = { employee_id: req.body.username }; //create a query in the collection we need to check
        var query2 = req.body.password;
        var collection = db.collection("employee_login"); //I don't feel like typing the whole thing out 

        collection.find(query, { _id: 0 }).toArray(function (err, results) { //query our collection within our database for any results. I coud limit the information returned from our query. I probably should too...
          if (err) { //If there are any issues with the database, print them to the browser
            console.log(err);
          } else if (results.length) { //SUCCESS ( we have an employee with this ID... )
            //verify the password exists
            if (results[0].employee_pass === query2) { //validates the user's password.  
              var curTime = new Date(); //get the current time



              //CLOCK IN SCRIPT
              //we want to check a flag to see if a user if clocked in
              //if so, clock them out and calculate the time
              if (results[0].employee_clock_status == 0) {//update the time and set the clock bit
                collection.update({ employee_id: req.body.username }, { $set: { employee_clock_status: 1 } }, { multi: true }); //this just sets a flag signify time clock status
                collection.update({ employee_id: req.body.username }, { $set: { employee_time_in: curTime } }, { multi: true });
              }
              else { //otherwise the user is already clocked in and we need to update this value to clock the user out
                //we need to calculate the time the user was clocked in.
                collection.find(query, { _id: 0, employee_time_in: 1, employee_weekly_hours: 1 }).toArray(function (err, results2) { //check for clock in time
                  var before = results2[0].employee_time_in; //get the value stored in the database
                  var diff = Math.abs(curTime - new Date(before)); //subtract original time from current time
                  var total_hours = results2[0].employee_weekly_hours;
                  // change from milliseconds to seconds -> seconds to minutes -> minutes to hours
                  diff = (diff / 60000) / 60;
                  total_hours = diff + total_hours;
                  collection.update({ employee_id: req.body.username }, { $set: { employee_weekly_hours: total_hours } }, { multi: true });
                });
                collection.update({ employee_id: req.body.username }, { $set: { employee_clock_status: 0 } }, { multi: true }); //this just sets a flag to signify time clock status
                collection.update({ employee_id: req.body.username }, { $unset: { employee_time_in: 1 } }, { multi: true }); //removes the previous entry for this field.
              }
              // END OF CLOCK IN SCRIPT 
              res.redirect(retAddress); //return back to the kiosk view we were logged into prior
            }
            else {
              console.log("Login not found");
              res.render("clock_login", { page: "Clock-In", prevAddress: retAddress });
            }
          }
          else { //user not found
            console.log("Login not found");
            res.render("clock_login", { page: "Clock-In", prevAddress: retAddress });
          }
          //db.close(); if i keep this here and we successfully login, I get a warning in the console? idk what other instances of the DB would cause this
          console.log("Connection Closed");
        });
      }
    }
  );
});

/*

FILTERING APPETIZER MENU

*/
//Everything below this is filtering menu
router.get("/guest-appetizers/vegan/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Appetizer" },
          { Active: "yes" },
          { VeganFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-appetizers/vegetarian/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Appetizer" },
          { Active: "yes" },
          { VegetarianFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);//we send an empty list anyways
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-appetizers/spicy/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Appetizer" },
          { Active: "yes" },
          { SpicyFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-appetizers/gf/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Appetizer" },
          { Active: "yes" },
          { GlutenFreeFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          setTimeout(function () {
            res.render("appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});



/*---------------------------------------------------------------
---------------------------------------------------------------
FILTERING ENTREE MENU
---------------------------------------------------------------
*/
//Everything below this is filtering menu
router.get("/guest-entrees/vegan/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Entree" },
          { Active: "yes" },
          { VeganFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-entrees/vegetarian/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Entree" },
          { Active: "yes" },
          { VegetarianFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);//we send an empty list anyways
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-entrees/spicy/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Entree" },
          { Active: "yes" },
          { SpicyFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-entrees/gf/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Entree" },
          { Active: "yes" },
          { GlutenFreeFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          setTimeout(function () {
            res.render("entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});



/*---------------------------------------------------------------
---------------------------------------------------------------
FILTERING KID'S MEAL MENU
---------------------------------------------------------------
-----------------------------------------------------------------*/
router.get("/guest-kids-meals/vegan/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Kids Meal" },
          { Active: "yes" },
          { VeganFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-kids-meals/vegetarian/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Kids Meal" },
          { Active: "yes" },
          { VegetarianFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);//we send an empty list anyways
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-kids-meals/spicy/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Kids Meal" },
          { Active: "yes" },
          { SpicyFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-kids-meals/gf/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Kids Meal" },
          { Active: "yes" },
          { GlutenFreeFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          setTimeout(function () {
            res.render("kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});



/*---------------------------------------------------------------
---------------------------------------------------------------
FILTERING KID'S MEAL MENU
---------------------------------------------------------------
-----------------------------------------------------------------*/
router.get("/guest-desserts/vegan/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Dessert" },
          { Active: "yes" },
          { VeganFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-desserts/vegetarian/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Dessert" },
          { Active: "yes" },
          { VegetarianFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);//we send an empty list anyways
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-desserts/spicy/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Dessert" },
          { Active: "yes" },
          { SpicyFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-desserts/gf/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Dessert" },
          { Active: "yes" },
          { GlutenFreeFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          setTimeout(function () {
            res.render("desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});


/*---------------------------------------------------------------
---------------------------------------------------------------
FILTERING DRINKS MENU
---------------------------------------------------------------
-----------------------------------------------------------------*/
router.get("/guest-drinks/vegan/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Drink" },
          { Active: "yes" },
          { VeganFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-drinks/vegetarian/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Drink" },
          { Active: "yes" },
          { VegetarianFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);//we send an empty list anyways
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-drinks/spicy/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Drink" },
          { Active: "yes" },
          { SpicyFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          console.log("No results! ERROR");
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});
router.get("/guest-drinks/gf/", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Drink" },
          { Active: "yes" },
          { GlutenFreeFlag: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          var dt = new Date();
          var time = dt.getHours();
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {
          setTimeout(function () {
            res.render("drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        console.log("Connection closed with MongoDB Server");
        db.close();
      });
    }
  });
});

router.post("/guest-pay/submit/:order_tax/:order_total/:order_tips/", function (req, res) {

//submits the active order to submited order db
  console.log("HELLO");
  console.log(currentTable + " is submitting their order!");

  MongoClient.connect(
    url,
    function (err, db) {
      if (err) {
        console.log("Unable to connect to the db server");
      }
      else {//attempt making query
        var query = { table: currentTable.toString() };
        var collection = db.collection("submitted_orders");

        collection.find(query).toArray(function (err, results) {
          if (err) {
            console.log(err);
          }
          else if (results.length) {//want to insert the values of the ordered items for the current table to submitted orders
            var t_id = results[0]._id
            console.log('The id is: ' + t_id)
            var t_insert = { table: results[0].table, archivedItems: results[0].orderedItems, tax: req.params.order_tax, total: req.params.order_total, tips: req.params.order_tips, orderID: t_id.toString() };
            //console.log(util.inspect(t_insert, {showHidden:false, depth: null}));

            var t_collection = db.collection("archived_orders");
            t_collection.insert(t_insert, function (err) {
              if (err) {
                console.log(err);
              }
              else {//we want to clear out the current order
                  collection.remove({table: results[0].table, orderedItems: results[0].orderedItems}, {justOne: 1} )
              }
            });
            //need to clear out contents
            //
          }
          else {
            console.log("Should not happen, a table should be instantiated for everyone.");
          }
        });
      }
    }
  );
});
// //DROPPING SUBMITTED ORDER
// // newdb is the database we drop
// var url = "mongodb://localhost:27017/4quad/submitted_orders";
 
// // create a client to mongodb
// var MongoClient = require('mongodb').MongoClient;
 
// // make client connect to mongo service
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     console.log("Connected to Database!");
//     // print database name
//     console.log("db object points to the database : "+ db.submitted_orders);
//     // delete the database
//     db.dropDatabase(function(err, result){
//         console.log("Error : "+err);
//         if (err) throw err;
//         console.log("Operation Success ? "+result);
//         // after all the operations with db, close it.
//         db.close();
//     });
// });

// takeout routes

router.get("/takeout", function (req, res) {
  var dt = new Date();
  var day = dt.getDay();
  var time = dt.getHours();
  var drinks = [];//empty drinks array

  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          for (var j = 0; j < results.length; j++) {
            for (var i = 0; i < results[j].orderedItems.length; i++) {
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      console.log("The current day number is: " + day);
      //attempting and query
      if(day != 0 && day != 6){//if the day is a weekday, then get special 1
        var query = {
          $and: [
            { Category: "Special1" },
            { Active: "yes" }
          ]
        };
      }
      else{//weekend, get special2
        var query = {
          $and: [
            { Category: "Special2" },
            { Active: "yes" }
          ]
        };
      }
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("All drinks are: " + drinks);
          console.log("We are in: /takeout");
          console.log("The current hour is: " + time + typeof time);
          console.log(util.inspect(results, { showHidden: false, depth: null }))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//appetizers
router.get("/takeout-appetizers", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array

  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          for (var j = 0; j < results.length; j++) {
            for (var i = 0; i < results[j].orderedItems.length; i++) {
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
        }
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Appetizer" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /takeout-appetizesr");
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            console.log("All drinks are: " + drinks);
            res.render("takeout/takeout-appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-appetizers", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//entrees
router.get("/takeout-entrees", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          for (var j = 0; j < results.length; j++) {
            for (var i = 0; i < results[j].orderedItems.length; i++) {
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
        }
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Entree" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /takeout-eentrees");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-entrees", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

// kid-meals
router.get("/takeout-kids-meals", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {
            for (var i = 0; i < results[j].orderedItems.length; i++) {
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Kids Meal" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-kids-meals");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-kids-meals", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//for guest desserts
router.get("/takeout-desserts", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Dessert" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-kids-meals");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-desserts", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});

//for guest-drinks
router.get("/takeout-drinks", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {//grabs the menu items
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //attempting and query
      var query = {
        $and: [
          { Category: "Drink" },
          { Active: "yes" }
        ]
      };
      var collection = db.collection("menu_items");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          console.log("We are in: /guest-drinks");
          console.log("All drinks are: " + drinks);
          console.log("The current hour is: " + time + typeof time);
          //console.log(util.inspect(results, {showHidden:false, depth: null}))
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        else {//still need to load page even if all items are not active
          console.log("No results! ERROR");
          console.log("All drinks are: " + drinks);
          setTimeout(function () {//need a timeout otherwise node's asyncrhonous nature messed up loading of drinks
            res.render("takeout/takeout-drinks", { menu_items: results, hour: time, refill: drinks, tablenum: currentTable });
          }, 500);
        }
        db.close();
      });
    }
  });
});


router.get('/takeout-pay', function(req, res, next){
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");
      var query = { table: currentTable };
      var collection = db.collection("submitted_orders");
      console.log("attempting " + query + " " + currentTable);
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//send the object to the page
         
           console.log(results[0].orderedItems[0].price); //this prints the PRICE of a returned result.
           console.log(results);
            //console.log(orderedItems[i].price); //this prints the PRICE of a returned result.
            res.render('takeout/takeout-pay', {order_items: results, tablenum: currentTable});
        }
        else {
          console.log("Menu item not found!");
         // res.render('guest-pay', {order_items: results});
         res.send(404);
        }
        //db.close();     
      });
    }
  });
});

//order
router.get("/takeout-order", function (req, res) {
  var dt = new Date();
  var time = dt.getHours();
  var drinks = [];//empty drinks array
  MongoClient.connect(url, function (err, db) {//grabs the ordered drinks
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Drink connection to server successful");

      var query = { table: currentTable.toString() }
      var collection = db.collection("submitted_orders");
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {//not empty
          //need to find all drinks and put in object
          //results[0].items[i].item
          console.log("The user does have orders, going through " + results.length + " iters");
          console.log(util.inspect(results, { showHidden: false, depth: null }));
          //attempting this fix drinks w/ this
          for (var j = 0; j < results.length; j++) {

            for (var i = 0; i < results[j].orderedItems.length; i++) {
              //console.log("In iter: " + i + " looking for id " + results[0].orderedItems[i].item);
              var t_query = {
                $and: [
                  { Category: "Drink" },
                  { _id: new ObjectId(results[j].orderedItems[i].item) }
                ]
              };
              var t_collection = db.collection("menu_items");
              t_collection.find(t_query).toArray(function (err, drinkResults) {
                if (err) {
                  console.log(err);
                }
                else if (drinkResults.length) {//if is a drink
                  console.log("Is a drink!");
                  //console.log(util.inspect(drinkResults, {showHidden:false, depth: null}));
                  //console.log("Found drink "+drinkResults[0].Name);
                  drinks.push(drinkResults[0].Name);
                }
                else {
                  console.log("Not a drink");
                }
              });
            }
          }
        }
        else {//empty
          //set as empty variable
        }
        //db.close();
      });
    }
  });

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      //var query = {table : currentTable.toString()};
      var query = { table: currentTable.toString() };//, {"_id":0, "table":0};
      var hide = { "_id": 0, "table": 0 };
      console.log(hide)
      var collection = db.collection("active_orders");
      //console.log("attempting " + query + " " + currentTable);
      collection.find(query, hide).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          t_notes = results[0].items
          console.log("T_notes: " + t_notes);
          MongoClient.connect(url, function (err, db) {
            if (err) {
              console.log("Unable to connecto to the MongoDB Server");
            }
            else {
              console.log("Connection established with MongoDB Server");

              console.log("made it here");
              //have to go over array of objects to find items
              //console.log(util.inspect(results, {showHidden:false, depth: null}));
              console.log(results[0]);//.items[0]);
              if (results[0].items.length >= 2) {
                var t_collection = db.collection("menu_items");
                var t_query = [];//creates an empty array to push objects into
                console.log("pushing to query " + results[0].items.length + " times");
                for (var i = 0; i < results[0].items.length; i++) {
                  console.log("pushed " + results[0].items[i].item);
                  t_query.push({ _id: new ObjectId(results[0].items[i].item) })
                }
                //run or query
                t_collection.find({ $or: t_query }).toArray(function (err, results) {
                  if (err) {
                    console.log(err);
                  }
                  else if (results.length) {
                    //console.log("woo, success!");
                    //console.log("length is: " + results.length);
                    //console.log(util.inspect(results, {showHidden:false, depth: null}));
                    //util console log results
                    res.render("takeout/takeout-order", { order_items: results, notes: t_notes, refill: drinks, tablenum: currentTable });
                  }
                  else {
                    //no elements, should not happen
                  }
                  db.close();
                });
              }
              else if (results[0].items.length == 1) {
                console.log("Running single item query");
                //single object
                //console.log(util.inspect(results[0].items[0], {showHidden:false, depth: null}));
                //just the object's item.
                //console.log(util.inspect(results[0].items[0].item, {showHidden:false, depth: null}));

                //run single query
                var t_collection = db.collection("menu_items");
                var t_query = { _id: new ObjectId(results[0].items[0].item) };

                t_collection.find(t_query).toArray(function (err, results) {
                  if (err) {
                    console.log(err);
                  }
                  else if (results.length) {
                    console.log("Got results");
                    res.render("takeout/takeout-order", { order_items: results, notes: t_notes, tablenum: currentTable, refill: drinks })
                  }
                  else {
                    console.log("No results, should not happen.")
                  }
                });
              }
              else {
                //no elements, render empty page
                console.log("Rendering empty order page");
                res.render("takeout/takeout-order", { order_items: [], notes: [], tablenum: currentTable, refill: drinks });
              }
            }
          });
        }
        else {
          console.log("No results! ERROR");

        }
        db.close();
      });
    }
  });
});




module.exports = router;

//example of how to use util.inspect for objects
//console.log(util.inspect(results.items, {showHidden:false, depth: null}));
