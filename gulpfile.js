var gulp = require('gulp');
var jslint = require('gulp-jslint');

gulp.task('default', function(){
    console.log('default');
});

gulp.task('lint', function(){
    return gulp.src('./src/*.js')
        .pipe(jslint({
            node: true,
            evil: true,
            nomen: true,
            reporter: 'default',
            errorsOnly: false

        }))
        .on('error', function(error){
            console.log(String(error));
        });
});