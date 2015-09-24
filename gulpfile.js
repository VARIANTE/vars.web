/* jshint -W069, -W079 */

/**
 *  vars
 *  (c) VARIANTE (http://variante.io)
 *
 *  Gulp tasks.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */

var SCRIPTS_PATTERN = 'js';
var STYLES_PATTERN = '{css,scss}';
var SOURCEMAPS_PATTERN = '{css.map,js.map}';

var gulp = require('gulp');
var merge = require('merge-stream');
var r = require('requirejs');
var $ = require('gulp-load-plugins')();

/**
 * Clean task.
 */
gulp.task('clean', require('del').bind(null, ['dist']));

/**
 * Wire CSS/JavaScript dependencies.
 */
gulp.task('wiredep', function() {
  return merge(
    // CSS dependencies.
    gulp.src('node_modules/normalize.css/normalize.css')
      .pipe($.rename('normalize.scss'))
      .pipe(gulp.dest('src/sass'))
  );
});

/**
 * Builds the Sass library.
 */
gulp.task('styles', ['wiredep'], function() {
  return merge(
    // Compile Sass to CSS.
    gulp.src('src/sass/vars.' + STYLES_PATTERN)
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        outputStyle: 'nested',
        precision: 10
      }))
      .pipe($.postcss([require('autoprefixer-core')({
        browsers: ['last 2 version', 'ie 9']
      })]))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('dist/css')),

    // Compile Sass to CSS (minified).
    gulp.src('src/sass/vars.' + STYLES_PATTERN)
      .pipe($.sass({
        outputStyle: 'nested',
        precision: 10
      }))
      .pipe($.postcss([require('autoprefixer-core')({
        browsers: ['last 2 version', 'ie 9']
      })]))
      .pipe($.csso())
      .pipe($.rename('vars.min.css'))
      .pipe(gulp.dest('dist/css')),

    // Copy Sass to dist directory.
    gulp.src('src/sass/**/*' + STYLES_PATTERN)
      .pipe(gulp.dest('dist/sass'))
  );
});

/**
 * Builds the JavaScript library.
 */
gulp.task('scripts', ['wiredep'], function() {
  r.optimize({
    baseUrl: 'src/js',
    out: 'dist/js/vars.js',
    paths: {
      almond: '../../node_modules/almond/almond'
    },
    include: ['almond', 'vars'],
    wrap: {
      startFile: 'src/js/_start.js',
      endFile: 'src/js/_end.js'
    },
    optimize: 'none',
    preserveLicenseComments: false,
    generateSourceMaps: true
  });

  r.optimize({
    baseUrl: 'src/js',
    out: 'dist/js/vars.min.js',
    paths: {
      almond: '../../node_modules/almond/almond'
    },
    include: ['almond', 'vars'],
    wrap: {
      startFile: 'src/js/_start.js',
      endFile: 'src/js/_end.js'
    },
    optimize: 'uglify2',
    preserveLicenseComments: false,
    generateSourceMaps: false
  });
});

/**
 * Build bask.
 */
gulp.task('build', ['styles', 'scripts']);

/**
 * Default task.
 *
 * @param  {Boolean} --watch Specifies whether to watch for changes after the task is done.
 */
gulp.task('default', ['clean'], function() {
  var watch = $.util.env['watch'] || $.util.env['w'];

  gulp.start('build');

  if (watch) {
    gulp.watch('src/**/*.' + STYLES_PATTERN, ['build']);
    gulp.watch('src/**/*.' + SCRIPTS_PATTERN, ['build']);
  }
});
