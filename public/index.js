window.onload = () =>{
    document.getElementById('toggle-pass').addEventListener('click', function(){
        document.getElementById('main-form-pass').type = this.checked ? 'text':'password';
    });

    let tmp = ['Estrog','Lulav','Adasim','Arovot','Husanos'];
    document.getElementById('to-items').addEventListener('click',()=>{
        document.getElementById('items').style.display='block';
    })
    document.getElementById('close-items').addEventListener('click',()=>{
        document.getElementById('items').style.display='none';
    })
    let update = false;
    let f = document.getElementById('main-form-f-name');
    let l = document.getElementById('main-form-l-name');
    let p = document.getElementById('main-form-phone');
    let e = document.getElementById('main-form-email');
    let ft = f.placeholder;  let pt = p.placeholder;
    let lt = l.placeholder;  let et = e.placeholder;
    document.getElementById('update').addEventListener('click', function(){
        let disTxt = 'Not Requierd on updating order';
        update = !update;
        this.innerHTML = update? 'New Order' : 'Update Order';
        f.disabled = update;  l.disabled = update;  
        p.disabled = update;  e.disabled = update;
        p.placeholder = update ? disTxt : ft;
        e.placeholder = update ? disTxt : lt;
        f.placeholder = update ? disTxt : ft;
        l.placeholder = update ? disTxt : lt;
        document.getElementById('form').action = update ? '/update' : '/order';
        document.getElementById('form-status').innerHTML = update ? '- Update -' : '- New Order -';
        document.getElementById('form-note').innerHTML = update ? 'Forgot password / username ?! <a href="tel:+18186052066">call me</a>.':"You can change you'r order in the future with this username & password."
    })

    let arr;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            arr = JSON.parse(this.responseText);
            let estrog = arr.filter(d=>d.n==1);
            let lulav = arr.filter(d=>d.n==2);
            let arava = arr.filter(d=>d.n==3);
            let hadas = arr.filter(d=>d.n==4);
            let husana = arr.filter(d=>d.n==5);

            tmp.map(d=>{
                let a = [estrog, lulav, hadas, arava, husana];
                let mya = a[tmp.indexOf(d)];
              document.getElementById('min').innerHTML+=`<div class="p-3" id="min-${d}">
              <h2 class="text-success">${d}</h2>
              ${mya==estrog? sale():''}
              ${
                mya.map(m=>`<div class="row">
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