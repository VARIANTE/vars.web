/**
 * VARS
 * (c) Andrew Wei
 *
 * Build tasks.
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var autoprefixer = require('autoprefixer');
var config = require('./.taskconfig');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var r = require('requirejs');
var sequence = require('run-sequence');
var $csso = require('gulp-csso');
var $postcss = require('gulp-postcss');
var $rename = require('gulp-rename');
var $sass = require('gulp-sass');
var $size = require('gulp-size');
var $sourcemaps = require('gulp-sourcemaps');
var $uglify = require('gulp-uglify');
var $util = require('gulp-util');

/**
 * Cleans the build directory.
 */
gulp.task('clean', function(done) {
  del(config.tasks.clean.input).then(function(paths) {
    done();
  });
});

/**
 * Wires dependencies into the Sass library.
 */
gulp.task('wiredeps', function() {
  return gulp.src(config.tasks.wiredeps.normalize.input)
    .pipe($rename(config.tasks.wiredeps.normalize.outputFile))
    .pipe(gulp.dest(config.tasks.wiredeps.normalize.output));
});

/**
 * Builds the stylesheet library. There are 3 different outputs:
 * 1. CSS library, uncompressed
 * 2. CSS library, compressed
 * 3. Sass library
 */
gulp.task('styles', ['wiredeps'], function() {
  return merge(
    // Compile Sass to CSS.
    gulp.src(config.tasks.styles.css.input)
      .pipe($sourcemaps.init())
      .pipe($sass(config.tasks.styles.css.sass))
      .pipe($postcss([autoprefixer(config.tasks.styles.autoprefixer)]))
      .pipe($sourcemaps.write('./'))
      .pipe($size({
        title: '[styles:css:pretty]',
        gzip: true
      }))
      .pipe(gulp.dest(config.tasks.styles.css.output)),

    // Compile Sass to CSS (minified).
    gulp.src(config.tasks.styles.css.input)
      .pipe($sass(config.tasks.styles.css.sass))
      .pipe($postcss([autoprefixer(config.tasks.styles.autoprefixer)]))
      .pipe($csso())
      .pipe($rename(config.tasks.styles.css.outputFile))
      .pipe($size({
        title: '[styles:css:ugly]',
        gzip: true
      }))
      .pipe(gulp.dest(config.tasks.styles.css.output)),

    // Copy Sass to dist directory.
    gulp.src(config.tasks.styles.sass.input)
      .pipe($size({
        title: '[styles:sass]',
        gzip: true
      }))
      .pipe(gulp.dest(config.tasks.styles.sass.output))
  );
});

/**
 * Builds the JavaScript library.
 */
gulp.task('scripts', function(done) {
  r.optimize(config.tasks.scripts.r,
    function(res) {
      $util.log($util.colors.blue('[r]'), 'Successfully compiled library');

      gulp.src(config.tasks.scripts.input)
        .pipe($size({
          title: 'scripts:pretty',
          gzip: true
        }))
        .pipe($uglify())
        .pipe($rename(config.tasks.scripts.outputFile))
        .pipe($size({
          title: 'scripts:ugly',
          gzip: true
        }))
        .pipe(gulp.dest(config.tasks.scripts.output))
        .on('end', done);
    },
    function(err) {
      $util.log($util.colors.blue('[r]'), $util.colors.red(err));
      done();
    });
});

/**
 * Builds stylesheets and JavaScripts. Option to clean built files and
 * enable file watching.
 *
 * @param {Boolean} --clean
 * @param {Boolean} --watch
 */
gulp.task('build', function(done) {
  var seq = [['styles', 'scripts']];

  if (config.env.clean) seq.unshift('clean');

  seq.push(function() {
    if (config.env.watch) {
      for (var i = 0; i < config.tasks.watch.build.length; i++) {
        var entry = config.tasks.watch.build[i];
        gulp.watch(entry.files, entry.tasks);
      }
    }

    done();
  });

  sequence.apply(null, seq);
});
