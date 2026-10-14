/**
 * Google Apps Script for School Friends Profile
 * -------------------------------------------------------------
 * 100% Free - No server, no credit card, no paid APIs required.
 * 
 * HOW TO UPDATE / DEPLOY IN 1 MINUTE:
 * 1. Open Google Sheets (sheets.google.com) and open your profile sheet.
 * 2. Click Extensions > Apps Script in the top menu.
 * 3. Delete any code in the editor and PASTE this ENTIRE code.
 * 4. Click the "Save" (disk 💾) icon or press Ctrl + S.
 * 5. Click "Deploy" > "Manage deployments".
 * 6. Click the pencil ✏️ (Edit) icon next to the active Web App.
 * 7. Under "Version", select "New version".
 * 8. Click "Deploy".
 * 
 * NOTE: The script automatically detects your existing sheet columns,
 * safely adds missing headers ("bloodGroup", "willingToDonate") without
 * corrupting existing data, and dynamically matches row values by header name.
 */

// Canonical headers definition
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
 * Handle POST requests - Store or update registered profile into the sheet
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

    var normalizedData = {
      id: id,
      name: name,
      gender: gender,
      dob: dob,
      bloodGroup: bloodGroup,
      willingToDonate: willingToDonate,
      occupationType: occupationType,
      jobDesignation: jobDesignation,
      currentJob: currentJob,
      companyName: companyName,
      currentCity: currentCity,
      businessLocation: businessLocation,
      workingSector: workingSector,
      businessCategory: businessCategory,
      businessWebsite: businessWebsite,
      phone: phone,
      email: email,
      photo: photo,
      registeredAt: registeredAt
    };

    // Dynamically retrieve sheet headers so row values map to exact columns
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
      return String(h).trim();
    });

    // Check if profile ID already exists (for edits/updates)
    var allData = sheet.getDataRange().getValues();
    var idColIdx = headers.indexOf("id");
    var existingRowIdx = -1;

    if (idColIdx !== -1 && allData.length > 1) {
      for (var r = 1; r < allData.length; r++) {
        if (String(allData[r][idColIdx]).trim() === String(id).trim()) {
          existingRowIdx = r + 1; // 1-indexed for SpreadsheetApp
          break;
        }
      }
    }

    // Build row array in the exact column sequence of the sheet
    var rowValues = [];
    for (var c = 0; c < headers.length; c++) {
      var headerKey = headers[c];
      var val = normalizedData.hasOwnProperty(headerKey) ? normalizedData[headerKey] : (payload[headerKey] !== undefined ? payload[headerKey] : "");
      rowValues.push(val);
    }

    if (existingRowIdx > 0) {
      // Update existing row in place
      sheet.getRange(existingRowIdx, 1, 1, rowValues.length).setValues([rowValues]);
      return jsonResponse({
        status: "success",
        message: "Profile for " + name + " updated successfully in Google Sheet",
        profileId: id
      });
    } else {
      // Append new row
      sheet.appendRow(rowValues);
      return jsonResponse({
        status: "success",
        message: "Profile for " + name + " stored successfully in Google Sheet",
        profileId: id
      });
    }

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Helper to get active sheet and automatically ensure all headers exist
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
    return sheet;
  }

  // Auto-upgrade existing sheet if missing headers
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h).trim();
  });

  for (var k = 0; k < HEADERS.length; k++) {
    var reqHeader = HEADERS[k];
    if (existingHeaders.indexOf(reqHeader) === -1) {
      var newCol = sheet.getLastColumn() + 1;
      var cell = sheet.getRange(1, newCol);
      cell.setValue(reqHeader);
      cell.setFontWeight("bold");
      cell.setBackground("#4f46e5");
      cell.setFontColor("#ffffff");
      existingHeaders.push(reqHeader);
    }
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
