
// Replace 'StudentInfo' with the name of the Firestore collection you want to import data into
const collectionName = 'StudentInfo';

// Function to import CSV data to Firestore
async function importCSVtoFirestore(file) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: async (result) => {
            const data = result.data;

            // Iterate through each row and add to Firestore if not already present
            for (const docData of data) {
                try {
                    // Check if a document with the same 'IdNumber' already exists
                    const querySnapshot = await db.collection(collectionName)
                        .where('IdNumber', '==', docData.IdNumber)
                        .get();

                    // If no matching document found, add the data to Firestore
                    if (querySnapshot.empty) {
                        await db.collection(collectionName).add(docData);
                        console.log('Document added successfully:', docData);
                    } else {
                        console.log('Document already exists, skipping:', docData);
                    }
                } catch (error) {
                    console.error('Error checking or adding document:', error);
                }
            }

            console.log('CSV import complete.');
            Swal.fire({
                icon: 'success',
                title: 'CSV Import',
                text: 'CSV import to Firestore complete.',
            });
        },
        error: (error) => {
            console.error('Error parsing CSV:', error);
            Swal.fire({
                icon: 'error',
                title: 'CSV Import Error',
                text: 'Error parsing CSV. Please check the file format.',
            });
        }
    });
}

// Handle file input change event
function handleFileUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        importCSVtoFirestore(file);
    } else {
        console.error('No file selected.');
        Swal.fire({
            icon: 'error',
            title: 'No File Selected',
            text: 'Please select a CSV file for import.',
        });
    }
}

// Attach event listener to file input element
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
