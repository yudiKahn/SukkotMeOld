const express = require('express');
const mongoose = require('mongoose');
const secure = require('express-force-https');
const robots= require('express-robots-txt');
const cookieSession = require('cookie-session')

const app = express();
app.use(secure);
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname+'/public'));
app.use(robots(__dirname+'/public/robots.txt'));
app.use(cookieSession({
    name: 'session',
    secret:'some secret',
    maxAge: 24 * 60 * 60 * 1000 * 20, // 20 days
    secure: false,
    httpOnly:true
}))


app.get('*', (req,res)=>{
    res.send(`<div style="text-align:center; padding-top: 30vh;">
    <h1 style="font-family: monospace;">For orders please call Yanky :18186052066</h1>
    </div>`)
})

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