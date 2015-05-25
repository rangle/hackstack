'use strict';

function identityFn(x) {
  return x;
}

var $timeout, fh, $q, $httpBackend, $window, path, cloudSpy, defaultOptions;
var mockData1 = {
  'title': 'mock title 1',
  'id': 1
};
var mockData2 = {
  'title': 'mock title 2',
  'id': 2
};
var endpoint = 'endpoint';
var incompleteObject = {
  'id': 0,
  'description': 'mock description'
};
// Origin takes precedence
var mockObject1 = R.merge(mockData1, incompleteObject);
var mockObject2 = R.merge(mockData2, incompleteObject);

describe('Hack Stack FeedHenry tests', function () {
  var pathCounter = 0;

  function generateNewPath() {
    pathCounter += 1;
    return '/path'.concat(pathCounter).concat('/endpoint');
  }

  beforeEach(function () {
    module('hackstack.feedhenry');
  });

  beforeEach(inject(function (_mockFH_, _$timeout_, _$q_, _$window_) {
    fh = _mockFH_;
    $timeout = _$timeout_;
    $q = _$q_;
    $window = _$window_;
  }));

  beforeEach(inject(function (_mockFH_) {
    cloudSpy = sinon.spy();
    path = generateNewPath();

    fh.addMockEndpoint(path, [mockObject1]);
    $window.$fh = {
      'cloud': cloudSpy
    };
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $timeout.verifyNoPendingTasks();
  });

  describe('GET tests', function () {

    beforeEach(function () {
      defaultOptions = {
        'path': path,
        'method': 'GET',
        'data': {}
      };
    });

    it('should return mock data in response', function () {
      var response = fh.cloud(defaultOptions, function (res) {
        expect(res.data).to.deep.equal(mockObject1);
      });
      $timeout.flush();
    });

    it('should return data(status=Ok)', function () {
      var response = fh.cloud(defaultOptions, function (res) {
        expect(res.status).to.equal('Ok');
      });
      $timeout.flush();
    });

    it('should call $fh.cloud if endpoint not defined', function () {
      var options = {
        'method': 'POST',
        'path': 'undefined/endpoint',
        'data': 'test'
      };
      var callback = function () {};
      fh.cloud(options, callback);
      expect(cloudSpy).to.have.been.calledWith(options, callback);
    });

    it('should return a backend error if mockFH.forceBackendError()',
      function () {
        var errorCode = 404;
        var mockFHError = fh.forceBackendError(errorCode);
        mockFHError.cloud(defaultOptions, function (res) {
          expect(res.status).to.equal('Ok');
          expect(res.data.status).to.equal(errorCode);
        });
        $timeout.flush();
      });
  });

  describe('sanity checks', function () {
    it('should throw if endpoint defined twice', function () {
      var options = {
        'path': path,
        'method': 'GET',
        'data': {}
      };
      expect(function () {
        fh.addMockEndpoint(options.path, [{}]);
      }).to.throw();
    });

    it('should only accept GET or POST', function () {
      var getOptions, postOptions, headOptions;
      getOptions = {
        'path': path,
        'method': 'GET',
        'data': {}
      };
      postOptions = angular.copy(getOptions);
      postOptions.method = 'POST';
      headOptions = angular.copy(getOptions);
      headOptions.method = 'HEAD';

      expect(function () {
        fh.cloud(getOptions, function () {});
      }).to.not.throw();
      expect(function () {
        fh.cloud(postOptions, function () {});
      }).to.not.throw();
      expect(function () {
        fh.cloud(headOptions, function () {});
      }).to.throw();

      $timeout.flush();
    });

    it('should throw if options.data === undefined', function () {
      var options = {
        'path': path,
        'method': 'GET'
      };
      expect(function () {
        fh.cloud(options, identityFn);
      }).to.throw();
    });

    it('should not set an error if endpoint not defined', function () {
      var options = {
        'path': 'undefined/endpoint',
        'method': 'GET',
        'data': {}
      };
      fh.forceBackendError(404).cloud(options, identityFn,
        identityFn);
      options.path = path;
      fh.cloud(options, function (res) {
        expect(res.status).to.equal('Ok');
      });
      $timeout.flush();
    });

    it('should throw if given an empty array', function () {
      expect(function () {
        fh.addMockEndpoint(generateNewPath(), []);
      }).to.throw();
    });

    it('should throw if not given an array', function () {
      expect(function () {
        fh.addMockEndpoint(generateNewPath(), 1);
      }).to.throw();

      expect(function () {
        fh.addMockEndpoint(generateNewPath(), 'string');
      }).to.throw();
    });

    it('should set property $window.hsUtils.mockFH.listEndpoints,' +
      'which lists mock endpoints',
      function () {
        var newPath = generateNewPath();
        var listEndpoints = $window.hsUtils.mockFH.listEndpoints;
        var oldCount = listEndpoints().length;
        expect(R.contains(newPath)(listEndpoints())).to.be.false;
        fh.addMockEndpoint(newPath, ['data']);
        expect(R.contains(newPath)(listEndpoints())).to.be.true;
        expect(listEndpoints().length).to.equal(oldCount + 1);
        // catch undefined
        expect(listEndpoints().length).to.not.equal(oldCount + 2);
      });
  });
});
