const nodemailer = require('nodemailer');
const mailSender  = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sukkotme@gmail.com',
      pass: 'sukkot130ME'
    }
});

function getItemObj(item, q, price, total){
    return {item: item, q:q, price: price, total: total}
}

function getUserItems(itemsAvailable, reqObj){
   let res = [];
   let sumOFSets = 0;
   itemsAvailable.map((d,i)=>{
        if(d.n==0){
            res.push(getItemObj(d.t , Number(reqObj[d.t]) , Number(reqObj[`${d.t} q`]) , Number(reqObj[d.t]*reqObj[`${d.t} q`]) ));
        }else if(d.n!==7){
            res.push(getItemObj(d.t , Number(reqObj[d.t]) , d.p , Number(reqObj[d.t]*d.p) ));
        }
        if(d.n==0 || d.n==1){
            sumOFSets += Number(reqObj[d.t]);
        }
   })

    itemsAvailable.map(d=>{
        if(d.n==7){
            res.push(getItemObj(d.t , sumOFSets , 0 , 0 ))
        }
    })

   return res;
}


function getUserSum(itemsAvailable, reqObj){
   let res = 0;
   itemsAvailable.map((d,i)=>{
        if(d.n==0){
           res += Number(reqObj[d.t]*reqObj[`${d.t} q`]);
        }else if(d.n!==7){
          res += Number(reqObj[d.t]*d.p);
        }
   })
   return res;
}

function sendErr(res, msg){
  return res.status(400).send(`<div style="text-align: center;">
  <h1 style="color:red;margin-top:20px;">${msg}.</h1>
  <a href="/">Go Back</a></div>`);
}

function sendWarning(res, msg){
   return res.status(200).send(`<div style="text-align: center;">
   <h1 style="color:#eff157;margin-top:20px;">${msg}.</h1>
   <a href="/">Go Back</a></div>`)
}

function sendSuccess(res, msg , details , user , sum){
  let paidItems = '';
  let freeItems = '';
  if(details){
     details.map(d=>{
         paidItems += d.total>0 ? `<p>${d.item} :${d.q}. total: ${d.total}$</p>`:'';
         freeItems += ((d.total==0)&&(d.q>0)) ? `<p>${d.item} :${d.q}. total: ${d.total}$</p>`:'';
     })
  }
  return res.status(200).send(`<div style="text-align: center;">
  <h1 style="color:#28a745;margin-top:20px;">${msg}.</h1>
  ${ user ? `<p>Full Name :${user.firstName} ${user.lastName}</p>
     <p>Email :${user.email} <b>/</b> Username :${user.username}</p>`:''}
  ${paidItems}${freeItems.length>0?`<hr/><h3>Free items</h3>${freeItems}`:''}<p><b>SUM :</b>${sum} $</p><a href="/">Go Back</a></div>`)
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
    sendSuccess: sendSuccess
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