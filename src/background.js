var chrome = require('chrome');

var DEFAULT_SETTINGS = {
  dedup: true,
  priorityDomains: ['example.com'],
  blockedDomains: ['bad.example.com']
};

var tabData = {};
window.tabData = tabData;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(options) {
    chrome.storage.sync.set(options);
  });
});

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
  if (message === 'showAction') {
    chrome.pageAction.show(sender.tab.id);
  }
});

chrome.pageAction.onClicked.addListener(function (tab) {
  var linksPage = chrome.extension.getURL('html/links.html');
  var opener = tab;

  chrome.tabs.sendMessage(opener.id, 'getLinks', function(links) {
    chrome.tabs.create({
      index: tab.index + 1,
      openerTabId: opener.id,
      url: linksPage
    }, function (newTab) {
      tabData[newTab.id] = {
        source: opener.url,
        links: links
      };
    });
  });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  delete tabData[tabId];
});