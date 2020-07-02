const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname+'/public'));
function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

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