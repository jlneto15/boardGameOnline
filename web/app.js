(function () {
	'use strict';
	angular.module('app', ['ngMaterial', 'jsonFormatter']);
	angular.module('app').config(configFunction);

	configFunction.$inject = [];
	function configFunction() {
	}

	angular.module('app').controller('HomeController', ControllerFunction);
	ControllerFunction.$inject = ['$scope', "$http", '$timeout', '$q'];

	function ControllerFunction($scope, $http, $timeout, $q) {

		$scope.dice = 0;
		$scope.diceShow = false;

		$scope.atual = null;
		$scope.aHeroes = [];
		$scope.aZombies = [];
		$scope.aTurn = ["zombies"];
		$scope.heroes = {};
		$scope.spawhero = "1_1";
		$scope.spawzombie = [];

		init();
		function init() {
			$http.get("../maps/map1.json").then(function (response) {
				$scope.mapa = response.data;
				$scope.mapa.table = [];
				angular.forEach($scope.mapa.zona, function (v, k) {
					var tab = k.split("_");
					if (angular.isUndefined($scope.mapa.table[tab[0]])) {
						$scope.mapa.table[tab[0]] = [];
					}
					$scope.mapa.table[tab[0]].push(k);

					if ($scope.spawhero && v.type === "spawhero") {
						$scope.spawhero = k;
					}
					if ($scope.spawzombie && v.type === "spawzombies") {
						$scope.spawzombie.push(k);
					}
				});
			}, function (response) {
				alert(response);
			});
		}

		$scope.createHero = function (hero) {
			var id = "hero" + ($scope.aHeroes.length + 1);
			hero.id = id;
			hero.color = "red";
			hero.actions = 1;
			hero.pos = $scope.spawhero;

			$scope.atual = id;
			$scope.heroes[id] = hero;

			if (angular.isUndefined($scope.mapa.zona[hero.pos].items.heroes)) {
				$scope.mapa.zona[hero.pos].items.heroes = [];
			}
			$scope.mapa.zona[hero.pos].items.heroes.push(id);
			$scope.aHeroes.push(hero);
			$scope.aTurn.push(id);
		};

		$scope.btnAction = function (pos) {

			if (["search"].indexOf(pos) !== -1) {
				console.log("SEARCH");
				return;
			}

			var actionREAL = $scope.mapa.zona[$scope.heroes[$scope.atual].pos].pos[pos];
			var target;
			var targetPos = pos;

			var action = actionREAL;
			var split = actionREAL.split("-");
			if (split.length > 1) {
				action = $scope.mapa.zona[split[0]].pos[split[1]];
				target = split[0];
				targetPos = split[1];
			}

			if (["open", "dooropen"].indexOf(action) !== -1) {
				$scope.mapa.zona[$scope.heroes[$scope.atual].pos].items.heroes.splice($scope.mapa.zona[$scope.heroes[$scope.atual].pos].items.heroes.indexOf($scope.atual));

				if (angular.isUndefined(target)) {
					var targerNew = $scope.heroes[$scope.atual].pos.split("_");
					switch (pos) {
						case "top":
							target = (parseInt(targerNew[0]) - 1) + "_" + targerNew[1];
							break;
						case "bottom":
							target = (parseInt(targerNew[0]) + 1) + "_" + targerNew[1];
							break;
						case "left":
							target = targerNew[0] + "_" + (parseInt(targerNew[1]) - 1);
							break;
						case "right":
							target = targerNew[0] + "_" + (parseInt(targerNew[1]) + 1);
							break;
					}
				}

				if (angular.isUndefined($scope.mapa.zona[target].items)) {
					$scope.mapa.zona[target].items = {};
				}
				if (angular.isUndefined($scope.mapa.zona[target].items.heroes)) {
					$scope.mapa.zona[target].items.heroes = [];
				}

				$scope.heroes[$scope.atual].pos = target;
				$scope.mapa.zona[target].items.heroes.push($scope.atual);
			}

			if (["doorclosed"].indexOf(action) !== -1) {
				if (angular.isUndefined(target)) {
					target = $scope.heroes[$scope.atual].pos;
				}
				$scope.mapa.zona[target].pos[targetPos] = "dooropen";
			}

			$scope.newTurn();
		};

		$scope.newTurn = function () {
			if ($scope.atual !== 'zombies') {
				if ($scope.heroes[$scope.atual].actions < 3) {
					$scope.heroes[$scope.atual].actions += 1;
				} else {
					$scope.heroes[$scope.atual].actions = 0;
					var atual = $scope.atual;
					var atualAchou = false;
					angular.forEach($scope.aTurn, function (v, k) {
						if (atualAchou) {
							$scope.atual = v;
						}
						if (v === $scope.atual) {
							atualAchou = true;
						}
					});

					if ($scope.atual === atual) {
						$scope.atual = $scope.aTurn[0];
						$scope.turnZombie();
					}
				}
			} else {
				$scope.atual = $scope.aTurn[1];
			}
		};

		$scope.rolarDados = function () {
			var deferred = $q.defer();
			$scope.diceShow = true;
			var qtd = 1;
			var rol = function () {
				if (qtd > 20) {
					deferred.resolve(1);//getRandomSpan());
					$scope.diceShow = false;
//					return getRandomSpan();
				}
				$timeout(function () {
					qtd++;
					$scope.dice = getRandomSpan();
					rol();
				}, 1);
			};

			rol();

			var getRandomSpan = function () {
				return Math.floor((Math.random() * 6) + 1);
			};

			return deferred.promise;
		};

		$scope.turnZombie = function () {

			var andaZombie = function (origem, direcao, zombie, v) {
//				console.log("ANDA KRAI", origem, direcao, zombie, v);
				var action = $scope.getAction(v.pos[direcao]);
				if (["open", "dooropen"].indexOf(action) === -1) {
//					console.log("NÃO ANDOU", origem, direcao, zombie, v);
					return false;
				}
				$scope.mapa.zona[origem].items.zombies.splice($scope.mapa.zona[origem].items.zombies.indexOf(zombie), 1);

				var target;
				var origem = origem.split("_");
				switch (direcao) {
					case "top":
						target = (parseInt(origem[0]) - 1) + "_" + origem[1];
						break;
					case "bottom":
						target = (parseInt(origem[0]) + 1) + "_" + origem[1];
						break;
					case "left":
						target = origem[0] + "_" + (parseInt(origem[1]) - 1);
						break;
					case "right":
						target = origem[0] + "_" + (parseInt(origem[1]) + 1);
						break;
				}

				if (angular.isUndefined($scope.mapa.zona[target].items)) {
					$scope.mapa.zona[target].items = {};
				}
				if (angular.isUndefined($scope.mapa.zona[target].items.zombies)) {
					$scope.mapa.zona[target].items.zombies = [];
				}

//				$scope.zombies[zombie].pos = target;
				$scope.mapa.zona[target].items.zombies.push(zombie);
				console.log("Z ANDOU", origem, direcao, target);
				return true;
			};

			angular.forEach($scope.mapa.zona, function (moveZombie, k) {
				if (angular.isDefined(moveZombie.items.zombies) && moveZombie.items.zombies.length) {
					for (var i = 0; i < moveZombie.items.zombies.length; i++) {
						var direcaoInicial = Math.floor((Math.random() * 4));
						switch (direcaoInicial) {
							case 0:
								if (!andaZombie(k, 'top', moveZombie.items.zombies[i], moveZombie)) {
									if (!andaZombie(k, 'right', moveZombie.items.zombies[i], moveZombie)) {
										if (!andaZombie(k, 'bottom', moveZombie.items.zombies[i], moveZombie)) {
											if (!andaZombie(k, 'left', moveZombie.items.zombies[i], moveZombie)) {
											}
										}
									}
								}
								break;
							case 1:
								if (!andaZombie(k, 'right', moveZombie.items.zombies[i], moveZombie)) {
									if (!andaZombie(k, 'bottom', moveZombie.items.zombies[i], moveZombie)) {
										if (!andaZombie(k, 'left', moveZombie.items.zombies[i], moveZombie)) {
											if (!andaZombie(k, 'top', moveZombie.items.zombies[i], moveZombie)) {
											}
										}
									}
								}
								break;
							case 2:
								if (!andaZombie(k, 'bottom', moveZombie.items.zombies[i], moveZombie)) {
									if (!andaZombie(k, 'left', moveZombie.items.zombies[i], moveZombie)) {
										if (!andaZombie(k, 'top', moveZombie.items.zombies[i], moveZombie)) {
											if (!andaZombie(k, 'right', moveZombie.items.zombies[i], moveZombie)) {
											}
										}
									}
								}
								break;
							case 3:
								if (!andaZombie(k, 'left', moveZombie.items.zombies[i], moveZombie)) {
									if (!andaZombie(k, 'top', moveZombie.items.zombies[i], moveZombie)) {
										if (!andaZombie(k, 'right', moveZombie.items.zombies[i], moveZombie)) {
											if (!andaZombie(k, 'bottom', moveZombie.items.zombies[i], moveZombie)) {
											}
										}
									}
								}
								break;
						}
					}
				}
			});

			angular.forEach($scope.spawzombie, function (v, k) {
				$scope.mapa.zona[v].showDice = false;

				$scope.mapa.zona[v].showDice = true;
				$scope.rolarDados().then(function (dice) {
					$scope.mapa.zona[v].showDice = false;
					if (angular.isUndefined($scope.mapa.zona[v].items.zombies)) {
						$scope.mapa.zona[v].items.zombies = [];
					}

					console.log("Dice: " + dice);

					for (var i = 0; i < dice; i++) {
						if ($scope.mapa.zona[v].items.zombies.length < 20) {
							var zombie = {
								name: "Z" + $scope.mapa.zona[v].items.zombies.length,
								hit: 1
							};

							$scope.mapa.zona[v].items.zombies.push(zombie);
							$scope.aZombies.push(zombie);
						}
					}
					$scope.newTurn();
				});
			});
		};

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
			var icon = $scope.btnMoveAction(pos);
			if (icon === 'cancel') {
				return false;
			}
			return true;
		};
		$scope.btnMoveAction = function (pos) {
			if (angular.isUndefined($scope.mapa) || Object.keys($scope.heroes).length <= 0) {
				return
			}

			var action = $scope.mapa.zona[$scope.heroes[$scope.atual].pos].pos[pos];

			var split = action.split("-");
			if (split.length > 1) {
				action = $scope.mapa.zona[split[0]].pos[split[1]];
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

		$scope.getAction = function (action) {
			var split = action.split("-");
			if (split.length > 1) {
				action = $scope.mapa.zona[split[0]].pos[split[1]];
			}
			return action;
		};

	}
})();