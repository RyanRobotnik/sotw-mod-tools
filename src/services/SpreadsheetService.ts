const SHEET_CONFIG = {
  HEADER_ROW_INDEX: 3,
  HEADER_HEIGHT: 35,
  HEADER_WEIGHT: "bold",
  DATA_ROW_HEIGHT: 28,
  COLORS: {
    HEADER_BG: "#055fb7",
    HEADER_FONT: "white",
    USER_FONT: "#434343",
    BRONZE: "#d19b4f",
    SILVER: "#d9d9d9",
    GOLD: "#ffe07a"
  },
  BANDING_THEME: SpreadsheetApp.BandingTheme.LIGHT_GREY
}

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
    const nextRow = sheet.getLastRow() + 1
    const userHyperlink = `=HYPERLINK(D${nextRow}, E${nextRow})`
    sheet.appendRow([compNum, userHyperlink, userId, profileUrl, userName, "Active"])

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

    const headerRange = sheet.getRange("A3:F3")
    headerRange.setValues([["Competition #", "Winner", "User ID", "Profile URL", "Name", "Status"]])

    // Header Formatting
    headerRange.setFontWeight(SHEET_CONFIG.HEADER_WEIGHT as GoogleAppsScript.Spreadsheet.FontWeight)
    headerRange.setBackground(SHEET_CONFIG.COLORS.HEADER_BG)
    headerRange.setFontColor(SHEET_CONFIG.COLORS.HEADER_FONT)
    sheet.setFrozenRows(SHEET_CONFIG.HEADER_ROW_INDEX)
    sheet.setRowHeight(SHEET_CONFIG.HEADER_ROW_INDEX, SHEET_CONFIG.HEADER_HEIGHT) // Header slightly taller
    sheet.setRowHeights(SHEET_CONFIG.HEADER_ROW_INDEX + 1, sheet.getMaxRows() - SHEET_CONFIG.HEADER_ROW_INDEX, SHEET_CONFIG.DATA_ROW_HEIGHT) // data rows height

    // Hide the User ID, Profile URL, Name, and Status columns
    sheet.hideColumns(3, 4)

    // Table Styling
    const range = sheet.getRange("A3:F")
    range.createFilter()

    const dataRange = sheet.getRange("A4:F")
    dataRange.applyRowBanding(SHEET_CONFIG.BANDING_THEME, false, false)
    dataRange.setVerticalAlignment("middle")

    const userColumn = sheet.getRange("B4:B")
    userColumn.setFontColor(SHEET_CONFIG.COLORS.USER_FONT) // Dark grey 4

    // Conditional highlighting for tie wins
    const compColumn = sheet.getRange("A4:A")
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COUNTIF($A$4:$A, A4)>1')
      .setBold(true)
      .setBackground("#a4c2f4")
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
    const headerRange = sheet.getRange("A3:E3")
    headerRange.setValues([["ID", "User", "Bronze", "Silver", "Gold"]])

    headerRange.setFontWeight(SHEET_CONFIG.HEADER_WEIGHT as GoogleAppsScript.Spreadsheet.FontWeight)
    headerRange.setBackground(SHEET_CONFIG.COLORS.HEADER_BG)
    headerRange.setFontColor(SHEET_CONFIG.COLORS.HEADER_FONT)
    sheet.setFrozenRows(SHEET_CONFIG.HEADER_ROW_INDEX)
    sheet.setRowHeight(SHEET_CONFIG.HEADER_ROW_INDEX, SHEET_CONFIG.HEADER_HEIGHT) // Header slightly taller
    sheet.setRowHeights(SHEET_CONFIG.HEADER_ROW_INDEX + 1, sheet.getMaxRows() - SHEET_CONFIG.HEADER_ROW_INDEX, SHEET_CONFIG.DATA_ROW_HEIGHT) // data rows height

    // Hide ID column
    sheet.hideColumns(1)

    // ID Column (A) - Unique IDs from Competitions, excluding Deleted, Sorted by Name
    sheet.getRange("A4").setFormula(`=LET(uids, UNIQUE(FILTER('Competitions'!C4:C, 'Competitions'!C4:C<>"", 'Competitions'!F4:F<>"Deleted")), names, MAP(uids, LAMBDA(id, XLOOKUP(id, 'Competitions'!C:C, 'Competitions'!E:E))), sorted, SORT({uids, names}, 2, TRUE), INDEX(sorted, 0, 1))`)
    // User Column (B) - Hyperlink using ID lookup
    sheet.getRange("B4").setFormula(`=MAP(A4:A, LAMBDA(uid, IF(uid="", "", HYPERLINK(XLOOKUP(uid, 'Competitions'!C:C, 'Competitions'!D:D), XLOOKUP(uid, 'Competitions'!C:C, 'Competitions'!E:E)))))`)
    // Wins/Bronze Column (C) - Count active wins by ID
    sheet.getRange("C4").setFormula(`=MAP(A4:A, LAMBDA(uid, IF(uid="", "", COUNTIFS('Competitions'!C:C, uid, 'Competitions'!F:F, "<>Deleted"))))`)
    // Silver Column (D)
    sheet.getRange("D4").setFormula(`=MAP(C4:C, LAMBDA(wins, IF(OR(wins="", wins<5), "", FLOOR(wins/5))))`)
    // Gold Column (E)
    sheet.getRange("E4").setFormula(`=MAP(C4:C, LAMBDA(wins, IF(OR(wins="", wins<10), "", FLOOR(wins/10))))`)

    const dataRange = sheet.getRange("A4:E")
    dataRange.applyRowBanding(SHEET_CONFIG.BANDING_THEME, false, false)
    dataRange.setVerticalAlignment("middle")

    const userColumn = sheet.getRange("B4:B")
    userColumn.setFontColor(SHEET_CONFIG.COLORS.USER_FONT)

    // Conditional Formatting for Bronze, Silver, Gold
    const bronzeRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=C4<>""')
      .setBold(true)
      .setBackground(SHEET_CONFIG.COLORS.BRONZE)
      .setRanges([sheet.getRange("C4:C")])
      .build()

    const silverRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=D4<>""')
      .setBold(true)
      .setBackground(SHEET_CONFIG.COLORS.SILVER)
      .setRanges([sheet.getRange("D4:D")])
      .build()

    const goldRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=E4<>""')
      .setBold(true)
      .setBackground(SHEET_CONFIG.COLORS.GOLD)
      .setRanges([sheet.getRange("E4:E")])
      .build()

    sheet.setConditionalFormatRules([bronzeRule, silverRule, goldRule])

    return sheet
  },
}
