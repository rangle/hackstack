'use strict';
angular.module('showcase.core.hackstack.wrapper', [
    'showcase.core.hackstack.common'
  ])
  /**
   * The hack wrapper wraps an end point with the hack stack error generation
   * methods so you get the random errors and mock latency while still talking
   * to a real server.
   *
   * When you get data with the hack wrapper you can merge it will a mock data
   * object to fill in either missing or incorrect data from the server.
   *
   * When you post the data back to the server you can pass in a transform
   * function that will change the data to the form expected by the server.
   */
  .factory('hackWrap', function ($q, $http, hackStackUtils, API_BASE) {
    function createWrapper(endpoint, mockData, options) {
      var baseEndpoint = [API_BASE, endpoint].join('/');
      if (R.isArrayLike(mockData) === true) {
        throw new Error('mock data must be an object, not an array');
      }

      if (options) {
        hackStackUtils.setOptions(options);
      }

      var disableErrors = hackStackUtils.disableErrors;
      var produceError = hackStackUtils.produceError;
      var waitForTime = hackStackUtils.waitForTime;


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
              //If origin is priority;
              return R.merge(mockData, item);
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
            /**
             * Real data will clobber mock data.
             *
             * TODO: Create a switch that will have mock data
             * clobber real data.
             */
            response.data = R.merge(mockData, response.data);
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

        var error = produceError();

        if (null !== error) {
          return $q.reject(error);
        }

        return $http.post(baseEndpoint, data)
          .then(function (response) {
            data.id = R.last(response.headers().location.split('/'));
            return data;
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

        var error = produceError();

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
        var error = produceError();

        if (null !== error) {
          return $q.reject(error);
        }

        return waitForTime().then(function () {
          return $q.when(processGet(id));
        });
      }

      return {
        create: create,
        disableErrors: disableErrors,
        forceError: hackStackUtils.forceError,
        getAll: getAll,
        get: get,
        query: getAll,
        save: save,
        update: update
      };

    }

    return createWrapper;
  });
