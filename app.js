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
//var ObjectID = require('mongodb').ObjectID;
var ObjectID = require('mongodb/lib/mongodb/bson/bson').ObjectID
var db = mongo.db('localhost:27017/questions');

// Helpers
var strip = function(str) {
	return str.replace(/^(\s*)((\S+\s*?)*)(\s*)$/,"$2");
};

var tagify = function(str) {
	return strip(str).toLowerCase().replace(/'/g,'').replace(/[^a-zA-Z0-9]+/g,'-');
};


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
		res.render('list', {
			title: 'Questions tagged "'+req.params.tag+'"',
			questions: (results)
		
		});
	});
			
});

app.get('/question/new.:format?', function(req, res) {
	res.render('addquestion', {
		title: "Add a new question"
	});
});



// Create
app.post('/question.:format?', function(req, res) {
	// In a POST the params are in the req.body, not req.params.
	var tags = [];
	var tagCount = {};
	if (req.body.tags.replace(/\s/,'').length > 0) {
		tags = req.body.tags.split(',');
	}
	// Strip leading/trailing whitespace from each tag.
	for (var i = tags.length-1 ; i >= 0 ; i--) { // iterate backwards so splice() works
		tags[i] = tagify(tags[i]);
		if (tags[i].length == 0) {
			tags.splice(i,1);
		} else {
			tagCount[tags[i]] = 1;
		}
	}

	eyes.inspect(tagCount);
	var ins = { date: new Date(),
		author: req.body.author, body: req.body.body,
		tags: tags, tag_count: tagCount,
		answers: [], votes: 0
		};
//	res.send(JSON.stringify(ins));
	db.collection('questions').insert(ins, {});
	res.end('Added new question: '+req.body.body);
});

// Read
app.get('/question/:id.:format?', function(req, res) {
//	eyes.inspect(req.params.id);
//	var find = {_id: ObjectID(req.params.id)};
//	eyes.inspect(find);
	db.collection('questions').find({_id: ObjectID.createFromHexString(req.params.id)}).toArray(function(err, results) {
		if (err) new Error(err);
		eyes.inspect(results);
		res.render('question', {
			title: 'Question #'+req.params.id,
			question: results[0]
		
		});
	});

});

// Update
app.put('/question/:id.:format?', function(req, res) {
});

// Delete
app.del('/question/:id.:format?', function(req, res) {
});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
