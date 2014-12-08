//Boilerplate:
var express = require('express');
var pg = require('pg');
var models = require("./models/index.js");
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
//var request = require('request');

//Authentication: 
var passport = require("passport"),
    localStrategy = require("passport-local").Strategy,
    flash = require('connect-flash'),
    session = require("cookie-session");

//APP
var app = express();

//Middleware:
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(methodOverride("_method"));


//Authentication:
app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  maxage: 3600000
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    models.User.find({
        where: {
            id: id
        }
    }).done(function(error,user){
        done(error, user);
    });
});

//------
//Routes:

//Read 
app.get('/', function(req, res){
	models.User.findAll().success(function(users){
		res.render('index', {
			userData: users
		});
	});
});

//Create //Using modal instead. Not being used.   
app.get('/new', function(req, res){
	res.render('new');
});

//Create
app.post("/new", function(req, res){
	models.User.createNewUser({
		//Need to install body-parser to use req.body.
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.username,
		age: req.body.age,
		password: req.body.password
	}, function(){
		res.redirect("/");
	});
	// .success(function(data){
	// 	res.redirect("/"); 
	// }); //Moved this to user model. 
});

//Edit
app.get('/edit/:id', function(req, res){
	if (req.isAuthenticated()){
	models.User.find(req.params.id).success(function(user) {
    	res.render("edit", {
        	userInfo: user
    	});
	});
	}else {
		res.redirect('/login');
	}
});

//Update
app.put('/users/:id', function(req, res){
	models.User.find(req.params.id).success(function(user) {
    	user.updateAttributes({
       		first_name:req.body.first_name,
        	last_name:req.body.last_name,
        	username:req.body.username,
        	age:req.body.age
    	}).success(function() {
        	res.redirect("/");
   		});
	});
});

//Destroy
app.delete("/users/:id", function(req, res) {
    models.User.find(req.params.id).success(function(user) {
    	user.destroy().success(function() {
        	res.redirect("/");
    	});
	});
});

//Login
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}));

app.get('/login', function(req, res){
	res.render('login');
});

//Logout 
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});	

//Server
var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("Server listening at http://%s:%s", host, port);
});
