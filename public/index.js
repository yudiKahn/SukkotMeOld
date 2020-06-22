window.onload = () =>{
    document.getElementById('toggle-pass').addEventListener('click', function(){
        document.getElementById('main-form-pass').type = this.checked ? 'text':'password';
    });

    let tmpMinimArr = ['Israeli set','Esrog','Lulav','Hadasim','Aruvos','Hushanos'];
    document.getElementById('to-items').addEventListener('click',()=>{
        document.getElementById('items').style.display='block';
    })
    document.getElementById('close-items').addEventListener('click',()=>{
        document.getElementById('items').style.display='none';
    })
    let update = false;
    document.getElementById('update').addEventListener('click', function(){
        let placehold = ['Address','Email','Phone Number','First Name','Last Name'];
        update = !update;
        this.innerHTML = update? 'New Order' : 'Update Order';
        document.getElementById('form').action = update ? '/update' : '/order';
        document.getElementById('form-status').innerHTML = update ? '- Update -' : '- New Order -';
        document.getElementById('form-note').innerHTML = update ? 'Forgot password / username ?!<a href="tel:+18186052066">call me</a>.':"You can change you'r order in the future with this username & password."
        document.querySelectorAll('.dis-on-up').forEach((input,index)=>{
          input.placeholder = update ? 'Not Requierd on updating order':`Enter ${placehold[index]}`;
          input.disabled = update;
        })
    })

    let arr;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            arr = JSON.parse(this.responseText);
            let set = arr.filter(d=>d.n==1);
            let estrog = arr.filter(d=>d.n==2);
            let lulav = arr.filter(d=>d.n==3);
            let arava = arr.filter(d=>d.n==4);
            let hadas = arr.filter(d=>d.n==5);
            let husana = arr.filter(d=>d.n==6);

            tmpMinimArr.map((d,index)=>{
                let a = [set,estrog, lulav, hadas, arava, husana];
                let currentMin = a[index];
                document.getElementById('min').innerHTML+=`<div class="p-3" id="min-${d}">
                <h2 class="text-success">${d}</h2>
                ${
                    currentMin.map(m=>`<div class="row">
                    <div class="col ${m.t.toString().includes('NO')?'text-warning':''}">${m.t}</div>
                    <div class="col"><input type="number" name="${m.t}" min="0" class="form-control"></div>
                    <div class="col">${m.p} $</div>
                    </div>`)
                }
                </div>`;
            })
            
            function sale(){
                setTimeout(()=>{
                    let yan = document.getElementById('yan-e');
                    let isra = document.getElementById('ysra-e');
                    yan.addEventListener('click', ()=>{
                        alert('order yanever estrog and get two adasim.')
                    })
                    isra.addEventListener('click', ()=>{
                        alert('order israeli estrog and get a all set')
                    })
                },500);
                return `<small class="form-text text-muted">Order Israeli estrog & get a gift. <em id="ysra-e" class="text-info">press here</em></small>
                <small class="form-text text-muted">Order Yanever estrog & get a gift. <em id="yan-e" class="text-info">press here</em></small><br/>`;
            }

            document.getElementById('submit-btn').addEventListener('click',()=>{
                document.getElementById('items').style.display='none';
            })
        }
    };
    xhttp.open("GET", "/items", true);
    xhttp.send();
}