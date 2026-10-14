/**
 * Google Apps Script for School Friends Profile
 * -------------------------------------------------------------
 * 100% Free - No server, no credit card, no paid APIs required.
 * 
 * HOW TO SET UP IN 2 MINUTES:
 * 1. Open Google Sheets (sheets.google.com) and create a New Blank Spreadsheet.
 * 2. Name your sheet (e.g. "School Friends Profiles").
 * 3. Click Extensions > Apps Script in the top menu.
 * 4. Delete any code in the editor and PASTE this ENTIRE code.
 * 5. Click the "Save" (disk) icon.
 * 6. Click "Deploy" > "New deployment".
 * 7. Click the gear icon next to "Select type" and choose "Web app".
 * 8. Set the settings:
 *    - Description: "School Friends Profiles API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (allows your web page to read & write)
 * 9. Click "Deploy" and authorize permissions if prompted.
 * 10. Copy the "Web app URL" (looks like: https://script.google.com/macros/s/.../exec).
 * 11. Paste that URL into the "Connect Google Sheet" modal in your web application!
 */

// Headers definition
var HEADERS = [
  "id",
  "name",
  "gender",
  "dob",
  "bloodGroup",
  "willingToDonate",
  "occupationType",
  "jobDesignation",
  "currentJob",
  "companyName",
  "currentCity",
  "businessLocation",
  "workingSector",
  "businessCategory",
  "businessWebsite",
  "phone",
  "email",
  "photo",
  "registeredAt"
];

/**
 * Handle GET requests - Read all registered profiles from the sheet
 */
function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse({
        status: "success",
        count: 0,
        data: []
      });
    }

    var headers = data[0];
    var profiles = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Skip completely empty rows
      if (!row[0] && !row[1]) continue;

      var profile = {};
      for (var j = 0; j < headers.length; j++) {
        var key = String(headers[j]).trim();
        var val = row[j];

        // Format dates if Google Sheets returns a Date object
        if (val instanceof Date) {
          if (key === 'dob') {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } else {
            val = val.toISOString();
          }
        }
        profile[key] = val !== undefined && val !== null ? String(val) : '';
      }
      profiles.push(profile);
    }

    return jsonResponse({
      status: "success",
      count: profiles.length,
      data: profiles
    });

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Handle POST requests - Store newly registered profile into the sheet
 */
function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var id = payload.id || ("sfp-" + new Date().getTime().toString(36) + Math.random().toString(36).substring(2, 5));
    var name = payload.name || "";
    var gender = payload.gender || "";
    var dob = payload.dob || "";
    var bloodGroup = payload.bloodGroup || "";
    var willingToDonate = payload.willingToDonate === 'Yes' || payload.willingToDonate === true ? "Yes" : "No";
    var occupationType = payload.occupationType || "Working";
    var jobDesignation = payload.jobDesignation || "";
    var currentJob = payload.currentJob || payload.businessName || "";
    var companyName = payload.companyName || "";
    var currentCity = payload.currentCity || "";
    var businessLocation = payload.businessLocation || "";
    var workingSector = payload.workingSector || (occupationType === "Business" ? "Self" : "Private");
    var businessCategory = payload.businessCategory || "";
    var businessWebsite = payload.businessWebsite || "";
    var phone = payload.phone || "";
    var email = payload.email || "";
    var photo = payload.photo || "";
    var registeredAt = payload.registeredAt || new Date().toISOString();

    // Append as a new row in Google Sheet
    sheet.appendRow([
      id,
      name,
      gender,
      dob,
      bloodGroup,
      willingToDonate,
      occupationType,
      jobDesignation,
      currentJob,
      companyName,
      currentCity,
      businessLocation,
      workingSector,
      businessCategory,
      businessWebsite,
      phone,
      email,
      photo,
      registeredAt
    ]);

    return jsonResponse({
      status: "success",
      message: "Profile for " + name + " stored successfully in Google Sheet",
      profileId: id
    });

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Helper to get or create sheet with headers
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    // Add header row with pretty styling
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4f46e5");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Helper to return standard JSON output with CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
