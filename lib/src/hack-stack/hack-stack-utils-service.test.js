'use strict';

var hsu;
var $timeout;
var $window;

describe('Hack Stack Util tests', function () {
  beforeEach(function () {
    module('hackstack.common');
  });
  beforeEach(inject(function (_hackStackUtils_, _$timeout_, _$window_) {
    hsu = _hackStackUtils_;
    $timeout = _$timeout_;
    $window = _$window_;
  }));

  it('should force an error if random errors are disabled', function () {
    hsu.disableRandomErrors(true);
    hsu.forceError(405);
    var error = hsu.produceError();
    expect(error).to.have.property('status').and.equal(405);
  });
});
