'use strict';

var $timeout;
var hw;
var $q;
var $httpBackend;
var API_BASE;
// karma is stupid unless we're using it wrong. It uses the name namespace
// across files. Thus the 'w' suffix.
var mockData1w = {
  'title': 'mock title 1',
  'id': 1
};
var mockData2w = {
  'title': 'mock title 2',
  'id': 2
};
var endpoint = 'endpoint';
var incompleteObject = {
  'id': 0,
  'description': 'mock description'
};
// Origin takes precedence
var mockObject1w = R.merge(mockData1w, incompleteObject);
var mockObject2w = R.merge(mockData2w, incompleteObject);

describe('Hack Stack Wrapper tests', function () {
  beforeEach(function () {
    module('hackstack.wrapper');
    module(function ($provide) {
      $provide.constant('API_BASE', 'fakehost');
    });
  });
  beforeEach(inject(function (_hackWrap_, _$timeout_, _$q_, _$httpBackend_,
    _$http_, _API_BASE_) {
    hw = _hackWrap_;
    $timeout = _$timeout_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET([_API_BASE_, endpoint].join('/'))
      .respond([incompleteObject, incompleteObject]);
    $httpBackend.whenGET(new RegExp([_API_BASE_, endpoint, '.*'].join(
        '/')))
      .respond(incompleteObject);
    API_BASE = _API_BASE_;
  }));
  beforeEach(inject(function (_hackWrap_) {
    hw = _hackWrap_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  describe('sanity checks', function () {
    it('should throw an error if created with no endpoint/data',
      function () {
        expect(function () {
          hw(); // No endpoint, no data
        }).to.throw('wrapper must be provided with an endpoint');

        expect(function () {
          hw(endpoint); // No data
        }).to.throw('wrapper must be provided with mock data');

        expect(function () {
          hw(undefined, {
            'one': 1
          }); // No endpoint
        }).to.throw('wrapper must be provided with an endpoint');
      });

    it('should throw an error if mock data is not an object', function () {
      expect(function () {
        hw(endpoint, 'test');
      }).to.throw();
      expect(function () {
        hw(endpoint, [1, 2, 3]);
      }).to.throw();
    });
  });

  describe('GET tests', function () {
    it('should return mock data in response', function () {
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      var response = wrapper.get(1);
      expect(response).to.eventually.have.property('data')
        .deep.equal(mockObject1w);
      $timeout.flush();
      $httpBackend.flush();
    });

    it('should do a deep merge, preserving all sub-object properties',
      function () {
        var originObject = {
          'level1': {
            1: 1,
            'level2': {
              1: 1,
              'data': 'lives'
            },
            'data': 'lives'
          }
        };
        var mockData = {
          'level1': {
            2: 2,
            'level2': {
              2: 2,
              'data': 'dies'
            },
            'data': 'dies'
          }
        };
        var expected = {
          'level1': {
            1: 1,
            2: 2,
            'level2': {
              1: 1,
              2: 2,
              'data': 'lives'
            },
            'data': 'lives'
          }
        };
        var wrapper = hw(endpoint, mockData);
        wrapper.disableErrors(true);
        $httpBackend.expectGET(/.*/).respond(200, originObject);
        expect(wrapper.get(1)).to.eventually.have.property('data')
          .deep.equal(expected);
        $timeout.flush();
        $httpBackend.flush();
      });

    it('should prioritize mock data if asked to', function () {
      var expected = R.merge(incompleteObject, mockData1w);
      var wrapper = hw(endpoint, mockData1w, {
        'priorityMock': true
      });
      wrapper.disableErrors(true);
      expect(wrapper.get(1)).to.eventually.have.property('data')
        .deep.equal(expected);
      expect(wrapper.getAll()).to.eventually.have.property('data')
        .deep.equal([expected, expected]);
      $timeout.flush();
      $httpBackend.flush();
    });

    it('should modify all objects if getAll if called', function () {
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      var response = wrapper.getAll();
      expect(response).to.eventually.have.property('data')
        .deep.equal([mockObject1w, mockObject1w]);
      $timeout.flush();
      $httpBackend.flush();
    });

    it(
      'should call $http.get(endpoint/id) when wrapper.get(id) is called',
      function () {
        var id = 1;
        var wrapper = hw(endpoint, mockData1w);
        wrapper.disableErrors(true);
        $httpBackend.expectGET([API_BASE, endpoint, id].join('/'));
        var response = wrapper.get(id);
        $timeout.flush();
        $httpBackend.flush();
      });

    it(
      'should call $http.get(endpoint) when wrapper.getAll() is called',
      function () {
        var wrapper = hw(endpoint, mockData1w);
        wrapper.disableErrors(true);
        $httpBackend.expectGET([API_BASE, endpoint].join('/'));
        var response = wrapper.getAll();
        $timeout.flush();
        $httpBackend.flush();
      });

    it(
      'should return {status:error, ...} when forceError(error) is set',
      function () {
        var errorCode = 404;
        var assertions = function (result) {
          expect(result.status).to.equal(errorCode);
        };
        var wrapper = hw(endpoint, mockData1w);
        wrapper.forceError(errorCode);
        var response = wrapper.get(1);
        response.then(assertions, assertions);
        $timeout.flush();
      });

    it('should have independent results when multiple objects created',
      function () {
        var wrapper1 = hw(endpoint, mockData1w);
        var wrapper2 = hw(endpoint, mockData2w);
        wrapper1.disableErrors(true);
        wrapper2.disableErrors(true);
        expect(wrapper1.get(1)).to.eventually.have.property('data')
          .deep.equal(mockObject1w);
        expect(wrapper2.get(1)).to.eventually.have.property('data')
          .deep.equal(mockObject2w);
        $timeout.flush();
        $httpBackend.flush();
      });

    it('should return a single result when calling get(id)', function () {
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      var response = wrapper.get(1);
      response.then(function (result) {
        expect(result.data).to.not.be.instanceOf(Array);
      });
      $timeout.flush();
      $httpBackend.flush();
    });

    it('should forward errors from origin', function () {
      var id = 1;
      var errorCode = 404;
      var assertions = function (result) {
        expect(result.status).to.equal(errorCode);
      };
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      $httpBackend.expectGET([API_BASE, endpoint, id].join('/'))
        .respond(errorCode, {
          'statusText': 'Not found',
          'data': 'Forced error by hackStack'
        });
      var request = wrapper.get(id);
      request.then(assertions, assertions);
      $timeout.flush();
      $httpBackend.flush();
    });
  });

  describe('CREATE tests', function () {
    it('should forward create requests', function () {
      var id = mockObject1w.id;
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      $httpBackend.expectPOST([API_BASE, endpoint].join('/'))
        .respond(200, 'ok', {
          'location': [API_BASE, endpoint, id].join('/')
        });
      wrapper.create(mockObject1w);
      $httpBackend.flush();
    });

    it('should create an id when provided a function', function () {
      var id = 1;
      var objectSansId = angular.copy(mockObject1w);
      objectSansId.id = undefined;
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      $httpBackend.expectPOST([API_BASE, endpoint].join('/'))
        .respond(200, 'ok', {
          'location': [API_BASE, endpoint, id].join('/')
        });
      wrapper.create(objectSansId, function (data) {
        data.id = id;
      });
      $timeout.flush();
      $httpBackend.flush();
    });

    it(
      'should return the object created in the response if no location header',
      function () {
        var wrapper = hw(endpoint, mockData1w);
        wrapper.disableErrors(true);
        $httpBackend.expectPOST([API_BASE, endpoint].join('/'))
          .respond(200, mockObject1w);
        var response = wrapper.create(mockObject1w);
        expect(response).to.eventually.have.property('data')
          .deep.equal(mockObject1w);
        $httpBackend.flush();
      });

    it('should request and return object if location header present',
      function () {
        var location = [API_BASE, endpoint, 1].join('/');
        var wrapper = hw(endpoint, mockData1w);
        wrapper.disableErrors(true);
        $httpBackend.expectPOST([API_BASE, endpoint].join('/'))
          .respond(200, mockObject1w, {
            'location': location
          });
        var response = wrapper.create(mockObject1w);
        expect(response).to.eventually.have.property('data')
          .deep.equal(mockObject1w);
        $httpBackend.flush();

      });
  });

  describe('Update tests', function () {
    it('should issue an update request to origin', function () {
      var id = mockObject1w.id;
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      $httpBackend.expectPOST([API_BASE, endpoint, id].join('/'))
        .respond(200, 'ok');
      wrapper.update(id, mockObject1w);
      $httpBackend.flush();
    });

    it('should return a 200 if the origin returns a 200', function () {
      var id = mockObject1w.id;
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      $httpBackend.expectPOST([API_BASE, endpoint, id].join('/'))
        .respond(200, 'ok');
      var response = wrapper.update(id, mockObject1w);
      expect(response).to.eventually.have.property('status').equal(
        200);
      $httpBackend.flush();
    });

    it('should forward errors from origin', function () {
      var id = mockObject1w.id;
      var errorCode = 403;
      var assertions = function (result) {
        expect(result.status).to.equal(errorCode);
      };
      var wrapper = hw(endpoint, mockData1w);
      wrapper.disableErrors(true);
      $httpBackend.expectPOST([API_BASE, endpoint, id].join('/'))
        .respond(errorCode, 'Forbidden');
      var response = wrapper.update(id, mockObject1w);
      // We want to assert on either success or failure
      response.then(assertions, assertions);
      $httpBackend.flush();
    });
  });
});
