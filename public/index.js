window.onload = () =>{  
    let tmp = ['Estrog','Lulav','Adasim','Arovot','Husanos'];
    document.getElementById('to-items').addEventListener('click',()=>{
        document.getElementById('items').style.display='block';
    })
    document.getElementById('close-items').addEventListener('click',()=>{
        document.getElementById('items').style.display='none';
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
        }
    };
    xhttp.open("GET", "/items", true);
    xhttp.send();
}