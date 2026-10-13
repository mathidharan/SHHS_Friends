/**
 * School Friends Profile - Core Data & Application Manager
 */

const STORAGE_KEY = 'school_friends_profiles_data_v1';
const THEME_KEY = 'sfp_theme_mode';

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
    "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "phone": "+91 95974 84321",
    "email": "",
    "registeredAt": "2026-10-11T09:00:00.000Z"
  }
];

// Profile Manager
const ProfileManager = {
  // Load profiles from LocalStorage or fallback to seed / data.json
  async getProfiles() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Seamless backward compatibility
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

  // Add a single new profile
  async addProfile(profileData) {
    const profiles = await this.getProfiles();
    const newProfile = {
      id: 'sfp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      registeredAt: new Date().toISOString(),
      photo: profileData.photo || this.getDefaultAvatar(profileData.gender),
      ...profileData
    };
    profiles.unshift(newProfile); // Prepend to top
    this.saveProfiles(profiles);
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
  const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
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

// Initialize on document ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  ProfileManager.updateHeaderBadge();
});
