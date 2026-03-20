/** @OnlyCurrentDoc */

/**
 * The entry point for the Google Sheets add-on. It creates the custom menu item in the Google Sheets UI that allows
 * users with edit privileges to access the SotW (Screenshot of the Week) Moderator Tools. 
 */
function onOpen () {
  SpreadsheetApp.getUi().createMenu('🔷 SotW Moderator Tools')
    .addItem('🏆 Add Winner', 'showSidebar')
    .addToUi()
}

function showSidebar () {
  const template = HtmlService.createTemplateFromFile('MainSidebar')

  // Inject initial state
  template.nextCompNum = WinnerController.getNextCompNumber()

  const html = template.evaluate()
    .setTitle('SotW Moderator Tools')
    .setWidth(300)

  SpreadsheetApp.getUi().showSidebar(html)
}

/**
 * Google Apps Script (GAS) doesn't support ES modules (import/export syntax), so we assign functions to the global
 * 'this' (which is the GAS Global scope). This tells ESLint "someone is using this", so it doesn't mark it as unused,
 * and maintains it as a top-level function for GAS.
 */
(globalThis as GlobalThis).onOpen = onOpen;
(globalThis as GlobalThis).showSidebar = showSidebar