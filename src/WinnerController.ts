import { UrlService } from './services/UrlService'
import { BadgeService } from './services/BadgeService'
import { SuccessCard } from './components/SuccessCard'

export const WinnerController = {
  processSubmission: function (compNum: number, profileUrl: string) {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const rawDataSheet = ss.getSheetByName("Raw Data") || this.setupRawDataSheet(ss)

    const { userId, userName } = UrlService.parseProfileUrl(profileUrl)

    // Input Validation: Duplicate (A user can only win the same competition once)
    const data = rawDataSheet.getDataRange().getValues()
    const isDuplicate = data.some(row =>
      row[0].toString() === compNum.toString() &&
      row[2].toString() === userId.toString()
    )

    if (isDuplicate) {
      throw new Error(`${userName} is already logged for Comp #${compNum}`)
    }

    // Persist data (write row to Sheet)
    rawDataSheet.appendRow([compNum, userName, userId, profileUrl, new Date()])

    // Calculate Status
    const totalWins = this.getWinCount(rawDataSheet, userId)
    const badges = BadgeService.getBadgesToAward(totalWins)

    // Render SuccessCard Component
    const card = new SuccessCard(userName, userId, totalWins, badges)

    return {
      html: card.render(),
      nextCompNum: this.getNextCompNumber()
    }
  },

  getNextCompNumber: function () {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Raw Data")
    if (!sheet) return 1
    const data = sheet.getDataRange().getValues()
    if (data.length <= 1) return 1

    const compNumbers = data.slice(1).map(row => Number(row[0])).filter(n => !isNaN(n))
    const maxNum = Math.max(...compNumbers)
    return maxNum > 0 ? maxNum + 1 : 1
  },

  getWinCount: function (sheet: GoogleAppsScript.Spreadsheet.Sheet, userId: string): number {
    const data = sheet.getDataRange().getValues()
    return data.filter(row => row[2].toString() === userId.toString()).length
  },

  setupRawDataSheet: function (ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = ss.insertSheet("Raw Data")
    sheet.appendRow(["Comp #", "User Name", "User ID", "Profile URL", "Timestamp"])
    sheet.getRange("1:1").setFontWeight("bold")
    return sheet
  }
}

