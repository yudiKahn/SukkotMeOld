window.onload = function(){

    const adminItems=['Israeli Esrog A PITOM','Israeli Esrog B PITOM','Israeli Esrog C PITOM',
            'Israeli Esrog A NO PITOM','Israeli Esrog B NO PITOM','Israeli Esrog C NO PITOM',
            'Esrog Yannever A PITOM','Esrog Yannever B PITOM','Esrog Yannever C PITOM',
            'Esrog Yannever D PITOM','Esrog Yannever A NO PITOM','Esrog Yannever B NO PITOM',
            'Esrog Yannever C NO PITOM','Esrog Yannever D NO PITOM','Egyptian Lulav','Deri Lulav',
            'Deri Much Lulav','Aruvos', 'Hadas A','Hadas B','Hadas C','Hushanos',"Koisaklach","Plastic bag"];

        function printMoney(money){
            document.getElementById('total-money').innerHTML=`Total all : <b class="c-y">${money} $</b>`;
        }

        function Print(d, whatPrint){
            let tmpItems = '';
            d.items.map(i=>{
                if(i.q>0){
                    tmpItems+=`<tr>
                    <td scope="row">${i.item.toString().replace('set','Esrog')}</td>
                    <td>${i.q}</td>
                    <td><small>${i.price} &times; ${i.q} = $ ${i.total}</small></td>
                    </tr>`;
                }
            })
            document.getElementById('popup-print').style.display='block';
            document.getElementById('popup-print').innerHTML=`<a id="close-popup" style="color:red;position:absolute;top:5px;right:5px;">&times;</a>
            <p>${d.firstName} ${d.lastName} <b>/</b> ${d.email} <b>/</b> ${d.phoneNumber}  <b>/</b> ${d.address}</p>
            ${
                whatPrint=="Order"?
                `<table class="table table-bordered">
                <thead>
                    <tr>
                        <td scope="col">#</td>
                        <td scope="col">Quantity</td>
                        <td scope="col">Price</td>
                    </tr>
                </thead>
                <tbody>
                   ${tmpItems}
                   <tr><th scope="row">SUM :</th><th></th><th>$${d.sum}</th></tr>
                </tbody>
                </table>`:
                `<p><b>Email</b> ${d.email}</p><p><b>Phone number</b> ${d.phoneNumber}</p><p><b>Box No.</b> </p>`
            }
            <button class="btn btn-outline-info" onclick="window.print()">Print</button>`;
            document.getElementById('close-popup').addEventListener('click', ()=>{
                document.getElementById('popup-print').style.display='none';
            })
        }

        function showUpdateForm(username, id){
            const form = document.getElementById('admin-form');
            form.style.display='block';
            form.action=`/admin/update/130240/${id}`;
            document.getElementById('close-form').addEventListener('click',()=> form.style.display='none' );
            document.getElementById('form-user').innerText=username;

            adminItems.map((d,i)=>{
                document.getElementById('form-select').innerHTML+=`<option>${d}</option>`;
            })            


        }

        function getOrders(d, i, items){
           let doneBtn = i.toString().includes('done')? 'unDone' : 'Done';
           let paidBtn = i.toString().includes('paid')? 'unPaid' : 'Paid';
           return (`<div class="list-group-item">
                 <div data-toggle="collapse" data-target="#li${i}"
                 aria-expanded="true" aria-controls="collapseOne">${d.lastName} ${d.firstName}</div>
                 <div id="li${i}" class="collapse" data-parent="#ul">email :${d.email}<br/>
                user name :${d.username}<br/>password :${d.password}<br/>
                ${items}sum:$ ${d.sum}
                <br/>order created at :${new Date(d.createdAt)} <br/> updated at :${new Date(d.updatedAt)}
                <br/>
                 <button value="${d._id}" class="btn btn-outline-success">${paidBtn}</button>
                 <button value="${d._id}" class="btn btn-warning text-white">${doneBtn}</button>
                 <button value="${d._id}" class="btn btn-danger">Delete</button>
                 <button value="${d._id}" class="btn btn-info">Order</button>
                 <button value="${d._id}" class="btn btn-info">Shipping</button>
                 <button value="${d._id}" data-user="${d.firstName} ${d.lastName}" class="btn btn-outline-dark">Edit</button> </div>
                 </div>`);
        }

        function fillPage(){
            let money = 0;
            document.getElementById('ul').innerHTML="";
            document.getElementById('ul-done').innerHTML="";
            document.getElementById('ul-paid').innerHTML="";
            document.getElementById('ul-done-paid').innerHTML="";
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function(){
                if(this.readyState == 4 && this.status == 200){
                    let data = JSON.parse(this.responseText);
                    data = data.sort((a,b) => (a.lastName.toLowerCase() > b.lastName.toLowerCase()) ? 1 : ((b.lastName.toLowerCase() < a.lastName.toLowerCase()) ? -1 : 0))
                    data.map((d,i)=>{
                        money += Number(d.sum);
                        let itemStr = '';
                        d.items.map(t=>t.total>0?itemStr+= `- <em class="c-y">${t.item}</em> - <br>quantaty: ${t.q} total: ${t.total}$<br>`:'')
                        if((!d.isDone)&&(!d.isPaid)){
                        document.getElementById('ul').innerHTML+=getOrders(d,i,itemStr);}
                        else if(d.isPaid&&d.isDone){
                            document.getElementById('ul-done-paid').innerHTML+=getOrders(d,`done-paid`,itemStr);
                        }
                        else if(d.isDone){
                        document.getElementById('ul-done').innerHTML+=getOrders(d,`${i}-done`,itemStr);}
                        else if(d.isPaid){document.getElementById('ul-paid').innerHTML+=getOrders(d,`${i}-paid`,itemStr);}                    
                    })
                    enableBtns();
                    printMoney(money);
                }
            }
            xhttp.open("GET", "/orders/130240", true);
            xhttp.send();
        }
        fillPage()
        function enableBtns(){
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

            document.querySelectorAll('.btn-outline-dark').forEach(btn=>{
                btn.addEventListener('click', e=>{
                    showUpdateForm(e.target.getAttribute('data-user'), e.target.value);
                })
            });
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
        }
}