'use strict';
angular.module('hackstack.wrapper', [
    'hackstack.common'
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
  .factory('hackWrap', function ($q, $http, hackStackUtils) {
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
      hackStackUtils.setOptions(options);
      var baseEndpoint = endpoint;

      var disableRandomErrors = hackStackUtils.disableRandomErrors;
      var produceError = hackStackUtils.produceError;
      var waitForTime = hackStackUtils.waitForTime;

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
          if (priObj[prop] !== void 0 && typeof priObj[prop] === 'object') {
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
