var gulp = require('gulp');
var less = require('gulp-less');
var jade = require('gulp-jade');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var paths = {
  output: 'public',
  bower: [
    'bower_components/c3/c3.min.js',
    'bower_components/c3/c3.min.css',
    'bower_components/d3/d3.min.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/papaparse/papaparse.min.js',
    'bower_components/underscore/underscore-min.js'
  ],
  less: [ 'app/**/*.less' ],
  jade: [ 'app/**/*.jade' ],
  script: [ 'app/**/*.js' ]
}

function copyBower() {
  gulp.src(paths.bower)
      .pipe(gulp.dest(paths.output + '/ext'));
}
gulp.task('copy-bower', copyBower);

function buildLess() {
  gulp.src(paths.less)
      .pipe(less())
      .pipe(gulp.dest(paths.output));
}
gulp.task('build-less', buildLess);

function buildJade() {
  gulp.src(paths.jade)
      .pipe(jade())
      .pipe(gulp.dest(paths.output));
}
gulp.task('build-jade', buildJade);

function buildScript() {
  gulp.src(paths.script)
      .pipe(babel())
      .pipe(concat('app.js'))
      .pipe(gulp.dest(paths.output));
}
gulp.task('build-script', buildScript);

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

// Deploy changes the output directory and manually runs each of our build functions
gulp.task('deploy', function() {
  paths.output = 'deploy';
  copyBower();
  buildLess();
  buildJade();
  buildScript();
});
