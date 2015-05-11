'use strict';
// Angular claims services are singletons, but mockEndpoints is not preserved
// across separate mockFH instances.
var mockEndpoints = {},
  bypassMock = false;

angular.module('hackstack.feedhenry', [
    'hackstack.mock'
  ])
  .factory('mockFH', function (hackStack, $window) {
    var mockFHObject = Object.create($window.$fh || null);

    function wrapBackendResponse(res) {
      var data;
      if (res.status === 200) {
        data = res.data;
      } else {
        data = res;
      }

      return {
        'status': 200,
        'statusText': 'OK',
        // top level data (feedhenry's response)
        'data': {
          'status': 'Ok',
          // backend data
          'data': data
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
    mockFHObject.addMockEndpoint = function addMockEndpoint(endpoint,
      mockData) {
      var hs = hackStack(mockData);
      hs.disableErrors(true);
      if (mockEndpoints[endpoint] !== undefined) {
        throw new Error('Endpoint already defined: '.concat(endpoint));
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
    function mockCloudFn(options, callback) {
      var path = options.path;
      var hs = mockEndpoints[path];

      if (hs === undefined) {
        throw new Error('This endpoint has not been defined');
      }

      /* jshint -W116 */
      // catches undefined, false, null
      if (options.forceBackendError != null) {
        /* jshint +W116 */
        hs.forceError(options.forceBackendError);
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
    }

    mockFHObject.cloud = function cloud(options, callback) {
      if (bypassMock === true) {
        return $window.$fh.cloud(options, callback);
      } else {
        return mockCloudFn(options, callback);
      }
    };

    mockFHObject.setBypassMock = function (truthValue) {
      // `!!x` is always a boolean, and its truth value is the same as x's
      // so the next if asserts truthValue is a boolean
      /* jshint -W018 */
      if (truthValue !== !!truthValue) {
        /* jshint +W018 */
        throw new Error('Truth value has to be a boolean');
      }
      bypassMock = truthValue;
    };

    return mockFHObject;
  });
