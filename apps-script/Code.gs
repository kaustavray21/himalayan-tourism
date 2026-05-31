/* ============================================================
   Himalayan Tourism — Google Apps Script form receiver
   ------------------------------------------------------------
   Receives POSTs from the website's lead popup + contact form
   and appends each submission as a row in your Google Sheet.

   This is a BOUND script: create it from inside your Sheet via
   Extensions ▸ Apps Script, so getActiveSpreadsheet() works.
   (If you make a STANDALONE script instead, replace
   getActiveSpreadsheet() with openById("YOUR_SHEET_ID").)
   ============================================================ */

// OPTIONAL anti-spam token. Leave "" to disable.
// If you set this, also set the same value in js/config.js (see notes).
var SECRET = "";

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // avoid two submissions writing at once

    var data = (e && e.parameter) ? e.parameter : {};

    // Optional shared-secret check
    if (SECRET && data.token !== SECRET) {
      return _json({ ok: false, error: "unauthorized" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var formType = (data.formType || "lead").toLowerCase();
    var isContact = formType === "contact";
    // Sheet1 = popup leads (Name, Phone, optional Email) | Sheet2 = contact form
    var sheetName = isContact ? "Sheet2" : "Sheet1";

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);

    var headers = isContact
      ? ["Timestamp", "Name", "Email", "Phone", "Package", "Message", "Page"]
      : ["Timestamp", "Name", "Phone", "Email", "Page"];

    // Write the header row once
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var row = isContact
      ? [new Date(), data.name || "", data.email || "", data.phone || "",
         data.package || "", data.message || "", data.page || ""]
      : [new Date(), data.name || "", data.phone || "", data.email || "", data.page || ""];

    sheet.appendRow(row);

    // OPTIONAL: email yourself on every submission (uncomment + set address)
    // MailApp.sendEmail("you@example.com",
    //   "New " + sheetName + " submission",
    //   JSON.stringify(data, null, 2));

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Health check — visiting the /exec URL in a browser shows this.
function doGet() {
  return ContentService
    .createTextOutput("Himalayan Tourism form endpoint is live.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
