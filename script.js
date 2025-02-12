const apiKey = 'AIzaSyAOoFOzSAtirT5XjYUJLr1FOewcoOHxHSE'; // Replace with your actual API key
const spreadsheetId = '1zdr3bxIiFAYw9Mv_n4qVuRxD8Y0U_qMxIrZ74NK9JWE'; // Replace with your spreadsheet ID
const sheetName = 'Drills';
const drillLibrary = document.getElementById('drill-library');

async function getDrills() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;

    if (rows && rows.length > 1) { // Ensure there's data beyond the header row
      const headers = rows[0];
      const drills = rows.slice(1).map(row => {
        const drill = {};
        for (let i = 0; i < headers.length; i++) {
          drill[headers[i]] = row[i];
        }
        return drill;
      });

      displayDrills(drills);
    } else {
      drillLibrary.textContent = 'No drills found.';
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    drillLibrary.textContent = 'Error loading drills.';
  }
}

function displayDrills(drills) {
  drillLibrary.innerHTML = ''; // Clear existing content

  drills.forEach(drill => {
    const drillCard = document.createElement('div');
    drillCard.className = 'drill-card p-4 border rounded shadow-md mb-4'; // Tailwind classes for styling

    drillCard.innerHTML = `
      <h3 class="text-lg font-semibold">${drill.Name}</h3>
      <p class="text-gray-700">${drill.Description}</p>
      <p>Duration: ${drill.Duration} minutes</p>
      <p>Equipment: ${drill.Equipment}</p>
      ${drill.PictureLink ? `<img src="${drill.PictureLink}" alt="${drill.Name}" class="mt-2 max-w-full">` : ''}
      ${drill.Link ? `<a href="${drill.Link}" target="_blank" rel="noopener noreferrer" class="text-blue-500">More Info</a>` : ''}
    `;

    drillLibrary.appendChild(drillCard);
  });
}

getDrills(); // Call the function to fetch and display drills on page load

// ... (Existing code from before)

const sessionForm = document.getElementById('session-form');
const createSessionButton = document.getElementById('create-session');
const sessionDrillsList = document.getElementById('session-drills-list');
const exportPdfButton = document.getElementById('export-pdf');

let sessionDrills = []; // Array to hold drill IDs for the current session
let currentSession = null;  // Holds current session

createSessionButton.addEventListener('click', createSession);
exportPdfButton.addEventListener('click', exportSessionToPDF);

function createSession() {
  const sessionName = document.getElementById('session-name').value;
  const sessionCoach = document.getElementById('session-coach').value;
  const sessionLocation = document.getElementById('session-location').value;
  const sessionTargetAge = document.getElementById('session-target-age').value;

  //Simple ID
  const newSessionId = Date.now()
  currentSession = {
    ID: newSessionId,
    Name: sessionName,
    Coach: sessionCoach,
    Location: sessionLocation,
    TargetAge: sessionTargetAge,
    DrillIDs: '' //Initial empty Drill ID Array
  };

  //Reset Form values after session has been created
  document.getElementById('session-name').value = ''
  document.getElementById('session-coach').value = ''
  document.getElementById('session-location').value = ''
  document.getElementById('session-target-age').value = ''

  alert(`Session created! Session ID: ${newSessionId}. Now add some Drills`);

}

// Function to add a drill to the session (call this from displayDrills function)
function addDrillToSession(drillId) {
  if (currentSession === null){
    alert('A session has not been created yet, please create a session first!');
    return;
  }

  sessionDrills.push(drillId); // Add the drill ID to the session array
  updateSessionDrillsList();
  alert(`Drill with ID: ${drillId} was added to session. Don't forget to store your session`)
}

// Function to update the display of drills in the session
function updateSessionDrillsList() {
  sessionDrillsList.innerHTML = ''; // Clear existing list

  // Fetch and display drills from Google Sheets
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

  // ... (Similar to the getDrills function, but only retrieve selected drill IDs from the sessionDrills array)
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const headers = data.values[0]; // headers
            const rows = data.values.slice(1); // all data
            const foundDrills = [];

            for (const id of sessionDrills) {
              for (const row of rows) {
                  if (row[0] === id) {  //row[0] is the `ID` header

                      const drill = {};

                      for (let i = 0; i < headers.length; i++) {
                        drill[headers[i]] = row[i];
                      }
                      foundDrills.push(drill);

                  }
                }

            }


            displayAddedDrills(foundDrills) // pass to function
        })

        .catch(error => console.error('Error getting Google Sheets data:', error));

  function displayAddedDrills(drills) {

      sessionDrillsList.innerHTML = "";  // set the displayed data to empty, so duplicate information can be avoided


      drills.forEach(drill => {


        const listItem = document.createElement('li');  // create the new data item

        listItem.className = "drill-card p-4 border rounded shadow-md mb-4";

        listItem.innerHTML = `  
                <h3 class="text-lg font-semibold">${drill.Name}</h3>
                <p class="text-gray-700">${drill.Description}</p>
                <p>Duration: ${drill.Duration} minutes</p>
                <p>Equipment: ${drill.Equipment}</p>
                ${drill.PictureLink ? `<img src="${drill.PictureLink}" alt="${drill.Name}" class="mt-2 max-w-full">` : ''}
                ${drill.Link ? `<a href="${drill.Link}" target="_blank" rel="noopener noreferrer" class="text-blue-500">More Info</a>` : ''}
              `;

        sessionDrillsList.appendChild(listItem);    // insert the values in a row with the header

    });
    };

}

//Update Drills (and the `Add Drill` Button)

function displayDrills(drills) {
    drillLibrary.innerHTML = '';  // set display data empty

    drills.forEach(drill => {

    const drillCard = document.createElement('div');   // create the data box
    drillCard.className = 'drill-card p-4 border rounded shadow-md mb-4';

    drillCard.innerHTML = `  
            <h3 class="text-lg font-semibold">${drill.Name}</h3>
            <p class="text-gray-700">${drill.Description}</p>
            <p>Duration: ${drill.Duration} minutes</p>
            <p>Equipment: ${drill.Equipment}</p>
            ${drill.PictureLink ? `<img src="${drill.PictureLink}" alt="${drill.Name}" class="mt-2 max-w-full">` : ''}
            ${drill.Link ? `<a href="${drill.Link}" target="_blank" rel="noopener noreferrer" class="text-blue-500">More Info</a>` : ''}
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onclick="addDrillToSession('${drill.ID}')">Add Drill to Session</button>
          `;


        drillLibrary.appendChild(drillCard);     // insert the values in a row with the header

    });

}
// call displayDrills after pushing/patching a google sheet object, the screen can auto update


// Function to save session data back to Google Sheets
async function saveSessionToSheets() {
// ... Implementation to write session data to the 'Sessions' sheet ...
    // Save Session to Google Sheets and include selected drill IDs
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${apiKey}`;


    //Format all drills in the 'sessionDrills' array to a commaseperated String
    //DrillIDs  is a must in column in `sheet 2: sessions`, otherwise Google Sheets can't map it correct!
    const DrillIDs = sessionDrills.join(', ')


    //Set Column Order,  Important !
    //Always: ID, NAME, COACH, LOCATION, TARGETAGE, `DrillIDs`, and the rest

    const values = [[currentSession.ID, currentSession.Name, currentSession.Coach, currentSession.Location, currentSession.TargetAge, DrillIDs]]

    //Build Request Object

    const requestBody = {
        values: values
      };
      console.log(values)

    try {

        //Try post Request to Sheets

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),

        });
        const responseData = await response.json();

        console.log(responseData)

        alert("Successfully stored a session with Drills inside of the session sheets! (Click Export to PDF after this)")

      }

      catch (error) {

        console.error('Error post sheet Values:', error);
        alert("An Error occured. Please check you have enabled the 'Google Sheets API'")

      }
}

 // Export to PDF Feature:
function exportSessionToPDF() {

if (currentSession === null){
  alert('No Session exist at the moment. Please store and create a session first.');
  return;
}

else if (sessionDrills.length === 0){
  alert("No Drills assigned, save session with drill. If you did, please refresh page.")
  return
}

else if (confirm("Click Save to save session with drill, it store this session at your sheet, the data can always override. The current time is not stored and it would require coding.")){
      saveSessionToSheets();

}
    import('jspdf').then(jsPDF => {
        const { jsPDF } = jsPDF;
        const pdf = new jsPDF();

        pdf.text(`Session Name: ${currentSession.Name}`, 10, 10);
        pdf.text(`Coach: ${currentSession.Coach}`, 10, 20);
        pdf.text(`Location: ${currentSession.Location}`, 10, 30);
        pdf.text(`Target Age: ${currentSession.TargetAge}`, 10, 40);

         //Display the Drills which assigned

        pdf.text("Selected Drills:", 10, 60);
          sessionDrillsList.childNodes.forEach((child, index) => {


            // PDF will show all items with his property
            // drillItem is here named, that its only the drill properties which need to be displayed.
            // not drillContainer, so only its inner Text instead the complete HTML
              const drillItem = child.innerText
            pdf.text(`${index + 1}. ${drillItem}`, 10, 70 + (index * 10));

        });

        pdf.save(`${currentSession.Name}.pdf`);
    });
  };

getDrills();