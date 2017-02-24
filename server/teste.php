<?php

include "boardGame.php";

//$jsonHero = [
//	"user_id" => "1s23456",
////	"hero" => [
////		"name" => "Nome",
////		"alias" => "Alias"
////	]
//];
//
//$jsonHeroes = [
//		[
//		"name" => "Nome",
//		"alias" => "Alias",
//		"socket" => "123456",
//		"pos" => "1_1"
//	],
//		[
//		"name" => "Nome2",
//		"alias" => "Alias2",
//		"socket" => "1111111",
//		"pos" => "1_1"
//	]
//];
//
//$hero = new Hero();
//$hero = $hero->newUserGame($jsonHeroes, $jsonHero);
//
//print_r($hero);

print_r((new Map())->getAllMaps());
//print_r(Game::getAllActives());
//$g = new Game();
//$g->id = 'teste';
//$g->mapOrig = "[4x4]-1obj";
//$g->createGame();
//
//print_r($g->readFile());


