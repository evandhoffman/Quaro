// Node tutorial: http://dailyjs.com/2010/11/15/node-tutorial-3/
// Jade basics: http://www.screenr.com/vV0

/**
 * Module dependencies.
 */

var express = require('express');

var eyes = require('eyes');

var app = module.exports = express.createServer();

var mongo = require('mongoskin');
var db = mongo.db('localhost:27017/questions');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.logger());
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

// List
app.get('/questions', function(req, res) {
	db.collection('questions').find().toArray(function(err, results) {
		if (err) new Error(err);
	//	eyes.inspect(results);
		res.render('list', {
			title: 'Question List',
			questions: (results)
		
		});
	});
			
});

// tagsearch
app.get('/tags/:tag.:format?', function(req, res) {
	db.collection('questions').find({tags: req.params.tag}).toArray(function(err, results) {
		if (err) new Error(err);
	//	eyes.inspect(results);
		res.render('taglist', {
			title: 'Tag List',
			questions: (results)
		
		});
	});
			
});

// Create
app.post('/question.:format?', function(req, res) {
});

// Read
app.get('/question/:id.:format?', function(req, res) {
});

// Update
app.put('/question/:id.:format?', function(req, res) {
});

// Delete
app.del('/question/:id.:format?', function(req, res) {
});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
