/**
 * User: jeshan
 * Date: 09/03/14
 * Time: 12:02
 */

/**
 * Receive button click event
 */
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendMessage(tab.id, {"action": "initSlideshow"});
});
