var app = require('express')();
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('embed',['member','order'])

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var insertUser = function(req,res){
	var rec = {
		username:"stamp",
		password:"stamp"
	};
	db.member.insert(rec,function(err,docs){
		if(err){
			res.send("0");
		}
		else{
			res.send("1");
		}

	});
};

var findUser = function(req,res){
	db.member.find({username:"stamp"},function(err,docs){
		if(err || docs.length == 0){
			res.send("no result");
		}
		else{
			var arrayKey = [];
			var arrayVal = [];
			docs.forEach(function(rec){
				arrayKey.push(rec.username);
				arrayVal.push(rec.password);
				//console.log(rec.username + " " + rec.password);
			});
			var print = {key1:arrayKey,key2:arrayVal};
			res.send(print);
		}
	});
};

var sendService = function(req,res){
	var uname = req.body.username;
	var rid = req.body.nfcid;
	var datetime = new Date().toLocaleString();

	db.order.findOne({username:uname,nfcid:rid,status:"fail"},function(err,docs){
		if(err || !docs){
			res.send("wtf");
		}
		else{
			res.send("yessss");
		}
	});
};

var getHomePage = function(req,res) {
	res.send('test /');
};

app.post('/api/test',function(req,res){
	var test1 = req.body.id;

	res.send('your data is ' + test1);
})

app.post('/api/check_send',sendService);

app.get('/',getHomePage);
app.get('/insertdb',insertUser);
app.get('/finddb',findUser);

app.listen(process.env.PORT || 3000,function() {
	console.log('Starting node.js on port' + process.env.PORT);
});