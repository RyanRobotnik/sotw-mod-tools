import { WinnerController } from './WinnerController'

/**
 * The entry point for the Google Sheets add-on. It creates the custom menu item in the Google Sheets UI that allows
 * users with edit privileges to access the SotW (Screenshot of the Week) Moderator Tools. 
 */
function onOpen () {
  SpreadsheetApp.getUi().createMenu('🔷 Moderator Tools')
    .addItem('🏆 Add Winner', 'showSidebar')
    .addToUi()
}

function showSidebar () {
  const template = HtmlService.createTemplateFromFile('Sidebar')

  // Inject initial state
  template.nextCompNum = WinnerController.getNextCompNumber()

  const html = template.evaluate()
    .setTitle('Moderator Tools')
    .setWidth(300)

  SpreadsheetApp.getUi().showSidebar(html)
}

function processFromSidebar (compNum: number, profileUrl: string) {
  return WinnerController.processSubmission(compNum, profileUrl)
}

// Expose to GAS
interface GasGlobal {
  onOpen: typeof onOpen
  showSidebar: typeof showSidebar
  processFromSidebar: typeof processFromSidebar
}

declare const global: GasGlobal
global.onOpen = onOpen
global.showSidebar = showSidebar
global.processFromSidebar = processFromSidebar
