
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


document.addEventListener("DOMContentLoaded", function () {
    // Initialize Firestore
    const db = firebase.firestore();

    // Flag to track if a scan is in progress

    let lastResult = null;
    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText !== lastResult) {
            lastResult = decodedText;
            findDataByIdNumber(Number(decodedText));
        }
    }

    function onScanFailure(error) {
        // Handle scan failure, usually better to ignore and keep scanning.
        // console.error("QR Code scan failed:", error);

        // Reset the flag to allow for the next scan

    }
    function ClearSpan() {
        // clear the span
        const spanIdNumber = document.getElementById("ScannerID");
        const spanName = document.getElementById("ScannerName");
        const spanCourse = document.getElementById("ScannerCourse");
        const spanRemarks = document.getElementById("ScannerRemarks");

        if (spanIdNumber && spanName && spanCourse) {
            spanIdNumber.textContent = "";
            spanName.textContent = "";
            spanCourse.textContent = "";
            spanRemarks.value = "";
        }
        // Clear the select element
        const scannerViolationSelect = document.getElementById("ScannerViolation");
        if (scannerViolationSelect) {
            scannerViolationSelect.selectedIndex = 0;
        }
    }

    function findDataByIdNumber(idNumber) {

        db.collection("StudentInfo")
            .where("IdNumber", "==", idNumber)
            .get()
            .then(function (querySnapshot) {
                if (!querySnapshot.empty) {
                    querySnapshot.forEach(function (doc) {
                        const data = doc.data();
                        console.log("Found document:", data);
                        // alert(`Found document with IdNumber: ${idNumber}\nData: ${JSON.stringify(data)}`);

                        // Update the span element with id "studentName" in HTML
                        const spanIdNumber = document.getElementById("ScannerID");
                        const spanName = document.getElementById("ScannerName");
                        const spanCourse = document.getElementById("ScannerCourse");

                        if (spanIdNumber && spanName && spanCourse) {
                            spanIdNumber.textContent = data.IdNumber;
                            spanName.textContent = data.Name;
                            spanCourse.textContent = data.Course;
                        }
                    });
                } else {

                    ClearSpan();
                    Swal.fire({
                        icon: 'error',
                        title: 'QR Failed',
                        text: 'No Student Found',
                    });


                }
            })
            .catch(function (error) {
                console.error("Error querying Firestore:", error);
            })

    }

    // Create the scanner instance
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false);

    // Render the scanner
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});

async function Encode() {
    // Delay to ensure the content is updated after scanning
    await new Promise(resolve => setTimeout(resolve, 100));

    const idNumber = document.getElementById("ScannerID").textContent;
    const selectedValue = document.getElementById('ScannerViolation').value;
    const name = document.getElementById("ScannerName").textContent;
    const course = document.getElementById("ScannerCourse").textContent;
    const remarks = document.getElementById("ScannerRemarks").value;

    if (!selectedValue || !idNumber || !name) {
        // Using SweetAlert to show a nice alert with a custom message
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please make sure to scan the QR code and provide all required information',
        });
        return;
    }

    db.collection("/Records")
        .add({
            idNumber: idNumber,
            name: name,
            violation: selectedValue,
            Course: course,
            Remarks: remarks,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            status: "Unsettled"
        })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            // Using SweetAlert for success
            Swal.fire({
                icon: 'success',
                title: 'Violation Added',
                text: 'Successfully added record',
            });
            // Clear input values
            document.getElementById("ViolationInput").value = "";
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
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
