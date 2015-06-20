'use strict';

var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

gulp.task('config', function () {
  return gulp.src('demo.config.json')
    .pipe(gulpNgConfig('demo.config'))
    .pipe(gulp.dest(paths.tmp + '/serve'));
})

gulp.task('scripts', ['clean:tmp', 'config'], function () {
  return gulp.src(paths.src + '/**/*.ts')
    .pipe($.typescript())
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(gulp.dest(paths.tmp + '/serve/'))
    .pipe($.size());
});

gulp.task('clean:tmp', function (done) {
  $.del([
    paths.tmp + '/serve/**/*.js'
  ], { force: true } , done );
});
