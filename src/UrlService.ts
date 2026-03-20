const UrlService = {
  parseProfileUrl: function(url: string): { userId: string; userName: string } {
    const regex = /\/users\/(\d+)\/([^\/?]+)/;
    const match = url.match(regex);
    if (!match) {
      throw new Error("Invalid URL format");
    }

    const userId = match[1];
    const userName = match[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return { userId, userName };
  },

  getAdminLink: function(userId: string): string {
    return `https://gaming.stackexchange.com/admin/grant-community-badge?userId=${userId}`;
  }
};