var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");

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
      let proj = { _id: 0, tableNum: 1}

      db.collection("service_requests").find({}, proj ).toArray(function(err, result) {
        if (err) throw err;
        serviceRequests = result;
        res.render("waitstaff", { page: "Waitstaff View", serviceReqs: serviceRequests });
        db.close();
      });
    }
  })
})


// Terminal View for Kitchen Staff
router.get("/kitchenstaff", function (req, res) {
  res.render("kitchenstaff", { page: "Kitchen Staff View" });
});

// Terminal View for Management
router.get("/manager", function (req, res) {
  res.render("manager", { page: "Management View" });
});

// Terminal View for Guests
<<<<<<< HEAD
router.get("/guest", function (req, res) {
  res.render("guest", { page: "Guest View" });
});

router.post("/validateCredentials", function (req, res) {
  
  MongoClient.connect(
    url,
=======
>>>>>>> waitstaff-ag
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
<<<<<<< HEAD
              let tblNumber = req.body.username.replace("table", "");
              res.render("guest", { page: "", tablenum: tblNumber });
=======
              res.redirect("/guest");
>>>>>>> waitstaff-ag
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
