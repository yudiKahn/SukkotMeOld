const mongoose = require('mongoose');

const schema = mongoose.Schema({
    username: {type: String, trim: true},
    firstName: {type:String},
    lastName: {type:String},
    email: {type:String},
    phoneNumber: {type: String},
    password: {type:String, trim: true},
    items:[],
    sum: {type:Number},
    address: {type: String},
    isDone: {type:Boolean},
    isPaid: {type:Boolean}
}, {timestamps: true});


module.exports = new mongoose.model('YANKI', schema);