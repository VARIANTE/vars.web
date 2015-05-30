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

/**
 * Clean task.
 */
gulp.task('clean', require('del').bind(null, ['dist']));

/**
 * Build bask.
 */
gulp.task('build', ['clean'], function()
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
                almond: '../node_modules/almond/almond'
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
            optimize: 'none',

            // Option to strip comments.
            preserveLicenseComments: false,

            // Option to generate source maps for the original modules.
            generateSourceMaps: true
        }
    );

    r.optimize
    (
        {
            // All paths used by the r.js optimizer will be relative to this base URL.
            baseUrl: 'src',

            // File of the distributed library.
            out: 'dist/vars.min.js',

            // Paths of modules.
            paths:
            {
                almond: '../node_modules/almond/almond'
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
            optimize: 'uglify2',

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
gulp.task('default', function()
{
    gulp.start('build');
    gulp.watch('src/**/*.js', ['build']);
});
