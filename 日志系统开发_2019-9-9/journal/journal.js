var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require("mysql");

var app = express()
app.use(cookieParser())


// 引入登录校验
var checeklogin = require('./logincheck');

const hour = 1000 * 60 * 60;
const connection = mysql.createConnection({
	host: "localhost", // 主机地址
	pott: 3306,
	user: "root", // 数据库用户密码
	password: "", // |数据库用户密码
	database: "boke", // 数据库名
	multipleStatements: true,
});
connection.connect(); // 链接数据库
console.log('引入数据库成功');

app.use('/Web', express.static('Web')); // 静态资源
app.use(bodyParser.urlencoded({
	extended: false
}));

// 设置密钥
var sessionOpts = {
	secret: 'a cool secret', // 设置密钥
	resave: true,
	saveUninitialized: true,
	key: 'myapp_sid', // 设置会话cookie名, 默认是connect.sid

	cookie: {
		maxAge: hour * 2,
		secure: false
	}
}

app.use(session(sessionOpts));

// filter 
// 前端校验  // 监听一个请求,将校验的结果返回给前端
app.get('/checkelogin', function(req, res) {
	console.log(checeklogin.checeklogin(req));
	if (checeklogin.checeklogin(req)) {
		res.json({
			"ok": true
		});
	} else {
		res.json({
			"ok": false
		});
	}
})


// 修改成权限页面
app.get('/', function(req, res) {
	// 验证登录状态
	var sess = req.session;
	// 拦截 权限
	if (!checeklogin.checeklogin(req)) {
		res.sendFile(__dirname + "/Web/login.html");
	} else {
		res.setHeader('Content-Type', 'text/html;charset=utf-8');
		res.write('<p>欢迎您:' + sess.userName + '已经登录' + '</p>')
		res.end();
	}

})

// 获得日志信息
app.get("/journal", function(req, res) {
	// 查询数据库
	var sqlString = 'select * from journal';
	connection.query(sqlString, function(err, result, file) {
		if (err) {
			res.json("未找到");
		} else {
			var a = [];
			for (var i = 0; i < result.length; i++) {
				if (result[i].private1 == 'false') {
					if (result[i].private1 == 'false') {
						result[i].private1 = '公开';
					} else {
						result[i].private1 = '私密';
					}
					a[i] = '<tr><th scope="row">' + result[i].articleId + '</th><td>' + result[i].title + '</td><td>' + result[i].author +
						'</td><td>' + result[i].good + '</td><td>' + result[i].private1 +
						'</td><td>' + '<button class="btn btn-success examine">' + '查看' + '</button>' + '</td></tr>'
				}

			}
			res.json(a);
		};
	})
	// res.json({});
})

// 判断vip
app.get("/pdVip", function(req, res) {
	var sqlString = 'select * from vip where userName="' + username + '"';
	connection.query(sqlString, function(err, result, file) {
		if (err) {
			throw err;
			console.info(err);
			// res.json({
			// 	"ok": false
			// })
		} else {
			console.info(result);
			if (result.length > 0) {
				res.json({
					"ok": true
				})
			} else {
				res.json({
					"ok": false
				})
			}
		}
	})
});

// vip私密日志
app.get("/vip", function(req, res) {
	// 查询数据库
	var sqlString = 'select * from journal';
	connection.query(sqlString, function(err, result, file) {
		if (err) {
			res.json("未找到");
		} else {
			var a = [];
			for (var i = 0; i < result.length; i++) {
				if (result[i].private1 == 'false') {
					result[i].private1 = '公开';
				} else {
					result[i].private1 = '私密';
				}
				a[i] = '<tr><th scope="row">' + result[i].articleId + '</th><td>' + result[i].title + '</td><td>' + result[i].author +
					'</td><td>' + result[i].good + '</td><td>' + result[i].private1 +
					'</td><td>' + '<button class="btn btn-success examine">' + '查看' + '</button>' + '</td></tr>'

			}
			res.json(a);
		};
	})
})



// 个人获得日志信息
app.get("/journal2", function(req, res) {
	// 查询数据库
	var sqlString = 'select * from journal';
	connection.query(sqlString, function(err, result, file) {
		if (err) {
			res.json("未找到");
		} else {
			var a = [];
			for (var i = 0; i < result.length; i++) {
				if (result[i].private1 == 'false') {
					result[i].private1 = '公开';
				} else {
					result[i].private1 = '私密';
				}
				if (result[i].author == username) {
					a[i] = "<tr><td class='y'>" + result[i].articleId + '</td><td>' + result[i].author + '</td><td>' + result[i].private1 +
						'</td><td>' + result[i].title + '<td><button class="btn btn-success examine">' + '查看' + '</button>&nbsp;' +
						'<button class="btn btn-info updata">' + '编辑' + '</button>&nbsp;' +
						'<button class="btn btn-danger delete">' + '删除' + '</button></td></tr >';
				}
			}
			res.json(a);
		};
	})
	// res.json({});
});

// 从个人列表删除文章
app.post('/deleteArticle', function(req, res) {
	number = req.body.articleId;
	connection.query('delete from journal where articleId=' + number, function(err, result) {
		if (err) {
			res.json({
				"ok": false,
				"info": "此文章不存在"
			});
		} else {
			if (result.affectedRows > 0) {
				res.json({
					"ok": true,
					"info": "删除成功"
				});
			} else {
				res.json({
					"ok": false,
					"info": "此文章不存在"
				});
			}
		}
	});
});


// 储存点击查看文章按钮时从前台传过来的文章id
app.post("/seeing", function(req, res) {
	articleid = req.body.id;
	// 查询数据库
	var sqlString = 'select * from journal';
	connection.query(sqlString, function(err, result, file) {
		if (err) {
			res.json("未找到");
		} else {
			for (var i = 0; i < result.length; i++) {
				if (result[i].articleId == articleid) {
					console.info("------");
					res.json(result[i].article);
					// res.jaon(articleid) // 把文章id
				}
			}
		};
	})
	// res.json({});
})

// get当前日志的数据
app.get("/see", function(req, res) {
	//console.info(articleid); // 点击查看文章按钮时从前台传过来的文章id
	// 查询数据库
	var sqlString = 'select * from journal';
	connection.query(sqlString, function(err, result, file) {
		console.info(result);
		if (err) {
			res.json("未找到");
		} else {
			for (var i = 0; i < result.length; i++) {
				if (result[i].articleId == articleid) {
					res.json(result[i]);
				}

			}
		};
	})
	// res.json({});
})

// // 新增评论
app.post("/subComment", function(req, res) {
	
	console.log(req.body);
	var add = 'insert into comment(userName,title,userId,journalId,comments,times) values("' + req.body.userName + '","' +
		req.body.title + '","' + req.body.userId + '","' + articleid + '","' + req.body.comments + '","' + req.body
		.times + '")';
	console.info(add);
	connection.query(add,
		function(error, results, fields) {
			if (error) {
				res.json({
					"ok": false
				});
			} else {
				res.json({
					"ok": true
				});
			}
		})
})

// 显示评论
app.get("/showComments", function(req, res) {
	console.info("进入显示评论");
	// 查询数据库
	

	var sqlString = 'select * from comment where journalId='+articleid;
	connection.query(sqlString, function(err, result, file) {
		if (err) {
			res.json("未找到");
		} else {
			
			var a = [];
			for (var i = 0; i < result.length; i++) {

				a[i] = '<tr><th>' + result[i].Id + '</th><th>' + result[i].userName + '</th><th scope="row">' + result[i].comments +
					'</th><td>' + result[i].times +
					'</td><td><button class="btn btn-success examine">' + '查看' + '</button></td></tr>';

			}
			res.json(a);
		};
	})
	// res.json({});
});

// 点击查看评论按钮查时从前台返回评论人id
app.post("/postCommentId", function(req, res) {
	CommentId = req.body.CommentId;
})
// get看当前评论信息
app.get("/queryComment", function(req, res) {
	var sqlString = 'select * from comment where Id=' + CommentId;
	console.info(sqlString);
	connection.query(sqlString, function(err, result) {
		if (err) {
			res.json("未找到");
		} else {
			console.info(result);
			res.json(result[0]);
		}
	})
});

// 处理登录
app.post("/login", function(req, res) {
	username = req.body.userName;
	console.info(req.body); // console.info(req.body);
	// 查询数据库, 看看用户名和密码是否匹配	 
	var sqlString = 'select * from user where userName = "' + req.body.userName + '"and userPassword="' + req.body.userPassword +
		'" limit 1';
	connection.query(sqlString, function(err, result) {

		if (err) {
			res.json({
				"ok": false
			});
		} else if (result <= 0) {
			res.json({
				"ok": false
			});
		} else {
			// 登录成功,要改session
			userId = result[0].userId;
			var sess = req.session;
			sess.userName = req.body.userName;
			res.json({
				"ok": true,

			});

		};
	})
	//res.json({});
})

// 返回登录用户名
app.get("/username", function(req, res) {
	if (username) {
		res.json(username);
	} else {
		res.json("未登录");
	}
});

// 返回登录id
app.get("/userId", function(req, res) {
	console.info(userId);
	if (userId) {
		res.json(userId);
	} else {
		res.json("未登录");
	}
})

// 注销 
app.post('/logout', function(req, res) {
	console.info("进入注销");
	var sess = req.session;
	delete sess.userName;
	res.json({
		"logout": true
	})
})


// 注册用户并容错
app.post('/regist', function(req, res) {
	var repeatUserName = null;
	connection.query('select * from user where userName="' + req.body.userName + '";', function(error, results, fields) {
		if (results.length > 0) {
			repeatUserName = results[0].userName;
			console.info(results[0].userName);
		} else {
			console.info("成功输入")
		}
		if (req.body.userName == false) {

			console.info("请输入账号");
			res.json({
				"w": true
			});
		} else if (req.body.userPassword == false) {
			res.json({
				"q": true
			});
			console.info("请输入密码")
		} else {
			var queryCom1 = 'insert into user(userName,userPassword) values(' + '"' + req.body.userName + '"' + "," + '"' +
				req.body.userPassword + '"' + ')';
			connection.query(queryCom1,
				function(error, results, fields) {
					if (repeatUserName == req.body.userName) {
						res.json({
							"y": true
						});
					} else if (error) {
						console.log('失败')
						res.json({
							"ok": false
						});
					} else {

						res.json({
							"ok": true
						});
					}

				})
		}
	});
});

// 新增日志到数据库
app.post("/addArticle", function(req, res) {
	var q = 'insert into journal(  author,title,classify,article,good,private1) values("' +
		username + '","' +
		req.body.title + '","' + req.body.classify + '","' +
		req.body.article + '","' +
		0 + '","' +
		req.body.private1 + '")';
	connection.query(q,
		function(error, results, fields) {
			if (error) {
				res.json({
					"ok": false
				});
			} else {
				res.json({
					"ok": true
				});
			}
		})
});

//点赞

app.get('/DZ', function(req, res) {
	connection.query('select * from vip where userName="' + username + '";', function(err, result, file) {
		console.info(result.length);
		if (result.length > 0) {

			connection.query('select * from comment', function(error, results, fields) {

				connection.query('insert into comment(userName,journalId) values(' + '"' + username + '"' + ',' + '"' +
					articleid +
					'"' + ');',
					function(error, results, fields) {

					});

				connection.query('select * from journal', function(error, results, fields) {

					for (var i = 0; i < results.length; i++) {
						if (results[i].articleId == articleid) {
							if (isNaN(results[i].good) == true) {
								results[i].good = 1;
							} else {
								results[i].good = parseInt(results[i].good);
								results[i].good += 1;

								console.info(results[i].good + "我是赞的数");

								connection.query('update journal set good="' + results[i].good + '" where articleId="' + results[i].articleId +
									'"',
									function(error, results, fields) {
										res.json("成功");

									});
							}

						}
					}

				});
			});
		} else {
			connection.query('select * from comment', function(error, results, fields) {

				for (var x = 0; x < results.length; x++) {
					if (results[x].userName == username && results[x].journalId == articleid) {
						console.info("你已经赞过了");
						res.json("你已经赞过了");
						return;
					}
				}

				connection.query('insert into comment(userName,journalId) values(' + '"' + username + '"' + ',' + '"' +
					articleid +
					'"' + ');',
					function(error, results, fields) {

					});

				connection.query('select * from journal', function(error, results, fields) {

					for (var i = 0; i < results.length; i++) {
						if (results[i].articleId == articleid) {
							if (isNaN(results[i].good) == true) {
								results[i].good = 1;
							} else {
								results[i].good = parseInt(results[i].good);
								results[i].good += 1;

								console.info(results[i].good + "我是赞的数");

								connection.query('update journal set good="' + results[i].good + '" where articleId="' + results[i].articleId +
									'"',
									function(error, results, fields) {
										res.json("成功");

									});
							}

						}
					}

				});
			});

		}
	})
});

// 编辑日志 修改
app.post("/edit", function(req, res) {

	console.info(req.body);
	var a = 'update journal set author="' + req.body.author + '" where articleId=' + req.body.articleId;
	var b = 'update journal set title="' + req.body.title + '" where articleId=' + req.body.articleId;
	var c = 'update journal set classify="' + req.body.classify + '" where articleId=' + req.body.articleId;
	var d = 'update journal set article="' + req.body.content + '" where articleId=' + req.body.articleId;
	var e = 'update journal set private1="' + req.body.private1 + '" where articleId=' + req.body.articleId;

	console.info(a);
	connection.query(a,
		function(error, results, fields) {

			if (error) {
				console.log('失败')
				res.json({
					"ok": false
				});
			} else {
				connection.query(a,
					function(error, results, fields) {

						if (error) {
							console.log('失败')
							res.json({
								"ok": false
							});
						} else {
							connection.query(b,
								function(error, results, fields) {

									if (error) {
										console.log('失败')
										res.json({
											"ok": false
										});
									} else {
										connection.query(c,
											function(error, results, fields) {

												if (error) {
													console.log('失败')
													res.json({
														"ok": false
													});
												} else {
													connection.query(d,
														function(error, results, fields) {

															if (error) {
																console.log('失败')
																res.json({
																	"ok": false
																});
															} else {
																connection.query(e,
																	function(error, results, fields) {

																		if (error) {
																			console.log('失败')
																			res.json({
																				"ok": false
																			});
																		} else {
																			res.json({
																				"ok": true
																			});
																		}
																	})
															}
														})
												}
											})
									}
								})
						}
					})

			}
		})


});

// 注册vip (并加了容错)
app.post("/reVip", function(req, res) {
	// insert into vip(userName) values("user1");
	// select * from vip where userName="wqy";
	connection.query('select * from vip where userName="' + req.body.userName + '";', function(err, result, file) {
		console.info(result.length);
		if (result.length > 0) {
			res.json({
				"w": true
			})
		} else {
			var sqlString = 'insert into vip(userName) values("' + username + '")';
			connection.query(sqlString, function(err, result, file) {
				if (err) {
					res.json("未找到");
				} else {
					res.json({
						"ok": true
					});
				}
			})
		}
	})


});


app.listen(7777);
