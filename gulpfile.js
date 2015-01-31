var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('default', function(){
    console.log('default');
});

gulp.task('lint', function(){
    return gulp.src('./src/*.js, ./lib/*.js, ./models/*.js')
        .pipe(jshint({node: true, browser: false}))
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function(){
    return gulp.src([
        './test/*.spec.js'
    ], { read: false }).pipe(mocha({
        reporter: 'spec'
    })).once('end', function(){
        process.exit();
    });
});