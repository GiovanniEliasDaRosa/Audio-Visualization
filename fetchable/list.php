<?php

if (!file_exists('../uploads/')) {
  mkdir('../uploads/', 0777, true);
}

$dir = scandir('../uploads/');
$results = array();

foreach ($dir as $item) {
  if ($item == '.' || $item == '..') {
    continue;
  }
  array_push($results, $item);
}

$response = array();
$response["status"] = true;
$response["results"] = $results;
header("Content-Type: application/json");
echo json_encode($response);
