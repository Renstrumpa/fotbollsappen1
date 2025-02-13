const CLIENT_ID = '154778312454-v2vq7abfddnpcc01vduvkr5b0gns5713.apps.googleusercontent.com'; // Replace with your Client ID
const SPREADSHEET_ID = '1zdr3bxIiFAYw9Mv_n4qVuRxD8Y0U_qMxIrZ74NK9JWE'; // Replace with your spreadsheet ID
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']; // Full access to Google Sheets
const REDIRECT_URI = 'https://renstrumpa.github.io/fotbollsappen1/'; // Your Redirect URI (Important!)


let accessToken = null;

const drillLibrary = document.getElementById('drill-library');
const drillThemeFilter = document.getElementById('drill-theme-filter'); // Get the filter element
const sessionDrillsList = document.getElementById('session-drills-list'); // Get the session drills list
let createSessionButton = document.getElementById('create-session');

// Function to extract access token from URL fragment
function getAccessTokenFromUrl() {
  const hash = window.location.substring(1); // Remove the '#'
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

// Function to initiate the OAuth 2.0 flow
function authorize() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPES.join(' '))}&include_granted_scopes=true`;
  window.location.href = authUrl;
}

// Function to fetch drills from Google Sheets
async function getDrills() {
  if (!accessToken) {
    console.log("Not authorized to get drills");
    return;
  }

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Drills?valueRenderOption=USER_ENTERED`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

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

  const filterTheme = drillThemeFilter.value; // Get the selected theme from the filter

  drills.forEach(drill => {
    if (filterTheme === '' || drill.Fokus === filterTheme) { // Apply the filter
      const drillCard = document.createElement('div');
      drillCard.className = 'drill-card p-4 border rounded shadow-md mb-4';

      drillCard.innerHTML = `
        <h3 class="text-lg font-semibold">${drill.Name}</h3>
        <p class="text-gray-700">${drill.Description}</p>
        <p class="text-gray-700">Fokus: ${drill.Fokus}</p>
        <p>Equipment: ${drill.Equipment}</p>
        <label for="drill-duration-${drill.ID}">Duration (minutes):</label>
        <select id="drill-duration-${drill.ID}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="40">40</option>
          <option value="45">45</option>
        </select>
        ${drill.PictureLink ? `<img src="${drill.PictureLink}" alt="${drill.Name}" class="mt-2 max-w-full">` : ''}
        ${drill.Link ? `<a href="${drill.Link}" target="_blank" rel="noopener noreferrer" class="text-blue-500">More Info</a>` : ''}
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onclick="addDrillToSession('${drill.ID}')">Add Drill to Session</button>
      `;

      drillLibrary.appendChild(drillCard);
    }
  });
}

const sessionForm = document.getElementById('session-form');
let createSessionButton = document.getElementById('create-session');

let sessionDrills = []; // Array to hold drill IDs for the current session
let currentSession = null;  // Holds current session

createSessionButton = document.getElementById('create-session'); // Get the create session button
createSessionButton.addEventListener('click', createSession);

function createSession() {
  const sessionName = document.getElementById('session-name').value;
  const sessionCoach = document.getElementById('session-coach').value;
  const sessionLocation = document.getElementById('session-location').value;
  const sessionTargetAge = document.getElementById('session-target-age').value;
  const sessionTheme = document.getElementById('session-theme').value; // Get the selected theme

  //Simple ID
  const newSessionId = Date.now()
  currentSession = {
    ID: newSessionId,
    Name: sessionName,
    Coach: sessionCoach,
    Location: sessionLocation,
    TargetAge: sessionTargetAge,
    Theme: sessionTheme, // Include the theme in the session data
    DrillIDs: '' //Initial empty Drill ID Array
  };

  //Reset Form values after session has been created
  document.getElementById('session-name').value = ''
  document.getElementById('session-coach').value = ''
  document.getElementById('session-location').value = ''
  document.getElementById('session-target-age').value = ''
  document.getElementById('session-theme').value = '' // Reset the theme dropdown

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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Drills?valueRenderOption=USER_ENTERED`;

  // ... (Similar to the getDrills function, but only retrieve selected drill IDs from the sessionDrills array)
   fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
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

// Function to save session data back to Google Sheets
async function saveSessionToSheets() {
   // 1. Get authResult
  if (!accessToken) {
    alert('Please authorize first.');
    return;
  }

  if (currentSession === null) {
    alert('No session created. Please create a session first.');
    return;
  }

  // 1. Capture Drill Durations
  const drillData = sessionDrills.map(drillId => {
    const durationSelect = document.getElementById(`drill-duration-${drillId}`);
    const duration = durationSelect ? durationSelect.value : 10; // Default to 10 if not found
    return {
      drillId: drillId,
      duration: duration
    };
  });

  // 2. Format Session Data
  const drillIDsAndDurations = drillData.map(item => `${item.drillId}:${item.duration}`).join(','); // Format: "drillId1:duration1,drillId2:duration2,..."

  // 3. Prepare Data for Google Sheets
  const values = [
    [
      currentSession.ID,
      currentSession.Name,
      currentSession.Coach,
      currentSession.Location,
      currentSession.TargetAge,
      currentSession.Theme,
      drillIDsAndDurations // Save drill IDs and durations as a comma-separated string
    ]
  ];

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sessions:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: values })
    });
    const data = await response.json()
    console.log(data);
    alert("Session saved successfully!");
  } catch (error) {
    console.log(error.message)
  }

// Load the API client after the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check for access token in URL
  accessToken = getAccessTokenFromUrl();

  if (accessToken) {
    console.log("Access token found:", accessToken);
    // Access token is available, load the drills
    getDrills();
    document.getElementById('authorizeButton').style.display = 'none';
    document.getElementById('save-session').disabled = false;
  } else {
    console.log("No access token found");
    document.getElementById('authorizeButton').style.display = 'block';
    document.getElementById('save-session').disabled = true;
  }

  // Set the authorize button onclick
  document.getElementById('authorizeButton').onclick = authorize;
});
