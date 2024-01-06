const firebaseConfig = {
  apiKey: "AIzaSyDkQlfhAtYv2MLU-JinEP7q8ITSq2C1834",
  authDomain: "web-based-violation-tracker.firebaseapp.com",
  projectId: "web-based-violation-tracker",
  storageBucket: "web-based-violation-tracker.appspot.com",
  messagingSenderId: "153034123104",
  appId: "1:153034123104:web:1f57b4b115047f86c6e005"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


//Function to Store data in firestore
function Encode() {

  const idNumber = document.getElementById("IdNumberInput").value;
  const violation = document.getElementById("ViolationInput").value;
  const name = document.getElementById("NameInput").value;

  if (!violation || !idNumber) {
    alert("Please enter both violation value and ID number.");
    return;
  }
  db.collection("/Records")
    .add({
      idNumber: idNumber,
      name: name,
      violation: violation,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      status: "Unsettled"
    })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      swal({
        icon: "success",
        title: "Violation Added",
        text: "Succesfully added record"
      });
      document.getElementById("IdNumberInput").value = "";
      document.getElementById("ViolationInput").value = "";
      document.getElementById("NameInput").value = "";
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      console.log('here')
    });
}


//Function to convert firestore timestamp
function convertFirestoreTimestamp(timestamp) {
  const seconds = timestamp.seconds;
  const nanoseconds = timestamp.nanoseconds;

  const milliseconds = seconds * 1000 + nanoseconds / 1e6;

  return new Date(milliseconds);
}

// Function to fetch Firestore data and update the table
function initDataTable() {
  const tableBody = $("#violation-table");

  // Clear existing rows
  tableBody.empty();

  // Fetch data from Firestore
  db.collection("/Records").onSnapshot((querySnapshot) => {
    const snapshot = querySnapshot.docs.map((firestoreData) => {
      return { ...firestoreData.data(), docId: firestoreData.id }
    });

    if ($.fn.DataTable.isDataTable(tableBody)) {
      tableBody.destroy();
    }

    // Initialize Datatable
    const table = $("#violation-table").DataTable({
      "responsive": true,
      "data": snapshot,
      "columns": [
        {
          "title": "Time",
          "data": function (row) {
            // Convert timestamp to Date object and format as a string
            const date = convertFirestoreTimestamp(row.time);
            return date.toLocaleString();
          }
        },
        { "title": "ID  Number", "data": "idNumber" },
        { "title": "Name", "data": "name" },
        { "title": "Course", "data": "Course" },
        { "title": "Violation", "data": "violation" },
        { "title": "Details", "data": "Remarks" },
        { "title": "Status", "data": "status" },
        {
          "title": "Actions",
          data: null,
          className: 'dt-center editor-edit',
          render: function (data, type, row) {
            // Render Settle button for unsettled records
            if (row.status !== 'Settled') {
              return '<button type="button" class="btn btn-primary btn-sm js-settle" data-toggle="modal" data-target="#exampleModalCenter" >Settle</button>';
            }
            // Render Settled button for settled records
            else {
              return '<button type="button" class="btn btn-success btn-sm js-view-settled">Settled</button>';
            }
          },
          orderable: false
        },
      ],
      "searching": true,
      "ordering": true
    });

    // Add event listener to the Settled button in the DataTable
    $("#violation-table").on('click', 'tbody button.js-view-settled', function (e) {
      const settledData = table.row($(this).closest('tr')).data();
      viewSettledRecord(settledData);
    });
  }, (error) => {
    console.error("Error getting documents: ", error);
  });
}

//view settleby
function viewSettledRecord(settledData) {
  // Pass the timestamp through convertFirestoreTimestamp first
  const date = convertFirestoreTimestamp(settledData.time);

  Swal.fire({
    title: 'Settled Record Details',
    html: `<ul class="list-group">
              <li class="list-group-item">Time: ${date.toLocaleString()}</li>
              <li class="list-group-item">ID Number: ${settledData.idNumber}</li>
              <li class="list-group-item">Name: ${settledData.name}</li>
              <li class="list-group-item">Violation: ${settledData.violation}</li>
              <li class="list-group-item">Settled By: ${settledData.SettledBy}</li>
            </ul>`,
    showCloseButton: true,
  });
}


function initTable() {
  console.log('trigger')
  const tableBody = $("#violation-table");

  // Clear existing rows
  tableBody.destroy();

  // Fetch data from Firestore
  db.collection("/Records")
    .get()
    .then((querySnapshot) => {
      const table = $("#violation-table");
      const snapshot = querySnapshot.docs.map(x => x.data());

      snapshot.map(el => {
        table.find("tbody").append()
      })
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

// Settlement Function for Status
function settleRecord(dataRow) {
  const db = firebase.firestore();
  const auth = firebase.auth();

  const time = convertFirestoreTimestamp(dataRow.time);
  const id = dataRow.idNumber;
  const name = dataRow.name;
  const violation = dataRow.violation;

  // Check if the record is already settled
  if (dataRow.status === 'Settled') {
    Swal.fire({
      icon: 'info',
      title: 'Record Already Settled',
      text: 'This record has already been settled.',
    });
    return;
  }

  // Get information about the currently logged-in user
  const currentUser = auth.currentUser;

  // Check if a user is logged in before proceeding
  if (!currentUser) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please log in to settle records.',
    });
    return;
  }

  // Get the email of the current user
  const userEmail = currentUser.email;

  Swal.fire({
    title: 'Do you want to Settle This Record?',
    html: `<ul class="list-group">
              <li class="list-group-item" id="listTime">Time: ${time}</li>
              <li class="list-group-item" id="listID">ID: ${id}</li>
              <li class="list-group-item" id="listName">Name: ${name}</li>
              <li class="list-group-item" id="listViolation">Violation: ${violation}</li>
            </ul>
            <hr>
            <input type="text" name="Confirm" class="form-control mx-auto" placeholder='"CONFIRM"' id="confirmationModal">`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Settle',
    preConfirm: () => {
      const confirmationValue = document.getElementById("confirmationModal").value.trim();

      if (confirmationValue === 'CONFIRM') {
        try {
          // Update the record with the Settled status and SettledBy field
          return db.collection('/Records').doc(dataRow.docId).update({
            status: 'Settled',
            SettledBy: userEmail,
          });
        } catch (e) {
          console.error('Error updating document:', e);
          return Promise.reject('Error updating document');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please input CONFIRM and try again'
        });
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Violation Updated',
        text: 'Record successfully Settled'
      }).then(() => {
        location.reload();
      });
    }
  }).catch((error) => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'error'
      });
    }
  });
}



$(document).ready(function () {
  initDataTable();

  $("#violation-table").on('click', 'tbody button', function (e) {
    const tableBody = $("#violation-table").DataTable();
    let data_row = tableBody.row($(this).closest('tr')).data();
    settleRecord(data_row);
  });
});


// Login Function
function login() {
  var email = document.getElementById('AuthEmail').value;
  var password = document.getElementById('AuthPassword').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("Logged in as:", user.email);

      // Check email domain and redirect accordingly
      if (email.endsWith('@osa.com')) {
        // Redirect to index.htm for @osa.com
        window.location.href = 'index.htm';
      } else if (email.endsWith('@encoder.com')) {
        // Redirect to scanner.html for @encoder.com
        window.location.href = 'scanner.htm';
      } else if (email.endsWith('@admin.com')) {
        // Redirect to scanner.html for @encoder.com
        window.location.href = 'index.htm';
      }
      else {
        // Handle other cases or display an error message
        console.log("Unknown email domain:", email);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Unknown email domain. Please enter a valid email domain.',
        });
      }
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error("Login failed:", errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Incorrect email or password. Please check your credentials and try again',
      });
    });
}


//logout function
document.addEventListener('DOMContentLoaded', function () {

  var logoutButtons = document.querySelectorAll('.logout');

  logoutButtons.forEach(function (button) {
    button.addEventListener('click', function () {

      auth.signOut().then(function () {

        console.log('User signed out.');
        window.location.href = 'auth-normal-sign-in.htm';
      }).catch(function (error) {

        console.error('Error during sign-out:', error);
      });
    });
  });
});

//checks if user is logged in or not and changes the name on the upper left
auth.onAuthStateChanged(function (user) {
  if (user) {
    console.log("User is signed in:", user.email);

    //change the name on the upper left
    const userEmail = user.email;
    const userEmailSpans = document.getElementsByClassName('userEmailSpan');

    for (var i = 0; i < userEmailSpans.length; i++) {
      userEmailSpans[i].textContent = userEmail;
    }
  } else {
    console.log("User is not signed in.");

    // Check if the user is already on the login page
    const isLoginPage = window.location.href.includes("auth-normal-sign-in.htm");

    if (!isLoginPage) {
      console.log("Redirecting to login page.");
      window.location.href = "auth-normal-sign-in.htm";
    }
  }
});




