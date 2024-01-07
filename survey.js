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

document.getElementById("survey").addEventListener("submit", survey)

function getRadioValue(id) {
  var ele = document.getElementsByName(id);

  for (i = 0; i < ele.length; i++) {
    if (ele[i].checked)
      return ele[i].value;
  }
}

function survey() {
  const queryString = window.location.search;
  var emailid = queryString.substring(queryString.indexOf("=") + 1)

  var Type = getRadioValue("rdbType");
  var Grade = getRadioValue("rdbGrade");
  var Gender = getRadioValue("rdbGender");
  var Learning = getRadioValue("rdbLearning");
  var Subject = getRadioValue("rdbSubject");
  var Level = getRadioValue("rdbLevel");
  var Day = getRadioValue("rdbDay");
  var OEN = document.getElementById("rdbOEN").value;

  if (!Type || !Grade || !Gender || !Learning || !Subject || !Level || !Day || !OEN) {
    alert("Please fill all fields before submitting");
    return;
  }
  saveData(emailid, Type, Grade, Gender, Learning, Subject, Level, Day, OEN);

  //window.location.href = "Homepage.html"
  window.location.href = "Homepage.html?emailid=" + emailid;
}

const saveData = (emailid, Type, Grade, Gender, Learning, Subject, Level, Day, OEN) => {

  var query = P2PTutoringDB.orderByChild("emailid").equalTo(emailid);
  query.once("child_added", function(snapshot) {
    snapshot.ref.update({
      Type: Type,
      Grade: Grade,
      Gender: Gender,
      Learning: Learning,
      Subject: Subject,
      Level: Level,
      Day: Day,
      OEN: OEN,
    })
  });

}
