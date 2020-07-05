window.onload = ()=> {

    //user id
    const urlArray = window.location.href.toString().split(/[# , /]/);
    const urlId = urlArray[4];

    //comment form action
    document.getElementById('comment-form').action=`/user/${urlId}/comment`;
    //profile form action
    $('#profile-form').submit(function(e){
        $('#form-loader-profile').css('display','block');
        e.preventDefault();
        let form = $(this);
        $.ajax({ type: "POST", url: `/profile/update/${urlId}`, data: form.serialize(), success: data => {
            $('#errors-for-profile').html('');
            $('#form-loader-profile').css('display','none');
            location.reload();
        }, error: err => {
            $('#form-loader-profile').css('display','none');
            $('#errors-for-profile').html(`<div class="mx-auto alert-dismissible fade show alert alert-warning" role="alert" style="width:90vw; max-width:500px;">
             ${err.responseText}<button type="button" class="close" data-dismiss="alert" aria-label="Close">
             <span aria-hidden="true">&times;</span></button></div>`)
        }}); 
    })

    //some responsive effects
    function changeImgAndColOrRow(){
        let w = window.innerWidth;
        let img = document.getElementById('bg-img-head');

        if(w<500){  img.src="/imgs/d-minim-s.png";}
        else{ img.src="/imgs/d-minim.jpg"; }
        document.querySelectorAll('.col-or-row').forEach(d=>{ if(w<500){ d.classList.remove('col-6');}  else{ d.classList.add('col-6');}})
    }
    changeImgAndColOrRow();
    window.addEventListener('resize', changeImgAndColOrRow);

    //fill user profile
    function fillUserProfile(user){
       let profileDiv = document.getElementById('user-profile-fill');
       let txt=`<li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="custom-control custom-switch">
        <input type="checkbox" class="custom-control-input" id="modify-profile">
        <label class="custom-control-label" for="modify-profile">Modify profile.</label>
        </div><button disabled type="submit" class="p-1 badge badge-primary badge-pill" id="submit-profile">SUBMIT</button>         
        </li>`;
       Object.keys(user).sort().map(d=>{
           if(d == 'address'){
                Object.keys(user[d]).sort().map(a=>{
                    txt+=`<li class="list-group-item d-flex justify-content-between align-items-center">
                     ${a}<input name="${a}" style="max-width:200px" type="${a=='zip'?'number':'text'}" value="${user[d][a]}" disabled class="form-control profile-input"></li>`;
                })
           }else
           txt+=`<li class="list-group-item d-flex justify-content-between align-items-center">
            ${d}<input style="max-width:200px" name="${d}" type="text" value="${user[d]}" disabled class="form-control profile-input"></li>`;
       })
       profileDiv.innerHTML=txt;
       //manage profile update
       document.getElementById('modify-profile').addEventListener('click', function(e){
           let btn = document.getElementById('submit-profile');
           
           let isCheck = e.target.checked;
           btn.disabled = !isCheck;
           document.querySelectorAll('.profile-input').forEach(input=>{
               input.disabled = !isCheck;
           })
       })
    }

    //get user name
    let getUser = new XMLHttpRequest();
    getUser.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){
                let user = JSON.parse(this.responseText);
                //fill user name
                let welcomeTxt = `Welcome`;
                document.getElementById('h1-name').innerHTML=`${welcomeTxt} ${user.firstName} ${user.lastName}`;                
                //fill user profile
                fillUserProfile(user);
        }    
    }
    getUser.open("GET", `/user/${urlId}`, true);
    getUser.send();

    //gets all ordrs for user
    function getAllOrders(){
        let orders = new XMLHttpRequest();
        orders.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                const orders = JSON.parse(this.responseText);
                let htmlTxtOrder = "";
                let htmlTxtForDel="";
                if(orders.length>0){
                    for(let order of orders){
                        let date = `${new Date(order.createdAt).toDateString()} ${new Date(order.createdAt).getHours()}:${new Date(order.createdAt).getMinutes()}`;
                        let orderMin = `<h5 class="p-3 text-primary"><span class="badge badge-primary badge-pill">Order items</span> <b>/</b> ${date}</h5>
                        <ul id="user-order-min" class="list-group">`;
                        let orderMax = `<h5 class="p-3 collapsed justify-content-between align-items-center d-flex" data-toggle="collapse" aria-expanded="false"
                        data-target="#li${order._id.toString().slice(0,6)}" aria-controls="collapseOne">
                        <span class="badge badge-primary badge-pill">What's in the box &nbsp;<i class="fa fa-mouse-pointer"></i></span>
                        <span class="badge badge-primary badge-pill">TOTAL :$${order.sum}</span></h5>
                        <ul id="li${order._id.toString().slice(0,6)}" class="list-group collapse" data-parent="#user-orders-fill">`;
                        //delete page
                        htmlTxtForDel+=`<button class="btn-delete-order btn btn-block btn-danger w-75 mx-auto my-4" 
                        value="${order._id}">Delete order created at ${date}</button>`;
                        //orders page
                        for(let item of order.items){
                            if(item.price>0){
                                orderMin+= `<li class="list-group-item d-flex justify-content-between align-items-center">
                                ${item.item}<span class="badge badge-primary badge-pill">${item.totalPaid||item.q}</span></li>`;
                            }
                            orderMax+=`<li class="list-group-item d-flex justify-content-between align-items-center">
                            ${item.item.replace('set','Esrog')}<span class="badge badge-primary badge-pill">${item.q}</span></li>`;
                        }
                        orderMin+="</ul>";orderMax+="</ul>";
                        //price
                        htmlTxtOrder+=`${orderMin}${orderMax}`;
                    }
                }else{
                    let txt = '<h5 class="text-warning text-center">There are no orders.</h5>';
                    htmlTxtForDel=txt;htmlTxtOrderMin=txt;
                }
                document.getElementById('user-orders-fill').innerHTML=htmlTxtOrder;
                document.getElementById('user-orders-delete').innerHTML=htmlTxtForDel;
                enableBtns();
            }
        }
        orders.open("GET", `/orders/${urlId}/all`, true);
        orders.send();
    }getAllOrders();

    //delete order
    function enableBtns(){
        document.querySelectorAll('.btn-delete-order').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                let del = new XMLHttpRequest();
                del.onreadystatechange = function(){
                    if(this.readyState==4 && this.status==200){
                        location.reload();
                    }
                }
                del.open("POST", `/order/${btn.value}/delete`, true);
                del.send();
            })
        })
    }

    //form update order action
    //document.getElementById('form-update').action=`/order/${urlId}/update`;

    //form create order action
    document.getElementById('form-new').action=`/order/${urlId}/new`;
    
    //form comment action
    //document.getElementById('comment-form').action=`/comment/${urlId}/send`

    //check inputs
    function checkInputs(){
        document.querySelectorAll('input').forEach((inp,ind)=>{
            if(inp.min){
                let min = inp.min;
                let max = inp.max||2000;
                inp.addEventListener('input', function(){
                    if(Number(this.value) > max || Number(this.value) < min){
                        this.style.color="red";
                    }else{
                        this.style.color="black"
                    }
                })
            }
        });
    }

    //fill d minim form
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let arr = JSON.parse(this.responseText);
            let tmpMinimArr = ['Israeli Esrog set','Yanover Esrog set','Lulav','Hadasim','Aruvos','Hoshnos','Schach','Lulav Bag'];
            let comment = ['Each set comes complete with Lulav, Esrog, Hadasim, Aruvos, Koshelach & Plastic bag',
                 'Each set comes complete with Lulav, Esrog, Hadasim "רובו חיים נאה & כולו חיים נאה",  Aruvos & Plastic bag',
                 'if you want additional lulavim', 'if you want additional hadasim', 'if you want additional aruvos']
            let itemsToGoOver = [1, 2 ,3 ,4, 5, 6, 9, 10];
            //israeli set, yanever, lulav, arava, hadas, hushana, schach, lulav bag.

            document.querySelectorAll('.fill-d-minim').forEach(minim=>{
                tmpMinimArr.map((d,index)=>{
                    minim.innerHTML+=`<div class="p-3" id="min-${d}">
                    <h2 class="text-success">${d}</h2><small class="text-dark">${comment[index]?comment[index]:''}</small>
                    ${
                        arr.filter(d=>d.n==itemsToGoOver[index]).map(m=>`<div class="row">
                        <div class="col ${m.t.toString().includes('NO')?'text-warning':''}">${m.t}
                            ${m.n==1?`<b style="color:black;text-decoration:underline;">${m.p>25?'Mehudar':m.p<25?'Chinuch':'Standard'}</b>`:''}</div>
                        <div class="col"><input type="number" name="${m.t}" min="0" class="form-control"></div>
                        <div class="col">$ ${m.p}</div>
                        </div>`)
                    }
                    </div>`;
                }); 
            });
            checkInputs();
        }
    };
    xhttp.open("GET", "/items", true);
    xhttp.send();

    //secret
    document.getElementById('yanky').addEventListener('click', e=>{
        if(e.detail==3){
            window.location = "/auth.html";
        }
    })
}