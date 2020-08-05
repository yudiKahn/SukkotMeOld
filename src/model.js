const mongoose = require('mongoose');
const {getId} = require('./helpfulFunctions');

const schema = mongoose.Schema({
    firstName: {type:String,required: true},
    lastName: {type:String,required: true},
    email: {type:String,required: true},
    phoneNumber: {type: String,required: true},
    password: {type:String, trim: true,required: true},
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
    sum: {type: Number},
    comment: {type: String}
}, {timestamps: true})

let users = new mongoose.model('users', schema);
let comments = new mongoose.model('comments', commentSchema);
let orders = new mongoose.model('orders', orderSchema);


class User{
    constructor(obj){

    }
}
class Order{
    constructor(obj){
        if(obj.userId && obj.items&&obj.total){
            this.items = obj.items;
            this.userId = obj.userId;
            this._id=getId();
            this.total=obj.total;
        }
    }
}

module.exports = {
    users,
    comments,
    orders
}