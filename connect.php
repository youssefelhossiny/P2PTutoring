<?php
  $fullName = $_POST['fullName']
  $Email = $_POST['Email']
  $createUsername = $_POST['createUsername']
  $createPassword = $_POST['createPassword']
  $verifyPassword = $_POST['verifyPassword']

$conn = new mysqli('localhost','root','youssef16');
if($conn->connect_error){
die('Connection Failed  :  '$conn->connect_error);
}
else{
$stmt = $conn->prepare("insert into registration(fullName, Email creareUsername, createPasswrod, verifyPasswrod)values(?,?,?,?,?)");
  $stmt->blind_param("")
}
?>
