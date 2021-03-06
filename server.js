'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require("dns");
const bodyParser = require("body-parser")

var cors = require('cors');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI)
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

const urlSchema = new mongoose.Schema({
  originalUrl:{ type:String, required: true},
  newUrl: Number
});
const newUrlModel = mongoose.model("newUrlModel", urlSchema);


app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  let newUrl = req.body.url.replace(/https?:\/\//, "")
  let toBeSent = {};
  dns.lookup(newUrl, function(err){
    if(err){
      console.log("it is not a valid url")
      res.json({"error":"invalid URL"});
    }else{
      console.log("its is a valid url")
      newUrlModel.findOne({originalUrl: newUrl}, function(err, data){
        if(!err){
          console.log("it already exits in the db "+ data)
          res.json({original_url: data.originalUrl, short_url: data.newUrl})
        }else{
          const urlDoc = new newUrlModel({originalUrl: newUrl, newUrl: Math.floor(Math.random()*1000)})
          urlDoc.save(function(err, data){
            if(err){
              console.log("error occured")
            }else{
              console.log("created new doc in db "+ data)
              res.json({original_url: data.originalUrl, short_url: data.newUrl})
            }
          })
        }
      })
    }
  })
});

// get request to redirect the user to the original url
app.get("/api/shorturl/:shortUrl", function(req, res){
  console.log(req.params.shortUrl)
  newUrlModel.findOne({newUrl: req.params.shortUrl}, function(err, data){
    if(!data){
      console.log("error");
      res.write("<h1>No such url shortened<, redirecting to home page/h1>")
      setTimeout(()=>{res.redirect("/")}, 1000);
    }else{
      res.redirect("http://"+data.originalUrl)
    }
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});