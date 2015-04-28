'use strict';

describe('REST factory service', function () {
  var restFactory;
  var service;
  var $httpBackend;
  var $rootScope;
  var endpoint;

  var schemaName = 'dwelling';

  beforeEach(function () {
    module('showcase.core.constants');
    module(function ($provide) {
      $provide.constant('API_BASE', '');
    });
  });

  beforeEach(module(
    'showcase.core.restFactory.service'));

  beforeEach(module(function ($provide) {
    $provide.service('schemaFetchValidator', function ($q) {
      return function (x, y) {
        if (!x || !y) {
          return $q.reject();
        } else {
          return $q.when();
        }
      };
    });
  }));

  beforeEach(function () {
    inject(function ($injector) {
      restFactory = $injector.get('restFactory');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      var API_BASE = $injector.get('API_BASE');

      endpoint = [API_BASE, schemaName].join('/');
      service = restFactory(schemaName);
    });
  });


  /*
   * Get all
   */
  it('should hit get-all endpoint', function (done) {
    $httpBackend.expectGET('/dwelling').respond('hello world');

    var p = service.getAll();
    expect(p).to.eventually.have.property('data')
      .equal('hello world').and.notify(done);

    $httpBackend.flush();
  });

  /*
   * Get by ID
   */
  it('should hit get by ID endpoint', function (done) {
    var id = 1;
    $httpBackend.expectGET('/dwelling/1').respond(
      'hello world');

    var p = service.get(id);
    expect(p).to.eventually.have.property('data')
      .equal('hello world').and.notify(done);

    $httpBackend.flush();
  });

  it('should throw error when no ID present', function () {
    expect(service.get()).to.be.rejected;
  });

  /*
   * Create
   */
  it('should hit creation endpoint', function (done) {
    $httpBackend.expectPOST('/dwelling')
      .respond(function () {
        return [200, '', {
          location: 'http://showcase.us/test/123456'
        }];
      });

    var p = service.create({});
    expect(p).to.eventually.have.property('id')
      .equal('123456').and.notify(done);

    $httpBackend.flush();
  });

  /*
   * Update
   */
  it('should hit update endpoint', function (done) {
    var id = 1;
    $httpBackend.expectPUT('/dwelling/1').respond(
      'hello world');

    var p = service.update(id, {});
    expect(p).to.eventually.have.property('data')
      .equal('hello world').and.notify(done);

    $httpBackend.flush();
  });

  it('should throw error without id', function (done) {
    expect(service.update(undefined, 1)).to.be.rejected.and.notify(
      done);
    $rootScope.$apply();
  });

  /*
   * Query
   */

  it('should do get query requests', function (done) {
    var data = {
      param: 'value'
    };
    $httpBackend.expectGET('/dwelling?param=value').respond(200, 'resp');
    var result = service.query(data);
    expect(result).to.eventually.have.property('data').equal('resp').and
      .notify(done);
    $httpBackend.flush();
  });

  it('should do post query requests', function (done) {
    var data = {
      param: 'value'
    };
    $httpBackend.expectPOST('/dwelling', data).respond(200, 'resp');
    var result = service.query(data, 'POST');
    expect(result).to.eventually.have.property('data').equal('resp').and
      .notify(done);
    $httpBackend.flush();
  });

  it('should throw if you initialize the service incorrectly', function () {
    expect(restFactory).to.throw(
      'Must specify base endpoint and schema name');
  });
});
