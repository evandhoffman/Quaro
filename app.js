// Node tutorial: http://dailyjs.com/2010/11/15/node-tutorial-3/
// Jade basics: http://www.screenr.com/vV0
// Form stuff: http://japhr.blogspot.com/2010/08/jade-templating.html

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

// Search
app.get('/search', function(req, res) {
	var regex = new RegExp(req.query.query, "i");
	db.collection('questions').find({ $or : 
		[ 
			{ body : { $regex : regex}}, 
			{ tags: { $regex : regex}} 
		] }).sort({ votes : -1 }).toArray(function(err, results) {
		if (err) new Error(err);
	//	eyes.inspect(results);
		res.render('list', {
			title: "Search result for "+ req.query.query,
			questions: (results)
		
		});
	});
			
});

// List
app.get('/questions', function(req, res) {
	db.collection('questions').find().sort().toArray(function(err, results) {
		if (err) new Error(err);
		if (results.length == 0) {
			console.log('no results');
		}
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

app.get('/question/new.:format?', function(req, res) {
	res.render('addquestion', {
		title: "Add a new question"
	});
});

var strip = function(str) {
//	return str.replace(/^(\s*?)(\.+)(\s*?)/,"$2");
	return str.replace(/^(\s*)(.+)/,"$2").replace(/(([\w]+ )+(\w+))(\s*)/,"$1");
}

// Create
app.post('/question.:format?', function(req, res) {
	// In a POST the params are in the req.body, not req.params.
//	eyes.inspect(req.body);
	var tags = [];
	if (req.body.tags.replace(/\s/,'').length > 0) {
		tags = req.body.tags.split(',');
	}
	for (var i = 0 ; i < tags.length ; i++) {
		// Strip leading/trailing whitespace from each tag.
		tags[i] = strip(tags[i]);
	}
	eyes.inspect(tags);
	var ins = { date: new Date(),
		author: req.body.author, body: req.body.body,
		tags: tags, answers: [], votes: 0 };
//	res.send(JSON.stringify(ins));
	db.collection('questions').insert(ins, {});
	res.end('Added new question: '+req.body.body);
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
