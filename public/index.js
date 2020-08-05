$(window).ready(()=>{
    onSignUp();
    onSignin();
    toggleInfo();
})

function onSignUp(){
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
            $('#errors-for-signUp').html(Err(err))
        }});    

    });
}
function onSignin(){
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
            $('#errors-for-signin').html(Err(err))
        }});    

    })
}

function toggleInfo(){
    $('#info-icon').click(()=>{
        $('#info').animate({width:'toggle'},800)
    })
    $(window).click((e)=>{
        if($(e.originalEvent.path[0]).attr('id')!=='info-icon' && $('#info').css('display')=='block'){
            $('#info').animate({height:'toggle'},800)
        }
    })
}

function Err(err){
    let error = err || 'Something went wrong. please try again later';
    return (`<div class="mx-auto alert-dismissible fade show alert alert-warning w-100" role="alert" style="max-width:300px;">
        ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`)
}