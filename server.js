const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
let items = require('./items');
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
    sum: {type:Number}
}, {timestamps: true});
var Yanki = new mongoose.model('YANKI', schema);

let uri = "mongodb+srv://yudikahn:thisisyudi770@fcc-myfirstcluster-fecus.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('connected to db...');
    app.route('/order').post((req,res)=>{
        let myItems = [];
        let sum = 0;
        items.map(d=>{
            sum += Number(req.body[d.t]*d.p);
            myItems.push({item: d.t, q: Number(req.body[d.t]), price:d.p, total: Number(req.body[d.t]*d.p)})
        })
        let newUser = new Yanki(req.body);
        newUser.items = myItems;
        newUser.sum = sum;
        if(newUser.sum <= 0){
           res.send(`<div style="text-align: center;">
           <h1 style="color:red;margin-top:20px;">Your did not order any items.</h1>
           <a href="/">Go Back</a></div>`)
        }else if(newUser.password==''||newUser.username==''){
            res.send(`<div style="text-align: center;">
            <h1 style="color:red;margin-top:20px;">Your did not enter username / password.</h1>
            <a href="/">Go Back</a></div>`)
        }else{
            Yanki.find({username: newUser.username, password:newUser.password}).then(data=>{
                if(data.length<=0){
                    newUser.save().then(doc=>{
                        res.send(`<div style="text-align: center;">
                        <h1 style="color:#28a745;margin-top:20px;">Your Order Has Been Saved.</h1>
                        <p>First Name :${doc.firstName}<br/>
                        Last Name :${doc.lastName}<br/>User Name :${doc.username}<br/> Email :${doc.email}<br/>
                        ${myItems.map(d=>d.q>0?`${d.item} :${d.q}. total: ${d.total}$<br/>`:'')} Sum :${doc.sum}$</p>
                        <a href="/">Go Back</a></div>`)
                    }).catch(err=>{
                        res.send(`<div>
                        <h1 style="text-align:center;margin-top:20px;">Something went wrong.</h1>
                        <p style="color:red;">${err}</p>
                        <a href="/">Go Back</a></div>`)
                    })
                }else{
                    res.send(`<div style="text-align: center;"> <h1 style="color:#eff157;margin-top:20px;">User name already taken.</h1><a href="/">Go Back</a></div>`);
                }
            }).catch(err=>console.log(err))
        }
    })
    app.route('/update').post((req, res)=>{
        Yanki.find({username: req.body.username, password: req.body.password}).then(data=>{
            if(data.length<=0){
                res.send(`<div style="text-align: center;"> <h1 style="color:#eff157;margin-top:20px;">No user found with username '${req.body.username}' / password.</h1><a href="/">Go Back</a></div>`)
            }else{
                let myItems = [];
                let sum = 0;
                items.map(d=>{
                    sum += Number(req.body[d.t]*d.p);
                    myItems.push({item: d.t, q: Number(req.body[d.t]), price:d.p, total: Number(req.body[d.t]*d.p)})
                });
                if(sum<=0){
                    res.send(`<div style="text-align: center;">
                    <h1 style="color:red;margin-top:20px;">Your Did not order any items.</h1>
                    <a href="/">Go Back</a></div>`);
                }else{
                    Yanki.updateOne({username: req.body.username, password: req.body.password}, {items: myItems, sum:sum}).then(()=>{
                        res.send(`<div style="text-align: center;"> <h1 style="color:#28a745;margin-top:20px;">Username '${req.body.username}' is updated.</h1><br/> ${myItems.map(d=>d.q>0?`${d.item} :${d.q}. total: ${d.total}$<br/>`:'')} Sum :${sum}$</p><a href="/">Go Back</a></div>`)
                    }).catch(err=>res.send(err))
                }
            }
        }).catch(err=>res.status(400).json(err))
    })
}).catch(err=>console.log(err));

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


const listener = app.listen(process.env.PORT || 8080, ()=>{
    console.log(`listening on port ${listener.address().port}`);
})