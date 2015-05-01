'use strict';
angular.module('showcase.core.hackstack.wrapper', [
  'showcase.core.hackstack.common'
])
  .factory('hackWrap', function ($q, $http, hackStackUtils, API_BASE) {
    function createWrapper(endpoint, mockData, options) {
      var baseEndpoint = [API_BASE, endpoint].join('/');
      if(R.isArrayLike(mockData) === true) {
        throw new Error('mock data must be an object, not an array');
      }

      var disableErrors = hackStackUtils.disableErrors;
      var produceError = hackStackUtils.produceError;
      var getErrorByCode = hackStackUtils.getErrorByCode;
      var waitForTime = hackStackUtils.waitForTime;

      var mergeMockPriority = R.merge(R._, mockData); //TODO: Add a switch for this.

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

      function processGet(id) {
        return $http.get([baseEndpoint, id].join('/'))
          .then(function (response) {
            response.data = R.merge(mockData, response.data);
            return response;
          });
      }

      function create(data, transformFn) {
        if(transformFn) {
          data = transformFn(data);
        }

        return $http.post(baseEndpoint, data)
          .then(function (response) {
            data.id = R.last(response.headers().location.split('/'));
            return data;
          });
      }

      function getAll() {
        return waitForTime().then(function () {
          return $q.when(processGetAll());
        });
      }

      function get(id) {
        return waitForTime().then(function () {
          return $q.when(processGet(id));
        });
      }

      return {
        create: create,
        getAll: getAll,
        get: get,
        save: create
      };

    }

    return createWrapper;
  });