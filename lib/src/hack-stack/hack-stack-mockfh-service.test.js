'use strict';

var $timeout, fh, $q, $httpBackend, $window, path, cloudSpy;
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
    fh.setBypassMock(false);
    $window.$fh = {
      'cloud': cloudSpy
    };
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $timeout.verifyNoPendingTasks();
  });

  it('should return mock data in response', function () {
    var response = fh.cloud({
      'path': path
    }, function (err, res) {
      if (err !== null) {
        throw new Error('Expected err === null');
      }
      expect(res.data.data).to.deep.equal(mockObject1);
    });
    $timeout.flush();
  });

  it('should return header(status=200) and data(status=Ok)', function () {
    var response = fh.cloud({
      'path': path
    }, function (err, res) {
      expect(res.status).to.equal(200);
      expect(res.data.status).to.equal('Ok');
    });
    $timeout.flush();
  });

  it('should call $fh.cloud if setBypassMock(true)', function () {
    var options = {
      'option': 'option'
    };
    var callback = function () {};
    fh.setBypassMock(true);
    fh.cloud(options, callback);
    expect(cloudSpy).to.have.been.calledWith(options, callback);
  });

  /**
   *  TODO: fix bug in hackstack.mock that breaks this
   *  Details: if disableErrors(true), forceError(error) doesn't work
   */
  xit('should return a backend error if options.forceBackendError',
    function () {
      var errorCode = 404;
      var options = {
        'path': path,
        'forceBackendError': errorCode
      };
      fh.cloud(options, function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.data.status).to.equal('Ok');
        expect(res.data.data.status).to.equal(errorCode);
      });
      $timeout.flush();
    });
});
