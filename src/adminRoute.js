const router = require('express').Router();
const items = require('./items');
const {users, orders} = require('./model');
const comments = require('./model').comments;
const {  getItemObj, adminSendEmail} = require('./helpfulFunctions');

const pass = 123240;
//gets all users for admin
router.get('/users-and-orders/:id', (req,res)=>{
    if(req.params.id == pass){
        let result = [];
        users.find().then(async doc=>{
            for(let user of doc){
               await orders.find({userId: user._id}).then(ordersArr=>{
                    result.push({ user,
                        order: ordersArr.filter(d=>d.isDone==false && d.isPaid==false),
                        done_orders: ordersArr.filter(d=>d.isDone==true && d.isPaid==false),
                        paid_orders:ordersArr.filter(d=>d.isDone==false && d.isPaid==true),
                        done_paid:ordersArr.filter(d=>d.isDone==true && d.isPaid==true) });
               }).catch(err=>res.send(err));
           };
           res.send(result)      
       }).catch(err=>res.send(err))
    }
    else res.send('not found.')
})

//gets all orders for admin
router.get('/orders/:code/:id', (req,res)=>{
    if(req.params.code == pass)
    orders.find({userId: req.params.id}).then(doc=>res.json(doc)).catch(err=>res.send(err))
    else res.send('not found.')
})

//delete an order
router.get('/delete/:id', (req, res)=>{
    orders.findByIdAndRemove(req.params.id).then(()=>res.send('deleted')).catch(er=>res.status(400).json(er))
})

//returns order for print
router.get('/get/:id', (req,res)=>{
    orders.findById(req.params.id).then(doc=>{
        users.findById(doc.userId).then(user=>{
            res.json({doc, user});
        }).catch(er=>res.status(400).json(er));
    }).catch(er=>res.status(400).json(er));
})

//change order status to done || undone
router.get('/orderdone/:id', (req,res)=>{
    orders.findById(req.params.id).then(doc=>{
        orders.updateOne({_id:req.params.id}, {isDone: !doc.isDone}).then((()=>res.send(doc.isDone))).catch(er=>res.status(400).json(er))
    }).catch(er=>res.status(400).json(er))
})

//change order status to paid || unpaid
router.get('/orderpaid/:id', (req,res)=>{
    orders.findById(req.params.id).then(doc=>{
        orders.updateOne({_id:req.params.id}, {isPaid: !doc.isPaid}).then((()=>res.send(doc.isPaid))).catch(er=>res.status(400).json(er))
    }).catch(er=>res.status(400).json(er))
})

//update order admin 
router.post('/admin/update/:adminId/:id', (req,res)=>{
    if(req.params.adminId==pass){
        orders.findById(req.params.id).then(doc=>{
            let oldItems = doc.items;
            oldItems.push(getItemObj(req.body.item, Number(req.body.q), Number(req.body.price), null, true))
            orders.updateOne({_id:req.params.id}, {items: oldItems}).then(()=>{
                res.status(200).send(sendSuccess('Order update successfuly', oldItems))
            }).catch(err=>res.status(400).send(err))
        }).catch(err=>res.status(400).send(err));
    }else{
        res.status(400).send('not found')
    }
})

//auth
let adminName='a';
let adminPass='a';
router.post('/admin/auth', (req, res)=>{
    if((req.body.username==adminName)&&(req.body.password==adminPass)){
        res.sendFile(__dirname+'/admin.html');
    }else{
        res.status(400).send('oops. something went wrong...')
    }
})

//get admin script
router.get('/admin/script-js/130240/GET', (req,res)=>{
    res.sendFile(__dirname+'/admin.js');
})

//admin send email
router.post('/admin/email/130240/:id', (req,res)=>{
    orders.findById(req.params.id).then(doc=>{
        adminSendEmail(doc, req.body.contant)
        res.send('email send');
    }).catch(err=>res.status(400).send(err));
})
router.post('/admin/email-update/130240/:id', (req,res)=>{
    orders.findById(req.params.id).then(doc=>{
        adminSendEmail(doc);
        res.send('email send');
    }).catch(err=>res.status(400).send(err));
})

//get all users names
router.get('/admin/getNames/:pass', async (req, res)=>{
    if(req.params.pass==pass){
        let names = [];
        await users.find({}).then(doc=>{
            doc.map(d=>names.push(`${d.firstName} ${d.lastName}`));
        }).catch(err=>res.status(400).send(sendErr(err)));
        res.send(names);
    }else 
      res.status(400).send(sendErr('Could not find'))
})

//get all comments
router.get('/admin/getComments/:pass', (req, res)=>{
    if(req.params.pass == pass){
        let result = [];
        users.find().then(async doc=>{
            for(let user of doc){
               await comments.find({userId: user._id}).then(commsArr=>{
                   if(commsArr.length>0)
                    result.push({ user, commsArr})
               }).catch(err=>res.send(err));
           };
           res.json(result)      
       }).catch(err=>res.send(err))
    }
    else res.send('not found.')
})
//delete comment
router.get('/admin/delete/comment/:id', (req,res)=>{
    comments.deleteOne({_id: req.params.id}).then(()=>res.send('deleted')).catch(err=>res.status(400).send(err));
})
//backup
router.get('/admin/backup/:pass', async (req,res)=>{
    if(req.params.pass==pass){
        let result = [];
        await users.find({}).then(doc=>result.push(doc)).catch(err=>{ return res.status(400) });
        await comments.find({}).then(doc=>result.push(doc)).catch(err=>{ return res.status(400) });
        await orders.find({}).then(doc=>result.push(doc)).catch(err=>{ return res.status(400) });
        res.json({ users: result[0], comments: result[1], orders: result[2] });
    }
})
module.exports = router;