// @ts-nocheck
console.log("TrustInBox content script loaded");

let sidebarOpen = false;
let currentAnalysis = null;

function extractEmailContent() {
  const subject = document.querySelector("h2.hP")?.textContent || "";

  const senderElement =
    document.querySelector(".gD") || document.querySelector("[data-email]");
  const sender =
    senderElement?.textContent ||
    senderElement?.getAttribute("data-email") ||
    "";

  const bodyElement =
    document.querySelector(".a3s") ||
    document.querySelector("#message_body") ||
    document.querySelector(".ii.gt");
  const body = bodyElement?.textContent || "";
  const bodyHtml = bodyElement?.innerHTML || "";

  const emailDate = document.querySelector(".g3")?.textContent || "";

  return { subject, sender, body, bodyHtml, date: emailDate };
}

function createSidebar() {
  const existingSidebar = document.getElementById("trustinbox-sidebar");
  if (existingSidebar) return existingSidebar;

  const sidebar = document.createElement("div");
  sidebar.id = "trustinbox-sidebar";
  sidebar.innerHTML = `
    <div class="trustinbox-sidebar-header">
      <div class="trustinbox-logo">
        <span class="trustinbox-icon">🛡️</span>
        <span>TrustInBox</span>
      </div>
      <button id="trustinbox-close" class="trustinbox-btn-icon">×</button>
    </div>
    <div class="trustinbox-sidebar-content" id="trustinbox-content">
      <div class="trustinbox-loading" id="trustinbox-loading">
        <div class="trustinbox-spinner"></div>
        <p>Analyzing email...</p>
      </div>
    </div>
    <div class="trustinbox-sidebar-footer">
      <button id="trustinbox-analyze" class="trustinbox-btn-primary">
        🔍 Analyze Email
      </button>
    </div>
  `;

  document.body.appendChild(sidebar);

  sidebar.querySelector("#trustinbox-close")?.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOpen = false;
  });

  sidebar
    .querySelector("#trustinbox-analyze")
    ?.addEventListener("click", async () => {
      await analyzeCurrentEmail();
    });

  return sidebar;
}

async function analyzeCurrentEmail() {
  const loading = document.getElementById("trustinbox-loading");
  const content = document.getElementById("trustinbox-content");

  if (!loading || !content) return;

  loading.style.display = "flex";
  content.innerHTML = "";
  content.appendChild(loading);

  try {
    const emailData = extractEmailContent();

    if (!emailData.body && !emailData.bodyHtml) {
      throw new Error("Could not extract email content");
    }

    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "ANALYZE_EMAIL", emailData },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        },
      );
    });

    if (response.success) {
      currentAnalysis = response.result;
      displayAnalysisResult(response.result);
    } else {
      throw new Error(response.error || "Analysis failed");
    }
  } catch (error) {
    displayError(error.message);
  }
}

function displayAnalysisResult(result) {
  const content = document.getElementById("trustinbox-content");
  if (!content) return;

  const riskLevel = result.riskLevel || "unknown";
  const riskClass =
    riskLevel === "high"
      ? "risk-high"
      : riskLevel === "medium"
        ? "risk-medium"
        : "risk-low";

  content.innerHTML = `
    <div class="trustinbox-result ${riskClass}">
      <div class="trustinbox-risk-badge">
        <span class="risk-indicator"></span>
        <span class="risk-text">${riskLevel.toUpperCase()} RISK</span>
      </div>
      
      <div class="trustinbox-score">
        <div class="score-circle" style="--score: ${result.score || 0}">
          <span>${result.score || 0}</span>
        </div>
        <p>Phishing Score</p>
      </div>

      ${
        result.threats && result.threats.length > 0
          ? `
        <div class="trustinbox-threats">
          <h4>⚠️ Detected Threats</h4>
          <ul>
            ${result.threats.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        result.recommendations
          ? `
        <div class="trustinbox-recommendations">
          <h4>💡 Recommendations</h4>
          <p>${result.recommendations}</p>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function displayError(message) {
  const content = document.getElementById("trustinbox-content");
  if (!content) return;

  content.innerHTML = `
    <div class="trustinbox-error">
      <p>❌ ${message}</p>
      <button id="trustinbox-retry" class="trustinbox-btn-secondary">Retry Analysis</button>
    </div>
  `;

  content
    .querySelector("#trustinbox-retry")
    ?.addEventListener("click", analyzeCurrentEmail);
}

function toggleSidebar() {
  const sidebar =
    document.getElementById("trustinbox-sidebar") || createSidebar();

  if (!sidebarOpen) {
    sidebar.classList.add("open");
    sidebarOpen = true;

    const authStatus = chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" });
    if (authStatus?.isAuthenticated) {
      analyzeCurrentEmail();
    }
  } else {
    sidebar.classList.remove("open");
    sidebarOpen = false;
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.classList?.contains("a3s") || el.querySelector?.(".a3s")) {
            console.log("Email content loaded");
          }
        }
      }
    }
  }
});

function init() {
  const toolbar =
    document.querySelector(".aJV") ||
    document.querySelector('[role="navigation"]');

  if (toolbar) {
    const button = document.createElement("button");
    button.id = "trustinbox-toggle";
    button.className = "trustinbox-toolbar-btn";
    button.innerHTML = "🛡️";
    button.title = "TrustInBox Phishing Detection";
    button.addEventListener("click", toggleSidebar);

    const existingBtn = toolbar.querySelector("#trustinbox-toggle");
    if (!existingBtn) {
      toolbar.insertBefore(button, toolbar.firstChild);
    }
  }

  createSidebar();

  document.addEventListener("click", (e) => {
    const emailRow = e.target.closest("tr.zA");
    if (emailRow) {
      currentAnalysis = null;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

observer.observe(document.body, { childList: true, subtree: true });
