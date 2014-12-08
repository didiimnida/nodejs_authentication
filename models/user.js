"use strict";

var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

var passport = require("passport"),
    localStrategy = require("passport-local").Strategy;

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    username: DataTypes.STRING,
    age: DataTypes.INTEGER,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      hashPass: function(password) {
        return bcrypt.hashSync(password, salt);
      },
      comparePass: function(userpass, dbpass) {
        return bcrypt.compareSync(userpass, dbpass);
      },
      createNewUser: function(userInfo, userComplete) {
      User.create({
        first_name:userInfo.first_name,
        last_name:userInfo.last_name,
        username:userInfo.username,
        age:userInfo.age,
        password:this.hashPass(userInfo.password)
      }).done(function(error, user){
          userComplete();
      });
     }
    }
  });

  passport.use(new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, function(username, password, authDone) {
      User.find({
        where: {
          username: username
        }
      }).done(function(error, user) {
        if (user) {
          if (User.comparePass(password, user.password)) {
            authDone(null, user);
          } else {
            authDone(null, null);
          }
        } else {
            authDone(null, null);
        }
      });
    }
  ));





  return User;
};



