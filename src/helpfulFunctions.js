const nodemailer = require('nodemailer');
const items = require('./items');
const mailSender  = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sukkotme@gmail.com',//'iesrogonline@gmail.com'
      pass: 'sukkot130ME'//'chanais11'
    }
});

function getId(){
    let nums='';
    for(let i=0;i<10;i++){
        nums += Math.floor(Math.random()*1000).toString();
    }
    return `${new Date().valueOf()}_${nums}`;
}

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

const invoiceEmail = (order, billed,total, id) => {
    const col = `-ms-flex-preferred-size: 0;flex-basis: 0; -ms-flex-positive: 1; flex-grow: 1; max-width: 100%;
        position: relative;width: 100%;padding-right: 15px;padding-left: 15px;`;
    let items='';
    order.map(i=>{
        if(i.total>0){
            items+=`
            <tr>
              <td>${i.item}</td>
              <td>${i.q}</td>
              <td>${i.price}</td>
              <td>${i.total}</td>
            </tr>`
        }
    });
    billed = `${billed.firstName} ${billed.lastName}<br/>
    ${billed.address.city} ${billed.address.state}
    ${billed.address.street} ${billed.address.zip}`;
    return(`
    <div>
        <div style="border-bottom: 3px solid #343a40;padding: 1rem; margin-left: 1rem;margin-right: 1rem;">
            <table style="width:100%;margin-bottom:1em;color: #343a40; background-color: #f8f9fa; padding:1em;">
                <tr>
                <td>INOICVE</td>
                <td><small> 18253 Topham St<br>Tarzana CA 91335  </small></td>
                <td>${id}</td>
                </tr>
            </table>
            <table style="width:100%;color: #343a40; background-color: #f8f9fa; padding:1em;">
                <tr>
                <td>
                    <small>Billed To</small>
                    <p>${billed}</p>
                </td>
                <td>
                    <small>Date</small>
                    <p>${new Date().getMonth()}/${new Date().getDay()}/${new Date().getFullYear()}</p>
                </td>
                <td>
                    <small>Total</small>
                    <p>$${total}</p>
                </td>
                </tr>
            </table>
        </div>
        <div style="padding: 1rem; margin: 1rem;">
            <table style="width:100%;color: #343a40; background-color: #f8f9fa; padding:.5em;">
                <thead>
                    <tr>
                    <td>Item</td>
                    <td>Qty</td>
                    <td>Price</td>
                    <td>Total</td>
                    </tr>
                </thead>
                <tbody>
                ${items}
                </tbody>
            </table>
        </div>
        <h4 style="text-align: center;">Thank you for you'r buisness</h4>
    </div>`)
}
function boxEmail(orderObj, userObj){
    let paid='', all='', bc='#343a40', lc='#f8f9fa', wc='#ffc107',pc='#007bff';
    orderObj.items.map((d,i)=>{
        if(d.total>0){
            paid+=` <tr>
                    <td>${d.item}</td>
                    <td>${d.q}</td>
                    <td>${d.price}</td>
                    <td>${d.total}</td>
                </tr>`
        }
        all+=`<tr ${d.byAdmin?`style="background-color:${bc};color:${lc};"`:''}>
            <td>${d.item.toString().replace('set','Esrog')}</td>
            <td>${d.q}</td>
            <td>${d.price}</td>
            <td>${d.total}</td>
        </tr>`
    })
    return(`
        <div style="padding:1em;">
            <h3 style="text-align:center;color:${bc};font-weight:200;margin-bottom:3em;font-size: x-large;">
              <em>Order update for: ${userObj.firstName} ${userObj.lastName}</em>
            </h3>
            <h5 style="color:${wc};font-size: larger;">Order items:</h5>
            <table style="width:100%;margin-bottom:3em;border-color:${pc};" border="1">
                <thead stye="text-align:left;">
                    <tr>
                        <th style="background-color:${pc};color:${lc};">Item</th>
                        <th style="background-color:${pc};color:${lc};">Qty</th>
                        <th style="background-color:${pc};color:${lc};">Price</th>
                        <th style="background-color:${pc};color:${lc};">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${paid}
                </tbody>
            </table>
            <h5 style="color:${wc};font-size: larger;">What's in the box:</h5>
            <table style="width:100%;margin-bottom:3em;border-color:${pc};" border="1">
                <thead stye="text-align:left;">
                    <tr>
                        <th style="background-color:${pc};color:${lc};">Item</th>
                        <th style="background-color:${pc};color:${lc};">Qty</th>
                        <th style="background-color:${pc};color:${lc};">Price</th>
                        <th style="background-color:${pc};color:${lc};">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${all}
                </tbody>
            </table>
        </div>
    `)
}

function sendEmail(id ,isInvoice){
    const { users, orders } = require('./model');
    orders.findById(id).then(order=>{
        users.findById(order.userId).then(user=>{
            let mailOptions = {
                from: 'iesrogonline@gmail.com',
                to: user.email,
                subject: isInvoice ? 'Esrog invoice':'Esrog update',
                html: isInvoice ? invoiceEmail(order.items, user, order.sum) : boxEmail(order, user)
            }
            mailSender.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                  return false;
                } else {
                  console.log('Email sent: ' + info.response);
                  return true;
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
        htmlTxt='';
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
    getOrderItems,
    getOrderSum,
    sendEmail,
    getItemObj,
    adminSendEmail,
    getId
}