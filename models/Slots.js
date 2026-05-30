const { required, date } = require('joi');
const mongoose = require('mongoose');
const slotsSchema= new mongoose.Schema({
    doctorId:{type:mongoose.Schema.Types.ObjectId,ref:"Doctor",required:true},
    date:{type:Date,required:true},
    from:{type:String,required:true},
    to:{type:String,required:true},
    isBooked:{type:Boolean,default:false}
})
module.exports=mongoose.model("Slot",slotsSchema)