const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname+'/public'));


let uri = "mongodb+srv://yudikahn:thisisyudi770@fcc-myfirstcluster-fecus.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false })
.then(()=>{ console.log('connected to db...'); }).catch(err=>console.log(err));

app.get('/', (req, res)=>{
    res.sendFile('/index.html');
})

const routs = require('./src/routs');
app.use('/', routs)

const listener = app.listen(process.env.PORT || 8080, ()=>{
    console.log(`listening on port ${listener.address().port}`);
})