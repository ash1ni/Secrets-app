//jshint esversion:6
const express = require('express')
const bodyParser = require("body-parser")
const ejs = require('ejs')
const mongoose = require('mongoose')
require('dotenv').config()
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const googleStrategy = require('passport-google-oauth20').Strategy
const findOrCreate = require("mongoose-findorcreate")



const app = express()

const url = process.env.DB_URL


app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
    secret: "This is dying world.",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect(url, {useNewUrlParser:true})


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)




const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(function(user, done) {
    done(null, user._id);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    (accessToken, refreshToken, profile, cb) => {
        User.findOrCreate({ googleId: profile.id }, (err, user) => {
            return cb(err, user)
        })
    }
))



app.get("/",(req,res)=>{
    res.render("home")
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/register",(req,res)=>{
    res.render("register")
})



app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
})

app.get("/logout",function(req,res,next){
    req.logout(function(err){
        if(err){return next(err)}
        res.redirect("/");
    });
    
})



app.post("/register",(req,res)=>{

    User.register({username: req.body.username}, req.body.password, (err,user)=>{
        if(err){
            console.log(err)
            res.redirect("/register")
        } else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets")
            })
        }
    })


   
})

app.post("/login",(req,res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err)=>{
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets")
            })
        }
    })
    
})
















app.listen(4000,()=>{
    console.log("Server started on port 4000.")
})
