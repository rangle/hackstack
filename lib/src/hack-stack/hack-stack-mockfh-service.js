'use strict';
angular.module('hackstack.feedhenry', [
    'hackstack.mock'
  ])
  .factory('mockFH', function (hackStack) {
    var $fhmock = Object.create(window.$fh || null),
      mockEndpoints = {};

    function wrapBackendResponse(res) {
      return {
        'status': 200,
        'statusText': 'OK',
        // top level data (feedhenry's response)
        'data': {
          'status': 'Ok',
          // backend data
          'body': res.data
        }
      };
    }

    /**
     * add a mock endpoint
     *
     * @param {String} endpoint path to this endpoint
     * @param {Array} mockData array of objects from which a response is
     * created. See hackStack documentation
     */
    $fhmock.addMockEndpoint = function addMockEndpoint(endpoint, mockData) {
      var hs = hackStack(mockData);
      hs.disableErrors(true);
      if (mockEndpoints[endpoint] !== undefined) {
        throw new Error('Endpoint already defined');
      } else {
        mockEndpoints[endpoint] = hs;
      }
    };

    /**
     * Mimick a web call to our mock backend
     *
     * @param {Object} options
     * @param {Function} callback
     */
    $fhmock.cloud = function cloud(options, callback) {
      var path = options.path;
      var hs = mockEndpoints[path];
      // get last token that's not the empty string so id('endpoint/1/') = 1
      //var id = R.last(R.filter(
      //  function (urlFragment) {
      //    return urlFragment !== '';
      //  })(path.split('/')));
      // TODO hack. Not hard to fix, but not sure what the correct solution is
      var id = 0;
      if (hs === undefined) {
        throw new Error('This endpoint has not been defined');
      }
      var backendResponse = hs.get(id);
      // wrap the backend response so it looks like a $fh res object
      backendResponse.then(
        // success callback
        function (result) {
          callback(null, wrapBackendResponse(result));
        },
        function (result) {
          callback(null, wrapBackendResponse(result));
        });
    };

    return $fhmock;
  });
