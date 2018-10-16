<?php

  include "database_info.php";

  $rating = null;
  $id = null;

  if(isset($_POST['id']) && isset($_POST['rating'])){
    $id = (int)$_POST['id'];
    $rating = (int)$_POST['rating'];
    if($rating > 0 && $rating < 6) {
      vote($rating, $id, $conn);
    } else {
      echo "badParams";
      http_response_code(400);
    }
  } else {
    echo "badParams";
    http_response_code(400);
  }

  function vote($rating, $id, $conne) {
    $ip = getUserIP();
    // check IP
    $checkIp = "SELECT ip, poemId FROM rating WHERE poemId='$id' AND ip='$ip'";
    $result = mysqli_query($conne, $checkIp);
    if(mysqli_num_rows($result) > 0) {
      // show message that already voted for this poem
       echo "alreadyVoted";
       http_response_code(400);
      // insert new vote to rating table
    } else {
      $insertRatingQuery="INSERT INTO rating (date, ip, score, poemId)
      VALUES (now(), '$ip' , $rating, $id)";
      $result = mysqli_query($conne, $insertRatingQuery);    
      $ratingQuery = "SELECT AVG(score) AS ratingAvg, COUNT(id) AS noOfVotes, poemId FROM rating WHERE poemId = $id GROUP BY poemId";
      $ratingResult = mysqli_query($conne, $ratingQuery); 
      if(mysqli_num_rows($ratingResult) > 0) {
        while($row = mysqli_fetch_assoc($ratingResult)) {
          $ratings[] = $row;
        }  
        $newAvg = $ratings[0]["ratingAvg"];
        $newCount = $ratings[0]["noOfVotes"];
        // insert updated rating average and number of votes into poem table  
        $updateRatingsDataQuery= "UPDATE poem SET ratingAvg = $newAvg, noOfVotes = $newCount WHERE id = $id";
        $updateRatingsDataResult = mysqli_query($conne, $updateRatingsDataQuery); 

        echo json_encode($ratings[0]);
      } 
    }
  }

  // Get user IP address
  function getUserIP() {
    if (isset($_SERVER["HTTP_CF_CONNECTING_IP"])) {
              $_SERVER['REMOTE_ADDR'] = $_SERVER["HTTP_CF_CONNECTING_IP"];
              $_SERVER['HTTP_CLIENT_IP'] = $_SERVER["HTTP_CF_CONNECTING_IP"];
    }

    $client  = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote  = $_SERVER['REMOTE_ADDR'];

    if(filter_var($client, FILTER_VALIDATE_IP)){
        $ip = $client;
    } elseif (filter_var($forward, FILTER_VALIDATE_IP)){
        $ip = $forward;
    } else {
        $ip = $remote;
    }
    return $ip;
  }

?>