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

      function produceError(errorArray) {
        var totalWeight = R.reduce(function (acc, value) {
          return acc + value.distribution;
        }, 0, errorArray);


        if (totalWeight > MAX_ERROR_DISTRIBUTION) {
          throw new Error(
            'Sum of distributions is greater than defined max');
        }

        var randomNumber = randomInt(0, MAX_ERROR_DISTRIBUTION);
        var weightedSum = 0;
        if (setError === null) {
          R.forEach(function (item) {
            weightedSum += item.distribution;
            if (randomNumber <= weightedSum) {
              return cleanError(item);
            }
          }, errorArray);
        } else {
          return cleanError(getErrorByCode(setError));
        }

        return null;
      }

      function processGET(id) {
        var error = produceError(errors);

        if (null !== error) {
          return $q.reject(error);
        }

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
        var error = produceError(errors);

        if (null !== error) {
          return $q.reject(error);
        }

        if(R.not(R.has('id')(data))) {
          data.id = createIdFn();
        }
        //TODO: Add a location header with the new id.
        mockData.push(data);
        setGoodGET(null, mockData);
        return goodPOST();
      }

      function processUpdate(id, data) {
        var error = produceError(errors);

        if(null !== error) {
          return $q.reject(error);
        }

        var index = -1;
        R.forEachIndexed(function (item, idx) {
          if(item.id === id) {
            index = idx;
          }
        }, mockData);
        if(index > -1) {
          mockData[index] = data;
          return {
            status: 200,
            statusText: 'OK',
            data: ''
          };

        } else {
          return $q.reject(cleanError(getErrorByCode(404)));
        }
      }

      function getAll() {
        return waitForTime().then(function () {
          return $q.when(processGET());
        });
      }

      function get(id) {
        return waitForTime().then(function () {
          return $q.when(processGET(id));
        });
      }

      function update(id, data) {
        return waitForTime().then(function() {
          return $q.when(processUpdate(id, data));
        });
      }

      function create(data, createIdFn) {
        return waitForTime().then(function() {
          return $q.when(processCreate(data, createIdFn));
        });
      }

      function save(data) {
        if(data.id) {
          return update(data.id, data);
        } else {
          return create(data);
        }
      }

      return {
        create: create,
        disableErrors: disableErrors,
        forceError: forceError,
        get: get,
        getAll: getAll,
        query: getAll,
        save: save,
        update: update
      };
    }

    return createMock;
  });
