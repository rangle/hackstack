'use strict';

var $timeout;
var hsu;
var $window;
var mockData = {
  id: 1,
  title: 'fire!'
};

describe('HackStack common tests', function () {
  beforeEach(function () {
    module('hackstack.common');
  });
  beforeEach(inject(function (_hackStackUtils_, _$timeout_, _$window_) {
    hsu = _hackStackUtils_;
    $timeout = _$timeout_;
    $window = _$window_;
  }));

  describe('functional tests', function () {
    it('should register an error trigger function', function () {
      hsu.addErrorTrigger(function (data) {
        return true;
      }, 404);
      expect(hsu._getErrorTriggers().length).to.equal(1);
    });

    it(
      'should remove an error trigger when the removal method is called',
      function () {
        var removeTrigger = hsu.addErrorTrigger(function (data) {
          return true;
        }, 404);
        expect(hsu._getErrorTriggers().length).to.equal(1);
        removeTrigger();
        expect(hsu._getErrorTriggers().length).to.equal(0);
      });

    it('should remove an error from the middle of the trigger list',
      function () {
        var mockFn = function (data) {
          return true;
        };
        var rmTrg1 = hsu.addErrorTrigger(mockFn, 404);
        var rmTrg2 = hsu.addErrorTrigger(mockFn, 404);
        var rmTrg3 = hsu.addErrorTrigger(mockFn, 404);
        expect(hsu._getErrorTriggers().length).to.equal(3);
        rmTrg2();
        expect(hsu._getErrorTriggers().length).to.equal(2);

        expect(hsu._getErrorTriggers()[0].id).to.equal(0);
        expect(hsu._getErrorTriggers()[1].id).to.equal(2);
      });

    it('should produce an error when the function returns true',
      function () {
        hsu.disableRandomErrors(true);
        hsu.addErrorTrigger(function (data) {
          if (data.title === 'fire!') {
            return true;
          }
          return false;
        }, 404, 'get');
        expect(hsu.produceError(mockData, 'get'))
          .to.have.property('status')
          .and.equal(404);
      });

    it(
      'should not produce an error if called for different method types',
      function () {
        hsu.disableRandomErrors(true);
        hsu.addErrorTrigger(function (data) {
          if (data.title === 'fire!') {
            return true;
          }
          return false;
        }, 404, 'get');
        expect(hsu.produceError(mockData, 'post'))
          .to.equal(null);
      });

    it(
      'should override the disable error setting if you supply a trigger',
      function () {
        hsu.disableRandomErrors(true);
        hsu.addErrorTrigger(function (data) {
          if (data.title === 'fire!') {
            return true;
          }
          return false;
        }, 404, 'get');
        expect(hsu.produceError(mockData, 'get'))
          .to.have.property('status')
          .and.equal(404);
      });

    it('should force an error if random errors are disabled', function () {
      hsu.disableRandomErrors(true);
      hsu.forceError(405);
      var error = hsu.produceError();
      expect(error).to.have.property('status').and.equal(405);
    });
  });

  describe('parameter tests', function () {
    it('should throw an error when you do not have a function as' +
      ' the first parameter',
      function () {
        expect(function () {
          hsu.addErrorTrigger('fail');
        }).to.throw('generateError function requires a function' +
          ' as its first parameter');
      });

    it('should require an error code parameter', function () {
      expect(function () {
        hsu.addErrorTrigger(function () {
          return true;
        });
      }).to.throw(); // I don't compare text because this is a long message.
    });

    it('should require an error code in the known list', function () {
      expect(function () {
        hsu.addErrorTrigger(function () {
          return true;
        }, 5);
      }).to.throw(); // I don't compare text because this is a long message.
    });
  });

  it('should have a valid method (get, post, or all currently)', function () {
    expect(function () {
      hsu.addErrorTrigger(function () {
        return true;
      }, 404, 'bad');
    }).to.throw(); // I don't compare text because this is a long message.
  });

});
