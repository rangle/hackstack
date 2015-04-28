'use strict';

var $timeout;
var hs;
var $q;
var $http;
var $httpBackend;

describe('Hack Stack tests', function () {
  beforeEach(function () {
    module('showcase.core.hackstack.service');
  });
  beforeEach(inject(function (_hackStack_, _$timeout_, _$q_, _$httpBackend_,
    _$http_) {
    hs = _hackStack_;
    $timeout = _$timeout_;
    $q = _$q_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('mock.json').respond(
      [{
        id: 1,
        title: 'My Mock Task',
        description: 'The description'
      }]
    );
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Should throw an error if created with no data', function () {
    expect(function () {
      hs();
    }).to.throw();
  });

  it('should throw an error when created with an object', function () {
    expect(function () {
      hs({
        id: 1
      });
    }).to.throw();
  });

  it('should return an object with a getAll function when ' +
    'created with an array',
    function () {
      expect(hs([{
        id: 1
      }]).getAll).to.be.an.instanceOf(Function);
    });

  it('should return an object with a getAll function when ' +
    'created with a json path',
    function () {
      expect(hs('mock.json').getAll).to.be.an.instanceOf(Function);
      $httpBackend.flush();
    });

  it('should return the mock data it is created with', function () {

    var expectedResults = {
      status: 200,
      statusText: 'OK',
      data: [{
        id: 1,
        title: 'mock',
        description: 'description'
      }]
    };
    var hack = hs(expectedResults.data);
    hack.disableErrors(true);

    expect(hack.getAll())
      .to.eventually.be.deep.equal(expectedResults);
    $timeout.flush();
  });

  it('should call $http.get when you pass a json filename', function () {
    var expectedResults = {
      status: 200,
      statusText: 'OK',
      data: [{
        id: 1,
        title: 'My Mock Task',
        description: 'The description'
      }]
    };
    var hack = hs('mock.json');
    hack.disableErrors(true);
    $httpBackend.flush();
    var result = hack.getAll();
    result.then(function (response) {
      expect(response.status).to.equal(200);
      expect(response.data).to.deep.equal(expectedResults.data);
    });
    $timeout.flush();
  });

  it('Should return an error when forceErrors is set', function () {
    var expectedResults = {
      status: 404,
      statusText: 'Not found',
      data: 'Forced error by hackStack'
    };
    var hack = hs('mock.json');
    hack.forceError(404);
    $httpBackend.flush();
    var result = hack.getAll();
    result.then(function (response) {
      expect(response.status).to.equal(404);
      expect(response.data).to.equal(expectedResults.data);
    });
    $timeout.flush();
  });

  it('Should have independent results if multiple objects created', function () {
    var expectedData = [{
      id: 1,
      title: 'My Mock Task',
      description: 'The description'
    }];
    var secondExpectedData = [
      {
        id: 7,
        title: 'my own task',
        description: 'this is the test'
      }
    ];

    var hack = hs([{
      id: 1,
      title: 'My Mock Task',
      description: 'The description'
    }]);
    var secondHack = hs([
      {
        id: 7,
        title: 'my own task',
        description: 'this is the test'
      }
    ]);

    var result = hack.getAll();
    var secondResult = secondHack.getAll();
    $timeout.flush();

    expect(result).to.eventually
      .have.property('data')
      .and.deep.equal(expectedData);

    expect(secondResult).to.eventually
      .have.property('data')
      .and.deep.equal(secondExpectedData);
  });
});
