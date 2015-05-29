/* global angular */
/* global R */
'use strict';
angular.module('hackstack.mock', [
    'hackstack.utils'
  ])
  .factory('mock', function ($http, $q, utils) {
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
  });
