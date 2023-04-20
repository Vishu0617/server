const mongoose = require("mongoose");
const author = require("./routes/auther");
const clientAuther=require("./routes/clientAuther")
const express = require("express");
const cors =require("cors")
const path = require('path');
const app = express();

require("dotenv").config();

app.use(express.json());
app.use(express.static("Upload/Admin"));
app.use(express.static("Upload/User"));
//databse connection

// static file read
app.use(express.static(path.join(__dirname,'../front/build')))

app.get('*',function(req,res){
  res.send(path.join(__dirname,'../front/build/index.html'))
})


const DB = process.env.DATABASE;
const PORT=process.env.PORT || 3001;

mongoose
  .connect(DB)
  .then(() => {
    app.listen(PORT, () => {
      console.log("server start");
    });
    console.log("Database connection success..");
  })
  .catch((err) => console.log(err,{err:"no connection"}));

  app.use(express.json())
  app.use(cors({origin:'http://localhost:3000',credentials:true}));
  app.use(express.urlencoded({extended:false}))

app.use("/", author); //admin routes
app.use("/",clientAuther) //client routes



