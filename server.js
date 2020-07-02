const express = require('express');
const mongoose = require('mongoose');
const app = express();

const { requireHTTPS } = require('./src/helpfulFunctions');
app.use(requireHTTPS);
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname+'/public'));

let uri = "mongodb+srv://yudikahn:thisisyudi770@fcc-myfirstcluster-fecus.mongodb.net/test?retryWrites=true&w=majority"

mongoose.connect(uri, {useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false})
.then(()=>{console.log('connected to db')}).catch(err=>console.log(err))

const routs = require('./src/routs');
app.use('/', routs)

const adminRouts = require('./src/adminRoute');
app.use('/', adminRouts)

const listener = app.listen(process.env.PORT || 8080, ()=>{
    console.log(`listening on port ${listener.address().port}`);
})