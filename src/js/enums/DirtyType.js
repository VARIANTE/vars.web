/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * UI dirty types.
 *
 * @type {Object}
 */
define
(
    {
        NONE:        0x00000000,
        POSITION:    1 << 0,
        SIZE:        1 << 1,
        LAYOUT:      1 << 2,
        STATE:       1 << 3,
        DATA:        1 << 4,
        LOCALE:      1 << 5,
        DEPTH:       1 << 6,
        CONFIG:      1 << 7,
        STYLE:       1 << 8,
        CUSTOM:      1 << 9,
        ALL:         0xFFFFFFFF
    }
);
