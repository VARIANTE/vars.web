/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Gulp tasks.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
var gulp   = require('gulp');
var r      = require('requirejs');
var config = require('./tasks/config');

// Load plugins.
var $ = require('gulp-load-plugins')();

/**
 * Clean task.
 */
gulp.task
(
    'clean',
    function()
    {
        return gulp.src([config.dist], { read: false }).pipe($.clean());
    }
);

/**
 * Build task.
 */
gulp.task
(
    'build',
    function()
    {
        r.optimize
        (
            {
                // All paths used by the r.js optimizer will be relative to this base URL.
                baseUrl: config.src,

                // File of the distributed library.
                out: config.dist + '/' + config.name + '.js',

                // Paths of modules.
                paths:
                {
                    almond: '../bower_components/almond/almond'
                },

                // Modules included in the distributed library.
                include: ['almond', config.name],

                // Wrapper for AMD, CommonJS and browser compatibility.
                wrap:
                {
                    startFile: config.src + '/_start.js',
                    endFile:   config.src + '/_end.js'
                },

                // Option to minify JS files.
                optimize: 'uglify2',

                // Option to strip comments.
                preserveLicenseComments: false,

                // Option to generate source maps for the original modules.
                generateSourceMaps: false
            }
        );
    }
);

/**
 * Watch task.
 */
gulp.task
(
    'watch',
    function()
    {
        gulp.watch(config.src + '/**/*.js', ['build']);
    }
);

/**
 * Default task.
 */
gulp.task
(
    'default',
    [
        'clean'
    ],
    function()
    {
        gulp.start('build');
    }
);
