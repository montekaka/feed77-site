import {google} from "googleapis"
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export const getFeedParams = async (sheetId, rowNumber) => {
  const apiKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: 'feed77-demo@justcast-testing.iam.gserviceaccount.com',
    key: apiKey,
    scopes: SCOPES
  })

  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1",
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    return;
  }

  const row = rows[rowNumber];

  const address = row[0];
  const mainPatterns = row[2];
  const itemPatterns = row[3];
  const feedTitle = row[4];
  const feedLink = row[5];
  const feedDesc = row[6];
  const itemTitle = row[7];
  const itemLink = row[8];
  const itemDesc = row[9];
  if(address && address.toString().length > 0 && itemPatterns && itemPatterns.toString().length > 0) {
    return {
      address,
      mainPatterns,
      itemPatterns,
      feedTitle,
      feedLink,
      feedDesc,
      itemTitle,
      itemLink,
      itemDesc
    }
  }
}