/* jshint ignore:start */
(function () {
	'use strict';

	angular
			.module('app')
			.directive('tmplHome', tmplHomeDirective);

	// ----- directiveFunction -----
	tmplHomeDirective.$inject = [];

	/* @ngInject */
	function tmplHomeDirective() {

		var directive = {
			restrict: 'E',
			scope: {
//				colunas: '=model'
			},
			templateUrl: 'app/directives/tmplHome.html',
			bindToController: true,
			controller: ['HomeService', function (HomeService) {
					var vm = this;
					vm.home = HomeService;
					vm.clickEnterGame = clickEnterGame;
					vm.clickCreateGame = clickCreateGame;
					vm.map_id = null;
					
					vm.game = {};
					vm.hero = {};

					function clickCreateGame() {
						if (angular.isDefined(vm.hero.name) && vm.hero.name === "") {
							vm.home.msg_error("Preencha seu Nome");
						}
						if (angular.isDefined(vm.hero.alias) && vm.hero.alias === "") {
							vm.home.msg_error("Preencha o nome do seu personagem");
						}
						vm.home.WSocket.send(angular.toJson({
							"action": "CREATE-GAME",
							"map_id": vm.map_id,
							"hero": vm.hero
						}));
					}
					
					function clickEnterGame(game) {
						if (angular.isDefined(vm.hero.name) && vm.hero.name === "") {
							vm.home.msg_error("Preencha seu Nome");
						}
						if (angular.isDefined(vm.hero.alias) && vm.hero.alias === "") {
							vm.home.msg_error("Preencha o nome do seu personagem");
						}
						vm.home.WSocket.send(angular.toJson({
							"action": "ENTER",
							"game_id": game,
							"hero": vm.hero
						}));
					}
				}],
			controllerAs: 'vm',
		};

		return directive;
	}

})();
