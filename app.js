//jshint esversion:6
const express = require('express')
const bodyParser = require("body-parser")
const ejs = require('ejs')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

const url = process.env.DB_URL

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect(url, {useNewUrlParser:true})

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema)


app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/register",(req,res)=>{
    res.render("register")
})
























app.listen(5000,()=>{
    console.log("Server started on port 5000.")
})
