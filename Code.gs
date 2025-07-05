const SHEET_NAME = 'Sheet1';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function submitBooking(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  const name = data.name.trim();
  const email = data.email.trim();
  const date = data.date;
  const startTime = data.start;
  const endTime = data.end;
  const notes = data.notes;

  const requestedStart = toMinutes(startTime);
  const requestedEnd = toMinutes(endTime);

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const bookedDate = row[2];
    const bookedStart = toMinutes(row[3]);
    const bookedEnd = toMinutes(row[4]);

    if (bookedDate === date) {
      const timeConflict = requestedEnd > bookedStart - 60 && requestedStart < bookedEnd + 60;
      const exactMatch = row[0].toLowerCase() === name.toLowerCase() &&
                         row[1].toLowerCase() === email.toLowerCase() &&
                         row[3] === startTime &&
                         row[4] === endTime;

      if (exactMatch) {
        return { success: false, message: "You have already booked this time slot." };
      }

      if (timeConflict) {
        return { success: false, message: "Time slot is unavailable. Please choose another." };
      }
    }
  }

  sheet.appendRow([name, email, date, startTime, endTime, notes]);
  return { success: true };
}
