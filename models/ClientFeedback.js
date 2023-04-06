const mongoose = require("mongoose");

const clientFb=new mongoose.Schema({
    feedback:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CLIENT",
        required: true
    }
})

const CLientFeedback=mongoose.model("CLIENTFEEDBACK",clientFb);
module.exports=CLientFeedback;