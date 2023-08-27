var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
mongoose.set("strictQuery", true)
const expressSession = require('express-session')
const plm = require('passport-local-mongoose')
mongoose.connect("mongodb://localhost/card")
    .then(function() {
        console.log("connected to db")
    })

var userSchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    dpimage: String,
    favourites: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    }
})

userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema)