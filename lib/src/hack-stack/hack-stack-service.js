/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('hackstack.service', [
    'hackstack.common'
  ])
  .factory('hackStack', function ($http, $q, hackStackUtils) {
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

      if (options) {
        hackStackUtils.setOptions(options);
      }

      var disableErrors = hackStackUtils.disableErrors;
      var produceError = hackStackUtils.produceError;
      var getErrorByCode = hackStackUtils.getErrorByCode;
      var waitForTime = hackStackUtils.waitForTime;

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

      function processGET(id) {
        var error = produceError();

        if (null !== error) {
          return $q.reject(error);
        }

        if (id) {
          /*jshint eqeqeq:false */
          var foundItem = R.find(function (item) {
            return item.id == id;
          })(mockData);
          /*jshint eqeqeq:true */
          return {
            status: 200,
            statusText: 'OK',
            data: foundItem
          };
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
        var error = produceError();

        if (null !== error) {
          return $q.reject(error);
        }

        if (createIdFn) {
          data.id = createIdFn();
        }
        //TODO: Add a location header with the new id.
        mockData.push(data);
        setGoodGET(null, mockData);
        return goodPOST();
      }

      function processUpdate(id, data) {
        var error = produceError();

        if (null !== error) {
          return $q.reject(error);
        }

        var index = R.findIndex(R.propEq('id', id))(mockData);

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
          return $q.when(processGET());
        });
      }

      // TODO FIX bug where if id is not in mockData, 200 is returned.
      // Should be 404
      function get(id) {
        return waitForTime().then(function () {
          return $q.when(processGET(id));
        });
      }

      function update(id, data) {
        return waitForTime().then(function () {
          return $q.when(processUpdate(id, data));
        });
      }

      function generateId() {
        return R.max(R.pluck('id', mockData)) + 1;
      }

      function create(data, createIdFn) {
        return waitForTime().then(function () {
          return $q.when(processCreate(data, createIdFn));
        });
      }

      function save(data, createIdFn) {
        createIdFn = createIdFn || generateId;
        if (data.id) {
          return update(data.id, data);
        } else {
          return create(data, createIdFn);
        }
      }

      return {
        create: create,
        disableErrors: disableErrors,
        forceError: hackStackUtils.forceError,
        get: get,
        getAll: getAll,
        query: getAll,
        save: save,
        update: update
      };
    }

    return createMock;
  });
