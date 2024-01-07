const firebaseConfig = {
  apiKey: "AIzaSyB_tpkisaHipwE1dXYCQofMVZR7CZGxLxs",
  authDomain: "p2ptutoring-82c20.firebaseapp.com",
  databaseURL: "https://p2ptutoring-82c20-default-rtdb.firebaseio.com",
  projectId: "p2ptutoring-82c20",
  storageBucket: "p2ptutoring-82c20.appspot.com",
  messagingSenderId: "142258545264",
  appId: "1:142258545264:web:ed13cfd6fee13097a50ab5",
  measurementId: "G-CWP4R72JX1"
};
// initialize firebase
firebase.initializeApp(firebaseConfig);

//refrence database
var P2PTutoringDB = firebase.database().ref("P2PTutoring");

document.getElementById("createAccount").addEventListener("submit", submitCreateAccount)

function submitCreateAccount(e) {
  e.preventDefault();

  var fullName = getElementVal("fullName");
  var emailid = getElementVal("email").toLowerCase();
  var username = getElementVal("username");
  var password = getElementVal("password");
  var verifyPassword = getElementVal("verifyPassword");
  var Type = "";
  var Grade = "";
  var Gender = "";
  var Learning = "";
  var Subject = "";
  var Level = "";
  var Day = "";
  var OEN = "";

  //validate password, must be greater than 6 characters
  if (password.length < 6) {
    alert("The password must have at least 6 characters");
    return;
  }
  // Check if the email address
  var emailExp = /^[^@]+@\w+(\.\w+)+\w$/;
  if (!emailExp.test(emailid)) {
    alert("The email address is not valid");
    return;
  }

  //password must be the same as equal password 
  if (password !== verifyPassword) {
    alert("The passwords do not match. Please try again.");
    return;
  }

  saveData(fullName, emailid, username, password, verifyPassword, Type, Grade, Gender, Learning, Subject, Level, Day, OEN);

  // Create a new user with email and password
  firebase.auth().createUserWithEmailAndPassword(emailid, password)
    .then(function(user) {

      console.log("User created: ", user);
      document.querySelector(".alert").style.display = "block";

      document.getElementById("createAccount").reset();
      // Remove the alert
      setTimeout(() => {
        document.querySelector(".alert").style.display = "none";
      }, 5000);
      // Reset the form
      var expires = "expires=" + new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)).toUTCString();
      document.cookie = "username=" + fullName + ";" + expires + ";path=/";

      //redirect to survey
      window.location.href = "survey.html?emailid=" + emailid;
    })
    .catch(function(error) {
      // Handle errors
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
      // Show an error message to the user
      alert(errorMessage);
    });
}

const saveData = (fullName, emailid, username, password, verifyPassword, Type, Grade, Gender, Learning, Subject, Level, Day, OEN) => {
  var newP2PTutoring = P2PTutoringDB.push();

  newP2PTutoring.set({
    fullName: fullName,
    emailid: emailid,
    username: username,
    password: password,
    verifyPassword: verifyPassword,
    Type: Type,
    Grade: Grade,
    Gender: Gender,
    Learning: Learning,
    Subject: Subject,
    Level: Level,
    Day: Day,
    OEN: OEN,
  })
}

const getElementVal = (id) => {
  return document.getElementById(id).value;
}

// Login Backend
document.getElementById("Login").addEventListener("submit", submitLogin);

function submitLogin() {
  var email = document.getElementById("email").value.toLowerCase();
  var password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user) {
      console.log("User signed in: ", user);

      firebase.database().ref("P2PTutoring").orderByChild("emailid").equalTo(email).once("value", function(snapshot) {
        if (snapshot.exists()) {
          var fullName = Object.values(snapshot.val())[0].fullName;
          var expires = "expires=" + new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)).toUTCString();
          document.cookie = "username=" + fullName + ";" + expires + ";path=/";
          console.log("Redirecting to homepage...");
          window.location.replace("Homepage.html");
        } else {
          alert("User data not found in the database.");
        }
      });
    })
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
      alert("Invalid username or password. Please try again.");
    });
}
//New password backend

document.getElementById("forgotPassword").addEventListener("submit", sendVerificationEmail);

function sendVerificationEmail() {
  //e.preventDefault();
  var emailid = document.getElementById("email").value;

  firebase.auth().sendPasswordResetEmail(emailid)
    .then(function() {
      // Send verification email
      alert("A password reset email has been sent to " + emailid);
    })
    .catch(function(error) {
      // Handle errors
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
      // Show an error message to the user
      alert(errorMessage);
    });
}


function displayPersonalizedMessage() {

  var MatchesDB = firebase.database().ref("Matches");
  var fullName = getCookie("username");

  MatchesDB.orderByChild("Peer").equalTo(fullName).on("child_added", function(snapshot) {
    var Peer = snapshot.val().Peer;
    var Tutor = snapshot.val().Tutor;

    alert("Hi " + Peer + " this is your tutor: " + Tutor)

  });

  MatchesDB.orderByChild("Tutor").equalTo(fullName).on("child_added", function(snapshot) {
    var Peer = snapshot.val().Peer;
    var Tutor = snapshot.val().Tutor;

    alert("Hi " + Tutor + " this is your peer: " + Peer)
  });

  // Check if the user has been matched
  // firebase.database().ref("/Matches").once("value").then(function(snapshot) {
  //   var isMatched = false;
  //   snapshot.forEach(function(childSnapshot) {
  //     var match = childSnapshot.val();
  //     if (match.Tutor === username || match.Peer === username) {
  //       isMatched = true;
  //       return;
  //     }
  //   });

  //   // Display a personalized message
  //   var message = document.getElementById("personalizedMessage");
  //   if (isMatched) {
  //     message.innerHTML = "Welcome back, " + username + "! You have been matched.";
  //   } else {
  //     message.innerHTML = "Welcome back, " + username + "! You have not been matched yet.";
  //   }
  // });
}

// Call the function when the page loads
window.onload = displayPersonalizedMessage;