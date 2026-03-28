// Gmail email extractor and side panel trigger
(() => {
  function extractEmailDetails() {
    try {
      // 1. Get Subject - Targeting Gmail's specific H2 or data attributes
      let subject = "";
      const subjectSelectors = [
        'h2.hP', // Gmail's main subject line class
        '[data-subject]',
        'h1'
      ];
      for (const sel of subjectSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent?.trim()) {
          subject = el.textContent.trim();
          // Filter out junk if it contains common Gmail UI words
          if (subject.toLowerCase().includes('search') && subject.toLowerCase().includes('gemini')) continue;
          break;
        }
      }

      // 2. Get Sender Email
      let senderEmail = "";
      const senderSelectors = [
        'span[email]', // Gmail specific attribute
        '[data-hovercard-id]', // Often contains the email
        '[data-email]',
        'span.gD' // Common sender name/email container
      ];
      for (const sel of senderSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          senderEmail = el.getAttribute('email') || el.getAttribute('data-hovercard-id') || el.getAttribute('data-email') || "";
          if (senderEmail && senderEmail.includes('@')) break;
          // Try text content if attributes fail
          const text = el.textContent || "";
          const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (match) { senderEmail = match[0]; break; }
        }
      }

      // 3. Get Email Body & Links
      const emailSelectors = [
        '[data-message-id] [role="presentation"]',
        '.a3s.aiL',
        '[role="main"] [role="article"]',
        '.gs'
      ];

      let emailElement = null;
      for (const selector of emailSelectors) {
        emailElement = document.querySelector(selector);
        if (emailElement && emailElement.textContent?.trim()) break;
      }

      if (!emailElement) emailElement = document.body;

      const clonedElement = emailElement.cloneNode(true) as Element;
      clonedElement.querySelectorAll('style, script, link').forEach(el => el.remove());

      const body = clonedElement.textContent?.trim() || "";
      const links: string[] = [];
      clonedElement.querySelectorAll('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          links.push(href);
        }
      });

      return { senderEmail, subject, body, links };
    } catch (error) {
      console.error('Error extracting email:', error);
      return null;
    }
  }

  function requestOpenSidePanel() {
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  }

  function attachClickListeners() {
    const rows = document.querySelectorAll('.zA:not(.trustinbox-listener-attached)');
    rows.forEach(row => {
      row.classList.add('trustinbox-listener-attached');
      row.addEventListener('click', () => {
        setTimeout(requestOpenSidePanel, 500);
      }, { capture: true });
    });
  }

  function checkGmailAndInit() {
    if (window.location.hostname.includes('mail.google.com')) {
      attachClickListeners();
    }
  }

  checkGmailAndInit();
  const observer = new MutationObserver(() => checkGmailAndInit());
  observer.observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractEmailDetails') {
      const result = extractEmailDetails();
      sendResponse({ success: !!result, data: result });
    }
  });
})();
