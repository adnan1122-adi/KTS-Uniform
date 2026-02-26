/**
 * KTS Uniform Size Request System - Backend
 * Google Apps Script
 * 
 * Sheet Structure (Tab: "Students"):
 * 0: StudentID
 * 1: EnglishName
 * 2: Grade
 * 3: Gender
 * 4: Parent Name
 * 5: Mobile No.
 * 6: Green Hoodie
 * 7: Green Pant
 * 8: Green Polo
 * 9: White T-shirt
 * 10: Beige Pant
 * 11: Skort
 * 12: Notes
 * 13: RequestStatus
 * 
 * Tab: "Config"
 * A1: English Message
 * B1: Arabic Message
 * C1: Modification Approval (enabled/disabled)
 */

const ADMIN_PASSWORD = "KTS_ADMIN_2024"; // Change this!
const SHEET_NAME = "Students";
const CONFIG_SHEET = "Config";

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const configSheet = ss.getSheetByName(CONFIG_SHEET);

  if (action === "getMessage") {
    const config = configSheet.getRange(1, 1, 1, 3).getValues()[0];
    return jsonResponse({
      english: config[0],
      arabic: config[1],
      modification: config[2] || "enabled"
    });
  }

  if (action === "search") {
    const studentId = e.parameter.studentId;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString().trim() === studentId.toString().trim()) {
        return jsonResponse({
          found: true,
          studentId: data[i][0],
          englishName: data[i][1],
          grade: data[i][2],
          gender: data[i][3],
          parentName: data[i][4],
          mobileNo: data[i][5],
          greenHoodie: data[i][6],
          greenPant: data[i][7],
          greenPolo: data[i][8],
          whiteTshirt: data[i][9],
          beigePant: data[i][10],
          skort: data[i][11],
          notes: data[i][12],
          status: data[i][13]
        });
      }
    }
    return jsonResponse({ found: false });
  }

  if (action === "admin") {
    const password = e.parameter.password;
    if (password !== ADMIN_PASSWORD) return jsonResponse({ error: "Unauthorized" });

    const subAction = e.parameter.subAction;
    const data = sheet.getDataRange().getValues();

    if (subAction === "summary") {
      const summary = {
        greenHoodie: {}, greenPant: {}, greenPolo: {}, whiteTshirt: {}, beigePant: {}, skort: {}
      };
      for (let i = 1; i < data.length; i++) {
        if (data[i][13] === "Approved") {
          if (data[i][6]) summary.greenHoodie[data[i][6]] = (summary.greenHoodie[data[i][6]] || 0) + 1;
          if (data[i][7]) summary.greenPant[data[i][7]] = (summary.greenPant[data[i][7]] || 0) + 1;
          if (data[i][8]) summary.greenPolo[data[i][8]] = (summary.greenPolo[data[i][8]] || 0) + 1;
          if (data[i][9]) summary.whiteTshirt[data[i][9]] = (summary.whiteTshirt[data[i][9]] || 0) + 1;
          if (data[i][10]) summary.beigePant[data[i][10]] = (summary.beigePant[data[i][10]] || 0) + 1;
          if (data[i][11]) summary.skort[data[i][11]] = (summary.skort[data[i][11]] || 0) + 1;
        }
      }
      return jsonResponse(summary);
    }

    const requests = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][13] === "Pending" || data[i][13] === "ModificationRequested") {
        requests.push({
          row: i + 1,
          studentId: data[i][0],
          englishName: data[i][1],
          grade: data[i][2],
          gender: data[i][3],
          parentName: data[i][4],
          mobileNo: data[i][5],
          greenHoodie: data[i][6],
          greenPant: data[i][7],
          greenPolo: data[i][8],
          whiteTshirt: data[i][9],
          beigePant: data[i][10],
          skort: data[i][11],
          notes: data[i][12],
          requestStatus: data[i][13]
        });
      }
    }
    return jsonResponse(requests);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const configSheet = ss.getSheetByName(CONFIG_SHEET);

  if (action === "requestUpdate") {
    const studentId = body.studentId;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString().trim() === studentId.toString().trim()) {
        const row = i + 1;
        const currentStatus = data[i][13];
        const isNewSubmission = !currentStatus || currentStatus === "";
        
        sheet.getRange(row, 5).setValue(body.parentName);
        sheet.getRange(row, 6).setValue(body.mobileNo);
        sheet.getRange(row, 7).setValue(body.greenHoodie);
        sheet.getRange(row, 8).setValue(body.greenPant);
        sheet.getRange(row, 9).setValue(body.greenPolo);
        sheet.getRange(row, 10).setValue(body.whiteTshirt);
        sheet.getRange(row, 11).setValue(body.beigePant);
        sheet.getRange(row, 12).setValue(body.skort);
        sheet.getRange(row, 13).setValue(body.notes);
        
        // New submissions are auto-approved, modifications need approval
        sheet.getRange(row, 14).setValue(isNewSubmission ? "Approved" : "Pending");
        
        return jsonResponse({ status: "success" });
      }
    }
    return jsonResponse({ status: "error", message: "Student not found" });
  }

  if (action === "approve") {
    if (body.password !== ADMIN_PASSWORD) return jsonResponse({ error: "Unauthorized" });
    sheet.getRange(body.row, 14).setValue("Approved");
    return jsonResponse({ status: "success" });
  }

  if (action === "requestModification") {
    const studentId = body.studentId;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString().trim() === studentId.toString().trim()) {
        sheet.getRange(i + 1, 14).setValue("ModificationRequested");
        return jsonResponse({ status: "success" });
      }
    }
  }

  if (action === "allowEdit") {
    if (body.password !== ADMIN_PASSWORD) return jsonResponse({ error: "Unauthorized" });
    sheet.getRange(body.row, 14).setValue("Modifiable");
    return jsonResponse({ status: "success" });
  }

  if (action === "updateMessage") {
    if (body.password !== ADMIN_PASSWORD) return jsonResponse({ error: "Unauthorized" });
    configSheet.getRange(1, 1).setValue(body.english);
    configSheet.getRange(1, 2).setValue(body.arabic);
    configSheet.getRange(1, 3).setValue(body.modification);
    return jsonResponse({ status: "success" });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
