var app = require('express')();
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('embed',['member','order','counter'])

app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
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





var getHomePage = function(req,res){
	res.render("../index.html");
	//res.send("test ja");
};

var formMember = function(req,res){
	//res.render("../forminsertmember.html");
	res.render("../forminsertmember");
};

var reqMember = function(req,res){
	//res.send("1111111");
	//console.log(req.body.username);

	var username_req_ins = req.body.username;
	var pass_req_ins = req.body.password;

	var rec = {
		username:username_req_ins,
		password:pass_req_ins
	};

	db.member.findOne({username:username_req_ins},function(err,docs){
		if(err) {
			res.send("error to find");
		}
		else if(docs){
			res.send("this username already used");
		}
		else{
			db.member.insert(rec,function(err){
				if(err){
					res.send("error to insert");
				}
				else{
					res.send("success");
				}
			});
		}
	});

};

var formOrder = function(req,res){
	res.render("../forminsertorder");
};

var reqOrder = function(req,res){


	db.member.findOne({username:req.body.username},function(err,doc){
		if(err){
			res.send("error to check");
		}
		else if(doc){
			db.counter.findAndModify({
				query:{_id:"userid"},
				update:{$inc:{seq:1}},
				new: true
			},function(err2,doc2,lastErrorObject){
				var rec = {
					username:req.body.username,
					order:doc2.seq,
					//tag:"0ab2d5e5",
					tag:req.body.tag,
					status:"fail",
					datetime:"01/01/1970, 1:00:00 AM"
				};

				db.order.insert(rec,function(err3){
					if(err3){
						res.send("fail to insert");
					}
					else{
						res.send("success");
					}
				});

			});
		}
		else{
			res.send("can't found ur username");
		}
	});
};

var insertOrder = function(req,res){

		db.counter.findAndModify(
			{
				query:{_id:"userid"},
				update:{$inc:{seq:1}},
				new: true
			}
		,function(err,doc,lastErrorObject){
			var rec = {
				username:"stamp",
				order:doc.seq,
				tag:"0ab2d5e5",
				status:"fail",
				datetime:"01/01/1970, 1:00:00 AM"
			};
				db.order.insert(rec,function(err){
					if(err){
						res.send("fail");
					}
					else{
						res.send("success");
					}
				});
			});
};

var postmanService = function(req,res){
	var username_req = req.body.username;
	var pass_req = req.body.pass;

	db.member.findOne({username:username_req,password:pass_req},function(err,docs){
		if(err || !docs){
			res.send("0");
		}
		else{
			res.send("1");
		}
	});
};

var orderService = function(req,res){
	var username_req = req.body.username;

	db.order.find({username:username_req},function(err,docs){
		if(err || docs.length == 0){
			res.send("no result");
		}
		else{
			var arrayRe = [];
			docs.forEach(function(rec){
				var each_rec = {};
				if(rec.status == "fail"){
					each_rec.order = rec.order;
					each_rec.status = rec.status;
				}
				else{
					each_rec.order = rec.order;
					each_rec.status = rec.status;
					each_rec.datetime = rec.datetime;
				}
				arrayRe.push(each_rec);
			});
			res.send(arrayRe);
		}
	});
};

var sendService = function(req,res){
	var order_req = parseInt(req.body.order);
	var tag_req = req.body.tag;
	var datetime_forsave = new Date().toLocaleString();

	db.order.findOne({order:order_req,tag:tag_req,status:"fail"},function(err,doc){
		if(err || !doc){
			res.send("fail");
		}
		else{
			db.order.save({_id:doc._id,username:doc.username,order:order_req,tag:doc.tag,status:"success",datetime:datetime_forsave});
			res.send("success");
		}
	});
};



app.get('/',getHomePage);
app.get('/index',getHomePage);
app.get('/forminsertmember',formMember);
app.post('/reqinsertmember',reqMember);
app.get('/forminsertorder',formOrder);
app.post('/reqinsertorder',reqOrder);
app.get('/insertorder',insertOrder);
app.get('/finddb',findUser);
app.post('/api/test',function(req,res){
	var test1 = req.body.id;

	res.send('your data is ' + test1);
})
app.post('/api/check_send',sendService);
app.post('/api/check_postman',postmanService);
app.post('/api/check_order',orderService);

app.set('port',process.env.port || 8080);
app.listen(app.get('port'),function() {
	console.log('Starting node.js on port ' + app.get('port'));
});