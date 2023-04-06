const mongoose=require('mongoose')

const vehicaleScema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  phone:{
    type:String,
    required:true,
  },
  demail:{
    type:String,
    required:true,
  },
  vname:{
    type:String,
    required:true
  },
  vnumber:{
    type:String,
    required:true
  },
  capacity:{
    type:String,
    required:true
  },
  slocation:{
    type:String,
    required:true
  },
  dlocation:{
    type:String,
    required:true
  },
  client:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"CLIENT",
    required:true
  }
  
})


const Vehicale=mongoose.model("VEHICALE",vehicaleScema);

module.exports=Vehicale

