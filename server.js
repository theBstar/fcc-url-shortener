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
const urlModel = mongoose.model("urlModel", urlSchema);


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
      urlModel.find({originalUrl: newUrl}, function(err, data){
        if(!err){
          console.log("it already exits in the db "+ data)
          toBeSent = Object.assign({original_url: data.originalUrl, short_url: data.newUrl})
        }else{
          const urlDoc = new urlModel({originalUrl: newUrl, newUrl: Math.floor(Math.random()*1000)})
          urlDoc.save(function(err, data){
            if(err){
              console.log("error occured")
            }else{
              console.log("created new doc in db "+ data)
              toBeSent = Object.assign({original_url: data.originalUrl, short_url: data.newUrl})
            }
          })
        }
      })
      res.json(toBeSent); 
    }
  })
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});