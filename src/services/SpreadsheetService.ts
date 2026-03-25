export const SpreadsheetService = {
  /**
   * Calculates the next competition number based on existing data.
   * Checks the "Competition #" column max value and increments it.
   * @returns {number} The next competition number.
   */
  getNextCompNumber: function (): number {
    const data = this.getCompetitionData_()
    if (data.length === 0) return 1

    const compNumbers = data.map(row => Number(row[0])).filter(n => !isNaN(n))
    if (compNumbers.length === 0) return 1

    const maxNum = Math.max(...compNumbers)
    return maxNum > 0 ? maxNum + 1 : 1
  },

  /**
   * Counts the number of wins for a specific user.
   * @param {string} userId - The unique identifier of the user.
   * @returns {number} The total number of wins.
   */
  getWinCountForUser: function (userId: string): number {
    const data = this.getCompetitionData_()
    // Assuming User ID is in column 3 (index 2)
    return data.filter(row => row[2].toString() === userId.toString()).length
  },

  /**
   * Checks if a winner entry already exists for a specific competition and user.
   * @param {number} compNum - The competition number.
   * @param {string} userId - The unique identifier of the user.
   * @returns {boolean} True if the entry exists, false otherwise.
   */
  isDuplicateEntry: function (compNum: number, userId: string): boolean {
    const data = this.getCompetitionData_()
    return data.some(row =>
      row[0].toString() === compNum.toString() && row[2].toString() === userId.toString()
    )
  },

  /**
   * Adds a new winner to the Competitions sheet.
   * Also ensures the Leaderboard sheet exists and is updated.
   * @param {number} compNum - The competition number.
   * @param {string} userName - The name of the winner.
   * @param {string} userId - The unique identifier of the winner.
   * @param {string} profileUrl - The URL to the winner's profile.
   * @returns {void}
   */
  addWinner: function (compNum: number, userName: string, userId: string, profileUrl: string): void {
    const sheet = this.getCompetitionSheet_()
    const userHyperlink = `=HYPERLINK("${profileUrl}", "${userName}")`
    sheet.appendRow([compNum, userHyperlink, userId, profileUrl])

    // Ensures the Leaderboard sheet is created if missing, after adding a winner
    this.getLeaderboardSheet_()
  },


  /**
   * Retrieves the "Competitions" sheet.
   * Creates it if it doesn't exist.
   * @private
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} The Competitions sheet.
   */
  getCompetitionSheet_: function (): GoogleAppsScript.Spreadsheet.Sheet {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    return ss.getSheetByName("Competitions") ?? this.setupCompetitionsSheet_(ss)
  },

  /**
   * Retrieves the "Leaderboard" sheet.
   * Creates it if it doesn't exist.
   * @private
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} The Leaderboard sheet.
   */
  getLeaderboardSheet_: function (): GoogleAppsScript.Spreadsheet.Sheet {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    return ss.getSheetByName("Leaderboard") ?? this.setupLeaderboardSheet_(ss)
  },

  /**
   * Retrieves data from the Competitions sheet given a header name.
   * @private
   * @param {string} [headerName="Competition #"] - The name of the header column to index data by.
   * @returns {(string | number | boolean | Date)[][]} The data rows from the sheet.
   */
  getCompetitionData_: function (headerName: string = "Competition #"): (string | number | boolean | Date)[][] {
    const data = this.getCompetitionSheet_().getDataRange().getValues()
    const headerIndex = data.findIndex(row => row[0] === headerName)
    if (headerIndex === -1) {
      console.warn(`Header "${headerName}" not found in Competitions sheet.`)
      return []
    }
    const startRowIndex = headerIndex + 1

    return data.length > startRowIndex ? data.slice(startRowIndex) : []
  },

  /**
   * Sets up and formats the "Competitions" sheet.
   * @private
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The active spreadsheet.
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} The newly created Competitions sheet.
   */
  setupCompetitionsSheet_: function (ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = ss.insertSheet("Competitions")

    const headerRange = sheet.getRange("A3:D3")
    headerRange.setValues([["Competition #", "Winner", "User ID", "Profile URL"]])

    // Header Formatting
    headerRange.setFontWeight("bold")
    headerRange.setBackground("#055fb7")
    headerRange.setFontColor("white")
    sheet.setFrozenRows(3)

    // Hide the URL column
    sheet.hideColumns(4)

    // Table Styling
    const range = sheet.getRange("A3:D")
    range.createFilter()

    const bandingRange = sheet.getRange("A4:D")
    bandingRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)

    const userColumn = sheet.getRange("B4:B")
    userColumn.setFontColor("#434343") // Dark grey 4

    // Conditional highlighting for tie wins
    const compColumn = sheet.getRange("A4:A")
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COUNTIF($A$4:$A, A4)>1')
      .setBold(true)
      .setRanges([compColumn])
      .build()
    sheet.setConditionalFormatRules([rule])

    return sheet
  },

  /**
   * Sets up and formats the "Leaderboard" sheet with formulas.
   * @private
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The active spreadsheet.
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} The newly created Leaderboard sheet.
   */
  setupLeaderboardSheet_: function (ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = ss.insertSheet("Leaderboard", 0)

    // Header at row 3
    const headerRange = sheet.getRange("A3:B3")
    headerRange.setValues([["User", "Wins"]])

    headerRange.setFontWeight("bold")
    headerRange.setBackground("#055fb7")
    headerRange.setFontColor("white")
    sheet.setFrozenRows(3)

    const formula = `=LET(
  ids, 'Competitions'!C4:C, 
  uids, UNIQUE(FILTER(ids, ids<>"")), 
  urls, XLOOKUP(uids, 'Competitions'!C:C, 'Competitions'!D:D, "", 0, -1), 
  names, XLOOKUP(uids, 'Competitions'!C:C, 'Competitions'!B:B, "", 0, -1), 
  counts, COUNTIF(ids, uids), 
  HSTACK(HYPERLINK(urls, names), counts)
)`
    sheet.getRange("A4").setFormula(formula)

    const bandingRange = sheet.getRange("A4:B")
    bandingRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)

    const userColumn = sheet.getRange("A4:A")
    userColumn.setFontColor("#434343") // Dark grey 4

    return sheet
  },
}
