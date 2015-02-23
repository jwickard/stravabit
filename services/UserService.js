require('seneca')()
    .add(
    { user:'findById'},
    function( message, done ) {
        done( null,
            {id:''+Math.random()} );
    })
    .add(
    { user:'create'},
    function( message, done ) {
        done( null,
            {id:''+Math.random()} );
    })
    .listen()