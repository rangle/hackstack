/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.core.hackstack.service', [])
  /**
   * A random number will be generated between 0 and MAX_ERROR_DISTRIBUTION.
   * The number generated will be used to determine which error will be produced.
   * Note when defining distributions of errors that you need to leave room
   * for a clean return.  So try not to make your distributions add up to this
   * number.
   *
   * 100 - sum_of_distributions = the chance of a clean return.
   */
  .constant('MAX_ERROR_DISTRIBUTION', 100)
  .factory('hackStack', function ($http, $q, $timeout, MAX_ERROR_DISTRIBUTION) {
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

      var defaults = {
        maxTime: 2000,
        minTime: 0,
        absoluteTime: null
      };

      /**
       * Set to ensure you get a 200 return from the the API.  This will
       * bypass the random error generation.
       *
       * @type {boolean} False to produce errors, true to prevent errors.
       */
      var errorsDisabled = false;

      /**
       * Set a specific error to be returned.  Pass in the HTTP error code.
       *
       * @type {Number} The HTTP Error code to return.
       */
      var setError = null;

      options = options || defaults; //TODO: Merge these.

      var responseObj;

      var errors = [{
        status: 0, //Dropped connection
        statusText: '',
        distribution: 1
      }, {
        status: 400,
        statusText: 'Bad request',
        distribution: 1
      }, {
        status: 401,
        statusText: 'Not authorized',
        distribution: 1
      }, {
        status: 403,
        statusText: 'Forbidden',
        distribution: 1
      }, {
        status: 404,
        statusText: 'Not found',
        distribution: 1
      }, {
        status: 405,
        statusText: 'Method not allowed',
        distribution: 1
      }, {
        status: 406,
        statusText: 'Not acceptable',
        distribution: 1
      }, {
        status: 407,
        statusText: 'Proxy Authentication Required',
        distribution: 1
      }, {
        status: 408,
        statusText: 'Request timeout',
        distribution: 1
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
        distribution: 1
      }, {
        status: 501,
        statusText: 'Not implemented',
        distribution: 1
      }, {
        status: 502,
        statusText: 'Bad gateway',
        distribution: 1
      }, {
        status: 503,
        statusText: 'Service unavailable',
        distribution: 1
      }, {
        status: 504,
        statusText: 'Gateway timeout',
        distribution: 1
      }, {
        status: 505,
        statusText: 'HTTP version not supported',
        distribution: 1
      }];

      function setGoodResponse(response, data) {
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

      if (Array.isArray(mockData)) {
        responseObj = setGoodResponse(null, mockData);
      } else if (mockData && mockData.indexOf && mockData.indexOf('.json') !==
        -1) {
        $http.get(mockData)
          .then(function (response) {
            responseObj = setGoodResponse(response);
          })
          .then(null, function (error) {
            throw new Error(error);
          });
      } else {
        throw new Error('mockData required to be an array or .json path');
      }

      /**
       * Set whether or not the hack stack should randomly produce server errors
       *
       * @param {boolean} disabled true to disable errors, false (default)
       * otherwise.
       * @returns {boolean} If called without a parameter, acts as a getter.
       */
      function disableErrors(disabled) {
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
        return error[0];
      }

      /**
       * Set the error code to the desired HTTP error.
       *
       * @param errorCode
       */
      function forceError(errorCode) {
        if (errorCode === null) {
          setError = null;
        } else if (getErrorByCode(errorCode) !== false) {
          setError = errorCode;
        } else {
          throw new Error('Unsupported HTTP Code');
        }
      }

      function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
      }

      function waitForTime() {
        var time = randomInt(options.minTime, options.maxTime);
        if (options.absoluteTime !== null) {
          time = options.absoluteTime;
        }

        return $timeout(function () {
          return true;
        }, time);
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
          data: 'Forced error by hackStack'
        };
      }

      function produceGETError(id) {
        var error = null;
        var totalWeight = R.reduce(function (acc, value) {
          return acc + value.distribution;
        }, 0, errors);


        if (totalWeight > MAX_ERROR_DISTRIBUTION) {
          throw new Error(
            'Sum of distributions is greater than defined max');
        }

        var randomNumber = randomInt(0, MAX_ERROR_DISTRIBUTION);
        var weightedSum = 0;
        if (setError === null) {
          R.forEach(function (item) {
            weightedSum += item.distribution;
            if (randomNumber <= weightedSum && error === null) {
              error = cleanError(item);
            }
          }, errors);
        } else {
          error = cleanError(getErrorByCode(setError));
        }

        if (null === error) {
          if(id) {
            return {
              status: 200,
              statusText: 'OK',
              data: responseObj.data[0]
            }
          } else {
            return responseObj;
          }
        }
        return $q.reject(error);
      }

      function getAll() {
        return waitForTime().then(function () {
          return $q.when(produceGETError());
        });
      }

      function get(id) {
        return waitForTime().then(function () {
          return $q.when(produceGETError(id));
        });
      }

      function update(id, data) {

      }

      function create(data) {

      }

      function save(data) {

      }

      return {
        disableErrors: disableErrors,
        forceError: forceError,
        get: get,
        getAll: getAll,
        query: getAll
      };
    }

    return createMock;
  });
