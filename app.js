const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
const http = require('http');
const fs = require('fs');

var app = express();

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//set static path
//app.use(express.static(path.join(__dirname, 'public')));

//global vars
app.use(function(req, res, next){
	res.locals.errors = null;
	next();
});

//express validator middleware for error formatting
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

//to pass-in users
var users = [
{
	id: 1,
	first_name: 'John',
	last_name: 'Doe',
	email: 'johndoe@gmail.com'
},
{
	id: 2,
	first_name: 'Jillian',
	last_name: 'Hare',
	email: 'JillHare@gmail.com'
}]

app.get('/', function(req, res){
	//res.send('Hello world');
	//res.render('index');//send in .html or .ejs file
	res.render('index', {
		title: 'Customers',//pass in a variable named title that is 'customers'
		users: users,//pass in an array of users named users
		errors: errors
	});
});

app.post('/users/add', function(req, res){
	req.checkBody('first_name', 'First Name is Required').notEmpty();
	req.checkBody('last_name', 'Last Name is Required').notEmpty();
	req.checkBody('email', 'Email is Required').notEmpty();
	
	errors = req.validationErrors();

	if(errors){
		console.log('Error');
		res.render('index', {
			title: 'Customers',//pass in a variable named title that is 'customers'
			users: users,//pass in an array of users named users
			errors: errors
		});
	}
	else{
		
		var newUser = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email
		}

		console.log('User submitted!');	
	}
})

app.listen(3000, function(){
	console.log('Server started on port 3000');

});
/*
const hostname = '127.0.0.1';
const port = 3000;

fs.readFile('index.html', (err, html) => {
	if(err){
		throw err;
	}

	const server = http.createServer((req, res) => {
		res.statusCode = 200;
		res.setHeader('Content-type', 'text/html');
		res.write(html);
		res.end();
	});

	server.listen(port, hostname, () => {
		console.log('Server started on port ' + port);
	});	
});*/


/*
var logger = function(req, res, next){
	console.log('Logging...');
	next();
}
app.use(logger);
*/
