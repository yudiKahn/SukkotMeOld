const nodemailer = require('nodemailer');
const mailSender  = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sukkotme@gmail.com',
      pass: 'sukkot130ME'
    }
});

function getItemObj(item, q, price){
    return {item: item, q:q, price: price, total: Number(price*q) }
}

function getUserItems(itemsAvailable, reqObj){
   let res = [];
   let sumOfIsraeliSets = 0;
   let sumOfYaneverSets = 0;
   itemsAvailable.map((d,i)=>{
        if(d.n==0){
            res.push(getItemObj(d.t , Number(reqObj[d.t]) , Number(reqObj[`${d.t} price`]) ));
        }else if(d.n!==7){
            res.push(getItemObj(d.t , Number(reqObj[d.t]) , d.p ));
        }
        if(d.n==1){
            sumOfIsraeliSets += Number(reqObj[d.t]);
        }
        if(d.n==0 || d.n==2){
            sumOfYaneverSets += Number(reqObj[d.t]);
        }
   })
   
    itemsAvailable.map(d=>{
      let price = Number(reqObj[`${d.t} price`]) || d.p;
      if(d.n==7 || d.n==8)
         res.push(((d.t.toString()=="Hadas B")&&(price>75))? getItemObj(d.t , sumOfYaneverSets , 0 ) : getItemObj(d.t , (Number(sumOfYaneverSets) + Number(sumOfIsraeliSets)) , 0 ));
    })

   return res;
}


function getUserSum(itemsAvailable, reqObj){
   let res = 0;
   itemsAvailable.map((d,i)=>{
        if(d.n==0){
           res += Number(reqObj[d.t]*reqObj[`${d.t} price`]);
        }else if((d.n!==7)&&(d.n!==8)){
          res += Number(reqObj[d.t]*d.p);
        }
   })
   return res;
}

function sendErr(res, msg){
    console.log(msg)
  return res.status(400).send(`<div style="text-align: center;">
  <h1 style="color:red;margin-top:20px;">An error has occurd.</h1>
  <p>${msg}</p>
  <a href="/">Go Back</a></div>`);
}

function sendWarning(res, msg){
   return res.status(200).send(`<div style="text-align: center;">
   <h1 style="color:#eff157;margin-top:20px;">${msg}.</h1>
   <a href="/">Go Back</a></div>`)
}

function sendSuccess(res, msg , details , user , sum){
  let paidItems = '';
  let allItems = '';
  if(details){
     details.map(d=>{
         paidItems += d.total>0 ? `<tr><td>${d.item}</td><td>${d.q}</td><td>${d.total}$</td></tr>`:'';
         allItems += d.q>0 ? `<tr><td>${d.item}</td><td>${d.q}</td><td>${d.total}$</td></tr>`:'';
     })
  }
  return res.status(200).send(`<div style="text-align: center;">
  <h1 style="color:#28a745;margin-top:20px;">${msg}.</h1>
  ${ user ? `<p>Full Name :${user.firstName} ${user.lastName}</p>
     <p>Email :${user.email} <b>/</b> Username :${user.username}</p>`:''}
     <h2 style="color:#ffc107;text-align:left;"><em>Order items.</em></h2>
     <style>table, th, td {border: 1px solid #17a2b8;} th{background-color:#17a2b8;color:white;}</style>
     <table style="width:100%;">
       <thead><tr><th>Items</th><th>Quantity</th><th>Price</th></tr></thead> <tbody>${paidItems}</tbody>
     <table>
     <p style="color:#28a745;text-align:right;"><b style="color:#ffc107;">Total :</b>${sum} $</p>
     <h2 style="color:#ffc107;text-align:left;"><em>What's in the box.</em></h2>
     <table style="width:100%;">
     <thead><tr><th>Items</th><th>Quantity</th><th>Price</th></tr></thead> <tbody>${allItems}</tbody>
     <table>
     <p style="color:#28a745;text-align:right;"><b style="color:#ffc107;">Total :</b>${sum} $</p><a href="/">Go Back</a></div>`)
}

function sendEmail(to){
    mailSender.sendMail({
        from: 'sukkotme@gmail.com',
        to: to,
        subject: 'Thank you !',
        html: htmlTxtRes
    }, (err, info)=>{
        return err ? 'Could not send email' : 'email was sended successfuly';
    });
}

module.exports = {
    getUserItems: getUserItems,
    getUserSum: getUserSum,
    sendErr: sendErr,
    sendWarning: sendWarning,
    sendSuccess: sendSuccess,
    getItemObj: getItemObj
}
/**
 * 
let htmlItmStr = '';
let htmlFreeItmStr = '';
myItems.map(d=>{
    htmlItmStr+=d.total>0?`${d.item} :${d.q}. total: ${d.total}$<br/>`:'';
    htmlFreeItmStr+=((d.total==0)&&(d.q>0))?`${d.item} :${d.q}. total: ${d.total}$<br/>`:'';
})
let htmlTxtRes = `<h1 style="color:#28a745;margin-top:20px;">Your Order Has Been Saved.</h1>
    <p>First Name :${doc.firstName}<br/>
    Last Name :${doc.lastName}<br/>User Name :${doc.username}<br/>Email :${doc.email}
    <br/>${htmlItmStr} ${htmlFreeItmStr.length>0?`<hr/><h3>Free items</h3>${htmlFreeItmStr}`:''}
    <hr/><b>SUM</b> :${doc.sum}$</p>`;
 */