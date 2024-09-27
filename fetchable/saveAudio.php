<?php
$response = array();

$uploadedAudio = $_POST['file'];
$uploadedname = $_POST['name'];
$type = $_POST['type'];
$GLOBALS['search'] = $uploadedname;
$GLOBALS['path'] = $type;

$decode = base64_decode(urldecode($uploadedAudio));

// // # RFC 2397 conform
$binary = file_get_contents($uploadedAudio);

// // # with two slashes
$uriPhp = 'data://' . substr($uploadedAudio, 5);
$binary = file_get_contents($uriPhp);
$path = "../uploads/$uploadedname.$type";
file_put_contents($path, $binary);

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
$response["status"] = "Saved";
$response["results"] = $results;

header("Content-Type: application/json");
echo json_encode($response);
