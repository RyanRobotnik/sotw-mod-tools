import { WinnerController } from './WinnerController'

/**
 * @OnlyCurrentDoc
 * The entry point for the Google Sheets add-on. It creates the custom menu item in the Google Sheets UI that allows
 * users with edit privileges to access the SotW (Screenshot of the Week) Moderator Tools. 
 */
function onOpen () {
  SpreadsheetApp.getUi().createMenu('🔷 Moderator Tools')
    .addItem('🏆 Add Winner', 'showWinnerSidebar')
    .addToUi()
}

function showWinnerSidebar () {
  const template = HtmlService.createTemplateFromFile('WinnerSidebar')

  // Inject initial state
  template.nextCompNum = WinnerController.getNextCompNumber()

  const html = template.evaluate()
    .setTitle('Moderator Tools')
    .setWidth(300)

  SpreadsheetApp.getUi().showSidebar(html)
}

function processWinnerFormSubmit (compNum: number, profileUrl: string) {
  return WinnerController.processSubmission(compNum, profileUrl)
}

// Expose to GAS
interface GasGlobal {
  onOpen: typeof onOpen
  showWinnerSidebar: typeof showWinnerSidebar
  processWinnerFormSubmit: typeof processWinnerFormSubmit
}

declare const global: GasGlobal
global.onOpen = onOpen
global.showWinnerSidebar = showWinnerSidebar
global.processWinnerFormSubmit = processWinnerFormSubmit
