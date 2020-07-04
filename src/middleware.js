const CRUD = require('./crud');

module.exports = class Middleware{
    constructor(){

    }
    static async SignUp(req, res, next){
        let {firstName, lastName, email, phoneNumber,password,city, state, street, zip} = req.body;
        if(!firstName || !lastName || !email || !phoneNumber || !password){
            return res.status(400).send('enter all fields')
        }
        if(!city || !state || !street || !zip){
            return res.status(400).send('enter all fields')
        }
        let emailRgx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!emailRgx.test(String(email).toLowerCase())){
            return res.status(400).send('email is not valid')
        }
        let crud = new CRUD('users');
        let emails =  await crud.ReadAll()
        if(emails.filter((v,i,a)=>v.email==email).length > 0){
            return res.status(400).send('user details already taken')
        }
        return next();
    }
}