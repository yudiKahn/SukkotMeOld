window.onload = async() =>{
    const minim = document.querySelector('.d-minim');
    let arr;


    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            arr = JSON.parse(this.responseText);

            arr.map(d=>{
                minim.innerHTML+=`<div class="form-check py-2">
                <label class="form-check-label text-success" for="${d.t}">${d.t} / ${d.p}$</label> &nbsp;
                <input type="number" class="form-control" min="0" value="0" id="${d.t}" name="${d.t}">      
                </div>`;
            });
        }
    };
    xhttp.open("GET", "/items", true);
    xhttp.send();

    document.getElementById('admin-link').addEventListener('click', ()=>{
       
    })
}