'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');
var addsrc = require('gulp-add-src');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var beautify = require('gulp-jsbeautifier');
var inject = require('gulp-inject');
var livereload = require('gulp-livereload');
var gulpFilter = require('gulp-filter');
var jshint = require('gulp-jshint');
var map = require('map-stream');
var ngAnnotate = require('gulp-ng-annotate');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var nodemon = require('gulp-nodemon');

var clientJsFiles = ['./client/app/**/*.js'];
var indexTmpl = './client/app/index.html';
var cleanDirs = ['./client/dist/*'];
var distFolder = 'client/dist';

var jsHintErrorReporter = function () {
  return map(function (file, cb) {
    if (!file.jshint.success) {
      process.exit(1);
    }
    cb(null, file);
  });
};

gulp.task('clean', function () {
  del(cleanDirs);
});

gulp.task('index-dev', function () {

  var filter = gulpFilter(function (file) {
    return !/\.test\.js$/.test(file.path);
  });
  var target = gulp.src(indexTmpl);
  var sources = gulp.src(clientJsFiles, {read: false}).pipe(filter);

  return target.pipe(inject(sources, {ignorePath: '/client/', addRootSlash: false}))
    .pipe(gulp.dest('./client'));
});

gulp.task('beautify', function() {
  return gulp.src(clientJsFiles, { base: '.' })
    .pipe(beautify({ config: '.jsbeautifyrc' }))
    .pipe(gulp.dest('.'));
});

gulp.task('lint', function () {
  return gulp.src(clientJsFiles)
    // '.jshintrc' was a parameter, which lead to jshint not working locally
    // for CD; so removing and seeing if the sky falls for anyone else.
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jsHintErrorReporter());
});

gulp.task('dev', function () {
  nodemon({ script: 'server/app.js',
    ext: 'html js',
    tasks: ['lint'] })
    .on('restart', function () {
      console.log('restarted!')
    });
});