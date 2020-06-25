const nodemailer = require('nodemailer');
const items = require('./items');
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
        let q = 0;
        let p = 0;
        let t=0;
        arrWithDup.map(i=>{
             if(i.item==d){
                q+=i.q; p+=i.price;t+=i.total;
             }
        })
        listToAdd.push(getItemObj(d, q, p, t))
    })
    listToAdd.map(d=>{
        arrWithOutDup.push(d);
    })
    return arrWithOutDup;
}

function getUserItems(itemsAvailable, reqObj){
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
      if(d.n==7){
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

function sendErr(msg){
    console.log(msg)
  return (`<div style="text-align: center;">
  <h1 style="color:red;margin-top:20px;">An error has occurd.</h1>
  <p>${msg}</p>
  <a href="/">Go Back</a></div>`);
}

function sendWarning(msg){
   return (`<div style="text-align: center;">
   <h1 style="color:#eff157;margin-top:20px;">${msg}.</h1>
   <a style="cursor: pointer;" id="go-back">Go Back</a></div>
   <script type="text/javascript">document.getElementById('go-back').addEventListener('click',()=>{
    window.history.back();
   })</script>`)
}

function sendSuccess(msg , details , user , sum){
  let paidItems = '';
  let allItems = '';
  if(details){
     details.map(d=>{
         paidItems += d.total > 0 ? `<tr><td>${d.item}</td><td>${d.q}</td><td>${d.total}$</td></tr>`:'';
         allItems += d.q > 0 ? `<tr><td>${d.item.toString().includes('set')?d.item.replace('set','Esrog'):d.item}</td><td>${d.q}</td><td>${d.total}$</td></tr>`:'';
     })
  }
  return (`<div style="text-align: center;">
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

function sendEmail(userBody, txt, array=null){
    let res = 'Email was send';
    let htmlTxtRes = `<h1>Sukkot Order.</h1>`;
    if(array){
        array.map(d=>{
            htmlTxtRes+=`<p>${d.item} &times; ${d.q} = $${d.price}. ${d.byAdmin?'<small style="color:#ffc107;">Added by Yanky Kahn</small>':''}</p>`
        })
    }else{
        htmlTxtRes+=`<p>${txt}</p>`;
    }
    mailSender.sendMail({
        from: 'sukkotme@gmail.com',
        to: userBody.email,
        subject: 'Thank you !',
        html: htmlTxtRes
    }, (err, info)=>{
        err ? res='Email was not send':'';
    });
    return res;
}

module.exports = {
    getUserItems: getUserItems,
    getUserSum: getUserSum,
    sendErr: sendErr,
    sendWarning: sendWarning,
    sendSuccess: sendSuccess,
    getItemObj: getItemObj,
    sendEmail: sendEmail
}
/*

 */