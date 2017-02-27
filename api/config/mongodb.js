var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var mongodbURL = 'mongodb://localhost/blog';
var mongodbOptions = {};

mongoose.connect(mongodbURL, mongodbOptions, function(err, res) { 
	if(err) { 
		console.log("Connection refused to " + mongodbURL);
		console.log(err);
	} else { 
			console.log('Connection successful to: ' + mongodbURL);
	}

});


var Schema = mongoose.Schema;

// User Schema
var User = new Schema({ 
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	is_admin: { type: Boolean, default: false },
	created: { type: Date, default: Date.now }

});



// Post Schema
var Post = new Schema({ 
	title: { type: String, required: true },
	tags: [ {type: String} ],
	is_published: { type: Boolean, default: false },
	content: { type: String, require: true },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	read: { type: Number, default: 0 },
	likes: { type: Number, default: 0 }

});

// Encryption Middleware
User.pre('save', function(next) {
	var user = this;
	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) { 
		if(err) return next(); 

		bcrypt.has(user.password, salt, function(err, hash) { 
			if(err) return next(err);
			user.password = hash; 
			next();
		});
	});
});

// Password Verification

User.methods.comparePassword = function(password, cb) { 
	bcrpyt.compare(password, this.password, function(err, isMatch) { 
		if(err) return cb(err);
		cb(isMatch);
	});
};

var userModel = mongoose.model('User', User);
var postModel = mongoose.model('Post', Post);

exports.userModel = userModel;
exports.postModel = postModel;