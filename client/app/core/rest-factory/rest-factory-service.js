'use strict';

angular.module('showcase.core.restFactory.service', [
  'showcase.core.constants'
])

.factory('restFactory', function (API_BASE, $q, $http) {
  /**
   * Generates a REST factory.
   * @param schemaName - The name of the schema/API end point.
   * @param serializer - And object containing serialize and deserialize
   * functions for doing data normalization between the API/angular models.
   * @returns - A service for communicating with the API, for the end-point
   * and data mapping that were provided.
   **/
  function createService(schemaName) {
    var baseEndpoint = [API_BASE, schemaName].join('/');

    // Potential contraints for the ID
    function assertId(id) {
      var deferred = $q.defer();
      if (id) {
        deferred.resolve();
      } else {
        deferred.reject('Missing ID');
      }
      return deferred.promise;
    }

    /**
     * Get an object by id from the API.
     * @param id : The id of the object.
     * @returns : Promise with the object.
     **/
    function get(id) {
      return assertId(id).then(function () {
        return $http.get([baseEndpoint, id].join('/'));
      });
    }

    /**
     * Query an endpoint with a collection of parameters instead of an id.
     * @param data : Object with the parameters to put in the query string.
     * @returns : Promise with the result of the query.
     **/
    function query(data, method) {
      method = method || 'GET';
      var queryParams = {
        method: method,
        url: baseEndpoint
      };
      if (method === 'GET') {
        queryParams.params = data;
      }
      if (method === 'POST') {
        queryParams.data = data;
      }

      return $http(queryParams);
    }

    /**
     * Get a list of objects from the API.
     * @returns : Promise with a list of objects.
     **/
    function getAll() {
      return $http.get(baseEndpoint);
    }

    /**
     * Update an object through the API
     * @param id : The id of the object.
     * @param data : The data to update the object with
     * @returns : Promise with the result of the update.
     **/
    function update(id, data) {
      return assertId(id).then(function () {
        return $http.put([baseEndpoint, id].join('/'), data);
      });
    }

    /**
     * Create a new object through the API
     * @param data : The data to update the object with
     * @returns : Promise that returns the provided data, amended with the id
     * that the API assigned.
     **/
    function create(data) {
      return $http.post(baseEndpoint, data).then(function (response) {
        data.id = R.last(response.headers().location.split('/'));
        return data;
      });
    }

    /**
     * Wrapper that saves or updates an object, based on whether it already
     * has an id. Data without an id attribute are created as new objects, and
     * those with an id are updated.
     * This function expects the angular model representation, and will handle
     * the formatting of the request.
     * @param data : The angular model to persist.
     * @returns : Promise that returns the provided data (with the id added
     * if a create took place)
     **/
    function save(data) {
      if (data.id) {
        return update(data.id, data).then(function (result) {
          return data;
        });
      } else {
        return create(data).then(function (result) {
          data.id = result.id;
          return data;
        });
      }
    }

    if (!baseEndpoint || !schemaName) {
      throw 'Must specify base endpoint and schema name';
    }

    return {
      get: get,
      query: query,
      getAll: getAll,
      update: update,
      create: create,
      save: save
    };
  }

  return createService;
});
