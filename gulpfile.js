/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  babel = require('gulp-babel'),
  uglify = require('gulp-uglifyjs'),
  sourcemaps = require("gulp-sourcemaps"),
  concat = require("gulp-concat"),
  browserSync = require('browser-sync');

/*
 * Directories here
 */
var paths = {
  markup: './markup/',
  data: './markup/data/',
  sass: './stylesheets/',
  js: './js/',
  public: './public/'
};

/**
 * Compile .pug files and pass in data from json file
 * matching file name. index.pug - index.pug.json
 */
gulp.task('pug', function () {
  return gulp.src(paths.markup + '*.pug')
    .pipe(data(function (file) {
      let data
      try {
        console.log(paths.data + path.basename(file.path.split('/').pop()) + '.json')
        data = require(paths.data + path.basename(file.path.split('/').pop()) + '.json')
      } catch (e) {
        console.error(`no data for ${file.path.split('/').pop()}`)
      }
      return data || {};
    }))
    .pipe(pug())
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest(paths.public));
});


/**
 * Compile .scss files into public css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', function () {
  return gulp.src(paths.sass + '*.scss')
    .pipe(sass({
      includePaths: [paths.sass],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest(paths.public + 'css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});


gulp.task('es6', () => {
  return gulp
    .src(paths.js + '**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat("script.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.public + 'js/'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], function () {
  browserSync.reload();
});

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['sass', 'pug', 'es6'], function () {
  browserSync({
    server: {
      baseDir: paths.public
    },
    notify: false
  });
});

/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch(paths.sass + '**/*.scss', ['sass']);
  gulp.watch(paths.markup + '**/*.pug', ['rebuild']);
  gulp.watch(paths.js + '**/*.js', ['es6'])
});

// Build task compile sass and pug.
gulp.task('build', ['sass', 'pug']);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'watch']);
