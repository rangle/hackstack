'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
  var src = [ 'src/**/*.scss', 'src/**/*.css' ];
  return gulp.src(src)
      .pipe($.sass())
      .pipe($.concat('css' + '.css'))
      .pipe(gulp.dest(paths.tmp + '/serve/app/'));
});
