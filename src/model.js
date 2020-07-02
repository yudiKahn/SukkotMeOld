const mongoose = require('mongoose');

const schema = mongoose.Schema({
    firstName: {type:String},
    lastName: {type:String},
    email: {type:String},
    phoneNumber: {type: String},
    password: {type:String, trim: true},
    sum: {type:Number},
    address: {
        street: String,
        city: String,
        state: String,
        zip: Number
    }
});

const commentSchema = mongoose.Schema({
    userId: {type: String},
    subject: {type: String},
    text: {type: String}
})

const orderSchema = mongoose.Schema({
    userId: {type: String},
    items: [],
    isDone: {type: Boolean},
    isPaid: {type:Boolean},
    sum: {type: Number}
}, {timestamps: true})


module.exports = {
    users: new mongoose.model('users', schema),
    comments: new mongoose.model('comments', commentSchema),
    orders: new mongoose.model('orders', orderSchema)
}