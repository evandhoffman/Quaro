// Testing findAndModify syntax with mongoskin.

var mongo = require('mongoskin');
var ObjectID = require('mongodb/lib/mongodb/bson/bson').ObjectID
var db = mongo.db('localhost:27017/questions');

db.collection('counters').findAndModify(
	{_id:'questions'}, 
	[],
	{$inc : {next: 1}},
	true, 
	true,
	function(err, result) {
		console.log(err, result);
	}
);
