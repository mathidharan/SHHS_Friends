# 📊 Google Sheets Integration Guide (100% Free)

This project connects your HTML registration form and directory page directly to **Google Sheets** using a **Google Apps Script Web App**.

- **Cost**: **$0.00** (Completely FREE forever)
- **Database**: Your own Google Sheet in Google Drive
- **Two-way sync**:
  - Automatically **stores** new user registrations from `index.html` as new rows in your sheet.
  - Automatically **fetches** and displays registered members in `profiles.html`.

---

## ⚡ 2-Minute Setup Instructions

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and click **Blank spreadsheet**.
2. Name your spreadsheet (e.g. `School Friends Profile Data`).

### Step 2: Open Apps Script
1. In the top menu of your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any boilerplate code already in the editor (`function myFunction() { ... }`).
3. Open the file [`google-sheets-script.js`](./google-sheets-script.js) from this repository, copy all the code, and paste it into the Apps Script editor.
4. Click the **Save** (floppy disk 💾) icon or press `Ctrl + S`.

### Step 3: Deploy as a Web App
1. Click the blue **Deploy** button in the top right > choose **New deployment**.
2. Beside "Select type", click the gear ⚙️ icon and pick **Web app**.
3. Fill in the fields:
   - **Description**: `School Friends API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Important: This allows your HTML page to send and read data without requiring Google login)*
4. Click **Deploy**.
5. When prompted for authorization:
   - Click **Authorize access**.
   - Choose your Google account.
   - Click **Advanced** > Click **Go to Untitled project (unsafe)**.
   - Click **Allow**.
6. Copy the **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

### Step 4: Web Application Integration
The Web App URL has been embedded directly into `js/app.js` as the default internal endpoint:
```
https://script.google.com/macros/s/AKfycbxKGDkCxSE-_AfDyD5aot0Em6vfoGGDmHGcd7yBwFztLynUewW60KJiYAfKMijQGyVUtw/exec
```
- **Hidden & Public Ready**: Visitors to the public page are never prompted for URLs or setup modals.
- **Auto-Sync on Registration**: Registrations on `index.html` save locally and immediately append a row to your Google Sheet.
- **One-Click Sync**: Clicking **Sync** on `profiles.html` fetches the latest entries from the Google Sheet and updates the cards instantly.
