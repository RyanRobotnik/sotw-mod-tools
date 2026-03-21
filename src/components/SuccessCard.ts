import { UrlService } from "../services/UrlService"

/**
 * Represents the view model for the Success Confirmation Card.
 * Handles the logic for background colors and badge lists before rendering.
 */
export class SuccessCard {
  private userName: string
  private userId: string
  private winCount: number
  private badges: string[]

  constructor(userName: string, userId: string, winCount: number, badges: string[]) {
    this.userName = userName
    this.userId = userId
    this.winCount = winCount
    this.badges = badges
  }

  /**
   * Renders the SuccessCard HTML template with the current data.
   */
  render (): string {
    const template = HtmlService.createTemplateFromFile('SuccessCard')

    template.name = this.userName
    template.count = this.winCount
    template.badges = this.badges
    template.link = UrlService.getAdminLink(this.userId)
    template.bgColor = this.badges.length > 1 ? '#fff9c4' : '#e6f4ea'

    return template.evaluate().getContent()
  }
}