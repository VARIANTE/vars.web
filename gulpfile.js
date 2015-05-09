/* jshint -W069, -W079 */

/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Gulp tasks.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */

var gulp = require('gulp');
var r = require('requirejs');
var $ = require('gulp-load-plugins')();

/**
 * Clean task.
 */
gulp.task('clean', require('del').bind(null, ['dist']));

/**
 * Build bask.
 */
gulp.task('build', function()
{
    r.optimize
    (
        {
            // All paths used by the r.js optimizer will be relative to this base URL.
            baseUrl: 'src',

            // File of the distributed library.
            out: 'dist/vars.js',

            // Paths of modules.
            paths:
            {
                almond: '../bower_components/almond/almond'
            },

            // Modules included in the distributed library.
            include: ['almond', 'vars'],

            // Wrapper for AMD, CommonJS and browser compatibility.
            wrap:
            {
                startFile: 'src/_start.js',
                endFile:   'src/_end.js'
            },

            // Option to minify JS files.
            optimize: ($.util.env['debug']) ? 'none' : 'uglify2',

            // Option to strip comments.
            preserveLicenseComments: false,

            // Option to generate source maps for the original modules.
            generateSourceMaps: false
        }
    );
});

/**
 * Default task.
 */
gulp.task('default', ['clean'], function()
{
    gulp.start('build');
    gulp.watch('src/**/*.js', ['build']);
});
