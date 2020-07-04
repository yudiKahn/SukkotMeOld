const pass = 123240;

function runOnReady(func){
    $(window).ready(func);
}

function init(){
    $.getJSON(`/users-and-orders/${pass}`, data=> runOnReady(fillUsersOrders(data))  );
    $.getJSON(`/admin/getNames/${pass}`,data=> runOnReady(fillUsersNames(data)) );
    $.getJSON(`/admin/getComments/${pass}`, data => runOnReady(fillUsersComments(data)) );
};

//init page
init();

function fillUsersOrders(usersArray){
    let totalMoney = getTotalMoney(usersArray);
    let orders = getOrders(usersArray, 'order');
    let doneOrders = getOrders(usersArray, 'done_orders');
    let paidOrders = getOrders(usersArray, 'paid_orders');
    let paidAndDoneOrders = getOrders(usersArray, 'done_paid');

    printMoney(totalMoney);
    printUsers([orders, doneOrders, paidOrders, paidAndDoneOrders]);
    enableBtns();
}

function fillUsersNames(arr){
    $('#names-ul').html('');
    let res = arr.sort();
    res = res.filter((v,i,a)=>a.indexOf(v)==i);
    res.map(d=>$('#names-ul').append(`<li class="list-group-item">${d}</li>`))
}

function fillUsersComments(arr){
    $('#comments-ul').html('');
    let res = arr.sort((a,b) => a.user.firstName.toLowerCase() > b.user.lastName.toLowerCase() ? 1 : a.user.firstName.toLowerCase() < b.user.lastName.toLowerCase() ? -1 : 0);
    res.map(d=> $('#comments-ul').append(getCommentInHTML(d)));
}

function getCommentInHTML(commentObj){
    let comments = "";
    for(let comment of commentObj.commsArr){
        comments+=`<b>${comment.subject}</b><p>${comment.text}</p>`
    }
    let res = `<li class="list-group-item">
    <h6 class="text-info">${comments}</h6>
    <small>${commentObj.user.lastName} ${commentObj.user.firstName}. 
    <a href="mailto:${commentObj.user.email}">Send Response</a></small></li>`;

    return res;
}

function getTotalMoney(arr){
   let res = 0;
   for(let user of arr){
        for(let order of user.order){
            res += Number(order.sum);
        }
        for(let order of user.done_orders){
            res += Number(order.sum);
        }
   }
   return Number(res);
}
function getOrders(arr, typeOfOrder){
    let res = '';
    for(let index in arr){
        res += getOrderInHTML(arr[index].user, index, arr[index][typeOfOrder])
    }
    return res;
}
 //returns order in html
 function getOrderInHTML(d, i, orders){
    if(orders.length>0){
        let tableTxt='';
        return (`<style>table, th, td {border: 1px solid #17a2b8;} th{background-color:#17a2b8;color:white;}</style>
            <div class="list-group-item">
            <div data-toggle="collapse" data-target="#li${i}"
            aria-expanded="true" aria-controls="collapseOne">${d.lastName} ${d.firstName}</div>
            <div id="li${i}" class="collapse" data-parent="#ul">
            <p><small>${d.email}<b>/</b>password :${d.password}</small></p>
            <h4 style="color:#ffc107;text-align:left;"><em>Order items.</em></h4>
            ${
                orders.map(order=>{
                    let doneBtn = order.isDone ? 'unDone' : 'Done';
                    let paidBtn = order.isPaid ? 'unPaid' : 'Paid';
                    tableTxt+=
                    `<div class="mb-5"><table style="width:100%;"><thead><tr><th>Items</th><th>Quantity</th><th>Price</th></tr></thead><tbody>`;
                    order.items.map(d=>tableTxt+=`<tr class="${d.byAdmin?'bg-dark text-white':''}">
                    <td>${d.item}</td><td>${d.q}</td><td>${d.price}</td></tr>`);
                    tableTxt+=`</tbody></table>
                    <p><small>sum: $ ${order.sum ? order.sum:0}</small></p>
                    <button value="${order._id}" class="btn btn-outline-success">${paidBtn}</button>
                    <button value="${order._id}" class="btn btn-warning text-white">${doneBtn}</button>
                    <button value="${order._id}" class="btn btn-danger">Delete</button>
                    <button value="${order._id}" class="btn btn-info">Order</button>
                    <button value="${order._id}" class="btn btn-info">Shipping</button>
                    <button value="${order._id}" data-user="${d.firstName} ${d.lastName}" class="btn btn-outline-dark">Edit</button>
                    <button value="${order._id}" data-user="${d.firstName} ${d.lastName}-${d.email}" class="btn btn-outline-primary">Email</button></div>`;
                })
            }${tableTxt}
            </div></div>`);
    }else return '';
    
}
//show total money
function printMoney(money){
    document.getElementById('total-money').innerHTML=`Total all : <b class="c-y">$ ${money}</b>`;
}
//print users orders
function printUsers(usersArr){
    ['ul','ul-done','ul-paid','ul-done-paid'].map((d,i)=>{
        document.getElementById(d).innerHTML=usersArr[i];
    })
}

//enable btns
function enableBtns(){
    //delete
    $('.btn-danger').each((i,btn)=>{
        $(btn).click(()=>{
            if (confirm('Are you sure you want to delete from the database?')) {
                $.ajax({url: `/delete/${btn.value}`, success: init });
            } 
        })
    })
    //print
    $('.btn-info').each((i,btn)=>{
        $(btn).click(()=>{
              $.ajax({url: `/get/${btn.value}`, success: result => Print(result, $(btn).text()) });
        })
    })
    //done
    $('.btn-warning').each((i,btn)=>{
        $(btn).click(()=>{ $.ajax({url: `/orderdone/${btn.value}`, success: init }); })
    })
    //edit
    $('.btn-outline-dark').each((i,btn)=>{
        $(btn).click(()=>{ showUpdateForm($(btn).attr('data-user'), btn.value); })
    })
    //paid
    $('.btn-outline-success').each((i,btn)=>{
       $(btn).click(()=>{  $.ajax({url: `/orderpaid/${btn.value}`, success: init });  })
    })
    //email
    $('.btn-outline-primary').each((i,btn)=>{
        $(btn).click(()=> showEmailForm($(btn).attr('data-user'), btn.value) );
    })
}
 //show print page
function Print(obj, whatPrint){
    let tmpItems = [];
    let sortedItems = obj.doc.items.sort((a,b)=>(a.item.toLowerCase() > b.item.toLowerCase()) ? 1 : ((a.item.toLowerCase() < b.item.toLowerCase()) ? -1 : 0))
    sortedItems.map(i=>{
            tmpItems+=`<tr class="${i.byAdmin? 'bg-dark text-white':''}">
            <td scope="row">${i.byAdmin?'+ ':''}${i.item.toString().replace('set','Esrog')}</td>
            <td>${i.q}</td>
            <td> $ ${i.total}</td>
            </tr>`;
    })
    document.getElementById('popup-print').style.display='block';
    document.getElementById('popup-print').innerHTML=`<a id="close-popup" style="color:red;position:absolute;top:5px;right:5px;">&times;</a>
    <p>${obj.user.firstName} ${obj.user.lastName} <b>/</b> ${obj.user.email} <b>/</b> ${obj.user.phoneNumber}  <b>/</b> 
    ${obj.user.address.city} ${obj.user.address.street} ${obj.user.address.zip} ${obj.user.address.state}</p>
    ${
        whatPrint=="Order"?
        `<table class="table table-bordered"><thead><tr><td scope="col">#</td><td scope="col">Quantity</td>
            <td scope="col">Price</td></tr></thead> <tbody>${tmpItems}<tr><th scope="row">SUM :</th><th></th><th>$${obj.doc.sum ? obj.doc.sum: 0}</th></tr>
        </tbody></table>`: `<p><b>Email</b> ${obj.user.email}</p><p><b>Phone number</b> ${obj.user.phoneNumber}</p><p><b>Box No.</b> </p>`
    }
    <button class="btn btn-outline-info" onclick="window.print()">Print</button>`;
    document.getElementById('close-popup').addEventListener('click', ()=>{
        document.getElementById('popup-print').style.display='none';
    })
}
//show admin update form
const adminItems=['Israeli Esrog A PITOM','Israeli Esrog B PITOM','Israeli Esrog C PITOM',
'Israeli Esrog A NO PITOM','Israeli Esrog B NO PITOM','Israeli Esrog C NO PITOM',
'Esrog Yannever A PITOM','Esrog Yannever B PITOM','Esrog Yannever C PITOM',
'Esrog Yannever D PITOM','Esrog Yannever A NO PITOM','Esrog Yannever B NO PITOM',
'Esrog Yannever C NO PITOM','Esrog Yannever D NO PITOM','Egyptian Lulav','Deri Lulav',
'Deri Much Lulav','Aruvos', 'Hadas A','Hadas B','Hadas C','Hoshnos',"Koisaklach","Plastic bag"];
function showUpdateForm(username, id){
    const form = document.getElementById('admin-form');
    form.style.display='block';
    form.action=`/admin/update/${pass}/${id}`;
    document.getElementById('close-form').addEventListener('click',()=> form.style.display='none' );
    document.getElementById('form-user').innerText=username;

    adminItems.map((d,i)=>{
        document.getElementById('form-select').innerHTML+=`<option>${d}</option>`;
    })          
}
//show admin email form
function showEmailForm(username, id){
    const form = document.getElementById('adminemail-form');
    form.style.display='block';
    form.action=`/admin/email/130240/${id}`;
    document.getElementById('closeemail-form').addEventListener('click',()=> form.style.display='none' );
    document.getElementById('formemail-user').innerText=username;    
    document.getElementById('send-email-update').addEventListener('click',function(){
        form.action=`/admin/email-update/130240/${id}`;
        this.type='submit';
    })   
}
/*
window.onload = function(){

    //returns order in html
    function getOrders(d, i, orders){
        if(orders.length>0){
            let tableTxt='';
            return (`<style>table, th, td {border: 1px solid #17a2b8;} th{background-color:#17a2b8;color:white;}</style>
                <div class="list-group-item">
                <div data-toggle="collapse" data-target="#li${i}"
                aria-expanded="true" aria-controls="collapseOne">${d.lastName} ${d.firstName}</div>
                <div id="li${i}" class="collapse" data-parent="#ul">
                <p><small>${d.email}<b>/</b>password :${d.password}</small></p>
                <h4 style="color:#ffc107;text-align:left;"><em>Order items.</em></h4>
                ${
                    orders.map(order=>{
                        let doneBtn = order.isDone ? 'unDone' : 'Done';
                        let paidBtn = order.isPaid ? 'unPaid' : 'Paid';
                        tableTxt+=
                        `<div class="mb-5"><table style="width:100%;"><thead><tr><th>Items</th><th>Quantity</th><th>Price</th></tr></thead><tbody>`;
                        order.items.map(d=>tableTxt+=`<tr class="${d.byAdmin?'bg-dark text-white':''}">
                        <td>${d.item}</td><td>${d.q}</td><td>${d.price}</td></tr>`);
                        tableTxt+=`</tbody></table>
                        <p><small>sum: $ ${order.sum ? order.sum:0}</small></p>
                        <button value="${order._id}" class="btn btn-outline-success">${paidBtn}</button>
                        <button value="${order._id}" class="btn btn-warning text-white">${doneBtn}</button>
                        <button value="${order._id}" class="btn btn-danger">Delete</button>
                        <button value="${order._id}" class="btn btn-info">Order</button>
                        <button value="${order._id}" class="btn btn-info">Shipping</button>
                        <button value="${order._id}" data-user="${d.firstName} ${d.lastName}" class="btn btn-outline-dark">Edit</button>
                        <button value="${order._id}" data-user="${d.firstName} ${d.lastName}-${d.email}" class="btn btn-outline-primary">Email</button></div>`;
                    })
                }${tableTxt}
                </div></div>`);
        }else return '';
        
    }

    //increase total
    function increaseTotal(userObj){
        let res=0;
        userObj.order.map(o=>res+=Number(o.sum));
        userObj.done_orders.map(o=>res+=Number(o.sum));
        return Number(res);
    }

    //fill page with orders
    function fillPage(){
        let money = 0;
        let ul = document.getElementById('ul');
        let ul_done = document.getElementById('ul-done');
        let ul_paid = document.getElementById('ul-paid');
        let ul_done_paid = document.getElementById('ul-done-paid');
        ul.innerHTML="";ul_done.innerHTML="";ul_paid.innerHTML="";ul_done_paid.innerHTML="";
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                let data = JSON.parse(this.responseText);
                data = data.sort((a,b) => (a.user.lastName.toLowerCase() > b.user.lastName.toLowerCase()) ? 1 : ((a.user.lastName.toLowerCase() < b.user.lastName.toLowerCase()) ? -1 : 0))
                data.map((d,i)=>{
                    ul.innerHTML+=getOrders(d.user,i, d.order);
                    ul_done.innerHTML+=getOrders(d.user,i, d.done_orders);
                    ul_paid.innerHTML+=getOrders(d.user, i, d.paid_orders);
                    ul_done_paid.innerHTML+=getOrders(d.user, i , d.done_paid);
                    money += increaseTotal(d);
                });
                enableBtns();
            }
            printMoney(money);
        }
        xhttp.open("GET", "/users-and-orders/130240", true);
        xhttp.send();
    }
    fillPage()

    //enable btns
    function enableBtns(){
        //delete
        document.querySelectorAll('.btn-danger').forEach(btn=>{
            btn.addEventListener('click', e=>{
                if (confirm('Are you sure you want to delete from the database?')) {
                    let del = new XMLHttpRequest();
                    del.onreadystatechange = function(){
                        if(this.readyState == 4 && this.status == 200){
                            location.reload();
                        }
                    }
                    del.open("GET", `/delete/${e.target.value}`, true);
                    del.send();
                } 
            })
        });
        //print
        document.querySelectorAll('.btn-info').forEach(btn=>{
            btn.addEventListener('click', e=>{
                let del = new XMLHttpRequest();
                del.onreadystatechange = function(){
                    if(this.readyState == 4 && this.status == 200){
                        Print(JSON.parse(this.responseText), btn.innerText)
                    }
                }
                del.open("GET", `/get/${e.target.value}`, true);
                del.send();
            })
        });
        //done
        document.querySelectorAll('.btn-warning').forEach(btn=>{
            btn.addEventListener('click', e=>{
                let del = new XMLHttpRequest();
                del.onreadystatechange = function(){
                    if(this.readyState == 4 && this.status == 200){
                        fillPage();
                    }
                }
                del.open("GET", `/orderdone/${e.target.value}`, true);
                del.send();
            })
        });
        //edit
        document.querySelectorAll('.btn-outline-dark').forEach(btn=>{
            btn.addEventListener('click', e=>{
                showUpdateForm(e.target.getAttribute('data-user'), e.target.value);
            })
        });
        //paid
        document.querySelectorAll('.btn-outline-success').forEach(btn=>{
            btn.addEventListener('click', e=>{
                let del = new XMLHttpRequest();
                del.onreadystatechange = function(){
                    if(this.readyState == 4 && this.status == 200){
                        fillPage();
                    }
                }
                del.open("GET", `/orderpaid/${e.target.value}`, true);
                del.send();
            })
        });
        //email
        document.querySelectorAll('.btn-outline-primary').forEach(btn=>{
            btn.addEventListener('click', e=>{
                showEmailForm(e.target.getAttribute('data-user'), btn.value);
            })
        })
    }

    //fill users names list
    let names = new XMLHttpRequest();
    const pass = 0;
    names.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById('names-ul').innerHTML="";
            let res = JSON.parse(this.responseText);
            res = res.sort();
            res.map(d=>document.getElementById('names-ul').innerHTML+=`<li class="list-group-item">${d}</li>`)
        }
    }
    names.open("GET", `/admin/getNames/${pass}`, true)
    names.send();

    //fill comments list
    let comments = new XMLHttpRequest();
    comments.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById('comments-ul').innerHTML="";
            JSON.parse(this.responseText).map(d=>{
                document.getElementById('comments-ul').innerHTML=`<li>
                <h4 style="border-bottom: 1px solid black;">${d.subject}</h4>
                <p class="text-info">${d.text}</p>
                <small>From :${d.firstName} ${d.lastName}<b>/</b>${d.email}<b>/</b>${d.phoneNumber}</small>
                <a href="mailto:${d.email}">Send Response</a>
                </li>`
            })
        }
    }
    comments.open("GET", "/admin/130240/getComments", true);
    comments.send();
}
*/