window.onload = () =>{

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
    $('#form-sigup').submit(function(e){
        e.preventDefault();
        let form = $(this);
        let url = form.attr('action');
        $('#form-loader').css('display','block');
        $.ajax({ type: "POST", url: url, data: form.serialize(), success: data => {
            $('#errors-for-signUp').html('');
            window.location = `/order/${data}`;
        }, error: err => {
            $('#form-loader').css('display','none');
            $('#errors-for-signUp').html(`<div class="mx-auto alert-dismissible fade show alert alert-warning" role="alert" style="width:90vw; max-width:500px;">
             ${err.responseText}<button type="button" class="close" data-dismiss="alert" aria-label="Close">
             <span aria-hidden="true">&times;</span></button></div>`)
        }});    

    });
    $('#form-signin').submit(function(e){
        e.preventDefault();
        let form = $(this);
        let url = form.attr('action');
        $('#form-loader-login').css('display','block');
        $.ajax({ type: "POST", url: url, data: form.serialize(), success: data => {
            $('#errors-for-signIn').html('');
            window.location = `/order/${data}`;   
        }, error: err => {
            $('#form-loader-login').css('display','none');
            $('#errors-for-signin').html(`<div class="mx-auto alert-dismissible fade show alert alert-warning" role="alert" style="width:90vw; max-width:500px;">
             ${err.responseText}<button type="button" class="close" data-dismiss="alert" aria-label="Close">
             <span aria-hidden="true">&times;</span></button></div>`)
        }});    

    })
    //secret
    document.getElementById('yanky').addEventListener('click', e=>{
        if(e.detail==3){
            window.location = "/auth.html";
        }
    })
}