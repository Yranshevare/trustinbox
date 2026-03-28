import Browser from 'webextension-polyfill';

Browser.runtime.onInstalled.addListener(() => {
  console.log('Welcome to TrustInBox extension!');

  Browser.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open TrustInBox',
    contexts: ['page'],
  });
});

Browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'openSidePanel' && tab?.id) {
    // @ts-expect-error sidePanel exists in Chrome
    await Browser.sidePanel.open({ tabId: tab.id });
  }
});

Browser.action.onClicked.addListener((tab) => {
  // @ts-expect-error sidePanel exists in Chrome
  Browser.sidePanel.open({ tabId: tab.id });
});

Browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url?.includes('mail.google.com') && changeInfo.status === 'complete') {
    Browser.action.setBadgeText({ tabId, text: '📧' });
  } else {
    Browser.action.setBadgeText({ tabId, text: '' });
  }
});
