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

      options = options || defaults; //TODO: Merge these.

      var responseObj;

      function setGoodResponse(response, data) {
        var defaultResponse = {
          status: 200,
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

      var errors = [{
        status: 400,
        statusText: 'Bad request',
        distribution: 10
      }, {
        status: 401,
        statusText: 'Not authorized',
        distribution: 10
      }, {
        status: 403,
        statusText: 'Forbidden',
        distribution: 10
      }, {
        status: 404,
        statusText: 'Not found',
        distribution: 10
      }, {
        status: 405,
        statusText: 'Method not allowed',
        distribution: 10
      }];

      function cleanError(error) {
        return {
          status: error.status,
          statusText: error.statusText,
          data: 'Forced error by hackStack'
        };
      }

      function produceError() {
        var error = null;
        var totalWeight = R.reduce(function (acc, value) {
          return acc + value.distribution;
        }, 0, errors);


        if (totalWeight > MAX_ERROR_DISTRIBUTION) {
          throw new Error(
            'Sum of distributions is greater than defined max');
        }

        var randomNumber = randomInt(0, MAX_ERROR_DISTRIBUTION);
        console.log('randomNumber', randomNumber);
        var weightedSum = 0;
        R.forEach(function (item) {
          weightedSum += item.distribution;
          if (randomNumber <= weightedSum && error === null) {
            error = cleanError(item);
          }
        }, errors);
        if (null === error) {
          return responseObj;
        }
        return $q.reject(error);
      }

      function getAll() {
        return waitForTime().then(function () {
          return $q.when(produceError());
        });
      }

      function get(id) {

      }

      function query(data, method) {

      }

      function update(id, data) {

      }

      function create(data) {

      }

      function save(data) {

      }

      return {
        getAll: getAll
      };
    }

    return createMock;
  });
