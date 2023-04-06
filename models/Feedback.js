const mongoose=require("mongoose")

const feedbackScema=new mongoose.Schema({
    fbphone:{
        type:String,
        required:true,
    },
    fbemail:{
        type:String,
        required:true,
    },
    fbmessage:{
        type:String,
        required:true,
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CLIENT",
        required: true
    },
})

const FeedBack=mongoose.model("FEEDBACK",feedbackScema)
module.exports=FeedBack;