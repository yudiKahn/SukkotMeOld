const nodemailer = require('nodemailer');
const items = require('./items');
const { use } = require('./routs');
const mailSender  = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sukkotme@gmail.com',
      pass: 'sukkot130ME'
    }
});

function getItemObj(item, q, price, total=null, byAdmin=false){
    return {item: item, q:q, price: price, total: total ? total :Number(price*q), byAdmin: byAdmin }
}

function getDuplacateItems(arr){
    let items = arr.map(d=>d.item);
    return items.filter((v, i, a)=> a.indexOf(v)!==i )
}

function trimDuplacate(arrOfDup, arrOriginal){
    let arrWithOutDup = arrOriginal.filter((v,i,a)=> arrOfDup.indexOf(v.item) == -1)
    let arrWithDup = arrOriginal.filter((v,i,a)=> arrOfDup.indexOf(v.item) > -1)
    let listToAdd=[]
    arrOfDup.map(d=>{
        let q = 0; let p = 0; let t=0;
        let paidFor = 0, free = 0;
        arrWithDup.map(i=>{
             if(i.item==d){
                q+=i.q; p+=i.price;t+=i.total;
                i.price > 0 ? paidFor+=i.q : free+=i.q;
             }
        })
        let obj = getItemObj(d, q, p, t);
        obj.totalPaid = paidFor;
        obj.totalFree = free;
        listToAdd.push(obj)
    })
    listToAdd.map(d=>{
        arrWithOutDup.push(d);
    })
    return arrWithOutDup;
}

function getOrderItems(itemsAvailable, reqObj){
   let res = [];
   let sumOfIsraeliSets = 0;
   let sumOfYaneverSets = 0;
   //fill paid items & sum of sets
   itemsAvailable.map(d=>{
       if((Number(reqObj[d.t])>0)&&(d.n!==7)&&(d.n!==8)){
           res.push(getItemObj(d.t , Number(reqObj[d.t]) , d.n==0 ? Number(reqObj[`${d.t} price`]) : d.p));
       }
       if(d.n==0){
            if(Number(reqObj[`${d.t} price`])>75){sumOfYaneverSets += Number(reqObj[d.t]);}
            else {sumOfIsraeliSets += Number(reqObj[d.t]);}
       }else if(d.n==1){
            sumOfIsraeliSets += Number(reqObj[d.t]);
       }else if(d.n==2){
            sumOfYaneverSets += Number(reqObj[d.t]);
       }
   })
  
   //fill sets items
    itemsAvailable.map(d=>{
      if(d.n==7&&((sumOfYaneverSets + sumOfIsraeliSets)>0)){
         res.push(getItemObj(d.t , Number(sumOfYaneverSets + sumOfIsraeliSets) , 0 ))
      }else if((d.n==8)&&(sumOfYaneverSets>0)){
         res.push(getItemObj(d.t , sumOfYaneverSets , 0 ))
      }
    })

    //merge duplacate
    let dupArr = getDuplacateItems(res);
    if(dupArr.length>0){
        res = trimDuplacate(dupArr, res);
    }
   return res;
}


function getOrderSum(itemsAvailable, reqObj){
   let res = 0;
   itemsAvailable.map((d,i)=>{
        if(d.n==0){
           res += Number(reqObj[d.t]*reqObj[`${d.t} price`]);
        }else if((d.n!==7)&&(d.n!==8)){
          res += Number(reqObj[d.t]*d.p);
        }
   })
   return res ? res : 0;
}

const htmlResEmail = (first, last, items, sum) => {
    let min="", max="";
    for(let item of items){
        if(item.total>0) min+=`<p>${item.item} &times; ${item.totalPaid||item.q}</p>`;
        max+=`<p>${item.item.replace('set','esrog')} &times; ${item.q}</p>`;
    }
    return(`${(first&&last)?`<h2>Hello ${first} ${last}. Here is your order details</h2>`:''}
    <h4>Your order items</h4>
    ${min}
    <h4>Wht's in the box</h4>
    ${max}
    <b>SUM :$${sum}</b>
    <p>Thank you for your order !</p>
    <p>WHEN YOU RECIEVE YOUR ORDER.
    Place Lulavim in a cool area and keep in a closed box
    Hadasim and Aravos should be refrigerated
    Inspect all merchandise for Kashrus
    Report any damaged products within 24 hours of receiving shipment.</p>
    <p>Payment address:  Y Kahn  18253 Topham St Tarzana CA 91335</p><br/>
    <small>Have a good Yom Tov!</small>`);
}


function sendEmail(items, sum, id){
    items = items.sort((a,b)=>a.item.toLowerCase()>b.item.toLowerCase()?1:a.item.toLowerCase()<b.item.toLowerCase()?-1:0)
    const { users, orders } = require('./model');
    orders.findById(id).then(order=>{
        users.findById(order.userId).then(user=>{
            let mailOptions = {
                from: 'sukkotme@gmail.com',
                to: user.email,
                subject: 'Thank you !',
                html: htmlResEmail(user.firstName, user.lastName, items, sum)
            }
            mailSender.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
        })
    })
}

async function adminSendEmail(doc, reqObj){
    const { users } = require('../src/model');
    let email="";
    await users.findById(doc.userId).then(doc=>email=doc.email)
    let htmlTxt="";
    if(reqObj){
       htmlTxt=`<p>${reqObj}</p>`;
    }else{
        htmlTxt=htmlResEmail(null,null,doc.items,doc.sum);
    }
    let mailOptions = {
        from: 'sukkotme@gmail.com',
        to: email,
        subject: 'Message from Yanky kahn',
        html: htmlTxt
    }
    mailSender.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    getOrderItems: getOrderItems,
    getOrderSum: getOrderSum,
    sendEmail: sendEmail,
    getItemObj:getItemObj,
    adminSendEmail:adminSendEmail
}