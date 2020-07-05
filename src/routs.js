const router = require('express').Router();
const items = require('./items');
const {sendErr, sendWarning, getOrderItems,sendSuccess, getItemObj, sendEmail, getOrderSum} = require('./helpfulFunctions');
const { orders, users, comments } = require('./model');
const CRUD = require('./crud');
const Middleware = require('./middleware');

//Home page
router.get('/', (req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

//sign up
router.post('/signup', Middleware.SignUp, (req,res)=>{
    let crud = new CRUD('users');
    const {city, state, street, zip, firstName, lastName, email, phoneNumber, password} = req.body;
    let userObj = {firstName, lastName, email, phoneNumber,password, address:{city, state, street, zip} };
    let newUser = new users(userObj);
    newUser.save().then(doc=>res.send(doc._id)).catch(err=>res.status(400).send(sendErr(err)));
})

//login
router.post('/login',(req, res)=>{
    users.findOne({email:req.body.email, password:req.body.password}).then(doc=>{
        if(doc){ return res.send(doc._id); }
        else { res.status(400).send('No user found. Please try again') };
    }).catch(err=>res.status(400).send(sendErr(err)));
});

//update user profile
router.post('/profile/update/:id', Middleware.UpdateProfile, (req, res)=>{
    let {email, firstName, lastName, phoneNumber} = req.body;
    let {city, street, state, zip} = req.body;
    users.updateOne({_id: req.params.id}, 
        {email, firstName, lastName, phoneNumber, address:{city, street, state, zip}}).then(doc=>{
        res.send('Your profile was update');
    }).catch(err=>res.status(400).send(err))
})

//order-page
router.get('/order/:id', Middleware.UserHomePage, (req,res)=>{
    res.sendFile(__dirname+'/order_page.html')
})  

//get user
router.get('/user/:id', (req, res)=>{
    users.findById(req.params.id).then(doc=>{
        let {firstName, lastName, email, address, phoneNumber} = doc;
        res.json({firstName, lastName, email, address, phoneNumber})
    }).catch(err=>res.status(400).json(err));
})

//create order
router.post('/order/:id/new', (req,res)=>{
    let newOrder = new orders();
    let newItems = getOrderItems(items, req.body);
    let sum = getOrderSum(items, req.body);
    newOrder.items = newItems;
    newOrder.isDone = false;
    newOrder.isPaid = false;
    newOrder.sum = sum;
    newOrder.userId = req.params.id;
    newOrder.save().then(()=>{
            res.redirect(`/order/${req.params.id}`);
    }).catch(err=>res.status(400).send(sendErr(err)));
})

//update order
/*
router.post('/order/:id/update', (req,res)=>{
  users.findById(req.params.id).then(doc=>{
    let myItems = getUserItems(items, req.body);
    let sum = getUserSum(items, req.body);
    if(sum<=0){
        res.status(400).send(sendErr('You did not order any items'))
    }else{
       users.updateOne({email: doc.email, password:doc.password}, {}).then(()=>{
            res.send(sendSuccess(`user <em>'${doc.username}'</em> is updated`,myItems, null, sum))
        }).catch(err=>res.status(400).send(sendErr(err)));
    }
  }).catch(err=>res.status(400).send(sendErr(err)));
})*/

//get all orders for user
router.get('/orders/:id/all',(req, res)=>{
    orders.find({userId: req.params.id}).then(doc=>{
        res.send(doc);
    })
})

//delete order
router.post('/order/:id/delete', (req, res)=>{
    orders.deleteOne({_id: req.params.id}).then(doc=>{
        res.send('deleted');
    }).catch(err=>res.status(400).send(sendErr(err)));
})

//send comment
router.post('/user/:id/comment', (req,res)=>{
    let newComment = new comments(req.body);
    newComment.userId = req.params.id;
    newComment.save().then(()=>{
        res.send(sendWarning("Thank you ! we'll be in touch with you soon."))
    }).catch(err=>res.status(400).send(sendErr(err)))
})

//return all items available
router.get('/items', (req,res)=>{
    res.json(items);
})

module.exports = router;