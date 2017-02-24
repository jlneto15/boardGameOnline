(function() {
	'use strict';

	angular.module('app').controller('HomeController', HomeController);
	
	HomeController.$inject = ['$scope', 'HomeService'];
	function HomeController($scope, HomeService) {
		var vm = this;
		vm.service = HomeService;

		init();
		function init() {
			console.log(HomeService.socket);
		}
	}

})();
