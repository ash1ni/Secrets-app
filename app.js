//jshint esversion:6
const express = require('express')
const bodyParser = require("body-parser")
const ejs = require('ejs')
const mongoose = require('mongoose')
require('dotenv').config()
const encrypt = require("mongoose-encryption")

const app = express()

const url = process.env.DB_URL

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect(url, {useNewUrlParser:true})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "Thisisourlittlesecret"

userSchema.plugin(encrypt,{secret: secret, encryptedFields: ['password']})


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

app.post("/register",(req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err)=>{
        if(err){
            console.log(err)
        }else{
            res.render("secrets")
        }
    })
})

app.post("/login",(req,res)=>{
    const username = req.body.username
    const password = req.body.password

    User.findOne({email: username},(err,foundUser)=>{
        if(err){
            console.log(err)
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets")
                }
            }
        }
    })
})




















app.listen(5000,()=>{
    console.log("Server started on port 5000.")
})
