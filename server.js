const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const items = require('./items');
const {getUserItems, getUserSum, sendErr, sendWarning, sendSuccess} = require('./helpfulFunctions')
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname+'/public'));


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
    isDone: {type:Boolean}
}, {timestamps: true});
var Yanki = new mongoose.model('YANKI', schema);

let uri = "mongodb+srv://yudikahn:thisisyudi770@fcc-myfirstcluster-fecus.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false })
.then(()=>{
    console.log('connected to db...');
    app.route('/order').post((req,res)=>{
        let myItems = getUserItems(items, req.body);
        let sum = getUserSum(items, req.body);
        let newUser = new Yanki(req.body);
        newUser.items = myItems;
        newUser.sum = sum;
        newUser.isDone=false;
        if(newUser.sum <= 0){
           sendErr(res, 'You did not order any items')
        }else if(newUser.password==''||newUser.username==''){
            sendErr(res, 'Your did not enter username / password')
        }else{
            Yanki.find({username: newUser.username, password:newUser.password}).then(data=>{
                if(data.length<=0){
                    newUser.save()
                    .then(doc=>{   
                        sendSuccess(res, 'Your order has been saved' , myItems , doc , sum)
                    }).catch(err=>sendErr(res, err))
                }else{
                    sendWarning('User name already taken');
                }
            }).catch(err=>sendErr(res, err));
        }
    })
    app.route('/update').post((req, res)=>{
        Yanki.find({username: req.body.username, password: req.body.password}).then(data=>{
            if(data.length<=0){
                sendWarning(res, `No user found with username '${req.body.username}' / password`);
            }else{
                let myItems = getUserItems(items, req.body);
                let sum = getUserSum(items, req.body);

                if(sum<=0){
                    sendErr(res, 'Your Did not order any items')
                }else{
                    Yanki.updateOne({username: req.body.username, password: req.body.password}, {items: myItems, sum:sum}).then(()=>{
                        sendSuccess(res, `Username '${req.body.username}' is updated` , myItems , null , sum)
                    }).catch(err=>sendErr(res, err))
                }
            }
        }).catch(err=>sendErr(res, err))
    })
}).catch(err=>sendErr(res, err));

app.get('/', (req, res)=>{
    res.sendFile('/index.html');
})

app.get('/items', (req,res)=>{
    res.json(items);
})

app.get('/admin/:id', (req, res)=>{
    if(req.params.id == 130240)
    res.sendFile(__dirname+'/admin.html');
    else res.send('not found.')
})

app.get('/orders/:id', (req,res)=>{
    if(req.params.id == 130240)
    Yanki.find().then(doc=>res.json(doc)).catch(err=>res.send(err))
    else res.send('not found.')
})

app.get('/delete/:id', (req, res)=>{
    Yanki.findByIdAndRemove(req.params.id).then(()=>res.send('deleted')).catch(er=>res.status(400).json(er))
})

app.get('/get/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>res.json(doc)).catch(er=>res.status(400).json(er))
})

app.get('/orderdone/:id', (req,res)=>{
    Yanki.findById(req.params.id).then(doc=>{
        Yanki.updateOne({_id:req.params.id}, {isDone: !doc.isDone}).then((()=>res.send(doc.isDone))).catch(er=>res.status(400).json(er))
    }).catch(er=>res.status(400).json(er))
})

const listener = app.listen(process.env.PORT || 8080, ()=>{
    console.log(`listening on port ${listener.address().port}`);
})

/**
 *         let numOfSets = 0;
        items.map(d=>{
            sum += d.n==0? Number(req.body[d.t]*Number(req.body[`${d.t} q`])) : Number(req.body[d.t]*d.p) ? Number(req.body[d.t]*d.p) : 0;
            if((d.n==1)&&(Number(req.body[d.t])>0)){
                numOfSets+=Number(req.body[d.t]);
                myItems.push({item: d.t, q: Number(req.body[d.t]), price:d.p, total: Number(req.body[d.t]*d.p)});
            }
            else if((d.n==0)&&(Number(req.body[d.t])>0)){
               if(Number(req.body[`${d.t} q`])>=75)
                 numOfSets+=Number(req.body[d.t]);
               myItems.push({item: d.t, q:Number(req.body[d.t]), price:Number(req.body[`${d.t} q`]), total:Number(req.body[d.t]*req.body[`${d.t} q`])})
            }else if(d.n!==7){
                myItems.push({item: d.t, q: Number(req.body[d.t]), price:d.p, total: Number(req.body[d.t]*d.p)});
            }
        })
        items.map(sev=>(sev.n==7)?myItems.push({item:sev.t,q:numOfSets,price:0,total:0}):undefined);



 *                 let numOfSets = 0;
                items.map(d=>{
                    sum += d.n==0? Number(req.body[d.t]*Number(req.body[`${d.t} q`])) : Number(req.body[d.t]*d.p) ? Number(req.body[d.t]*d.p) : 0;
                    if((d.n==1)&&(Number(req.body[d.t])>0)){
                        numOfSets+=Number(req.body[d.t]);
                        myItems.push({item: d.t, q: Number(req.body[d.t]), price:d.p, total: Number(req.body[d.t]*d.p)});
                    }
                    else if((d.n==0)&&(Number(req.body[d.t])>0)){
                       if(Number(req.body[`${d.t} q`])>=75)
                         numOfSets+=Number(req.body[d.t]);
                       myItems.push({item: d.t, q:Number(req.body[d.t]), price:Number(req.body[`${d.t} q`]), total:Number(req.body[d.t]*req.body[`${d.t} q`])})
                    }else if(d.n!==7){
                        myItems.push({item: d.t, q: Number(req.body[d.t]), price:d.p, total: Number(req.body[d.t]*d.p)});
                    }
                })
                items.map(sev=>(sev.n==7)?myItems.push({item:sev.t,q:numOfSets,price:0,total:0}):undefined);
 */