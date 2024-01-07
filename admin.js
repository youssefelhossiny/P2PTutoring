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

var P2PTutoringDB = firebase.database().ref("P2PTutoring");

// Get a reference to the database service
var database = firebase.database();

function submitAnnouncement() {
  // Get the values from the form
  var title = document.getElementById("title").value;
  var description = document.getElementById("description").value;
  var date = new Date();
  var dateString = date.toLocaleString();

  // Add the data to the database

  if ((title.length > 0) && (description.length > 0)) {
    var newAnnouncementRef = database.ref("/Announcements").push();
    newAnnouncementRef.set({
      title: title,
      description: description,
      date: dateString
    });
    alert("Announcment has been published");
    // Clear the form
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
  }
  else {
    alert("Error: Please enter a valid announcement");
  }
}

// Get a reference to the announcements node
var announcementsRef = database.ref("/Announcements");

// Create a variable to store the announcements
var announcements = [];

// Get the data from the database
announcementsRef.on("value", function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    var announcement = childSnapshot.val();
    announcements.push(announcement);
  });
  displayAnnouncements();
});

// Display the announcements on the homepage
let displayedAnnouncements = new Set();

function displayAnnouncements() {
  var announcementsDiv = document.getElementById("announcements");
  announcements.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  announcements.forEach(function(announcement) {
    var key = announcement.title + announcement.description + announcement.date;
    if (displayedAnnouncements.has(key)) {
      return;
    }
    displayedAnnouncements.add(key);

    var announcementDiv = document.createElement("div");
    announcementDiv.classList.add("announcement");
    var title = document.createElement("h4");
    title.innerHTML = announcement.title;
    var description = document.createElement("p");
    description.innerHTML = announcement.description;

    var date = document.createElement("p");
    date.classList.add("date");
    date.innerHTML = announcement.date;

    announcementDiv.appendChild(date);
    announcementDiv.appendChild(title);
    announcementDiv.appendChild(description);
    announcementsDiv.appendChild(announcementDiv);
  });
}

document.getElementById("algorithm").addEventListener("submit", algorithm)

async function algorithm() {

  var matchesRef = database.ref("/Matches");
  matchesRef.remove();

  var unmatchedRef = database.ref("/Unmatched");
  unmatchedRef.remove();

  //weights of each subject relative to peer/tutor
  const weights = {
    //weighting of each subject relative to peer/tutor
    availability: 2.0,
    grade: 1.5,
    course_stream: 1.5,
    gender: 1.0,
    learning_style: 1.0,
    subject: 3.0
  };

  class Pair {
    constructor(student, tutor, similarity) {
      this.student = student;
      this.tutor = tutor;
      this.similarity = similarity;
    }
  }

  const students = [];
  const tutors = [];

  // Get input for student or tutor

  const snapshot = await P2PTutoringDB.once("value")
    .then(snapshot => {
      snapshot.forEach(function(childSnapshot) {
        let email = childSnapshot.key;

        let userType = childSnapshot.val().Type;
        let name = childSnapshot.val().fullName;
        let grade = childSnapshot.val().Grade;
        let courseStream = childSnapshot.val().Level;
        let gender = childSnapshot.val().Gender;
        let learning_style = childSnapshot.val().Learning;
        let subject = childSnapshot.val().Subject;
        let availability = childSnapshot.val().Day;

        let survey = {
          name: name,
          grade: grade,
          course_stream: courseStream,
          gender: gender,
          learning_style: learning_style,
          subject: subject,
          availability: availability,
        };

        if (userType === "Peer") {
          students.push(survey);
        } else if (userType === "Tutor") {
          tutors.push(survey);
        }
      });
    });

  const matchedPairs = [];
  const unmatched = []

  while (students.length > 0 && tutors.length > 0) {

    // Loop through students and calculate cosine similarity with each tutor
    for (let i = 0; i < students.length; i++) {
      //alert("hi")
      for (let j = 0; j < tutors.length; j++) {
        let numerator = 0;
        let studentVector = 0;
        let tutorVector = 0;

        //alert("can you see this?")

        // Calculate numerator of cosine similarity formula
        numerator += weights.availability * (students[i].availability === tutors[j].availability ? 1 : 0);
        numerator += weights.grade * (students[i].grade === tutors[j].grade ? 1 : 0);
        numerator += weights.course_stream * (students[i].course_stream === tutors[j].course_stream ? 1 : 0);
        numerator += weights.gender * (students[i].gender === tutors[j].gender ? 1 : 0);
        numerator += weights.learning_style * (students[i].learning_style === tutors[j].learning_style ? 1 : 0);
        numerator += weights.subject * (students[i].subject === tutors[j].subject ? 1 : 0);

        // Calculate denominator of cosine similarity formula
        for (let weight in weights) {
          studentVector += Math.pow(weights[weight], 2);
          tutorVector += Math.pow(weights[weight], 2);
        }

        studentVector = Math.sqrt(studentVector);
        tutorVector = Math.sqrt(tutorVector);

        // Calculate cosine similarity
        let similarity = numerator / (studentVector * tutorVector);

        // Add pair to matched pairs list
        matchedPairs.push(new Pair(students[i].name, tutors[j].name, similarity));

        //remove the matched peer and tutor
        students.splice(i, 1);
        tutors.splice(j, 1);
        // Break out of inner loop and continue with next student
        break;
      }
    }
  }

  if (students.length === 0) {
    for (let i = 0; i < tutors.length; i++) {
      unmatched[i] = tutors[i];
    }
  }
  else if (tutors.length === 0) {
    for (let i = 0; i < students.length; i++) {
      unmatched[i] = students[i];
    }
  }

  // Sort matched pairs by similarity
  matchedPairs.sort((a, b) => b.similarity - a.similarity);

  // Print the best match
  for (var k = 0; k < matchedPairs.length; k++) {
    if (matchedPairs.length !== 0) {
      console.log("Best match: " + matchedPairs[k].student + " and " + matchedPairs[k].tutor + " with a similarity of " + matchedPairs[k].similarity);
      var newMatchRef = database.ref("/Matches").push();
      newMatchRef.set({
        Tutor: matchedPairs[k].tutor,
        Peer: matchedPairs[k].student,
      });
    }
  }
  for (var i = 0; i < unmatched.length; i++) {
    var newUnmatchRef = database.ref("/Unmatched").push();
    newUnmatchRef.set(unmatched[i]);
  }
  console.log(students)
  console.log(tutors)
  displayMatches();
  displayUnmatched();
}
function displayMatches() {

  var table = document.getElementById("matchesTable");
  var database = firebase.database();
  var matchesRef = database.ref("/Matches");
  matchesRef.on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var match = childSnapshot.val();
      var row = table.insertRow();
      var tutorCell = row.insertCell();
      var matchCell = row.insertCell();
      tutorCell.innerHTML = match.Tutor;
      matchCell.innerHTML = match.Peer;
    });
  });
}

function displayUnmatched() {

  var table = document.getElementById("UnmatchedTable");
  var database = firebase.database();
  var unmatchedRef = database.ref("/Unmatched");
  unmatchedRef.on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var unmatchedPerson = childSnapshot.val();
      var row = table.insertRow();
      var personCell = row.insertCell();
      personCell.innerHTML = unmatchedPerson.name;
    });
  });
}
window.onload = function() {
  displayMatches();
  displayUnmatched();
}

function refreshPage() {
  location.reload();
}
