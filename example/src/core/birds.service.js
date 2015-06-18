
angular.module('hackstack demo app').factory('birds',
function (hackstack, config, $http) {

  var mockAPI = hackstack.mock(config.mockData);
  var wrappedAPI = hackstack.wrap(config.BASE_URL, config.mockObject)

  var liveAPI = {
    'get': function(id) {
      var url = [config.BASE_URL, id].join('/');
      return $http.get(url);
    },
    'getAll': function() {
      var url = config.BASE_URL;
      return $http.get(url);
    },
    'create': function(bird) {
      var url = config.BASE_URL;
      return $http.post(url, bird);
    }
  }

  function getBackend() {
    var backendType = config.backendType;
    if (backendType === 'mock') {
      return mockAPI;
    } else if (backendType === 'wrap') {
      return wrappedAPI;
    } else if (backendType === 'live') {
      return liveAPI;
    } else {
      throw new Error('Unrecognized backend type', backendType);
    }
  }

  return {
    'getAllBirds': getAllBirds,
    'getBird': getBird,
    'createBird': createBird,
    'updateBird': updateBird
  }

  function getBird(id) {
    return getBackend()
      .get(id);
  }

  function getAllBirds() {
    return getBackend()
      .getAll();
  }

  function createBird(bird) {
    var id = bird.id;
    return getBackend()
      .craete(id, bird);
  }

  function updateBird(bird) {
    var id = bird.id;
    return getBackend()
      .update(id, bird);
  }
});
