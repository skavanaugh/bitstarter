#!/usr/bin/env node
"use strict";

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs'),
    program = require('commander'),
    cheerio = require('cheerio'),
    rest = require('restler'),
    HTMLFILE_DEFAULT = "index.html",
    CHECKSFILE_DEFAULT = "checks.json";

// var URLFILE_DEFAULT = "http://secure-everglades-4975.herokuapp.com";

var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

/*
var assertUrlExists = function (inUrl) {
    var instr = inUrl.toString();
    rest.get(instr).on('complete', function (result) {
        if (result instanceof Error) {
            console.log('Error: ' + result.message);
            process.exit(1);
        }
    });
    return instr;
};
*/

var cheerioHtmlFile = function (htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkOut = function (checksfile, $) {
    var out = {},
        checks = loadChecks(checksfile).sort(),
        ii,
        present;

    for (ii in checks) {
        present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);
};

var checkHtmlFile = function(htmlfile, checksfile, url) {
    var $;
    if (url) {
        rest.get(url).on('complete', function(result) {
            $ = cheerio.load(result);            
            checkOut(checksfile, $);
        });
    } else { 
        $ = cheerioHtmlFile(htmlfile);
        checkOut(checksfile, $);
    }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main === module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists),HTMLFILE_DEFAULT)
        .option('-u, --url <url_path>', 'Url Path to web.js')
        .parse(process.argv);
    checkHtmlFile(program.file, program.checks, program.url);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
