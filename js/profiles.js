/**
 * School Friends Profile - Profiles Card View & Admin Image Management
 */

document.addEventListener('DOMContentLoaded', async () => {
  const cardsContainer = document.getElementById('bizCardsContainer');
  const searchInput = document.getElementById('searchQuery');
  const filterPills = document.querySelectorAll('.filter-pill');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonInput = document.getElementById('importJsonFile');
  const resetDataBtn = document.getElementById('resetDataBtn');
  
  // Admin Image Modal Elements
  const adminModal = document.getElementById('adminPhotoModal');
  const adminModalClose = document.getElementById('adminModalClose');
  const adminModalCancel = document.getElementById('adminModalCancel');
  const adminPhotoFile = document.getElementById('adminPhotoFile');
  const adminPhotoUrl = document.getElementById('adminPhotoUrl');
  const adminPhotoPreview = document.getElementById('adminPhotoPreview');
  const adminTargetName = document.getElementById('adminTargetName');
  const adminSavePhotoBtn = document.getElementById('adminSavePhotoBtn');

  let currentEditingProfileId = null;
  let tempAdminPhotoData = '';
  let activeSectorFilter = 'ALL';
  let activeSearchTerm = '';

  // Render cards
  async function renderProfiles() {
    if (!cardsContainer) return;
    const allProfiles = await ProfileManager.getProfiles();

    // Filter logic
    let filtered = allProfiles.filter(profile => {
      // Career / Sector filter
      if (activeSectorFilter !== 'ALL') {
        if (activeSectorFilter === 'Business') {
          if (profile.occupationType !== 'Business') return false;
        } else if (activeSectorFilter === 'Working') {
          if (profile.occupationType === 'Business') return false;
        } else {
          if ((profile.workingSector || '').toUpperCase() !== activeSectorFilter.toUpperCase()) {
            return false;
          }
        }
      }
      // Search term filter
      if (activeSearchTerm) {
        const query = activeSearchTerm.toLowerCase();
        const matchesName = (profile.name || '').toLowerCase().includes(query);
        const matchesJob = (profile.currentJob || '').toLowerCase().includes(query);
        const matchesBiz = (profile.businessName || '').toLowerCase().includes(query);
        const matchesCompany = (profile.companyName || '').toLowerCase().includes(query);
        const matchesDesig = (profile.jobDesignation || '').toLowerCase().includes(query);
        const matchesCity = (profile.currentCity || '').toLowerCase().includes(query);
        const matchesBizLoc = (profile.businessLocation || '').toLowerCase().includes(query);
        const matchesSector = (profile.workingSector || '').toLowerCase().includes(query);
        const matchesOcc = (profile.occupationType || '').toLowerCase().includes(query);
        return matchesName || matchesJob || matchesBiz || matchesCompany || matchesDesig || matchesCity || matchesBizLoc || matchesSector || matchesOcc;
      }
      return true;
    });

    const countDisplay = document.getElementById('filteredCount');
    if (countDisplay) {
      countDisplay.textContent = `${filtered.length} member${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-id-card-alt"></i>
          <h3>No Profiles Found</h3>
          <p>No registered school friends match the current search or sector filters.</p>
          <a href="index.html" class="btn btn-primary btn-sm">
            <i class="fas fa-user-plus"></i> Register New Profile
          </a>
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = filtered.map(profile => {
      const formattedDob = profile.dob ? formatDate(profile.dob) : 'N/A';
      const isBusiness = profile.occupationType === 'Business';
      const sectorClass = isBusiness ? 'sector-self' : `sector-${(profile.workingSector || 'private').toLowerCase()}`;
      const photoSrc = profile.photo || ProfileManager.getDefaultAvatar(profile.gender);

      const sectorBadgeHtml = isBusiness 
        ? `<span class="sector-badge sector-self"><i class="fas fa-store"></i> Business</span>`
        : `<span class="sector-badge ${sectorClass}"><i class="fas fa-briefcase"></i> ${escapeHtml(profile.workingSector)}</span>`;

      return `
        <article class="biz-card" data-id="${profile.id}">
          <!-- 30% SECTION: Image Avatar & Sector Badge -->
          <div class="biz-card-visual">
            <div class="biz-avatar-box">
              <div class="biz-avatar-circle" style="background: ${getAvatarGradient(profile.name, profile.occupationType)};">
                <span>${getAvatarInitials(profile.name)}</span>
                <div class="biz-avatar-badge" title="${isBusiness ? 'Business Entrepreneur' : (profile.gender || 'Alumni Member')}">
                  <i class="fas ${isBusiness ? 'fa-store' : (profile.gender === 'Female' ? 'fa-venus' : 'fa-user-tie')}"></i>
                </div>
              </div>
            </div>
            
            ${sectorBadgeHtml}
          </div>

          <!-- 70% SECTION: Business Card Details from Form -->
          <div class="biz-card-content">
            <div>
              <div class="biz-card-header">
                <h3 class="biz-name">${escapeHtml(profile.name)}</h3>
                <span class="biz-gender-tag">
                  <i class="fas ${profile.gender === 'Female' ? 'fa-venus' : profile.gender === 'Male' ? 'fa-mars' : 'fa-genderless'}"></i>
                  ${escapeHtml(profile.gender)}
                </span>
              </div>

              <div class="biz-role-section">
                <div class="biz-designation">
                  <i class="fas ${isBusiness ? 'fa-crown' : 'fa-award'}" style="${isBusiness ? 'color: #fbbf24;' : ''}"></i>
                  <span>${escapeHtml(profile.jobDesignation)}</span>
                </div>
                
                ${isBusiness ? `
                <div class="biz-company" style="font-weight: 600;">
                  <i class="fas fa-store" style="color: #fbbf24;"></i> ${escapeHtml(profile.businessName || profile.currentJob)}
                  ${profile.companyName ? `<span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 500;">(${escapeHtml(profile.companyName)})</span>` : ''}
                </div>
                ` : `
                <div class="biz-company">
                  <i class="far fa-building"></i> ${escapeHtml(profile.currentJob)}
                </div>
                `}
              </div>

              <div class="biz-meta-grid">
                <div class="biz-meta-item" title="Date of Birth">
                  <i class="fas fa-birthday-cake"></i>
                  <div>
                    <strong>${formattedDob}</strong>
                  </div>
                </div>

                ${isBusiness ? `
                <div class="biz-meta-item" title="Business Location">
                  <i class="fas fa-map-marked-alt" style="color: #fbbf24;"></i>
                  <div>Biz Loc: <strong>${escapeHtml(profile.businessLocation || profile.currentCity)}</strong></div>
                </div>

                <div class="biz-meta-item" title="Living City">
                  <i class="fas fa-home"></i>
                  <div>Living: <strong>${escapeHtml(profile.currentCity)}</strong></div>
                </div>
                ` : `
                <div class="biz-meta-item" title="Current Living City">
                  <i class="fas fa-map-marker-alt"></i>
                  <div>City: <strong>${escapeHtml(profile.currentCity)}</strong></div>
                </div>

                <div class="biz-meta-item" title="Sector Category">
                  <i class="fas fa-layer-group"></i>
                  <div>Sector: <strong>${escapeHtml(profile.workingSector)}</strong></div>
                </div>
                `}

                ${profile.businessWebsite ? `
                <div class="biz-meta-item" title="Website / Store">
                  <i class="fas fa-globe" style="color: #60a5fa;"></i>
                  <div><a href="${profile.businessWebsite}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-light); text-decoration: underline;">Visit Website</a></div>
                </div>
                ` : ''}

                ${profile.phone ? `
                <div class="biz-meta-item" title="Phone">
                  <i class="fas fa-phone-alt"></i>
                  <div><strong>${escapeHtml(profile.phone)}</strong></div>
                </div>` : `
                <div class="biz-meta-item" title="Alumni Member">
                  <i class="fas fa-graduation-cap"></i>
                  <div>Batch Alumni</div>
                </div>`}
              </div>
            </div>

            <!-- Card Bottom Bar -->
            <div class="biz-card-footer">
              <span>ID: ${profile.id}</span>
              <div class="biz-card-actions">
                <a 
                  href="index.html?editId=${profile.id}" 
                  class="action-btn edit-btn" 
                  title="Edit profile"
                >
                  <i class="fas fa-edit"></i> Edit
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Utility to prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchTerm = e.target.value.trim();
      renderProfiles();
    });
  }

  // Filter Pill buttons (All, Working, Business, Private, Govt)
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSectorFilter = pill.dataset.filter || 'ALL';
      renderProfiles();
    });
  });

  // Initial load
  await renderProfiles();
});
