'use strict';

var express = require('express');
var app = express();
var jwt = require('express-jwt');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var tokenManager = require('./config/token_manager');
var secret = require('./config/secret');

var port = 3000;
app.listen(port);
app.use(bodyParser());
app.use(morgan());

var routes = {};
routes.post = require('./route/posts.js');
routes.users = require('./route/user.js');
routes.rss = require('./route/rss.js');

app.all("*", function(req, res, next) { 
	res.set('Access-Control-Allow-Origin', 'http://localhost');
	res.set('Access-Control-Allow-Credentials', true);
	res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
	res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
	if('OPTIONS' == req.method) return res.send(200);
	next();
});

// Get all published posts.
app.get('/post', routes.post.list);
app.get('/post/all', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.post.listAll);

// get a post by id
app.get('/post/:id', routes.post.read);

// like a post by id
app.post('/post/like', routes.post.like);

// dislike a post by id
app.post('/post/unlike', routes.post.unlike);

// get posts by tag (topic)
app.get('/tag/:tagName', routes.post.listByTag);

// register as a user
app.post('/user/register', routes.users.register);

// signin
app.post('/user/signin', routes.users.signin);

// quit
app.get('user/logout', jwt({secret: secret.secretToken}), routes.users.logout);

// post a new post
app.post('/post', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.post.create);

// edit a post.
app.put('/post/', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.post.update);

app.delete('/post/:id', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.post.delete);

// get the RSS
app.get('/rss', routes.rss.index);

console.log('Blog API is starting on port ' + port + '.');


