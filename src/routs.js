const router = require('express').Router();
const items = require('./items');
const {getUserItems, getUserSum, sendErr, sendWarning, getOrderItems,
      sendSuccess, getItemObj, sendEmail, emailValidate, getOrderSum} = require('./helpfulFunctions');
const { orders, users, comments } = require('./model');

//middlewere
function checkIfSignIn(req, res, next){
    users.findById(req.params.id).then(doc=>{
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
    const newUser = new users(req.body);
    const {city, state, street, zip} = req.body;
    newUser.address.city = city; newUser.address.street = street;
    newUser.address.state = state; newUser.address.zip = zip;
    users.findOne({email: newUser.email, password: newUser.password}).then(doc=>{
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
    users.findOne({email:req.body.email, password:req.body.password}).then(doc=>{
        if(doc){ return res.redirect(`/order/${doc._id}`); }
        res.redirect('/');
    }).catch(err=>res.status(400).send(sendErr(err)));
});

//update user profile
function existEmail(req,res, next){
    users.find({email: req.body.email}).then(doc=>{
        if(doc.length>1){
            return res.status(400).send(sendErr('Email already taken'))
        }else if(doc.length==0){
            return next();
        }else if(doc.length==1){
             return next();//fix me
        }
    })
}
router.post('/profile/update/:id',existEmail, (req, res)=>{
    let {email, firstName, lastName, phoneNumber} = req.body;
    let {city, street, state, zip} = req.body;
    users.updateOne({_id: req.params.id}, 
        {email, firstName, lastName, phoneNumber, address:{city, street, state, zip}}).then(doc=>{
        res.send(sendWarning('Your profile was update'));
    }).catch(err=>res.status(400).send(sendErr(err)))
})

//order-page
router.get('/order/:id', checkIfSignIn, (req,res)=>{
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
})

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
        res.send(sendWarning('Your comment was saved'))
    }).catch(err=>res.status(400).send(sendErr(err)))
})

//return all items available
router.get('/items', (req,res)=>{
    res.json(items);
})

module.exports = router;