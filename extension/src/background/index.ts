import Browser from 'webextension-polyfill';

Browser.runtime.onInstalled.addListener(() => {
  console.log('Welcome to chrome ext starter. have a nice day!');
});

Browser.action.onClicked.addListener((tab) => {
  //@ts-expect-error
  Browser.sidePanel.open({ tabId: tab.id });
});

Browser.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (!details.url.includes('mail.google.com')) return;

  const url = details.url;
  if (url.includes('/inbox/') || url.includes('/d/') || url.includes('#inbox/') || url.includes('#d/')) {
    setTimeout(async () => {
      try {
        const sidePanel = chrome.sidePanel as { open: (options: { tabId: number }) => Promise<void> };
        await sidePanel.open({ tabId: details.tabId });
      } catch (e) {
        console.error('Failed to open side panel:', e);
      }
    }, 1000);
  }
});
