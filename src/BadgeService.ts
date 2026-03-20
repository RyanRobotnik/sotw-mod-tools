const BadgeService = {
  BADGES: {
    BRONZE: "🥉 Screenshotter",
    SILVER: "🥈 Screenthusiast",
    GOLD: "🥇 Screenarcher"
  },

  getBadgesToAward: function(totalWins:number): string[] {
    const toAward = [this.BADGES.BRONZE]; // Always award Bronze
    
    if (totalWins % 5 === 0) toAward.push(this.BADGES.SILVER);
    if (totalWins % 10 === 0) toAward.push(this.BADGES.GOLD);
    
    return toAward;
  }
};