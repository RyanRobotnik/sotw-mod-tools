import { UrlService } from './services/UrlService'
import { BadgeService } from './services/BadgeService'
import { SpreadsheetService } from './services/SpreadsheetService'
import { SuccessCard } from './components/SuccessCard'

export const WinnerController = {
  processSubmission: function (compNum: number, profileUrl: string) {
    if (!UrlService.isValidProfileUrl(profileUrl)) {
      throw new Error("Invalid Arqade profile URL")
    }

    const { userId, userName, normalisedUrl } = UrlService.extractProfileData(profileUrl)

    if (SpreadsheetService.isDuplicateEntry(compNum, userId)) {
      throw new Error(`${userName} is already logged against Competition #${compNum}`)
    }

    SpreadsheetService.addWinner(compNum, userName, userId, normalisedUrl)

    // Calculate Status
    const usersTotalWins = SpreadsheetService.getWinCountForUser(userId)
    const badges = BadgeService.getBadgesToAward(usersTotalWins)

    return {
      html: new SuccessCard(userName, userId, usersTotalWins, badges).render()
    }
  },

  getNextCompNumber: function () {
    return SpreadsheetService.getNextCompNumber()
  }
}

