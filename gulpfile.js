var gulp = require('gulp');
var less = require('gulp-less');
var jade = require('gulp-jade');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var paths = {
  output: 'public',
  bower: [
    'bower_components/csv-js/csv.js',
    'bower_components/d3/d3.min.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/metrics-graphics/dist/metricsgraphics.css',
    'bower_components/metrics-graphics/dist/metricsgraphics.min.js'
  ],
  less: [ 'app/**/*.less' ],
  jade: [ 'app/**/*.jade' ],
  script: [ 'app/**/*.js' ]
}

gulp.task('copy-bower', function() {
  gulp.src(paths.bower)
      .pipe(gulp.dest(paths.output + '/ext'));
});

gulp.task('build-less', function() {
  gulp.src(paths.less)
      .pipe(less())
      .pipe(gulp.dest(paths.output));
});

gulp.task('build-jade', function() {
  gulp.src(paths.jade)
      .pipe(jade())
      .pipe(gulp.dest(paths.output));
});

gulp.task('build-script', function() {
  gulp.src(paths.script)
      .pipe(babel())
      .pipe(concat('app.js'))
      .pipe(gulp.dest(paths.output));
});

gulp.task('build', ['copy-bower', 'build-less', 'build-jade', 'build-script']);

gulp.task('server', function() {
  var express = require('express');
  var app = express();
  app.use(express.static(__dirname + '/' + paths.output));
  app.listen(3000);
});

gulp.task('preview', ['build', 'server'], function() {
  gulp.watch(paths.bower_components, ['copy-bower']);
  gulp.watch(paths.less, ['build-less']);
  gulp.watch(paths.jade, ['build-jade']);
  gulp.watch(paths.script, ['build-script']);
});

gulp.task('default', ['build']);
