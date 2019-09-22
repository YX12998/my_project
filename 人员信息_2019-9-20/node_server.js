var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require("mysql");
const querystring = require('querystring');
var url = require('url');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: false
}));

var multer  = require('multer'); // 文件上传
app.use(multer({ dest: '/tmp/'}).any()); // 接受任何类型

app.use('/temp', express.static('temp')); // 静态资源

app.get('/',function(req,res){
	res.sendFile(__dirname+"/"+"index.html");
});


const connection = mysql.createConnection({
	host: "localhost", // 主机地址
	pott: 3306,
	user: "root", // 数据库用户密码
	password: "", // |数据库用户密码
	database: "xin", // 数据库名
	multipleStatements: true,
});
connection.connect(); // 链接数据库

// 增加
app.post("/newPerson", function(request, respon) {
	// console.info(request.files[0].originalname);
	if(!request.files[0].originalname){
		return;
	}
	// 处理上传的文件
	// 容错: 
	let filePath = "01.jpg";
	if( request.files || request.files.length > 0 ){
		filePath =  new Date().getTime() + "-" + request.files[0].originalname;
		let des_file = __dirname + "/temp/" + filePath;
		console.info(filePath);
		fs.readFile(request.files[0].path, function(err, data) {
			fs.writeFile(des_file, data, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.info("文件保存成功");
				}
			});
		});
		
	}
	
	
	console.info(request.body);
	var username = request.body.userName;
	var userage = request.body.userAge;
	var usernumber = request.body.userNumber;
	var useradress = request.body.userAdd;
	var discribe = request.body.discribe;
	var checkedNames = request.body.checkedNames;
	var img = filePath;
	// 查询数据库
	var sqlString = 'insert into user(userName,userAge,userNumber,userAdd,discribe,checkedNames,img) values("'+username+'","'+userage+'","'+usernumber+'","'+useradress+'","'+discribe+'","'+checkedNames+'","'+img+'"); ';
	connection.query(sqlString, function(err, result, file) {
		respon.json(result);
	});


});

// 搜索
app.post("/getPersonByName", function(request, respon) {
	_username = request.body.username;
	console.info(request.body);
	connection.query('select * from user where userName = "' + _username + '"limit 1', function(error, results,fields) {
		
		if (error) {
			throw error;
		} else {
			// console.info(results[0]);
			respon.json(results[0]);
		}
	});
});

// 修改
app.post("/upPerson", function(request, respon) {
	
	console.info(request.body);
	var username = request.body.userName;
	var userage = request.body.userAge;
	var usernumber = request.body.userNumber;
	var useradress = request.body.userAdd;
	var discribe = request.body.discribe;
	var checkedNames = request.body.checkedNames;
	// var img = filePath;
	// 查询数据库
	// update user set userName="aa", userAge="1",userNumber="33",userAdd="44",discribe="55",checkedNames="66" where userId=2;
	
	var sqlString = 'update user set userName="'+username+'", userAge="'+userage+'",userNumber="'+usernumber+'",userAdd="'+useradress+'",discribe="'+discribe+'",checkedNames="'+checkedNames+'" where img="'+request.body.img+'";';
	connection.query(sqlString, function(err, result, file) {});
	

});

// 获取全部person信息
app.get("/searchUser", function(request, respon) {
	connection.query('select * from user', function(error, results, fields) {
		if (error) {
			throw error;
		} else {
			// console.info(results);
			respon.json(results);
		}
	});

});



// 模糊查询user
app.get("/searchperson", function(request, respon) {
	var queryObj = url.parse(request.url, true).query;
	console.info(queryObj);
	if( !queryObj  || !queryObj.pName){
		
		respon.json({
			status: "no",
			data: {
				info: "无输入"
			}
		});
		return;
	}
	
	connection.query(" select userName, userId from user where userName like '%"+ queryObj.pName  +"%'", function( error, results,fields) {
		if(error){
			throw error;
		}else{
			respon.json({
				status: "ok",
				data: {
					likePersons: results
				}
			});
		}

	});
});




app.listen(7777);