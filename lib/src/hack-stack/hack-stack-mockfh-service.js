'use strict';
// Angular claims services are singletons, but mockEndpoints is not preserved
// across separate mockFH instances.
var $fhmock = Object.create(window.$fh || null),
  mockEndpoints = {};

angular.module('hackstack.feedhenry', [
    'hackstack.mock'
  ])
  .factory('mockFH', function (hackStack) {
    function wrapBackendResponse(res) {
      return {
        'status': 200,
        'statusText': 'OK',
        // top level data (feedhenry's response)
        'data': {
          'status': 'Ok',
          // backend data
          'body': res.data
        }
      };
    }

    /**
     * add a mock endpoint
     *
     * @param {String} endpoint path to this endpoint
     * @param {Array} mockData array of objects from which a response is
     * created. See hackStack documentation
     */
    $fhmock.addMockEndpoint = function addMockEndpoint(endpoint, mockData) {
      var hs = hackStack(mockData);
      hs.disableErrors(true);
      if (mockEndpoints[endpoint] !== undefined) {
        throw new Error('Endpoint already defined');
      } else {
        mockEndpoints[endpoint] = hs;
      }
    };

    /**
     * Mimic a web call to our mock backend
     *
     * @param {Object} options
     * @param {Function} callback
     */
    $fhmock.cloud = function cloud(options, callback) {
      var path = options.path;
      var hs = mockEndpoints[path];
      if (hs === undefined) {
        throw new Error('This endpoint has not been defined');
      }
      // TODO temporary hack until refactoring (making it possible to reuse
      // code). We are doing this convoluted thing rather than using hs.get
      // because hs.get requires an id, and FH doesn't work that way
      var backendResponse = hs.getAll().then(function (result) {
        result.data = result.data[0];
        return result;
      });
      // wrap the backend response so it looks like a $fh res object
      backendResponse.then(
        // success callback
        function (result) {
          callback(null, wrapBackendResponse(result));
        },
        function (result) {
          callback(null, wrapBackendResponse(result));
        });
    };

    return $fhmock;
  });
