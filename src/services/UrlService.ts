export const UrlService = {
  _baseUrl: "https://gaming.stackexchange.com/",
  // Regex matches valid Arqade/GamingSE profile URLs and captures ID and Username
  _profileRegex: /^https?:\/\/(?:gaming\.(?:meta\.)?stackexchange|(?:meta\.)?arqade)\.com\/users\/(\d+)\/([^/?#]+)/i,

  /**
   * Validates if the provided URL is a valid Arqade / Gaming Stack Exchange profile URL.
   *
   * @param url The URL to validate.
   * @returns `true` if the URL is valid, `false` otherwise.
   */
  isValidProfileUrl: function (url: string): boolean {
    return this._profileRegex.test(url)
  },

  /**
   * Extracts user information from a valid profile URL.
   *
   * @param url The profile URL to extract data from.
   * @returns An object containing the user ID, formatted user name, and a normalised profile URL.
   * @throws Error if the URL is not valid.
   */
  extractProfileData: function (url: string): { userId: string; userName: string; normalisedUrl: string } {
    const match = url.match(this._profileRegex)

    if (!match) {
      throw new Error("Invalid Arqade profile URL")
    }

    const userId = match[1]
    const rawUserName = match[2]
    const userName = rawUserName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const normalisedUrl = `${this._baseUrl}users/${userId}/${rawUserName}`

    return { userId, userName, normalisedUrl }
  },

  /**
   * Generates an admin link for granting a community badge to a user.
   *
   * @param userId The ID of the user.
   * @returns The admin URL.
   */
  getAdminLink: function (userId: string): string {
    return `${this._baseUrl}admin/grant-community-badge?userId=${userId}`
  }
}