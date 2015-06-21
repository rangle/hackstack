
angular.module('hackstack demo app')

.service('birds', function (api) {
  this.getAllBirds = function getAllBirds() {
    return api.getAll('birds');
  };

  this.getBird = function getBird(id) {
    return api.get('birds', id);
  };
});
