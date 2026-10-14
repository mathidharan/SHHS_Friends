/**
 * School Friends Profile - Core Data & Application Manager
 * Includes 100% Free Google Sheets Two-Way Synchronization
 */

const STORAGE_KEY = 'school_friends_profiles_data_v1';
const THEME_KEY = 'sfp_theme_mode';
const GOOGLE_SHEET_KEY = 'sfp_google_sheet_url_v1';
const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxKGDkCxSE-_AfDyD5aot0Em6vfoGGDmHGcd7yBwFztLynUewW60KJiYAfKMijQGyVUtw/exec';

// Default seed records matching data.json
const DEFAULT_PROFILES = [
  {
    "id": "sfp-001",
    "name": "Rajaguru S",
    "gender": "Male",
    "dob": "1994-06-15",
    "occupationType": "Working",
    "currentJob": "HDFC Life Insurance",
    "jobDesignation": "Sr. CAM",
    "currentCity": "Salem",
    "workingSector": "Private",
    "bloodGroup": "O+",
    "willingToDonate": "Yes",
    "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "phone": "+91 98842 98181",
    "email": "",
    "registeredAt": "2026-10-10T10:30:00.000Z"
  },
  {
    "id": "sfp-002",
    "name": "Vinothkumar G",
    "gender": "Male",
    "dob": "1994-02-29",
    "occupationType": "Working",
    "currentJob": "Dolphin Food India Ltd",
    "jobDesignation": "Territory Sales Incharge",
    "currentCity": "Salem",
    "workingSector": "Private",
    "bloodGroup": "B+",
    "willingToDonate": "Yes",
    "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    "phone": "+91 90957 08567",
    "email": "",
    "registeredAt": "2026-10-10T11:15:00.000Z"
  },
  {
    "id": "sfp-003",
    "name": "Nandakumar D",
    "gender": "Male",
    "dob": "1994-06-15",
    "occupationType": "Working",
    "currentJob": "Kings Colleg of Engineering",
    "jobDesignation": "Assistant Professor",
    "currentCity": "Pudukkottai",
    "workingSector": "Private",
    "bloodGroup": "A+",
    "willingToDonate": "No",
    "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "phone": "+91 95974 84321",
    "email": "",
    "registeredAt": "2026-10-11T09:00:00.000Z"
  }
];

// Profile Manager
const ProfileManager = {
  _sheetFetchedOnce: false,

  // Get configured Google Apps Script Web App URL (hidden default for public use)
  getGoogleSheetUrl() {
    const stored = localStorage.getItem(GOOGLE_SHEET_KEY);
    if (stored && stored.trim()) {
      return stored.trim();
    }
    return DEFAULT_GOOGLE_SHEET_URL;
  },

  // Save or clear Google Apps Script Web App URL
  setGoogleSheetUrl(url) {
    if (!url || !url.trim()) {
      localStorage.removeItem(GOOGLE_SHEET_KEY);
    } else {
      localStorage.setItem(GOOGLE_SHEET_KEY, url.trim());
    }
    updateGoogleSheetNavBadge();
  },

  // Test connection to Google Apps Script Web App
  async testGoogleSheetConnection(url) {
    const targetUrl = (url && url.trim()) ? url.trim() : this.getGoogleSheetUrl();
    if (!targetUrl) {
      throw new Error('Google Apps Script URL is not configured');
    }
    const testUrl = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'action=getProfiles&_t=' + Date.now();
    const res = await fetch(testUrl);
    if (!res.ok) {
      throw new Error(`Google Apps Script responded with HTTP status ${res.status}`);
    }
    const json = await res.json();
    if (json && json.status === 'success') {
      return {
        success: true,
        count: Array.isArray(json.data) ? json.data.length : (json.count || 0)
      };
    }
    throw new Error(json.message || 'Unexpected response format from Google Apps Script');
  },

  // Fetch profiles directly from Google Sheet
  async fetchFromSheet() {
    const sheetUrl = this.getGoogleSheetUrl();
    if (!sheetUrl) return null;

    try {
      const urlWithParam = sheetUrl + (sheetUrl.includes('?') ? '&' : '?') + 'action=getProfiles&_t=' + Date.now();
      const response = await fetch(urlWithParam);
      if (response.ok) {
        const result = await response.json();
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          this._sheetFetchedOnce = true;
          // Normalize profiles to match internal schema and filter empty entries
          const normalized = result.data
            .filter(item => item && (item.name || '').trim().length > 0)
            .map(item => {
              // Normalize dob to YYYY-MM-DD format if it's a date string
              let dobFormatted = (item.dob || '').trim();
              if (dobFormatted) {
                const parsedDate = new Date(dobFormatted);
                if (!isNaN(parsedDate.getTime())) {
                  const yyyy = parsedDate.getFullYear();
                  const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
                  const dd = String(parsedDate.getDate()).padStart(2, '0');
                  dobFormatted = `${yyyy}-${mm}-${dd}`;
                }
              }

              const occType = item.occupationType || (item.workingSector === 'Self' ? 'Business' : 'Working');
              const isDonor = item.willingToDonate === 'Yes' || item.willingToDonate === true;

              return {
                id: item.id || ('sfp-' + Math.random().toString(36).substring(2, 7)),
                name: (item.name || '').trim(),
                gender: item.gender || 'Male',
                dob: dobFormatted,
                bloodGroup: (item.bloodGroup || '').trim(),
                willingToDonate: isDonor ? 'Yes' : 'No',
                occupationType: occType,
                currentJob: item.currentJob || item.businessName || '',
                jobDesignation: item.jobDesignation || '',
                companyName: item.companyName || '',
                businessName: item.businessName || (occType === 'Business' ? item.currentJob : ''),
                currentCity: item.currentCity || '',
                businessLocation: item.businessLocation || '',
                workingSector: item.workingSector || (occType === 'Business' ? 'Self' : 'Private'),
                businessCategory: item.businessCategory || '',
                businessWebsite: item.businessWebsite || '',
                phone: item.phone || '',
                email: item.email || '',
                photo: item.photo || ProfileManager.getDefaultAvatar(item.gender),
                registeredAt: item.registeredAt || new Date().toISOString()
              };
            });

          if (normalized.length > 0) {
            // Always update local storage with fresh Google Sheet data
            this.saveProfiles(normalized);
            return normalized;
          }
        }
      }
    } catch (sheetErr) {
      console.warn('Failed to load live data from Database, falling back to local cache:', sheetErr);
    }
    return null;
  },

  // Push new profile row to Google Sheet
  async syncToGoogleSheet(profilePayload) {
    const sheetUrl = this.getGoogleSheetUrl();
    if (!sheetUrl) return false;

    try {
      // POST with text/plain to prevent CORS preflight blocking in browsers
      await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(profilePayload)
      });
      return true;
    } catch (err) {
      // Secondary fallback with mode: no-cors
      try {
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(profilePayload)
        });
        return true;
      } catch (err2) {
        console.error('Database POST failed:', err2);
        return false;
      }
    }
  },

  // Load profiles from Google Sheet (if configured) or LocalStorage or seed / data.json
  async getProfiles(forceRefresh = false) {
    // If Google Sheet is linked and refresh requested or not yet loaded from remote
    const sheetUrl = this.getGoogleSheetUrl();
    if (sheetUrl && (forceRefresh || !this._sheetFetchedOnce)) {
      const remoteData = await this.fetchFromSheet();
      if (remoteData && remoteData.length > 0) {
        return remoteData;
      }
    }

    // Check LocalStorage cache
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => ({
            occupationType: item.occupationType || (item.workingSector === 'Self' ? 'Business' : 'Working'),
            businessName: item.businessName || (item.occupationType === 'Business' ? item.currentJob : ''),
            companyName: item.companyName || '',
            businessLocation: item.businessLocation || item.currentCity || '',
            ...item
          }));
        }
      } catch (e) {
        console.error('Error parsing stored profiles', e);
      }
    }

    // Try fetching from data.json if available via http server
    try {
      const response = await fetch('data.json');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveProfiles(data);
          return data;
        }
      }
    } catch (err) {
      // CORS or file:// protocol restriction; use built-in DEFAULT_PROFILES
    }

    // Fallback to embedded default data
    this.saveProfiles(DEFAULT_PROFILES);
    return DEFAULT_PROFILES;
  },

  // Save array to LocalStorage
  saveProfiles(profiles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    this.updateHeaderBadge(profiles.length);
  },

  // Add a single new profile (saves locally & syncs to Google Sheet)
  async addProfile(profileData) {
    const profiles = await this.getProfiles();
    const newProfile = {
      id: 'sfp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      registeredAt: new Date().toISOString(),
      photo: profileData.photo || this.getDefaultAvatar(profileData.gender),
      ...profileData
    };

    // Prepend to local list immediately for instant UI responsiveness
    profiles.unshift(newProfile);
    this.saveProfiles(profiles);

    // If Google Sheet is configured, send the record to Google Sheets
    const sheetUrl = this.getGoogleSheetUrl();
    if (sheetUrl) {
      this.syncToGoogleSheet(newProfile).then(success => {
        if (success) {
          showToast('☁️ Saved locally & stored in Database!', 'success');
        } else {
          showToast('Saved locally (Database sync failed)', 'warning');
        }
      });
    }

    return newProfile;
  },

  // Update existing profile
  async updateProfile(id, updatedFields) {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updatedFields };
      this.saveProfiles(profiles);
      return profiles[index];
    }
    return null;
  },

  // Delete profile
  async deleteProfile(id) {
    const profiles = await this.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    this.saveProfiles(filtered);
    return filtered;
  },

  // Default avatar fallback
  getDefaultAvatar(gender) {
    if (gender === 'Female') {
      return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
    } else if (gender === 'Male') {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  },

  // Export profiles as downloadable data.json file
  async exportToJsonFile() {
    const profiles = await this.getProfiles();
    const jsonStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded current profiles as data.json!', 'success');
  },

  // Update the count badge in the navigation bar
  async updateHeaderBadge(count) {
    const badge = document.getElementById('navProfileCount');
    if (badge) {
      if (typeof count === 'undefined') {
        const list = await this.getProfiles();
        badge.textContent = list.length;
      } else {
        badge.textContent = count;
      }
    }
  }
};

// Calculate age from date of birth
function calculateAge(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age > 0 ? `${age} yrs` : '';
}

// Format date nicely (e.g., "15 Jun 1994")
function formatDate(dobString) {
  if (!dobString) return 'N/A';
  try {
    const date = new Date(dobString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dobString;
  }
}

// Avatar Generator Helpers
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #4f46e5, #06b6d4)', // Indigo to Cyan
  'linear-gradient(135deg, #f59e0b, #ef4444)', // Amber to Red
  'linear-gradient(135deg, #10b981, #0ea5e9)', // Emerald to Sky
  'linear-gradient(135deg, #8b5cf6, #ec4899)', // Violet to Pink
  'linear-gradient(135deg, #3b82f6, #8b5cf6)', // Blue to Purple
  'linear-gradient(135deg, #f97316, #eab308)', // Orange to Yellow
  'linear-gradient(135deg, #14b8a6, #3b82f6)'  // Teal to Blue
];

function getAvatarInitials(name) {
  if (!name || !name.trim()) return 'SF';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(name, occupationType) {
  if (occupationType === 'Business') {
    return 'linear-gradient(135deg, #f59e0b, #d97706)'; // Gold/Amber for Business
  }
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-info-circle';
  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3600);
}

// Theme management (Dark / Light)
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggleBtn i');
  if (icon) {
    if (theme === 'light') {
      icon.className = 'fas fa-moon';
      icon.setAttribute('title', 'Switch to Dark Mode');
    } else {
      icon.className = 'fas fa-sun';
      icon.setAttribute('title', 'Switch to Light Mode');
    }
  }
}

// ==========================================================================
// Google Sheets UI & Modal Management
// ==========================================================================

function updateGoogleSheetNavBadge() {
  const btn = document.getElementById('googleSheetBtn');
  if (btn) btn.remove();
}

function injectGoogleSheetModal() {
  if (document.getElementById('googleSheetModal')) return;

  const modalHtml = `
    <div class="sheet-modal-backdrop" id="googleSheetModal" role="dialog" aria-modal="true" aria-labelledby="sheetModalTitle">
      <div class="sheet-modal-card">
        <div class="sheet-modal-header">
          <div class="sheet-modal-title" id="sheetModalTitle">
            <i class="fas fa-file-excel"></i>
            <span>Database Live Synchronization</span>
          </div>
          <button type="button" class="sheet-modal-close" id="closeSheetModalBtn" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sheet-modal-body">
          <!-- Status Banner -->
          <div class="sheet-status-box" id="sheetStatusBox">
            <div class="sheet-status-info">
              <span class="pulse-dot" id="modalStatusDot"></span>
              <div class="sheet-status-text">
                <h4 id="modalStatusTitle">Checking status...</h4>
                <p id="modalStatusSubtitle">Connect your Database to auto-store registrations and read data</p>
              </div>
            </div>
            <div id="modalStatusActions">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- Web App URL Input -->
          <div class="sheet-input-group">
            <label for="googleSheetUrlInput">
              <i class="fas fa-link" style="color: #10b981;"></i> Google Apps Script Web App URL
            </label>
            <div class="sheet-input-row">
              <input 
                type="url" 
                id="googleSheetUrlInput" 
                class="sheet-input" 
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                spellcheck="false"
              />
              <button type="button" class="btn btn-emerald btn-sm" id="saveSheetUrlBtn">
                <i class="fas fa-save"></i> Save & Test
              </button>
            </div>
            <span style="font-size: 0.78rem; color: var(--text-dim);">
              100% Free: Handled by Google Apps Script attached to your. No paid subscriptions needed.
            </span>
          </div>

          <!-- Step-by-step instructions accordion -->
          <div class="sheet-steps-accordion">
            <div class="sheet-steps-summary" id="toggleStepsBtn">
              <span><i class="fas fa-magic" style="color: #f59e0b;"></i> Quick 2-Minute Setup Instructions</span>
              <i class="fas fa-chevron-down" id="stepsChevron"></i>
            </div>
            <div class="sheet-steps-content" id="stepsContent" style="display: none;">
              <ol>
                <li>Open <strong><a href="https://sheets.google.com" target="_blank" style="color: #38bdf8;">Sheets</a></strong> and create a blank sheet.</li>
                <li>Click <strong>Extensions &gt; Apps Script</strong> in the top menu.</li>
                <li>Paste the script code below into the editor, replacing everything.</li>
                <li>Click the <strong>Save (💾)</strong> icon.</li>
                <li>Click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>.</li>
                <li>Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.</li>
                <li>Click <strong>Deploy</strong>, grant permission, copy the <strong>Web app URL</strong>, and paste it into the box above!</li>
              </ol>

              <div style="font-weight: 600; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <span>Apps Script Code:</span>
                <button type="button" class="btn-copy-code" id="copyAppsScriptBtn">
                  <i class="fas fa-copy"></i> Copy Code
                </button>
              </div>

              <div class="sheet-code-preview" id="appsScriptCodeSnippet">var HEADERS = [
  "id", "name", "gender", "dob", "bloodGroup", "willingToDonate",
  "occupationType", "jobDesignation", "currentJob", "companyName",
  "currentCity", "businessLocation", "workingSector", "businessCategory",
  "businessWebsite", "phone", "email", "photo", "registeredAt"
];

function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ status: "success", count: 0, data: [] });
    }
    var headers = data[0];
    var profiles = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[1]) continue;
      var profile = {};
      for (var j = 0; j < headers.length; j++) {
        var key = String(headers[j]).trim();
        var val = row[j];
        if (val instanceof Date) {
          val = (key === 'dob') ? Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd') : val.toISOString();
        }
        profile[key] = (val !== undefined && val !== null) ? String(val) : '';
      }
      profiles.push(profile);
    }
    return jsonResponse({ status: "success", count: profiles.length, data: profiles });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (err) { payload = e.parameter || {}; }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    var id = payload.id || ("sfp-" + new Date().getTime().toString(36));
    sheet.appendRow([
      id, payload.name || "", payload.gender || "", payload.dob || "",
      payload.bloodGroup || "", payload.willingToDonate === 'Yes' ? "Yes" : "No",
      payload.occupationType || "Working", payload.jobDesignation || "",
      payload.currentJob || payload.businessName || "", payload.companyName || "",
      payload.currentCity || "", payload.businessLocation || "",
      payload.workingSector || (payload.occupationType === "Business" ? "Self" : "Private"),
      payload.businessCategory || "", payload.businessWebsite || "",
      payload.phone || "", payload.email || "", payload.photo || "",
      payload.registeredAt || new Date().toISOString()
    ]);
    return jsonResponse({ status: "success", message: "Saved ", profileId: id });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4f46e5");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}</div>
            </div>
          </div>
        </div>

        <div class="sheet-modal-footer">
          <button type="button" class="btn btn-outline btn-sm" id="closeSheetModalBtn2">
            Close
          </button>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn btn-danger btn-sm" id="disconnectSheetBtn" style="display: none;">
              <i class="fas fa-unlink"></i> Disconnect Sheet
            </button>
            <button type="button" class="btn btn-emerald btn-sm" id="syncNowModalBtn">
              <i class="fas fa-sync-alt"></i> Pull Data from Sheet Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  attachModalEventListeners();
}

function attachModalEventListeners() {
  const modal = document.getElementById('googleSheetModal');
  const closeBtn1 = document.getElementById('closeSheetModalBtn');
  const closeBtn2 = document.getElementById('closeSheetModalBtn2');
  const toggleStepsBtn = document.getElementById('toggleStepsBtn');
  const stepsContent = document.getElementById('stepsContent');
  const stepsChevron = document.getElementById('stepsChevron');
  const saveBtn = document.getElementById('saveSheetUrlBtn');
  const urlInput = document.getElementById('googleSheetUrlInput');
  const disconnectBtn = document.getElementById('disconnectSheetBtn');
  const syncNowBtn = document.getElementById('syncNowModalBtn');
  const copyBtn = document.getElementById('copyAppsScriptBtn');

  if (closeBtn1) closeBtn1.addEventListener('click', closeGoogleSheetModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeGoogleSheetModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeGoogleSheetModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeGoogleSheetModal();
    }
  });

  if (toggleStepsBtn) {
    toggleStepsBtn.addEventListener('click', () => {
      const isVisible = stepsContent.style.display !== 'none';
      stepsContent.style.display = isVisible ? 'none' : 'block';
      stepsChevron.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      if (!url) {
        showToast('Please enter a Google Apps Script Web App URL', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

      try {
        const testRes = await ProfileManager.testGoogleSheetConnection(url);
        ProfileManager.setGoogleSheetUrl(url);
        showToast(`Connected successfully! Found ${testRes.count} profiles in sheet.`, 'success');
        refreshModalState();
        // If on profiles page, refresh directory
        if (typeof window.renderProfilesFromRemote === 'function') {
          window.renderProfilesFromRemote();
        }
      } catch (err) {
        // Even if direct GET encounters a CORS redirect warning, allow saving with guidance
        const userConfirm = confirm(`Could not verify URL directly (${err.message}). Save anyway? (Make sure deployment access is set to 'Anyone')`);
        if (userConfirm) {
          ProfileManager.setGoogleSheetUrl(url);
          showToast(' Sheet URL saved.', 'info');
          refreshModalState();
        }
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save & Test';
      }
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      if (confirm('Disconnect this Database? Local cached data will remain safe.')) {
        ProfileManager.setGoogleSheetUrl('');
        urlInput.value = '';
        showToast('Database disconnected.', 'info');
        refreshModalState();
      }
    });
  }

  if (syncNowBtn) {
    syncNowBtn.addEventListener('click', async () => {
      const sheetUrl = ProfileManager.getGoogleSheetUrl();
      if (!sheetUrl) {
        showToast('Please connect a Google Sheet URL first', 'error');
        return;
      }
      syncNowBtn.disabled = true;
      syncNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
      try {
        const data = await ProfileManager.fetchFromSheet();
        if (data) {
          showToast(`Synced ${data.length} profiles!`, 'success');
          if (typeof window.renderProfilesFromRemote === 'function') {
            window.renderProfilesFromRemote();
          }
        } else {
          showToast('No new data retrieved', 'info');
        }
      } catch (e) {
        showToast('Sync failed: ' + e.message, 'error');
      } finally {
        syncNowBtn.disabled = false;
        syncNowBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Pull Data from Sheet Now';
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      // Fetch full script or fallback to snippet
      const fullScript = document.getElementById('appsScriptCodeSnippet').innerText;
      navigator.clipboard.writeText(fullScript).then(() => {
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
        }, 2000);
      });
    });
  }
}

function refreshModalState() {
  const url = ProfileManager.getGoogleSheetUrl();
  const urlInput = document.getElementById('googleSheetUrlInput');
  const modalStatusDot = document.getElementById('modalStatusDot');
  const modalStatusTitle = document.getElementById('modalStatusTitle');
  const modalStatusSubtitle = document.getElementById('modalStatusSubtitle');
  const disconnectBtn = document.getElementById('disconnectSheetBtn');

  if (urlInput) urlInput.value = url;

  if (url) {
    if (modalStatusDot) modalStatusDot.className = 'pulse-dot active';
    if (modalStatusTitle) modalStatusTitle.textContent = '🟢 Google Sheet Connected & Active';
    if (modalStatusSubtitle) modalStatusSubtitle.textContent = 'New registrations will automatically write to your Google Sheet';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
  } else {
    if (modalStatusDot) modalStatusDot.className = 'pulse-dot inactive';
    if (modalStatusTitle) modalStatusTitle.textContent = '⚪ Google Sheet Not Connected';
    if (modalStatusSubtitle) modalStatusSubtitle.textContent = 'Paste your Google Apps Script Web App URL below to activate live sync';
    if (disconnectBtn) disconnectBtn.style.display = 'none';
  }
}

function openGoogleSheetModal() {
  // Public mode: The Google Sheet URL is hidden and handled automatically.
  // Directly trigger live sync from the sheet without prompting the user.
  if (typeof window.renderProfilesFromRemote === 'function') {
    window.renderProfilesFromRemote(true);
  }
}

function closeGoogleSheetModal() {
  const modal = document.getElementById('googleSheetModal');
  if (modal) modal.classList.remove('open');
}

function initGoogleSheetUI() {
  // Public mode: do not inject the setup modal or ask for URL
}

// Initialize on document ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGoogleSheetUI();
  ProfileManager.updateHeaderBadge();
});
