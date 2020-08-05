const fs = require('fs');
const { use } = require('./routs');

module.exports = class Middleware{
    constructor(){

    }
    static async SignUp(req, res, next){
        const {users} = require('./model');
        let {firstName, lastName, email, phoneNumber,password,city, state, street, zip} = req.body;
        if(!firstName || !lastName || !email || !phoneNumber || !password){
            return res.status(400).send('Please enter all fields')
        }
        if(!city || !state || !street || !zip){
            return res.status(400).send('Please enter all fields')
        }
        let emailRgx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!emailRgx.test(String(email).toLowerCase())){
            return res.status(400).send('Email is not valid')
        }
        await users.find({email: email}).then(doc=>{
            if(doc.length > 0)  return res.status(400).send('User details already taken. Change email');
            else  return next();
        })
    }
    static UpdateProfile(req, res, next){
        const {users} = require('./model');
        users.find({email: req.body.email}).then(doc=>{
            if(doc.length>1){
                return res.status(400).send('Email already taken')
            }else if(doc.length==0){
                return next();
            }else if(doc.length==1){
                if(doc[0]._id.toString() == req.params.id.toString())
                 return next();
                else return res.status(400).send('Email already taken');
            }
        })
    }
    static UserHomePage(req, res, next){
        let users = fs.readFileSync(`${__dirname}/users.json`);
        users=JSON.parse(users);
        users.find(d=>d._id==req.params.id);
        if(users)
         return next();
        return res.redirect('/')
        /*
        const {users} = require('./model');
        users.findById(req.params.id).then(doc=>{
            if(doc){return next();}
            res.redirect('/')
        }).catch(()=>res.redirect('/'));
        */
    }
}