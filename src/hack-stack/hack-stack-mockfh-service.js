'use strict';
// Angular claims services are singletons, but mockEndpoints is not preserved
// across separate mockFH instances.
var mockEndpoints = {},
  loggingEnabled = false;

angular.module('hackstack.feedhenry', [
    'hackstack.mock'
  ])
  .factory('mockFH', function (mock, $window, $log) {
    var mockFHObject = Object.create($window.$fh || null);

    function logger() {
      if (loggingEnabled) {
        $log.info.apply(null, arguments);
      }
    }

    /**
     * Takes a response object and wraps it so it looks like a response from
     * feedhenry
     *
     * @param {Object} res
     * @returns {{status: number, statusText: string, data: {status: string, data: *}}}
     */
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
     * created. See hackstack.mock documentation
     */
    mockFHObject.addMockEndpoint = function addMockEndpoint(endpoint,
      mockData, options) {
      if (mockData.length === 0 || !Array.isArray(mockData)) {
        throw new Error('Expected mockData to be a non-empty array');
      } else if (mockEndpoints[endpoint] !== undefined) {
        throw new Error('Endpoint already defined: '.concat(endpoint));
      }
      options = options || {};
      options.makeCompareFn = options.makeCompareFn || function (
        requestData) {
        return function (targetData) {
          return true;
        };
      };
      var hs = mock(mockData, options);
      hs.disableRandomErrors(true);
      mockEndpoints[endpoint] = hs;
    };

    /**
     * Throw if invalid or missing options
     *
     * @param options
     */
    function validateFHOptions(options) {
      if (options.method !== 'GET' && options.method !== 'POST') {
        throw new Error('Unsupported method or method wasn\'t provided');
      }
      if (options.data === undefined) {
        throw new Error('options.data not provided');
      }
    }

    /**
     * Mimic a request to our mock backend
     *
     * @param {Object} options See feedhenry v3 documentation
     * @param {Function} successCallback will be called with the response data
     * object as the first and only argument
     * @param {Function} failureCallback currently not used
     */
    function mockCloudFn(options, successCallback, failureCallback) {
      var hs;
      var backendResponse;

      validateFHOptions(options);

      hs = mockEndpoints[options.path];

      if (options.method === 'POST') {
        hs.save(options.data);
      }

      backendResponse = hs.get(options.data).then(function (result) {
        logger('Request: ', options, '\nResponse: ', result);
        return result;
      });

      // wrap the backend response so it looks like a $fh res object
      backendResponse.then(
        function (result) {
          successCallback(wrapBackendResponse(result).data);
        },
        // Because feedhenry returns 200 even if the backend fails, we'll call
        // the success feedback if the promise rejects
        function (result) {
          successCallback(wrapBackendResponse(result).data);
        });
    }

    /**
     * cloud calls mockCloudFn or $window.$fh.cloud based on whether
     * an endpoint is defined (don't use mock if endpoint is not defined)
     *
     * @param {Object} options
     * @param {Function} successCallback
     * @param {Function} failureCallback
     * @returns {*}
     */
    mockFHObject.cloud = function cloud(options, successCallback,
      failureCallback) {
      // if endpoint is not defined, don't use mock
      if (mockEndpoints[options.path] === undefined) {
        return $window.$fh.cloud(options, successCallback, failureCallback);
      } else {
        return mockCloudFn(options, successCallback, failureCallback);
      }
    };

    /**
     * Returns a new mockFH object whose backend will return the error
     * specified in errorCode
     *
     * @param errorCode
     * @returns {mockFHObject}
     */
    mockFHObject.forceBackendError = function (errorCode) {
      var newMockFH = Object.create(mockFHObject);
      newMockFH.cloud = function cloudForceError(options, successCallback,
        failureCallback) {
        var hs = mockEndpoints[options.path];

        /**
         * Don't ask hackstack.mock to return an error if endpoint is not
         * defined as that means we will not use the mock for this call.
         * Without this, the next call to the mock might inadvertently return
         * an error even if it's not supposed to
         */
        if (hs !== undefined) {
          validateFHOptions(options);
          hs.forceError(errorCode);
        }
        return mockFHObject.cloud.apply(mockFHObject, arguments);
      };
      return newMockFH;
    };

    mockFHObject.enableLogging = function enableLogging() {
      loggingEnabled = true;
    };

    mockFHObject.disableLogging = function disableLogging() {
      loggingEnabled = false;
    };

    mockFHObject.listEndpoints = function listEndpoints() {
      return R.keys(mockEndpoints);
    };

    $window.hsUtils.mockFH = {
      'listEndpoints': mockFHObject.listEndpoints,
      'enableLogging': mockFHObject.enableLogging,
      'disableLogging': mockFHObject.disableLogging
    };

    return mockFHObject;
  });
