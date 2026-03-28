/**
 * Development entry point for content script.
 * Gmail email extractor - extracts sender, subject, body and links
 */

(() => {
  function extractEmailDetails(): {
    senderEmail: string;
    subject: string;
    body: string;
    links: string[];
  } | null {
    try {
      const getText = (el: Element | Document, selector: string) => {
        const el2 = el.querySelector(selector);
        return el2?.textContent?.trim() || '';
      };

      const getAttr = (el: Element | Document, selector: string, attr: string) => {
        const el2 = el.querySelector(selector);
        return el2?.getAttribute(attr) || '';
      };

      const emailContainer = document.querySelector('[data-message-id]') || document.body;

      const senderEmail = (
        getAttr(emailContainer, '[data-email]', 'data-email') ||
        getAttr(emailContainer, '.gD', 'email') ||
        getText(emailContainer, '.gD') ||
        getText(emailContainer, '[rel="im"]')
      ).replace(/^.*<|>.*$/g, '').trim();

      const subject = (
        getText(emailContainer, 'h2[data-thread-id]') ||
        getText(emailContainer, '.hP') ||
        getText(emailContainer, '[role="heading"]')
      );

      const bodyElement =
        document.querySelector('[data-message-id] [role="presentation"]') ||
        document.querySelector('.a3s.aiL') ||
        emailContainer;

      const body = bodyElement?.textContent?.trim() || '';

      const links = Array.from(emailContainer.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((href): href is string => !!href && href.startsWith('http'));

      return { senderEmail, subject, body, links };
    } catch (error) {
      console.error('Error extracting email:', error);
      return null;
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractEmailDetails') {
      const result = extractEmailDetails();
      sendResponse({ success: !!result, data: result });
    }
  });
})();
