const mongoose = require("mongoose");

const goodsScema=new mongoose.Schema({
    spoint:{
        type:String,
        required:true,
    },
    dname:{
        type:String,
        required:true,
    },
    cphone:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true,
    },
    km:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true
    },
    descr:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:"Pending",
        enum:["Pending","Shipped","Dispatched","Delivered","Canceled"]
    },
    paymentStatus:{
        type:String,
        default:"Pending",
        enum:["Pending","Paid","Failed"]
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CLIENT",
        required: true
    }
})

const Goods=mongoose.model("GOODS",goodsScema);
module.exports=Goods;