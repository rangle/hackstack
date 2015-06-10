'use strict';

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'chai-as-promised', 'sinon',
      'sinon-chai'
    ],

    // list of files / patterns to load in the browser
    files: [
      'example/bower_components/angular/angular.min.js',
      'example/bower_components/angular-mocks/angular-mocks.js',
      'example/bower_components/ramda/dist/ramda.js',
      'src/**/*.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'example/client/app/**/*.html': 'ng-html2js',
      'example/client/app/**/*.json': 'ng-json2js',
      'src/**/!(*.test).js': ['coverage'],
      'src/**/*.test.js': ['wrap']
    },

    wrapPreprocessor: {
      template: '(function () { <%= contents %> })()'
    },

    coverageReporter: {
      reporters: [{
        type: 'json'
      }, {
        type: 'html'
      }, {
        type: 'text-summary'
      }],
      dir: './coverage/'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/',
      moduleName: 'htmlTemplates'
    },

    ngJson2JsPreprocessor: {
      stripPrefix: 'client',
      prependPrefix: 'served'
    },

    // list of files to exclude
    exclude: [],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['story', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
