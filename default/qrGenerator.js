let qr;

function searchFirestore() {
    // Get the value from the input field
    const idNumber = Number(document.getElementById("idNumber").value);

    // Remove previous QR code container
    clearQRCode();

    // Query Firestore
    db.collection("StudentInfo").where("IdNumber", "==", idNumber)
        .get()
        .then((querySnapshot) => {
            // Display the result
            const searchResultDiv = document.getElementById("searchResult");
            searchResultDiv.innerHTML = ""; // Clear previous results

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();

                    // Display the result with QR code
                    const resultHtml = `<p>Student Name: ${data.Name}, IdNumber: ${data.IdNumber}, Course: ${data.Course}</p>`;
                    searchResultDiv.innerHTML += resultHtml;

                    // Generate or update QR code
                    if (!qr) {
                        qr = new QRCode(document.getElementById("qrCodeContainer"), {
                            width: 128,
                            height: 128,
                        });
                    }
                    qr.makeCode(idNumber.toString());

                    // Show the download button
                    document.getElementById("downloadBtn").style.display = "block";
                });

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Search Successful!',
                    text: 'Student information found.',
                });
            } else {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Search Failed',
                    text: 'No matching records found for the provided IdNumber.',
                });
            }
        })
        .catch((error) => {
            console.error("Error searching Firestore:", error);
        });
}

function downloadQRCode() {
    // Check if a QR code is generated
    if (qr) {
        // Get the QR code image as a data URL
        const imageDataUrl = document.getElementById("qrCodeContainer").getElementsByTagName("img")[0].src;

        // Create a link element and set its attributes
        const downloadLink = document.createElement("a");
        downloadLink.href = imageDataUrl;
        downloadLink.download = "qrcode.png";

        // Trigger a click event on the link to start the download
        downloadLink.click();
    } else {
        alert("No QR code generated yet. Please perform a search first.");
    }
}

function clearQRCode() {
    // Remove previous QR code container
    const qrCodeContainer = document.getElementById("qrCodeContainer");
    qrCodeContainer.innerHTML = "";
    qr = null; // Reset the QR code instance
}