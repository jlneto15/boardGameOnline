<?php

include("boardMap.php");
include("boardHero.php");

class Game {

	public $dir;
	public $id = null;
	public $mapOrig = null;
	public $map = null;
	public $heroes = [];
	public $enemies = [];
	public $current;

	public function __construct() {
		$this->dir = getcwd() . "/games";

		$this->heroes = [];
		$this->enemies = [];
	}

	public function update($local, $value) {
		
	}

	public function createGame() {
		if (empty($this->mapOrig)) {
			throw new Exception("MAP not found", 500);
		}

		if (empty($this->id)) {
			$this->id = (date("YmdHis")) . "-" . rand(100, 999) . rand(100, 999) . rand(100, 999) . rand(100, 999);
		}

		$this->map = json_decode((new Map())->getFile($this->mapOrig), true);
//		$this->saveFile();

		return $this;
	}

	public function updateOrNewHero($hero) {
//		if (is_object($hero)) {
//			$hero = json_decode(json_encode($hero), true);
//		}
		
		if (!is_array($this->heroes)) {
			$this->heroes = [];
		}
		if (isset($hero->id)) {
			$keyForDelete = null;
			foreach ($this->heroes as $kHero => $vHero) {
				if ($vHero->id === $hero->id) {
					$hero = $vHero;
					$keyForDelete  = $kHero;
					echo "ENCONTRATO PARA DELETAR: ".$keyForDelete."\n";
					break;
				}
			}
			if ($keyForDelete !== null) {
//				$this->heroes = array_splice($this->heroes, $keyForDelete, 1);
				array_splice($this->heroes, $keyForDelete, 1);
			}
		}
		
		if (empty($this->current)) {
			$this->current = $hero;
		}
		
		return $hero;
		
	}

	public function readFile($id = null) {
		if (empty($id)) {
			$id = $this->id;
		}

		$fileName = $this->dir . "/" . $this->id . '.json';

		if (!file_exists($fileName)) {
			return false;
		}

		$file = json_decode(file_get_contents($fileName));
//		die(print_r($file, true));
		
//		$this->mapOrig = $file["mapOrig"];
//		$this->map = $file["map"];
//		$this->heroes = Hero::readArray($file["heroes"]);
//		$this->enemies = $file["enemies"];

		$this->mapOrig = $file->mapOrig;
		$this->map = $file->map;
		$this->heroes = Hero::readArray($file->heroes);
		$this->enemies = $file->enemies;

		return $this;
	}

	public function getFile() {
		if (!empty($this->id)) {
			$file = file_get_contents($this->dir . "/" . $this->id . '.json');
			return $file;
		}
	}

	public function saveFile() {

		if (!empty($this->id)) {

			$file = json_decode(json_encode($this), true);
			unset($file["dir"]);

			$fp = fopen($this->dir . "/" . $this->id . '.json', 'w');
			fwrite($fp, json_encode($file));
			fclose($fp);

			return true;
		}

		return false;
	}

	public function getAllActives() {
		$retorno = [];

		if (file_exists($this->dir)) {
			$files = scandir($this->dir);
			foreach ($files as $file) {
				if (!empty(trim($file)) && !in_array($file, [".", ".."])) {
					array_push($retorno, substr($file, 0, -5));
				}
			}
		} else {
			mkdir($this->dir);
		}
		return $retorno;
	}

}
