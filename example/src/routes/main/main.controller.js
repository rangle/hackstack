
angular.module('hackstack demo app').controller('main',
function (hackstack, birds, $log) {
  var vm = this;

  function success(result) {
    vm.loadingMessage = null;
    vm.birds = result.data;
  }

  console.log('main running');

  function error(err) {
    $log.info(err);
    vm.loadingMessage = null;
    vm.errorMessage = err.data || 'Couldn\'t contact server';
  }

  vm.loadingMessage = 'Loading...';
  birds.getAllBirds().then(success, error)
});
