angular.module('hackstack demo app')

.service('api', function($http, config, hackstack, mockData, mockDataOverrides, $window) {

  var birdsUrl = [config.BASE_URL, 'birds'].join('/');

  var mockBirds = hackstack.mock(mockData.birds);
  var wrappedBirds = hackstack.wrap(birdsUrl, mockDataOverrides.birds);
  $window.mockBirds = mockBirds;
  $window.wrappedBirds = wrappedBirds;

  var liveBirds = {
    'get': function(id) {
      return $http.get([birdsUrl, id].join('/'));
    },
    'getAll': function() {
      return $http.get(birdsUrl + '/');
    }
  }

  var endpoints = {
    birds: function() {
      var backendType = config.backendType;
      if (backendType === 'mock') {
        return mockBirds;
      } else if (backendType === 'wrap') {
        return wrappedBirds;
      } else if (backendType === 'live') {
        return liveBirds;
      } else {
        throw new Error('Unrecognized backend type', backendType);
      }
    }
  };

  function getEndpoint(endpointHandle) {
    var endpoint = endpoints[endpointHandle]
    if (!endpoint) {
      throw new Error('No such endpoint: ', endpoint.toString());
    }
    return endpoint();
  }

  this.getAll = function getAll(endpoint) {
    return getEndpoint(endpoint).getAll();
  };

  this.get = function get(endpoint) {
    return getEndpoint(endpoint).get();
  };
});