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
     * created. See hackStack documentation
     */
    mockFHObject.addMockEndpoint = function addMockEndpoint(endpoint,
      mockData) {
      var hs = hackStack(mockData);
      hs.disableRandomErrors(true);
      if (mockEndpoints[endpoint] !== undefined) {
        throw new Error('Endpoint already defined: '.concat(endpoint));
      } else {
        mockEndpoints[endpoint] = hs;
      }
    };

    /**
     * Throw if invalid or missing options
     *
     * @param options
     */
    function validateFHOptions(options) {
      if (mockEndpoints[options.path] === undefined) {
        throw new Error('Endpoint not defined: '.concat(options.path));
      }
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

      // TODO temporary hack until refactoring (making it possible to reuse
      // code). We are doing this convoluted thing rather than using hs.get
      // because hs.get requires an id, and FH doesn't work that way
      backendResponse = hs.getAll().then(function (result) {
        result.data = result.data[0];
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
     * cloud calls mockCloudFn or $window.$fh.cloud based on whether bypassMock
     * is true or false
     *
     * @param {Object} options
     * @param {Function} successCallback
     * @param {Function} failureCallback
     * @returns {*}
     */
    mockFHObject.cloud = function cloud(options, successCallback,
      failureCallback) {
      if (bypassMock === true) {
        return $window.$fh.cloud(options, successCallback, failureCallback);
      } else {
        return mockCloudFn(options, successCallback, failureCallback);
      }
    };

    /**
     * Accepts a boolean value x and sets bypassMock to x. If called with true,
     * calling mockFH.cloud will NOT use this mock, but instead call $window.$fh
     *
     * @param truthValue
     */
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
        /**
         * Don't ask hackstack.mock to return an error if bypassMock is set.
         * Without this, the next call to the mock might inadvertently return
         * an error even if it's not supposed to
         */
        if (bypassMock === false) {
          var hs;
          validateFHOptions(options);
          hs = mockEndpoints[options.path];
          hs.forceError(errorCode);
        }
        return mockFHObject.cloud.apply(mockFHObject, arguments);
      };
      return newMockFH;
    };

    return mockFHObject;
  });
