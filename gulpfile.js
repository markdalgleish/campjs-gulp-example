var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  streamify = require('gulp-streamify'),
  rename = require('gulp-rename'),
  connect = require('gulp-connect'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  es6ify = require('es6ify'),
  uglify = require('gulp-uglify'),
  jade = require('gulp-jade'),
  rework = require('gulp-rework'),
  reworkNpm = require('rework-npm'),
  myth = require('myth'),
  minifycss = require('gulp-minify-css'),
  through = require('through'),
  opn = require('opn'),
  path = require('path'),
  isDev = process.argv.indexOf('dev') > 0;

gulp.task('js', function() {
  var bundleStream = browserify()
    .add(es6ify.runtime)
    .transform(es6ify)
    .require('./src/scripts/main.js')
    .bundle({ debug: isDev });

  return bundleStream
    .pipe(source('src/scripts/main.js'))
    .pipe(plumber())
    .pipe(!isDev ? streamify(uglify()) : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('dist/build'))
    .pipe(isDev ? connect.reload() : through());
});

gulp.task('html', function() {
  return gulp.src('src/index.jade')
    .pipe(plumber())
    .pipe(jade({ pretty: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
    .pipe(isDev ? connect.reload() : through());
});

gulp.task('css', function() {
  return gulp.src('src/styles/main.css')
    .pipe(plumber())
    .pipe(rework(reworkNpm(), myth(), { sourcemap: isDev }))
    .pipe(!isDev ? minifycss() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/build'))
    .pipe(isDev ? connect.reload() : through());
});

gulp.task('serve', ['build'], function(done) {
  connect.server({
    root: 'dist',
    livereload: isDev
  });

  opn('http://localhost:8080', done);
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.jade', ['html']);
  gulp.watch('src/styles/**/*.css', ['css']);
  gulp.watch('src/scripts/**/*.js', ['js']);
});

gulp.task('build', ['js', 'html', 'css']);
gulp.task('dev', ['build', 'watch', 'serve']);
gulp.task('preview', ['build', 'serve']);

gulp.task('default', ['build']);
