var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");
var ObjectId = require('mongodb').ObjectId;

var currentTable = ""//is null b.c no table set.

var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/4quad";

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
          collectionID = new ObjectId(results[0]._id); //returns the element ID of a 
          //we have the ID, now we need to update our array by unsetting the value that matches.
          collection.update(
            { _id: collectionID },
            { $pull: { 'items': { item: req.params.item_name, notes: req.params.item_description } }, }, function (err, result) {
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
          collectionID = new ObjectId(results[0]._id); //returns the element ID of a 
          //we have the ID, now we need to update our array by unsetting the value that matches.
          collection.update( //remove the old value
            { _id: collectionID },
            { $pull: { 'items': { item: req.params.item_name, notes: req.params.item_description } }, });

          collection.update(
            { _id: collectionID }, //insert our new value
            { $push: { 'items': { item: req.params.item_name, notes: newDescription } }, });
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
  res.render("kitchenstaff", { page: "Kitchen Staff View" });
});

// Terminal View for Management
router.get("/manager", function (req, res) {
  res.render("manager", { page: "Management View" });
});

// Terminal View for Guests
router.get("/guest", function (req, res) {
  console.log("accessing guest index page, table " + req.body.tablenum);
  res.render("guest", { page: "Guest View", tablenum: req.body.tablenum });
});

//appetizers
router.get("/guest-appetizers", function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      var query = { Category: "Appetizer" };
      var collection = db.collection("menu_items");
      console.log("attempting " + query);
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          res.render("appetizers", { menu_items: results });
        }
        else {
          console.log("No results! ERROR");
        }
        db.close();
      });
    }
  });
});

//games
router.get("/guest-games", function (req, res) {
  res.render("guest-games");
});

//order
router.get("/guest-order", function (req, res) {
  //res.render("guest-order");
  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Unable to Connect to the MongoDB Server");
    }
    else {
      console.log("Connection established with MongoDB Server");

      var query = { table: currentTable };
      var collection = db.collection("active_orders");
      console.log("attempting " + query + " " + currentTable);
      collection.find(query).toArray(function (err, results) {
        if (err) {
          console.log(err);
        }
        else if (results.length) {
          //want to send info to db
          res.render("guest-order", { order_items: results });
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

  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
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

router.post("/submitToOrder/:objId/:notes", function (req, res) {
  console.log("Trying to submit to order with menu_items.objId " + req.params.objId +
    " and notes as " + req.params.notes);

  var MongoClient = mongodb.MongoClient;
  var url = "mongodb://localhost:27017/4quad";
  MongoClient.connect(
    url,
    function (err, db) {
      if (err) {
        console.log("Unable to connect to the Server");
      }
      else {
        console.log("Connection established");
        //var objID = new ObjectId(req.params.objId);
        var itemId = req.params.objId
        var query = { table: currentTable.toString() };
        var collection = db.collection("active_orders");
        var newvalues = { $push: { items: { item: itemId, notes: req.params.notes } } };

        console.log("Running the query collection.update(table: " + currentTable.toString()
          + " $push: {items: {item: " + itemId + ", notes: " + req.params.notes);
        var itemId = req.params.objId
        var query = { table: currentTable.toString() };
        var collection = db.collection("active_orders");
        var newvalues = { $push: { items: { item: itemId, notes: req.params.notes } } };
        collection.update(query, newvalues, function (err, res) {
          if (err) throw err;
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
              let tblNumber = req.body.username.replace("table", "");
              res.render("guest", { page: "", tablenum: tblNumber });
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

module.exports = router;
