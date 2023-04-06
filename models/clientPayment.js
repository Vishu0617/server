const mongoose = require("mongoose");

const paymentScema=new mongoose.Schema({
    cname:{
        type:String,
        required:true
    },
    cnumber:{
        type:String,
        required:true
    },
    exptime:{
        type:String,
        required:true
    },
    cvv:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    otp:{
        type: String,
        required:true,
    },
    amount:{
        type: String,
        required:true,
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CLIENT",
        required: true
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GOODS",
        required: true
    }
})

const ClientPayment=mongoose.model("CLIENTPAYMENT",paymentScema);
module.exports=ClientPayment;