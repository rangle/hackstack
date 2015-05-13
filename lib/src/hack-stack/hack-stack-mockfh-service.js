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
     *
     * @param {Object} hsOptions hack stack options. Options that will be
     * passed to the hackstack object which acts as a backend mock
     */
    function createFHMock(mockData, hsOptions) {
      /**
       * Mimick a web call to our mock backend
       *
       * @param {Object} options
       * @param {Function} callback
       */
      function web(options, callback) {
        var hs = hackStack(mockData, hsOptions);
        hs.disableErrors(true);
        var url = options.url;
        // $fh.web takes a url. hackstack.get takes an id
        var id = R.last($filter(url.split('/')));
        var backendResponse = hs.get(id);
        // wrap the backend response so it looks like a $fh res object
        backendResponse.then(
          // success callback
          function (result) {
            var res = {
              'status': 200,
              'statusText': 'OK',
              // top level data (feedhenry's response)
              'data': {
                'status': 'Ok',
                // backend data
                'body': result.data
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
