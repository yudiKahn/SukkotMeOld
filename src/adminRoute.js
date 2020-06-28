const router = require('express').Router();
const items = require('./items');
const Yanki = require('./model');
const {getUserItems, getUserSum, sendErr, sendWarning,
      sendSuccess, getItemObj, sendEmail, emailValidate} = require('./helpfulFunctions');

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
        oldItems.push(getItemObj(req.body.item, Number(req.body.q), Number(req.body.price), null, true))
        Yanki.updateOne({_id:req.params.id}, {items: oldItems}).then(()=>{
            res.status(200).send(sendSuccess('Order update successfuly'))
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

//admin send email
router.post('/admin/email/130240/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>{
        let isMaild = sendEmail(doc, req.body.contant)
        res.send(sendWarning(isMaild));
    }).catch(err=>res.status(400).send(err));
})
router.post('/admin/email-update/130240/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>{
        let isMaild = sendEmail(doc, '', doc.items);
        res.send(sendWarning(isMaild));
    }).catch(err=>res.status(400).send(err));
})

//get all users names
const pass = 0;
router.get('/admin/getNames/:pass', async (req, res)=>{
    if(req.params.pass==pass){
        let names = [];
        await Yanki.find({}).then(doc=>{
            doc.map(d=>names.push(`${d.firstName} ${d.lastName}`));
        }).catch(err=>res.status(400).send(sendErr(err)));
        res.send(names);
    }else 
      res.status(400).send(sendErr('Could not find'))
})

module.exports = router;