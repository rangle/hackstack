/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('hackstack', [
    'hackstack.mock',
    'hackstack.wrap',
    'hackstack.utils',
    'hackstack.feedhenry'
  ])
  .factory('hackstack', function (mock, wrap, utils) {
    return {
      'mock': mock,
      'wrap': wrap,
      'utils': utils
    };
  });
