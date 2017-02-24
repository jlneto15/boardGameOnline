/* jshint ignore:start */
(function () {
	'use strict';

	angular
			.module('app')
			.directive('tmplAction', tmplActionDirective);

	// ----- directiveFunction -----
	tmplActionDirective.$inject = [];

	/* @ngInject */
	function tmplActionDirective() {

		var directive = {
			restrict: 'E',
			scope: {
				colunas: '=model'
			},
			templateUrl: 'app/directives/tmplAction.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', 'HomeService', '$cookies', function ($scope, HomeService, $cookies) {
					var vm = this;
					vm.home = HomeService;

					init();
					function init() {
						vm.me = vm.home.getMe();
						vm.game = vm.home.game.game;
						vm.map = vm.game.map;
					}

					
					$scope.btnMoveTooltip = function (pos) {
						var icon = $scope.btnMoveAction(pos);
						switch (icon) {
							case "lock_open":
								return "Abrir porta";
							case "arrow_upward":
								return "Mover para cima";
							case "arrow_downward":
								return "Mover para baixo";
							case "arrow_back":
								return "Mover para esquerda";
							case "arrow_forward":
								return "Mover para direita";
							case "cancel":
								return "Nenhuma ação";
						}
					};
					$scope.btnMoveEnabled = function (pos) {
						var user = angular.fromJson($cookies.get('user'));
						if (vm.home.game.game.current.id !== user.id) {
							return false;
						}
							
						var icon = $scope.btnMoveAction(pos);
						if (icon === 'cancel') {
							return false;
						}
						return true;
					};
					$scope.btnMoveAction = function (pos) {
						
						var action = vm.map.zone[vm.game.current.pos].pos[pos];

						var split = action.split("-");
						if (split.length > 1) {
							action = vm.game.map.zone[split[0]].pos[split[1]];
						}

						if (["spawhero", "blocked"].indexOf(action) !== -1) {
							return "cancel";
						}

						var iconDefault = {
							doorclosed: "lock_open",
							exit: "grade"
						};

						var retorno = {
							"top": {
								"open": "arrow_upward",
								"dooropen": "arrow_upward",
							},
							"bottom": {
								"open": "arrow_downward",
								"dooropen": "arrow_downward",
							},
							"left": {
								"open": "arrow_back",
								"dooropen": "arrow_back",
							},
							"right": {
								"open": "arrow_forward",
								"dooropen": "arrow_forward",
							}
						};
						return retorno[pos][action] || iconDefault[action] || "add";
					};
				}],
		};

		return directive;
	}

})();
