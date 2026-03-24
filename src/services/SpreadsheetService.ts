export const SpreadsheetService = {
  getSheet: function (): GoogleAppsScript.Spreadsheet.Sheet {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    // Try to get sheet, if not create it
    let sheet = ss.getSheetByName("Competition Data")
    if (!sheet) {
      sheet = this.setupCompetitionDataSheet_(ss)
    }
    return sheet
  },

  getNextCompNumber: function (): number {
    const sheet = this.getSheet()
    const data = sheet.getDataRange().getValues()
    if (data.length <= 1) return 1

    const compNumbers = data.slice(1).map(row => Number(row[0])).filter(n => !isNaN(n))
    if (compNumbers.length === 0) return 1

    const maxNum = Math.max(...compNumbers)
    return maxNum > 0 ? maxNum + 1 : 1
  },

  getWinCount: function (userId: string): number {
    const sheet = this.getSheet()
    const data = sheet.getDataRange().getValues()
    // Assuming User ID is in column 3 (index 2)
    return data.filter(row => row[2].toString() === userId.toString()).length
  },

  isDuplicate: function (compNum: number, userId: string): boolean {
    const sheet = this.getSheet()
    const data = sheet.getDataRange().getValues()
    return data.some(row =>
      row[0].toString() === compNum.toString() && row[2].toString() === userId.toString()
    )
  },

  addWinner: function (compNum: number, userName: string, userId: string, profileUrl: string): void {
    const sheet = this.getSheet()
    const userHyperlink = `=HYPERLINK("${profileUrl}", "${userName}")`
    sheet.appendRow([compNum, userHyperlink, userId])
  },


  setupCompetitionDataSheet_: function (ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = ss.insertSheet("Competition Data")
    sheet.appendRow(["Competition #", "Winner", "User ID"])

    // Header Formatting
    const header = sheet.getRange("A1:C1")
    header.setFontWeight("bold")
    header.setBackground("#055fb7")
    header.setFontColor("white")
    sheet.setFrozenRows(1)

    // Table Styling
    const range = sheet.getRange("A:C")
    range.createFilter()

    const bandingRange = sheet.getRange("A2:C")
    bandingRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)

    // Conditional Formatting
    const colA = sheet.getRange("A2:A")
    // Note: The original code logic for duplicate checking
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COUNTIF($A$2:$A, A2)>1')
      .setBold(true)
      .setRanges([colA])
      .build()
    sheet.setConditionalFormatRules([rule])

    return sheet
  },
}
