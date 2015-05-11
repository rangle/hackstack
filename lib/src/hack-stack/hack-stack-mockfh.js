'use strict';
angular.module('hackstack.feedhenry', [
    'hackstack.mock'
  ])
  .factory('mockFH', function (hackStack, $timeout) {
    function $filter(i) {
      return i;
    }

    /**
     * Create a mock $fh (FeedHenry) endpoint to use in your app.
     *
     * @param {Object} mockData
     * @param {Object} options
     */
    function createFHMock(mockData, options) {
      /**
       * Mimick a web call to our mock backend
       *
       * @param {Object} options
       * @param {Function} callback
       */
      function web(options, callback) {
        var hs = hackStack(mockData, options);
        hs.disableErrors(true);
        var url = options.url;
        var id = R.last($filter(url.split('/')));
        var backendResponse = hs.get(id);
        backendResponse.then(
          // success callback
          function (result) {
            var data = result.data;
            var res = {
              'status': 200,
              'statusText': 'OK',
              // top level data (feedhenry's response)
              'data': {
                'status': 'Ok',
                // backend data
                'body': angular.copy(result.data)
              }
            };
            callback(null, res);
          },
          // failure callback
          // TODO should we transform result before passing it to callback
          function (result) {
            callback(result, null);
          });
      }

      return {
        'web': web
      };
    }

    return createFHMock;
  });
