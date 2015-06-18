'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync');

gulp.task('ngdocs-build', function () {
  var options = {
    //scripts: ['src/app.js'],
    html5Mode: true,
    startPage: '/api',
    title: 'hackstack demo app',
    image: "http://swiip.github.io/yeoman-angular/slides/img/yeoman-009.png",
    imageLink: "/api",
    titleLink: "http://localhost:3000"
  }
  return gulp.src(['src/**/*.js'])
    .pipe($.ngdocs.process(options))
    .pipe(gulp.dest('./ngDocs'));
});

gulp.task('serve:ngdocs', ['ngdocs-build'], function() {
  browserSync({
    port: 4000,
    server: {
      baseDir: 'ngDocs'//,
//      middleware: [ historyApiFallback ]
    }
  });
  // gulp.watch(['./**/*.html'], {cwd: 'ngDocs'}, reload);
});
