const router = require('express').Router();
const items = require('./items');
const Yanki = require('./model');
const {getUserItems, getUserSum, sendErr, sendWarning,
      sendSuccess, getItemObj, sendEmail} = require('./helpfulFunctions')

//create new order
router.post('/order', (req,res)=>{
    let myItems = getUserItems(items, req.body);
    let sum = getUserSum(items, req.body);
    let newUser = new Yanki(req.body);
    newUser.items = myItems;
    newUser.sum = sum;
    newUser.isDone=false;
    newUser.isPaid=false;
    if(newUser.sum <= 0){
       res.status(400).send(sendErr('You did not order any items'));
    }else if(newUser.password==''||newUser.username==''){
        res.status(400).send(sendErr('Your did not enter username / password'));
    }else{
        Yanki.find({username: newUser.username, password:newUser.password}).then(data=>{
            if(data.length<=0){
                newUser.save()
                .then(doc=>{   
                    res.status(200).send(sendSuccess('Your order has been saved' , myItems , doc , sum));
                    //sendEmail(doc);
                }).catch(err=>res.status(400).send(sendErr(res, err)))
            }else{
                res.status(400).send(sendWarning('User name already taken'))
            }
        }).catch(err=>res.status(400).send(sendErr(err)));
    }
})

//update exist order
router.post('/update', (req, res)=>{
    Yanki.find({username: req.body.username, password: req.body.password}).then(data=>{
        if(data.length<=0){
            res.status(400).send(sendWarning(`No user found with username '${req.body.username}' / password`))
        }else{
            let myItems = getUserItems(items, req.body);
            let sum = getUserSum(items, req.body);

            if(sum<=0){
                res.status(400).send(sendErr(res, 'Your Did not order any items'));
            }else{
                Yanki.updateOne({username: req.body.username, password: req.body.password}, {items: myItems, sum:sum}).then(()=>{
                    res.status(200).send(sendSuccess(`Username '${req.body.username}' is updated` , myItems , null , sum))
                    //sendEmail(req.body);
                }).catch(err=>res.status(400).send(sendErr(err)))
            }
        }
    }).catch(err=>res.status(400).send(sendErr(err)))
})

//return all items available
router.get('/items', (req,res)=>{
    res.json(items);
})

//admin route
router.get('/admin/:id', (req, res)=>{
    if(req.params.id == 130240)
    res.sendFile(__dirname+'/admin.html');
    else res.send('not found.')
})

//gets all orders for admin
router.get('/orders/:id', (req,res)=>{
    if(req.params.id == 130240)
    Yanki.find().then(doc=>res.json(doc)).catch(err=>res.send(err))
    else res.send('not found.')
})

//delete an order
router.get('/delete/:id', (req, res)=>{
    Yanki.findByIdAndRemove(req.params.id).then(()=>res.send('deleted')).catch(er=>res.status(400).json(er))
})

//returns order for print
router.get('/get/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>res.json(doc)).catch(er=>res.status(400).json(er))
})

//change order status to done || undone
router.get('/orderdone/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>{
        Yanki.updateOne({_id:req.params.id}, {isDone: !doc.isDone}).then((()=>res.send(doc.isDone))).catch(er=>res.status(400).json(er))
    }).catch(er=>res.status(400).json(er))
})

//change order status to paid || unpaid
router.get('/orderpaid/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>{
        Yanki.updateOne({_id:req.params.id}, {isPaid: !doc.isPaid}).then((()=>res.send(doc.isPaid))).catch(er=>res.status(400).json(er))
    }).catch(er=>res.status(400).json(er))
})

//admin update order
router.post('/admin/update/130240/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>{
        let oldItems = doc.items;
        oldItems.push(getItemObj(req.body.item, req.body.q, req.body.price))
        Yanki.updateOne({_id:req.params.id}, {items: oldItems}).then(()=>{
            res.redirect('/admin/130240')
        }).catch(err=>res.status(400).send(sendErr(err)))
    }).catch(err=>res.status(400).send(sendErr(err)));
})

//auth
let adminName='a';
let adminPass='a';
router.post('/admin/auth', (req, res)=>{
    if((req.body.username==adminName)&&(req.body.password==adminPass)){
        res.sendFile(__dirname+'/admin.html');
    }else{
        res.status(400).send(sendErr('oops. something went wrong...'))
    }
})

//get admin script
router.get('/admin/script-js/130240/GET', (req,res)=>{
    res.sendFile(__dirname+'/admin.js');
})

module.exports = router;