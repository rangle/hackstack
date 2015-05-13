'use strict';

var $timeout;
var fh;
var $q;
var $httpBackend;
// karma is stupid unless we're using it wrong. It uses the name namespace
// across files. Thus the 'fh' suffix.
var mockData1fh = {
  'title': 'mock title 1',
  'id': 1
};
var mockData2fh = {
  'title': 'mock title 2',
  'id': 2
};
var endpoint = 'endpoint';
var incompleteObject = {
  'id': 0,
  'description': 'mock description'
};
// Origin takes precedence
var mockObject1fh = R.merge(mockData1fh, incompleteObject);
var mockObject2fh = R.merge(mockData2fh, incompleteObject);

describe('Hack Stack FeedHenry tests', function () {
  beforeEach(function () {
    module('hackstack.feedhenry');
  });
  beforeEach(inject(function (_mockFH_, _$timeout_, _$q_) {
    fh = _mockFH_;
    $timeout = _$timeout_;
    $q = _$q_;
  }));

  beforeEach(inject(function (_mockFH_) {
    fh = _mockFH_;
  }));

  describe('GET tests', function () {
    it('should return mock data in response', function () {
      var fhmock = fh([mockObject1fh]);
      var response = fhmock.cloud({
        'path': 'host/task/0'
      }, function (err, res) {
        expect(res.data.body).to.deep.equal(mockObject1fh);
      });
      $timeout.flush();
    });

    it('should return header(status=200) and data(status=Ok)', function () {
      var fhmock = fh([mockObject1fh]);
      var response = fhmock.cloud({
        'path': 'host/task/0'
      }, function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.data.status).to.equal('Ok');
      });
      $timeout.flush();
    });
  });
});
