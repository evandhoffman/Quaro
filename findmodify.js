// Testing findAndModify syntax with mongoskin.

var eyes = require('eyes');
var mongo = require('mongoskin');
var ObjectID = require('mongodb/lib/mongodb/bson/bson').ObjectID
var db = mongo.db('localhost:27017/questions');

for (var i = 0; i < 10; i++) {
db.collection('counters').findAndModify(
	{_id:'questions'}, 
	[],
	{$inc : {next: 1}},
	true, 
	true,
	function(err, result) {
		if (err) { throw new Error(err); }
		eyes.inspect(result.next);
	}
);
}
