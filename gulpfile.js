var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('default', function(){
    console.log('default');
});

gulp.task('lint', function(){
    return gulp.src('./src/*.js, ./lib/*.js, ./models/*.js')
        .pipe(jshint({node: true, browser: false}))
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function (cb) {
    gulp.src(['./lib/*.js', './models/*.js', './src/*.js'])
        .pipe(istanbul({includeUntested: true})) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src(['test/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports({
                    dir: './coverage',
                    reporters: ['lcov', 'text'],
                    reportOpts: { dir: './coverage' }
                })) // Creating the reports after tests run
                .on('end', cb);
        });
});