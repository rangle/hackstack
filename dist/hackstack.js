/* global angular */
/* global R */
'use strict';
angular.module('hackstack.mock', [
    'hackstack.utils'
  ])
  .factory('mock', ["$http", "$q", "utils", function ($http, $q, utils) {
    /**
     * Create a mock endpoint to use in your app.
     *
     * @param mockData If this is a string, will be treated as a path for $http
     * to use to get a json file.  If it's an array, it will be used as the
     * mock data.
     *
     * @param options an object of options for specifics about errors to be thrown
     * timeouts, etc.
     */
    function createMock(mockData, options) {

      var responseObj;
      var makeCompareFn;

      if (options) {
        utils.setOptions(options);
        makeCompareFn = options.makeCompareFn;
      }

      makeCompareFn = makeCompareFn || function makeCompareFn(
        requestData) {
        return function (targetData) {
          return targetData.id === requestData;
        };
      };

      var disableRandomErrors = utils.disableRandomErrors;
      var produceError = utils.produceError;
      var getErrorByCode = utils.getErrorByCode;
      var waitForTime = utils.waitForTime;

      function findItem(requestData) {
        return R.find(makeCompareFn(requestData))(mockData);
      }

      function setGoodGET(response, data) {
        var defaultResponse = {
          status: 200,
          statusText: 'OK',
          data: data
        };

        if (response) {
          return response;
        }
        return defaultResponse;
      }

      function goodPOST() {
        return {
          status: 201,
          statusText: 'Created',
          data: ''
        };
      }

      if (Array.isArray(mockData)) {
        responseObj = setGoodGET(null, mockData);
      } else if (mockData && mockData.indexOf && mockData.indexOf('.json') !==
        -1) {
        $http.get(mockData)
          .then(function (response) {
            responseObj = setGoodGET(response);
          })
          .then(null, function (error) {
            throw new Error(error);
          });
      } else {
        throw new Error('mockData required to be an array or .json path');
      }

      function processGETAll() {
        var error = produceError(null, 'get');
        if (error !== null) {
          return $q.reject(error);
        }
        return angular.copy(responseObj);
      }

      function processGET(requestData) {
        var error = produceError(requestData, 'get');

        if (null !== error) {
          return $q.reject(error);
        }

        /*jshint eqeqeq:false */
        var foundItem = findItem(requestData);
        /*jshint eqeqeq:true */
        if (foundItem !== undefined) {
          return {
            status: 200,
            statusText: 'OK',
            data: angular.copy(foundItem)
          };
        } else {
          // return 404
          error = utils.getErrorByCode(404);
          return $q.reject(error);
        }
      }

      /**
       * Return first matching object from mockData. See query function for
       * what the definition of a match is
       *
       * @param queryObject
       * @returns {*}
       */
      function processQuery(queryObject) {
        var keys = R.keys(queryObject);
        // From mockData, create new objects that only include properties
        // also present in queryObject
        var comparisonData = R.map(R.pick(keys))(mockData);
        // Find first object in comparisonData that matches our queryObject
        var foundIndex = R.findIndex(R.eqDeep(queryObject))(
          comparisonData);
        var foundItem = mockData[foundIndex];
        if (foundIndex !== -1) {
          return {
            status: 200,
            statusText: 'OK',
            data: angular.copy(foundItem)
          };
        } else {
          var error = utils.getErrorByCode(404);
          return $q.reject(error);
        }
      }

      /**
       * Randomly generate an error on create.  If no error is generated
       * it will add the new item to the mock data array.
       *
       * @param data The new data item to be created.
       * @param createIdFn A function that contains logic to provide a new id.
       * This is done in case the ids are alphanumberic or not straight forward
       * to increment.
       *
       * @returns {*} An error or null.
       */
      function processCreate(data, createIdFn) {
        var error = produceError(data, 'post');

        if (null !== error) {
          return $q.reject(error);
        }

        if (createIdFn) {
          data.id = createIdFn();
        }
        /**
         * TODO: Add a location header with the new id.
         * Though that would be weird because HackStack assumes you're using an
         * abstraction that makes requests to your backend
         */
        mockData.push(data);
        setGoodGET(null, mockData);
        return goodPOST();
      }

      function processUpdate(requestData, data) {
        var error = produceError(data, 'post');

        if (null !== error) {
          return $q.reject(error);
        }

        var index = R.findIndex(makeCompareFn(requestData))(mockData);

        if (index > -1) {
          mockData[index] = data;
          return {
            status: 200,
            statusText: 'OK',
            data: ''
          };

        } else {
          return $q.reject(getErrorByCode(404));
        }
      }

      function getAll() {
        return waitForTime().then(function () {
          return $q.when(processGETAll());
        });
      }

      function get(requestData) {
        return waitForTime().then(function () {
          return $q.when(processGET(requestData));
        });
      }

      /**
       * Query mock data with a query object.
       *
       * A data object matches the query object if all the properties in the
       * query object (queryObject) have matching properties in the data object.
       *
       * For example, if {1:1} is our query object, it matches {1:1} and
       * {1:1, 2:2} but NOT {1:2} or {2:2}
       *
       * @param queryObject
       * @returns {*}
       */
      function query(queryObject) {
        return waitForTime().then(function () {
          return $q.when(processQuery(queryObject));
        });
      }

      function update(requestData, data) {
        return waitForTime().then(function () {
          return $q.when(processUpdate(requestData, data));
        });
      }

      function getNextId() {
        return R.max(R.pluck('id', mockData)) + 1;
      }

      function create(data, createIdFn) {
        return waitForTime().then(function () {
          return $q.when(processCreate(data, createIdFn));
        });
      }

      function save(data, createIdFn) {
        createIdFn = createIdFn || getNextId;
        if (data.id) {
          return update(data.id, data);
        } else {
          return create(data, createIdFn);
        }
      }

      return {
        create: create,
        disableRandomErrors: disableRandomErrors,
        forceError: utils.forceError,
        get: get,
        getAll: getAll,
        query: query,
        save: save,
        update: update
      };
    }

    return createMock;
  }]);

'use strict';
// Angular claims services are singletons, but mockEndpoints is not preserved
// across separate mockFH instances.
var mockEndpoints = {},
  loggingEnabled = false;

angular.module('hackstack.feedhenry', [
    'hackstack.mock'
  ])
  .factory('mockFH', ["mock", "$window", "$log", function (mock, $window, $log) {
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
  }]);

'use strict';
angular.module('hackstack.utils', [])

.factory('utils', ["$timeout", "$window", function ($timeout, $window) {
  /**
   * A random number will be generated between 0 and MAX_ERROR_DISTRIBUTION.
   * The number generated will be used to determine which error will be produced.
   * Note when defining distributions of errors that you need to leave room
   * for a clean return.  So try not to make your distributions add up to this
   * number.
   *
   * 100 - sum_of_distributions = the chance of a clean return.
   */
  var MAX_ERROR_DISTRIBUTION = 100;
  /**
   * Set a specific error to be returned.  Pass in the HTTP error code.
   *
   * @type {Number} The HTTP Error code to return.
   */
  var nextError = null;

  /**
   * Set to ensure you get a 200 return from the the API.  This will
   * bypass the random error generation.
   *
   * @type {boolean} False to produce errors, true to prevent errors.
   */
  var errorsDisabled = false;

  /**
   * The list of error trigger functions that will be used to compare against
   * incoming or outgoing data.
   */
  var errorTriggers = [];

  /**
   * This function is only for testing purposes.  You SHOULD NOT USE IT!
   */
  function _getErrorTriggers() {
    return errorTriggers;
  }

  var defaults = {
    maxTime: 2000,
    minTime: 0,
    absoluteTime: null
  };

  var options = defaults;

  /**
   * The default list of errors to be randomly produced.
   * Contains three properties:
   *   status: The HTTP status code of the error.
   *   statusText: The status text associated with the error.
   *   distribution: The chance out of 100 that the error will occure.
   *      i.e. a 5 means the error will be produced 5 percent of the time.
   *
   * @type {*[]} An array of error objects.
   */
  var errors = [{
    status: 0, //Dropped connection
    statusText: '',
    distribution: 5
  }, {
    status: 400,
    statusText: 'Bad request',
    distribution: 1
  }, {
    status: 401,
    statusText: 'Not authorized',
    distribution: 3
  }, {
    status: 403,
    statusText: 'Forbidden',
    distribution: 3
  }, {
    status: 404,
    statusText: 'Not found',
    distribution: 6
  }, {
    status: 405,
    statusText: 'Method not allowed',
    distribution: 2
  }, {
    status: 406,
    statusText: 'Not acceptable',
    distribution: 2
  }, {
    status: 407,
    statusText: 'Proxy Authentication Required',
    distribution: 0
  }, {
    status: 408,
    statusText: 'Request timeout',
    distribution: 2
  }, {
    status: 409,
    statusText: 'Conflict',
    distribution: 1
  }, {
    status: 410,
    statusText: 'Gone',
    distribution: 1
  }, {
    status: 411,
    statusText: 'Length required',
    distribution: 1
  }, {
    status: 412,
    statusText: 'Precondition Failed',
    distribution: 1
  }, {
    status: 413,
    statusText: 'Request entity too large',
    distribution: 1
  }, {
    status: 414,
    statusText: 'Request-URI too long',
    distribution: 1
  }, {
    status: 415,
    statusText: 'Unsupported media type',
    distribution: 1
  }, {
    status: 416,
    statusText: 'Requested range not satisfiable',
    distribution: 1
  }, {
    status: 417,
    statusText: 'Expectation failed',
    distribution: 1
  }, {
    status: 500,
    statusText: 'Internal server error',
    distribution: 5
  }, {
    status: 501,
    statusText: 'Not implemented',
    distribution: 1
  }, {
    status: 502,
    statusText: 'Bad gateway',
    distribution: 0
  }, {
    status: 503,
    statusText: 'Service unavailable',
    distribution: 1
  }, {
    status: 504,
    statusText: 'Gateway timeout',
    distribution: 0
  }, {
    status: 505,
    statusText: 'HTTP version not supported',
    distribution: 0
  }];

  /**
   * Set whether or not HackStack should randomly produce server errors
   *
   * @param {boolean} disabled true to disable errors, false (default)
   * otherwise.
   * @returns {boolean} If called without a parameter, acts as a getter.
   */
  function disableRandomErrors(disabled) {
    if (disabled || disabled === false) {
      errorsDisabled = disabled;
    } else {
      return errorsDisabled;
    }
  }

  /**
   * Retrieve the full error object from the errors array.
   *
   * @param errorCode The HTTP error code to be retrieved.
   * @returns {*} The object as is appears in the errors Array.
   */
  function getErrorByCode(errorCode) {
    if (typeof errorCode !== 'number') {
      throw new Error('Must provide an integer error code');
    }

    var error = R.filter(function (errorItem) {
      return errorItem.status === errorCode;
    }, errors);

    if (error.length === 0 || error.length > 1) {
      return false;
    }
    return cleanError(error[0]);
  }

  /**
   * Set the error code to the desired HTTP error.
   *
   * @param errorCode
   */
  function forceError(errorCode) {
    if (errorCode === null) {
      nextError = null;
    } else if (getErrorByCode(errorCode) !== false) {
      nextError = errorCode;
    } else {
      throw new Error('Unsupported HTTP Code');
    }
  }

  /**
   * Cleans the entry in the error array to the actual return doesn't
   * contain unwanted information.
   *
   * @param error The error from the error aray.
   * @returns {{status: *, statusText: *, data: string}} The mock $HTTP
   * return object.
   *
   */
  function cleanError(error) {
    return {
      status: error.status,
      statusText: error.statusText,
      data: error.statusText.concat(' -- generated by HackStack')
    };
  }

  /**
   * Generate a random integer.
   *
   * @param min The minimum number you want to see.
   * @param max The highest number you want to see.
   *
   * @returns {*} A random integer within the specified range.
   */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Produce a random HTTP error from the 400 or 500 series errors.  The
   * errors come from the internal list of possible errors by default and have
   * weights assigned to them that indicate the relative frequency that
   * the error should occur.
   *
   * @param errorArray The list of possible errors to choose from.  Defaults
   * to the internal list of errors.
   *
   * @returns {*} A object representing an HTTP error or null if there is no
   * error.
   */
  function randomError(errorArray) {
    errorArray = errorArray || errors;

    var totalWeight = R.reduce(function (acc, value) {
      return acc + value.distribution;
    }, 0, errorArray);

    if (totalWeight > MAX_ERROR_DISTRIBUTION) {
      throw new Error(
        'Sum of distributions is greater than defined max');
    }

    var randomNumber = randomInt(0, MAX_ERROR_DISTRIBUTION);
    var error = null;
    var weightedSum = 0;

    if (nextError === null) {
      if (errorsDisabled === false) {
        R.forEach(function (item) {
          weightedSum += item.distribution;
          if (randomNumber <= weightedSum && error === null) {
            error = cleanError(item);
          }
        }, errorArray);
      }
    } else {
      return cleanError(getErrorByCode(nextError));
    }

    return error;
  }

  /**
   * This function will go through the list of error triggers and run
   * each of the functions against incoming data.  It will return the
   * first error found.
   * 
   * @param {*} data The data to be tested.
   * @param {String} method The HTTP method used.  Determines which 
   *   triggers are used to compare against.
   * 
   * @return {*} An HTTP error object or null if no trigger matches.
   */
  function evaluateTriggers(data, method) {
    var error = null;

    // catches null and undefined
    /*jshint -W116 */
    if (data == null) {
      /*jshint +W116 */
      return null;
    }

    R.forEach(function (trigger) {
      if (trigger.fn(data) === true) {
        error = cleanError(getErrorByCode(trigger.errorCode));
      }
    }, R.filter(R.propEq('method', method.toLowerCase()),
      errorTriggers));

    return error;
  }

  /**
   * Helper function that HackStack uses to determine if an error is to
   * be returned to the user.
   *
   * It first checks provided error triggers and if none are fired,
   * then it will call a random error generator.
   *
   * If neither the provided error triggers nor the random error generators
   * return an error, it returns null.
   * 
   * @param {*} data The data object to be used in trigger comparisons.
   * @param {String} method The HTTP method used to determine which triggers
   *   are relevant.
   * @param {Array} errorArray An array of HTTP error codes that will be used
   *   to produce random errors.  Defaults to the default list of HTTP Errors.
   * 
   * @return {*} And HTTP error object or null.
   */
  function produceError(data, method, errorArray) {
    var error = evaluateTriggers(data, method);
    if (null === error) {
      error = randomError(errorArray);
    }
    return error;
  }

  /**
   * Users can register error triggers that will compare against data
   * being sent to or returned from the server.  If the trigger function
   * returns true, then the specified error will be returned.
   * 
   * @param {Function} errorFn The error function that must return true
   * if the error condition is met.  It will be passed one parameter, data.
   * @example
   *   The user posts an object to the server of the form:
   *     {
   *       id: 5,
   *       title: 'bad ticket'
   *       description: 'something useful'
   *     }
   *   The error function looks for objects with bad in the title and returns
   *   a 404 if it's found.
   *   function errorTrigger(data) {
   *     if(data.title && data.title.indexOf('bad') !== -1) {
   *       return true;
   *     }
   *     return false;
   *   }
   * @param errorCode The HTTP error code to return if the trigger is fired.
   * @param method The HTTP method when this trigger should be used.  valid values
   *   are: 'get', 'post', 'all'.
   * @return {Function} Returns a function that can be used to remove the trigger.
   * @example: 
   *   var myTrigger = addErrorTrigger(errorTrigger, 404, 'get'); //Add the trigger.
   *   myTrigger(); //Remove the trigger.
   */
  function addErrorTrigger(errorFn, errorCode, method) {
    var validMethods = [
      'get',
      'post',
      'all'
    ];
    var validErrorCodes = R.pluck('status')(errors);

    if (!errorFn || typeof errorFn !== 'function') {
      throw new Error('generateError function requires a function' +
        ' as its first parameter');
    }
    if (!errorCode || R.indexOf(errorCode, validErrorCodes) === -1) {
      throw new Error('error code must be one of: ' +
        validErrorCodes.toString());
    }
    method = method || 'all';
    if (R.indexOf(method.toLowerCase(), validMethods) === -1) {
      throw new Error('method must be one of: ' + validMethods.toString());
    }

    var errorTriggerId = 0;
    if (errorTriggers.length > 0) {
      errorTriggerId = R.max(R.pluck('id', errorTriggers)) + 1;
    }

    errorTriggers.push({
      id: errorTriggerId,
      fn: errorFn,
      errorCode: errorCode,
      method: method.toLowerCase()
    });

    return function removeTrigger() {
      var myerrorTriggerId = errorTriggerId;
      var removeIndex = R.findIndex(R.propEq('id', myerrorTriggerId))(
        errorTriggers);
      errorTriggers.splice(removeIndex, 1);
    };

  }

  /**
   * Add a false latency to any requests made.
   *
   * @returns {*} True, always.
   */
  function waitForTime() {
    var time;
    if (options.absoluteTime !== null) {
      time = options.absoluteTime;
    } else {
      time = randomInt(options.minTime, options.maxTime);
    }

    return $timeout(function () {
      return true;
    }, time);
  }

  function setOptions(newOptions) {
    options = R.merge(options, newOptions);
  }

  $window.hsUtils = {
    forceError: forceError,
    disableRandomErrors: disableRandomErrors
  };

  return {
    addErrorTrigger: addErrorTrigger,
    disableRandomErrors: disableRandomErrors,
    forceError: forceError,
    getErrorByCode: getErrorByCode,
    produceError: produceError,
    randomError: randomError,
    randomInt: randomInt,
    setOptions: setOptions,
    waitForTime: waitForTime,
    _getErrorTriggers: _getErrorTriggers
  };
}]);

'use strict';
angular.module('hackstack.wrap', [
    'hackstack.utils'
  ])
  /**
   * The hack wrapper wraps an end point with the HackStack error generation
   * methods so you get the random errors and mock latency while still talking
   * to a real server.
   *
   * When you get data with the hack wrapper you can merge it will a mock data
   * object to fill in either missing or incorrect data from the server.
   *
   * When you post the data back to the server you can pass in a transform
   * function that will change the data to the form expected by the server.
   */
  .factory('wrap', ["$q", "$http", "utils", function ($q, $http, utils) {
    function createWrapper(endpoint, mockData, options) {
      if (endpoint === undefined) {
        throw new Error('wrapper must be provided with an endpoint');
      }

      if (mockData === undefined) {
        throw new Error('wrapper must be provided with mock data');
      }

      if ('object' !== typeof (mockData)) {
        throw new Error('mock data must be an object');
      } else if (R.isArrayLike(mockData) === true) {
        throw new Error('mock data must be an object, not an array');
      }

      options = options || {};
      options.priorityMock = options.priorityMock || false;
      utils.setOptions(options);
      var baseEndpoint = endpoint;

      var disableRandomErrors = utils.disableRandomErrors;
      var produceError = utils.produceError;
      var waitForTime = utils.waitForTime;

      /**
       * Merges two objects with the first object passed in taking priority.
       * This function will deeply merge the two objects.
       * @example
       *   var obj1 = {
       *     id: 2,
       *     name: "brian"
       *   };
       *   var obj2 = {
       *     id: 1,
       *     address: {
       *       street: "John"
       *     }
       *   }
       *   var merged = deepMerge(obj2, obj1);
       *   //merged will be:
       *   {
       *     id: 1,
       *     name: "brian",
       *     address: {
       *       street: "John"
       *     }
       *   }
       * @param priorityObj
       * @param mergingObj
       * @returns {*}
       */
      function deepMerge(mergingObj, priorityObj) {
        // Make copies so we don't hold references
        var priObj = angular.copy(priorityObj);
        var newObj = angular.copy(mergingObj);

        for (var prop in priObj) {
          /**
           * Using void 0 to return undefined in case window.undefined is
           * modified.
           * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
           */
          if (priObj[prop] !== void 0 && typeof priObj[prop] === 'object' &&
            !Array.isArray(priObj[prop])) {
            newObj[prop] = deepMerge(newObj[prop], priObj[prop]);
          } else {
            newObj[prop] = priObj[prop];
          }
        }
        return newObj;
      }

      /**
       * A helper method to wrap the options check.
       *
       * @param responseData The data retrieved from the server.
       * @param mockData The mockData object.
       *
       * @returns {*} The merged object
       */
      function mergeResponse(responseData, mockData) {
        if (options.priorityMock && options.priorityMock === true) {
          return deepMerge(responseData, mockData);
        }
        return deepMerge(mockData, responseData);
      }

      /**
       * Return a list of objects from the server from a specified end point.
       * The mock object used to instantiate this service will be merged
       * with each individual result.
       *
       * @returns {*} A promise with the merged result from the server and mock.
       */
      function processGetAll() {
        return $http.get(baseEndpoint)
          .then(function (response) {
            var newData = R.map(function (item) {
              return mergeResponse(item, mockData);
            }, response.data);
            response.data = newData;
            return response;
          });
      }

      /**
       * Perform a get request to the desired end-point and ID.
       * This process with merge the returned results with the mock object
       * the service was instantiated with.
       *
       * @param id  The id to get.
       * @returns {*} A promise with the merged result from the server and mock.
       */
      function processGet(id) {
        return $http.get([baseEndpoint, id].join('/'))
          .then(function (response) {
            response.data = mergeResponse(response.data, mockData);
            return response;
          });
      }

      /**
       * Will create a new entity on the server.  If given a transform function
       * the function will be applied to the data before it is sent to the
       * server.
       *
       * @param data The data to be created on the server.
       * @param transformFn The transformation to apply to the data before
       * sending it to the server.
       *
       * @returns {*} A promise with the server response.
       */
      function create(data, transformFn) {
        if (transformFn) {
          data = transformFn(data);
        }
        var error = produceError(data, 'post');

        if (null !== error) {
          return $q.reject(error);
        }

        return $http.post(baseEndpoint, data)
          .then(function (response) {
            var id;
            /*
             * Return a pointer to the resource if the origin API returns
             * a location header. Otherwise return the response we receive
             */
            if (response.headers('location')) {
              id = R.last(response.headers().location.split('/'));
              // Wrap the request to the new object we just created by using
              // hackWrap.get rather than $http.get
              return get(id);
            }
            return response;
          });
      }

      /**
       * Update an entity on the server.  If given a transform function it will
       * apply the function to the data object before it is sent to the server.
       *
       * @param id The id to update.
       * @param data The data to update the data with.
       * @param transformFn The transformation function to apply to the data
       * before sending it to the server.
       *
       * @returns {*} A promise with the server response.
       */
      function update(id, data, transformFn) {
        if (transformFn) {
          data = transformFn(data);
        }

        var error = produceError(data, 'post');

        if (null !== error) {
          return $q.reject(error);
        }

        return $http.post([baseEndpoint, id].join('/'), data);
      }

      /**
       * A convenience method that will decide whether to use update or create
       * based on the presence of an id property in the data object.
       *
       * @param data The data to be saved to the server.
       * @param transformFn A data transformation function that will be applied
       * to the data before it is sent to the server.
       *
       * @returns {*} A promise with the server response.
       */
      function save(data, transformFn) {
        if (data.id) {
          return update(data.id, data, transformFn);
        } else {
          return create(data, transformFn);
        }
      }

      /**
       * The getAll function wraps the processGetAll function and adds in the
       * random errors and mock latency.
       *
       * @returns {*} A promise with the server response.
       */
      function getAll() {
        var error = produceError();

        if (null !== error) {
          return $q.reject(error);
        }

        return waitForTime().then(function () {
          return $q.when(processGetAll());
        });
      }

      /**
       * A wrapper for the processGet function that adds in random errors and
       * mock latency.
       *
       * @param id The id of the entity to retrieve
       * @returns {*} A promise with the server response.
       */
      function get(id) {
        var error = produceError(id, 'get');

        if (null !== error) {
          return $q.reject(error);
        }

        return waitForTime().then(function () {
          return $q.when(processGet(id));
        });
      }

      return {
        create: create,
        disableRandomErrors: disableRandomErrors,
        forceError: utils.forceError,
        getAll: getAll,
        get: get,
        query: getAll,
        save: save,
        update: update
      };
    }

    return createWrapper;
  }]);

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
  .factory('hackstack', ["mock", "wrap", "utils", function (mock, wrap, utils) {
    return {
      'mock': mock,
      'wrap': wrap,
      'utils': utils
    };
  }]);
