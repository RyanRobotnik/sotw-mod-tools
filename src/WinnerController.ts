import { UrlService } from './services/UrlService'
import { BadgeService } from './services/BadgeService'
import { SuccessCard } from './components/SuccessCard'

export const WinnerController = {
  processSubmission: function (compNum: number, profileUrl: string) {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const compDataSheet = ss.getSheetByName("Competition Data") || this.setupCompetitionDataSheet(ss)

    if (!UrlService.isValidProfileUrl(profileUrl)) {
      throw new Error("Invalid Arqade profile URL")
    }

    const { userId, userName, normalisedUrl } = UrlService.extractProfileData(profileUrl)

    // Input Validation: Duplicate (A user can only win the same competition once)
    const data = compDataSheet.getDataRange().getValues()
    const isDuplicate = data.some(row =>
      row[0].toString() === compNum.toString() && row[2].toString() === userId.toString()
    )

    if (isDuplicate) {
      throw new Error(`${userName} is already logged against Competition #${compNum}`)
    }

    // Persist data (write row to Sheet)
    compDataSheet.appendRow([compNum, userName, userId, normalisedUrl, new Date()])

    // Calculate Status
    const totalWins = this.getWinCount(compDataSheet, userId)
    const badges = BadgeService.getBadgesToAward(totalWins)

    // Render SuccessCard Component
    const card = new SuccessCard(userName, userId, totalWins, badges)

    return {
      html: card.render(),
      nextCompNum: this.getNextCompNumber()
    }
  },

  getNextCompNumber: function () {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Competition Data")
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

  setupCompetitionDataSheet: function (ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = ss.insertSheet("Competition Data")
    sheet.appendRow(["Comp #", "User Name", "User ID", "Profile URL", "Timestamp"])

    // Header Formatting
    const header = sheet.getRange("1:1")
    header.setFontWeight("bold")
    header.setFontSize(12)

    // Conditional Formatting
    const range = sheet.getRange("A2:A")
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COUNTIF($A$2:$A, A2)>1')
      .setBold(true)
      .setRanges([range])
      .build()
    sheet.setConditionalFormatRules([rule])

    return sheet
  }
}

