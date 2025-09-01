require('dotenv').config();

const express = require('express');

const bodyp=require("body-parser");
const compiler=require("compilex");
const options={stats:true}
compiler.init(options);

const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT || 5000;

//codemirror
app.use(bodyp.json());
app.use("/codemirror-5.65.12",express.static("C:/Users/somes/Desktop/The Major Project - codelearner/codemirror-5.65.12"));

app.use("/assets",express.static("C:/Users/somes/Desktop/The Major Project - codelearner/assets"));
app.post("/",function(req,res){
  var code = req.body.code;
  var input = req.body.input;
  var lang = req.body.lang;
  
  try{

      if(lang=="C/C++"){
          if(!input){
              var envData = { OS : "windows" , cmd : "g++" ,options:{timeout:10000}};
              compiler.compileCPP(envData , code , function (data) {
                  if(data.output){
                      res.send(data);
                      }
                      else{
                          res.send({output:"error"});
                      }
              });
          }
          else{
              var envData = { OS : "windows" , cmd : "g++",options:{timeout:10000}};
              compiler.compileCPPWithInput(envData , code , input , function (data) {
                  if(data.output){
                      res.send(data);
                      }
                      else{
                          res.send({output:"error"});
                      }
              });
          }
      }
      else if(lang=="Java"){
          if(!input){
              var envData = { OS : "windows"};
              compiler.compileJava(envData , code , function (data) {
                  if(data.output){
                      res.send(data);
                      }
                      else{
                          res.send({output:"error"});
                      }
              });
          }
          else{
              var envData = { OS : "windows"};
              compiler.compileJavaWithInput(envData , code , input , function (data) {
                  if(data.output){
                      res.send(data);
                      }
                      else{
                          res.send({output:"error"});
                      }
              });
          }
      }
      else if(lang=="Python"){
          if(!input){
              var envData = { OS : "windows"};
              compiler.compilePython(envData , code , function (data) {
                  if(data.output){
                      res.send(data);
                      }
                      else{
                          res.send({output:"error"});
                      }
              });
          }
          else{
              var envData = { OS : "windows"};
              compiler.compilePythonWithInput(envData , code , input , function (data) {
                  if(data.output){
                      res.send(data);
                      }
                      else{
                          res.send({output:"error"});
                      }
              });
          }
      }

  }catch(e){
      console.log("error");
  }
});




  
// Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
   
}));

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


app.locals.isActiveRoute = isActiveRoute; 

// Flush compiler data before serving any requests
app.use("/", function(req, res, next) {
    compiler.flush(function(err) {
        if (err) {
            console.error("Error flushing compiler:", err);
        } else {
            console.log("Compiler data flushed");
        }
        next(); // Proceed to the next middleware
    });
});

app.use('/', require('./server/routes/main')); 
app.use('/', require('./server/routes/admin'));



app.listen(PORT, ()=> {
  console.log(`App listening on port ${PORT}`);
});