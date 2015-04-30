'use strict';
angular.module('showcase.core.hackstack.httpErrorsFactory', [])
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
  .factory('httpErrorFactory', function (MAX_ERROR_DISTRIBUTION) {
    /**
     * Set a specific error to be returned.  Pass in the HTTP error code.
     *
     * @type {Number} The HTTP Error code to return.
     */
    var setError = null;

    /**
     * Set to ensure you get a 200 return from the the API.  This will
     * bypass the random error generation.
     *
     * @type {boolean} False to produce errors, true to prevent errors.
     */
    var errorsDisabled = false;

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
      return cleanError(error[0]);
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

    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function produceError(errorArray) {
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
      if(errorsDisabled === false) {
        if (setError === null) {
          R.forEach(function (item) {
            weightedSum += item.distribution;
            if (randomNumber <= weightedSum && error === null) {
              error = cleanError(item);
            }
          }, errorArray);
        } else {
          return cleanError(getErrorByCode(setError));
        }
      }

      return error;
    }

    return {
      disableErrors: disableErrors,
      forceError: forceError,
      produceError: produceError,
      getErrorByCode: getErrorByCode,
      randomInt: randomInt
    }
  });