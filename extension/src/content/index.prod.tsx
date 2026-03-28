// Gmail email extractor
(() => {
  function extractEmailDetails() {
    try {
      const emailSelectors = [
        '[data-message-id] [role="presentation"]',
        '.a3s.aiL',
        '[role="main"] [role="article"]',
        '[data-message-id]',
        '.gs',
        '[itemprop="description"]'
      ];

      let emailElement = null;
      for (const selector of emailSelectors) {
        emailElement = document.querySelector(selector);
        if (emailElement && emailElement.textContent?.trim()) {
          break;
        }
      }

      if (!emailElement) {
        emailElement = document.body;
      }

      const clonedElement = emailElement.cloneNode(true) as Element;

      const styles = clonedElement.querySelectorAll('style');
      styles.forEach((style) => { style.remove(); });

      const scripts = clonedElement.querySelectorAll('script');
      scripts.forEach((script) => { script.remove(); });

      const linkTags = clonedElement.querySelectorAll('link[rel="stylesheet"]');
      linkTags.forEach((link) => { link.remove(); });

      const body = clonedElement.textContent?.trim() || "";

      const links: string[] = [];
      const anchorLinks = clonedElement.querySelectorAll('a[href]');
      anchorLinks.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          links.push(href);
        }
      });

      let senderEmail = "";
      const senderElement = document.querySelector('[data-email]');
      if (senderElement) {
        senderEmail = senderElement.getAttribute('data-email') || "";
      }
      if (!senderEmail) {
        const fromElements = document.querySelectorAll('[name="from"]');
        for (const el of fromElements) {
          const value = el.getAttribute('value');
          if (value && value.includes('@')) {
            senderEmail = value;
            break;
          }
        }
      }
      if (!senderEmail) {
        const fromDivs = document.querySelectorAll('div[dir="ltr"]');
        for (const div of fromDivs) {
          const text = div.textContent || "";
          const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            senderEmail = emailMatch[0];
            break;
          }
        }
      }

      let subject = "";
      const subjectElement = document.querySelector('[data-subject]');
      if (subjectElement) {
        subject = subjectElement.getAttribute('data-subject') || "";
      }
      if (!subject) {
        const h1 = document.querySelector('h1');
        if (h1) subject = h1.textContent || "";
      }
      if (!subject) {
        const title = document.querySelector('title');
        if (title) subject = title.textContent || "";
      }

      return {
        senderEmail,
        subject,
        body,
        links,
      };
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
