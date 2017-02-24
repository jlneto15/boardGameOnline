<?php

class Map {

	public $dir;
	
	public function __construct() {
		$this->dir = getcwd() . "/maps";
	}
	
	public function getFile($fileName) {
		if (!empty($fileName)) {
			$file = file_get_contents($this->dir . "/" . $fileName . '.json');
			return $file;
		}
	}

	public function getAllMaps() {
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
