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

const commentSchema = mongoose.Schema({
    username: {type: String, trim: true},
    firstName: {type:String},
    lastName: {type:String},
    email: {type:String},
    phoneNumber: {type: String},
    subject: {type: String},
    text: {type: String}
})


module.exports = {
    users: new mongoose.model('YANKI', schema),
    comments: new mongoose.model('Comments', commentSchema)
}