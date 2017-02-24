(function () {
	'use strict';
	angular.module('app', ['ngMaterial', 'jsonFormatter', 'ngWebSocket']);
	angular.module('app').config(configFunction);

//	angular.module('app').factory('WSocket', function ($websocket) {
//		// Open a WebSocket connection
//		var dataStream = $websocket('ws://127.0.0.1:4444');
//
//		var retorno;
//
//		var collection = [];
//
//		dataStream.onMessage(function (message) {
////			collection.push(JSON.parse(message.data));
////			console.log($scope);
//			collection.push(message.data);
//		});
//
//		var methods = {
//			collection: collection,
//			retorno: retorno,
//			createUser: function(){},
//			get: function (data) {
//				dataStream.send(JSON.stringify({action: 'get'}));
//			}
//		};
//
//		return methods;
//	});

	configFunction.$inject = [];
	function configFunction() {
	}

	angular.module('app').controller('HomeController', ControllerFunction);
	ControllerFunction.$inject = ['$scope', "$http", '$timeout', '$q', '$websocket'];

	function ControllerFunction($scope, $http, $timeout, $q, $websocket) {
//		$scope.WSocket = WSocket;
		$scope.WSocket = $websocket('ws://127.0.0.1:4444');

		$scope.collection = [];
		$scope.dice = 0;
		$scope.diceShow = false;

//		$scope.$watch("collection", function(newValue, oldValue){
//			console.log("WATCH ", oldValue, newValue);
//		});

		$scope.meHero = null;

		$scope.current = null;
		$scope.aHeroes = [];
		$scope.aTurn = ["enemies"];
		$scope.heroes = {};
		$scope.spawhero = "1_1";
		$scope.spawenemy = [];

//		$scope.WSocket.onOpen(function(){
//			
//		});

		$scope.WSocket.onMessage(function (message) {
			console.log("MENSAGEM SOCKET RECEBIDA", message.data);
			var json = angular.fromJson(message.data);
			console.log("MENSAGEM SOCKET", json);
			
			switch (json.action) {
				case "updateMyMap":
					$scope.myMap = json.myMap;
					$scope.current = json.current;

					break;
					
				case "updateMyHeroes":
					$scope.heroes = json.heroes;
					$scope.aHeroes = json.aHeroes;
					$scope.aTurn = json.aTurn;
					break;
					
				default:
					break;
			}
//			$scope.collection.push(message.data);
		});

		init();
		function init() {
//			$scope.WSocket.send(angular.toJson({}));
			$scope.WSocket.send(angular.toJson({
				action:"NEW"
			}));
			
			$http.get("../maps/map1.json").then(function (response) {
				$scope.myMap = response.data;
				$scope.myMap.table = [];
				angular.forEach($scope.myMap.zone, function (v, k) {
					var tab = k.split("_");
					if (angular.isUndefined($scope.myMap.table[tab[0]])) {
						$scope.myMap.table[tab[0]] = [];
					}
					$scope.myMap.table[tab[0]].push(k);

					if ($scope.spawhero && v.type === "spawhero") {
						$scope.spawhero = k;
					}
					if ($scope.spawenemy && v.type === "spawenemies") {
						$scope.spawenemy.push(k);
					}
				});
			}, function (response) {
				alert(response);
			});
		}

		$scope.createHero = function (hero) {
			var id = "hero" + Math.floor((1 + Math.random()) * 0x10000).toString(16);// ($scope.aHeroes.length + 1);
			hero.id = id;
			hero.color = "red";
			hero.actions = 1;
			hero.hit = 0;
			hero.pos = $scope.spawhero;

			$scope.current = id;
			$scope.heroes[id] = hero;

			$scope.meHero = id;

			if (angular.isUndefined($scope.myMap.zone[hero.pos].items.heroes)) {
				$scope.myMap.zone[hero.pos].items.heroes = [];
			}
			$scope.myMap.zone[hero.pos].items.heroes.push(id);
			$scope.aHeroes.push(hero);
			$scope.aTurn.push(id);
			
			$scope.WSocket.send(angular.toJson({
				action: "updateMyHeroes",
				heroes: $scope.heroes,
				aHeroes: $scope.aHeroes,
				aTurn: $scope.aTurn
			}));
		};

		$scope.btnAction = function (pos) {

			if (["search"].indexOf(pos) !== -1) {
				console.log("SEARCH");
				return;
			}

			var actionREAL = $scope.myMap.zone[$scope.heroes[$scope.current].pos].pos[pos];
			var target;
			var targetPos = pos;

			var action = actionREAL;
			var split = actionREAL.split("-");
			if (split.length > 1) {
				action = $scope.myMap.zone[split[0]].pos[split[1]];
				target = split[0];
				targetPos = split[1];
			}

			if (["open", "dooropen"].indexOf(action) !== -1) {
				$scope.myMap.zone[$scope.heroes[$scope.current].pos].items.heroes.splice($scope.myMap.zone[$scope.heroes[$scope.current].pos].items.heroes.indexOf($scope.current));

				if (angular.isUndefined(target)) {
					var targerNew = $scope.heroes[$scope.current].pos.split("_");
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

				if (angular.isUndefined($scope.myMap.zone[target].items)) {
					$scope.myMap.zone[target].items = {};
				}
				if (angular.isUndefined($scope.myMap.zone[target].items.heroes)) {
					$scope.myMap.zone[target].items.heroes = [];
				}

				$scope.heroes[$scope.current].pos = target;
				$scope.myMap.zone[target].items.heroes.push($scope.current);
			}

			if (["doorclosed"].indexOf(action) !== -1) {
				if (angular.isUndefined(target)) {
					target = $scope.heroes[$scope.current].pos;
				}
				$scope.myMap.zone[target].pos[targetPos] = "dooropen";
			}

			$scope.newLogGame("Heroi andou para a " + targetPos);

			$scope.newTurn();
		};

		$scope.btnAttack = function () {
			if ($scope.myMap.zone[$scope.heroes[$scope.current].pos].items.enemies.length <= 0) {
				return false;
			}

			var enemyIdx = 0;
			var enemy = $scope.myMap.zone[$scope.heroes[$scope.current].pos].items.enemies[enemyIdx];
			$scope.rolarDados().then(function (dice) {
				console.log("Dice: " + dice);
				if (dice >= enemy.shield) {
					$scope.myMap.zone[$scope.heroes[$scope.current].pos].items.enemies.splice(enemyIdx, 1);
				}

				$scope.newTurn();
			});

		};

		$scope.newTurn = function () {
			if ($scope.current !== 'enemies') {
				if ($scope.heroes[$scope.current].actions < 3) {
					$scope.heroes[$scope.current].actions += 1;
				} else {
					$scope.heroes[$scope.current].actions = 0;
					var current = $scope.current;
					var currentAchou = false;
					angular.forEach($scope.aTurn, function (v, k) {
						if (currentAchou) {
							$scope.current = v;
						}
						if (v === $scope.current) {
							currentAchou = true;
						}
					});

					if ($scope.current === current) {
						$scope.current = $scope.aTurn[0];
						$scope.turnEnemy();
					}
				}
			} else {
				$scope.current = $scope.aTurn[1];
			}
			
			$scope.WSocket.send(angular.toJson({
				action: "updateMyMap",
				myMap: $scope.myMap,
				current: $scope.current
			}));			
		};

		$scope.rolarDados = function () {
			var deferred = $q.defer();
			$scope.diceShow = true;
			var qtd = 1;
			var rol = function () {
				if (qtd > 20) {
					deferred.resolve(getRandomSpan());
					$scope.diceShow = false;
					return;
				}
				$timeout(function () {
					qtd++;
					$scope.dice = getRandomSpan();
					rol();
				}, 100);
			};

			rol();

			var getRandomSpan = function () {
				return Math.floor((Math.random() * 6) + 1);
			};

			return deferred.promise;
		};

		$scope.turnEnemy = function () {

			var moveEnemy = function (myOrigin, direction, enemy, v) {
				var action = $scope.getAction(v.pos[direction]);
				if (["open", "dooropen"].indexOf(action) === -1) {
					return false;
				}

				var target;
				var origin = myOrigin.split("_");
				switch (direction) {
					case "top":
						target = (parseInt(origin[0]) - 1) + "_" + origin[1];
						break;
					case "bottom":
						target = (parseInt(origin[0]) + 1) + "_" + origin[1];
						break;
					case "left":
						target = origin[0] + "_" + (parseInt(origin[1]) - 1);
						break;
					case "right":
						target = origin[0] + "_" + (parseInt(origin[1]) + 1);
						break;
				}

				console.log("ENEMY: ", origin, direction, target, enemy.moveLast);
				if (target === enemy.moveLast) {
					return false;
				}

				enemy.moveLast = myOrigin;

				$scope.myMap.zone[myOrigin].items.enemies.splice($scope.myMap.zone[myOrigin].items.enemies.indexOf(enemy), 1);
				if (angular.isUndefined($scope.myMap.zone[target].items)) {
					$scope.myMap.zone[target].items = {};
				}
				if (angular.isUndefined($scope.myMap.zone[target].items.enemies)) {
					$scope.myMap.zone[target].items.enemies = [];
				}

//				$scope.enemies[enemy].pos = target;
				$scope.myMap.zone[target].items.enemies.push(enemy);
				console.log("ENEMY ANDOU", myOrigin, direction, target);
				return true;
			};

			angular.forEach($scope.myMap.zone, function (zone, k) {
				if (angular.isDefined(zone.items.enemies) && zone.items.enemies.length) {
					for (var i = 0; i < zone.items.enemies.length; i++) {

						if (angular.isDefined(zone.items.heroes) && zone.items.heroes.length > 0) {
							$scope.heroes[zone.items.heroes[0]].hit += 1;
							continue;
						}

						var directionInicial = Math.floor((Math.random() * 4));
						switch (directionInicial) {
							case 0:
								if (!moveEnemy(k, 'top', zone.items.enemies[i], zone)) {
									if (!moveEnemy(k, 'right', zone.items.enemies[i], zone)) {
										if (!moveEnemy(k, 'bottom', zone.items.enemies[i], zone)) {
											if (!moveEnemy(k, 'left', zone.items.enemies[i], zone)) {
											}
										}
									}
								}
								break;
							case 1:
								if (!moveEnemy(k, 'right', zone.items.enemies[i], zone)) {
									if (!moveEnemy(k, 'bottom', zone.items.enemies[i], zone)) {
										if (!moveEnemy(k, 'left', zone.items.enemies[i], zone)) {
											if (!moveEnemy(k, 'top', zone.items.enemies[i], zone)) {
											}
										}
									}
								}
								break;
							case 2:
								if (!moveEnemy(k, 'bottom', zone.items.enemies[i], zone)) {
									if (!moveEnemy(k, 'left', zone.items.enemies[i], zone)) {
										if (!moveEnemy(k, 'top', zone.items.enemies[i], zone)) {
											if (!moveEnemy(k, 'right', zone.items.enemies[i], zone)) {
											}
										}
									}
								}
								break;
							case 3:
								if (!moveEnemy(k, 'left', zone.items.enemies[i], zone)) {
									if (!moveEnemy(k, 'top', zone.items.enemies[i], zone)) {
										if (!moveEnemy(k, 'right', zone.items.enemies[i], zone)) {
											if (!moveEnemy(k, 'bottom', zone.items.enemies[i], zone)) {
											}
										}
									}
								}
								break;
						}
					}
				}
			});

			angular.forEach($scope.spawenemy, function (v, k) {
				$scope.myMap.zone[v].showDice = true;
				$scope.rolarDados().then(function (dice) {
					var dice = 1;
					$scope.myMap.zone[v].showDice = false;
					if (angular.isUndefined($scope.myMap.zone[v].items.enemies)) {
						$scope.myMap.zone[v].items.enemies = [];
					}

					console.log("Dice: " + dice);

					for (var i = 0; i < dice; i++) {
						if ($scope.myMap.zone[v].items.enemies.length < 20) {
							var enemy = {
								name: "Z" + $scope.myMap.zone[v].items.enemies.length,
								shield: 3,
								moveLast: v,
								hit: 1
							};

							$scope.myMap.zone[v].items.enemies.push(enemy);
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
			if ($scope.myMap !== null || angular.isUndefined($scope.myMap) || Object.keys($scope.heroes).length <= 0) {
				return
			}

			var action = $scope.myMap.zone[$scope.heroes[$scope.current].pos].pos[pos];

			var split = action.split("-");
			if (split.length > 1) {
				action = $scope.myMap.zone[split[0]].pos[split[1]];
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
				action = $scope.myMap.zone[split[0]].pos[split[1]];
			}
			return action;
		};

		$scope.logGame = [];
		$scope.newLogGame = function (text) {
			$scope.logGame.push({
				"date": new Date(),
				"text": text
			});
		};

	}
})();