const CLIENT_ID = '154778312454-v2vq7abfddnpcc01vduvkr5b0gns5713.apps.googleusercontent.com'; // Replace with your Client ID
const API_KEY = 'YOUR_API_KEY'; // Replace with your API key - (You can remove this later)
const SPREADSHEET_ID = '1zdr3bxIiFAYw9Mv_n4qVuRxD8Y0U_qMxIrZ74NK9JWE'; // Replace with your spreadsheet ID
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']; // Full access to Google Sheets

let gapiAuth; // Store the gapi.auth2 instance

const drillLibrary = document.getElementById('drill-library');
const drillThemeFilter = document.getElementById('drill-theme-filter'); // Get the filter element
const sessionDrillsList = document.getElementById('session-drills-list'); // Get the session drills list

// Load the API client and auth library
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

// Initialize the API client and auth library
function initClient() {
  gapi.auth2.init({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' ')
  }).then(() => {
    // Listen for sign-in state changes
    gapiAuth = gapi.auth2.getAuthInstance();
    gapiAuth.isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapiAuth.isSignedIn.get());

    // Automatically sign in the user if they are already signed in
    if (gapiAuth.isSignedIn.get()) {
      console.log("User is already signed in");
      document.getElementById('authorizeButton').style.display = 'none'; // Hide auth button
      document.getElementById('save-session').disabled = false; // Enable save button
      getDrills(); // Load drills immediately
    } else {
      console.log("User is not signed in");
      document.getElementById('authorizeButton').style.display = 'block'; // Show auth button
      document.getElementById('save-session').disabled = true; // Disable save button
    }

    document.getElementById('authorizeButton').onclick = handleAuthClick;
    document.getElementById('save-session').onclick = saveSessionToSheets;
    drillThemeFilter.addEventListener('change', () => {
      getDrills(); // Re-fetch and display drills when the filter changes
    });
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    console.log('User is signed in.');
    document.getElementById('authorizeButton').style.display = 'none'; // Hide auth button
    document.getElementById('save-session').disabled = false; // Enable save button
    getDrills(); // Load drills when signed in
  } else {
    console.log('User is not signed in.');
    document.getElementById('authorizeButton').style.display = 'block'; // Show auth button
    document.getElementById('save-session').disabled = true; // Disable save button
  }
}

function handleAuthClick() {
  gapiAuth.signIn();
}

async function getDrills() {
  if (!gapiAuth.isSignedIn.get()) {
    console.log("Not authorized to get drills");
    return;
  }

  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Drills',
    });

    const data = response.result;
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
const createSessionButton = document.getElementById('create-session');

let sessionDrills = []; // Array to hold drill IDs for the current session
let currentSession = null;  // Holds current session

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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Drills?key=${API_KEY}`;

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

                      for (let i = 0;
