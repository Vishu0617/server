const mongoose=require('mongoose')

const vehicalBookingScema=mongoose.Schema({
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CLIENT",
        required:true
    },
    vehicaleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"VEHICALE",
        required:true
    },
    date:{
      type:String,
      required:true
    },
    address:{
        type:String,
        require:true
    }
})

const BookingVehicale=mongoose.model("VEHICALE_BOOKING",vehicalBookingScema);

module.exports=BookingVehicale
