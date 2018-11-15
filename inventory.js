var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");

var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/4quad";

MongoClient.connect(url, function (err, db)
{
    if (err) throw err;
    var dbo = db.db("mydb");

    var inventory = [
        { _id: 1, name: 'orange juice', quantity: 100},
        { _id: 2, name: 'apple juice', quantity: 100}, 
        { _id: 3, name: 'milk', quantity: 100},
        { _id: 4, name: 'coffee beans', quantity: 100}, 
        { _id: 5, name: 'lemonade', quantity: 100},
        { _id: 6, name: 'iced tea', quantity: 100}, 
        { _id: 7, name: 'coke', quantity: 100},
        { _id: 8, name: 'sprite', quantity: 100}, 
        { _id: 9, name: 'dr. pepper', quantity: 100},
        { _id: 10, name: 'fanta', quantity: 100},
        { _id: 11, name: 'water', quantity: 100},
        { _id: 12, name: 'almond milk', quantity: 100},
        { _id: 13, name: 'soy milk', quantity: 100},
        { _id: 14, name: 'pancakes', quantity: 100},
        { _id: 15, name: 'waffles', quantity: 100},
        { _id: 16, name: 'french toast', quantity: 100}, 
        { _id: 17, name: 'biscuits', quantity: 100},
        { _id: 18, name: 'potatoes', quantity: 100}, 
        { _id: 19, name: 'strawberries', quantity: 100},
        { _id: 20, name: 'pineapples', quantity: 100},
        { _id: 21, name: 'blueberries', quantity: 100},
        { _id: 22, name: 'apples', quantity: 100}, 
        { _id: 23, name: 'bananas', quantity: 100},
        { _id: 24, name: 'chicken', quantity: 100}, 
        { _id: 25, name: 'bacon', quantity: 100},
        { _id: 26, name: 'cinnamon', quantity: 100}, 
        { _id: 27, name: 'greek yogurt', quantity: 100},
        { _id: 28, name: 'eggs', quantity: 100}, 
        { _id: 29, name: 'oats', quantity: 100},
        { _id: 30, name: 'chocolate', quantity: 100}, 
        { _id: 31, name: 'chocolate chips', quantity: 100},
        { _id: 32, name: 'bread', quantity: 100},
        { _id: 33, name: 'whipped cream', quantity: 100},
        { _id: 34, name: 'butter', quantity: 100}, 
        { _id: 35, name: 'syrup', quantity: 100},
        { _id: 36, name: 'sugar', quantity: 100}, 
        { _id: 37, name: 'tomatoes', quantity: 100},
        { _id: 38, name: 'english muffins', quantity: 100},
        { _id: 39, name: 'spinach', quantity: 100},
        { _id: 40, name: 'mushrooms', quantity: 100}, 
        { _id: 41, name: 'avocado', quantity: 100},
        { _id: 42, name: 'sausage', quantity: 100}, 
        { _id: 43, name: 'ham', quantity: 100},
        { _id: 44, name: 'onions', quantity: 100},
        { _id: 45, name: 'chorizo', quantity: 100},
        { _id: 46, name: 'red peppers', quantity: 100}, 
        { _id: 47, name: 'green peppers', quantity: 100},
        { _id: 48, name: 'black beans', quantity: 100}, 
        { _id: 49, name: 'tortillas', quantity: 100},
        { _id: 50, name: 'pork', quantity: 100}, 
        { _id: 51, name: 'nutella', quantity: 100},
        { _id: 52, name: 'walnuts', quantity: 100},
        { _id: 53, name: 'coconut', quantity: 100},
        { _id: 54, name: 'currants cranberries', quantity: 100}, 
        { _id: 55, name: 'acai', quantity: 100},
        { _id: 56, name: 'blackberries', quantity: 100}, 
        { _id: 57, name: 'gronola', quantity: 100},
        { _id: 58, name: 'lemon juice', quantity: 100},
        { _id: 59, name: 'pineapple mango juice', quantity: 100}    
    ];

        dbo.collection("items").insertMany(inventory, function(err, res) {
            if (err) throw err;
            console.log("Number of items inserted: " + res.insertedCount);
            db.close();
    });
});
