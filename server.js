const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
let items = require('./items');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname+'/public'));

const schema = mongoose.Schema({
    firstName: {type:String},
    lastName: {type:String},
    email: {type:String},
    Estrog:[Number],
    Lulav:[Number],
    Arovos:[Number],
    Adasim:[Number],
    sum: {type:Number}
});
var Yanki = new mongoose.model('YANKI', schema);

let uri = "mongodb+srv://yudikahn:thisisyudi770@fcc-myfirstcluster-fecus.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('connected to db...');
    app.route('/order').post((req,res)=>{
        let sum=0;
        items.map(d=>{
            req.body[d.t] = [req.body[d.t][0], (req.body[d.t][0]*d.p)]
            sum+=(req.body[d.t][0]*d.p);
        })
        let newUser = new Yanki(req.body);
        newUser.sum=sum;
        newUser.save().then(doc=>{
            res.send(`<div style="text-align: center;">
            <h1 style="color:#28a745;margin-top:20px;">Your Order Has Benn Proccecd.</h1>
            <p>First Name :${doc.firstName}<br/>
            Last Name :${doc.lastName}<br/> Email :${doc.email}<br/>
            ${items.map(d=>`${d.t} :${doc[d.t][0]}<br/>`)} Sum :${doc.sum}$</p>
            <a href="/">Go Back</a></div>`)
        }).catch(err=>{
            res.send(`<div>
            <h1 style="text-align:center;margin-top:20px;">Something went wrong.</h1>
            <p style="color:red;">${err}</p>
            </div>`)
        })
        
    })

}).catch(err=>console.log(err));

app.get('/', (req, res)=>{
    res.sendFile('/index.html');
})

app.get('/items', (req,res)=>{
    res.json(items);
})

app.get('/admin', (req, res)=>{
    res.sendFile(__dirname+'/admin.html');
})

app.get('/orders/:id', (req,res)=>{
    if(req.params.id == 130240)
    Yanki.find().then(doc=>res.json({data:doc, items:items})).catch(err=>res.send(err))
    else res.send('not found.')
})

const listener = app.listen(process.env.PORT || 8080, ()=>{
    console.log(`listening on port ${listener.address().port}`);
})