const router = require('express').Router();
const items = require('./items');
const User = require('./model').users;
const Order = require('./model').orders;
const {getUserItems, getUserSum, sendErr, sendWarning, getOrderItems,
      sendSuccess, getItemObj, sendEmail, emailValidate, getOrderSum} = require('./helpfulFunctions');
const { orders } = require('./model');

//middlewere
function checkIfSignIn(req, res, next){
    User.findById(req.params.id).then(doc=>{
        if(doc){return next();}
        res.redirect('/')
    }).catch(()=>res.redirect('/'));
}

//Home page
router.get('/', (req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

//sign up
router.post('/signup', (req,res)=>{
    let isEmail = emailValidate(req.body.email);
    if(!isEmail){
        return res.send(sendErr('Email is not valid'))
    }
    const newUser = new User(req.body);
    User.findOne({email: newUser.email, password: newUser.password}).then(doc=>{
        if(doc){
            res.status(400).send(sendErr('This email is already used.'))
        }else{
            newUser.save().then(doc=>{
                res.redirect(`/order/${doc._id}`);
            }).catch(err=>res.send(err))
        }
    }).catch(err=>res.status(400).send(sendErr(err)));
})

//login
router.post('/login',(req, res)=>{
    User.findOne({email:req.body.email, password:req.body.password}).then(doc=>{
        if(doc){ return res.redirect(`/order/${doc._id}`); }
        res.redirect('/');
    }).catch(err=>res.status(400).send(sendErr(err)));
});

//order-page
router.get('/order/:id', checkIfSignIn, (req,res)=>{
    res.sendFile(__dirname+'/order_page.html')
})  

//get user
router.get('/user/:id', (req, res)=>{
    User.findById(req.params.id).then(doc=>{
        res.json(doc)
    }).catch(err=>res.status(400).json(err));
})

//create order
router.post('/order/:id/new', (req,res)=>{
    let newOrder = new Order();
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
router.post('/order/:id/update', (req,res)=>{
  User.findById(req.params.id).then(doc=>{
    let myItems = getUserItems(items, req.body);
    let sum = getUserSum(items, req.body);
    if(sum<=0){
        res.status(400).send(sendErr('You did not order any items'))
    }else{
       User.updateOne({email: doc.email, password:doc.password}, {}).then(()=>{
            res.send(sendSuccess(`user <em>'${doc.username}'</em> is updated`,myItems, null, sum))
        }).catch(err=>res.status(400).send(sendErr(err)));
    }
  }).catch(err=>res.status(400).send(sendErr(err)));
})

//get all orders for user
router.get('/orders/:id/all',(req, res)=>{
    Order.find({userId: req.params.id}).then(doc=>{
        res.send(doc);
    })
})

//delete order
router.post('/order/:id/delete', (req, res)=>{
    Order.deleteOne({_id: req.params.id}).then(doc=>{
        res.send('deleted');
    }).catch(err=>res.status(400).send(sendErr(err)));
})


//return all items available
router.get('/items', (req,res)=>{
    res.json(items);
})

module.exports = router;