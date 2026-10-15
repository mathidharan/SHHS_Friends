/**
 * School Friends Profile - Profiles Card View & Admin Image Management
 */

document.addEventListener('DOMContentLoaded', async () => {
  const cardsContainer = document.getElementById('bizCardsContainer');
  const tableContainer = document.getElementById('bizTableContainer');
  const tableBody = document.getElementById('bizTableBody');
  const viewCardBtn = document.getElementById('viewCardBtn');
  const viewTableBtn = document.getElementById('viewTableBtn');
  const searchInput = document.getElementById('searchQuery');
  const filterPills = document.querySelectorAll('.filter-pill');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonInput = document.getElementById('importJsonFile');
  const resetDataBtn = document.getElementById('resetDataBtn');

  // View Mode Persistence (Cards vs Table)
  const VIEW_STORAGE_KEY = 'sfp_directory_view_mode';
  let currentViewMode = localStorage.getItem(VIEW_STORAGE_KEY) || 'cards';

  function setViewMode(mode) {
    currentViewMode = mode === 'table' ? 'table' : 'cards';
    localStorage.setItem(VIEW_STORAGE_KEY, currentViewMode);

    if (currentViewMode === 'table') {
      if (cardsContainer) cardsContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      if (viewTableBtn) viewTableBtn.classList.add('active');
      if (viewCardBtn) viewCardBtn.classList.remove('active');
    } else {
      if (cardsContainer) cardsContainer.style.display = 'grid';
      if (tableContainer) tableContainer.style.display = 'none';
      if (viewCardBtn) viewCardBtn.classList.add('active');
      if (viewTableBtn) viewTableBtn.classList.remove('active');
    }
  }

  if (viewCardBtn) {
    viewCardBtn.addEventListener('click', () => setViewMode('cards'));
  }
  if (viewTableBtn) {
    viewTableBtn.addEventListener('click', () => setViewMode('table'));
  }

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

  // Render Skeleton Shimmer Table Rows while data loads
  function renderSkeletonTableRows(count = 6) {
    if (!tableBody) return;
    tableBody.innerHTML = Array(count).fill(0).map(() => `
      <tr class="skeleton-table-row" aria-hidden="true">
        <td>
          <div class="table-member-cell">
            <div class="skeleton-shimmer" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div class="skeleton-shimmer" style="width: 120px; height: 16px; border-radius: 4px; margin-bottom: 5px;"></div>
              <div class="skeleton-shimmer" style="width: 70px; height: 12px; border-radius: 4px;"></div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-role-cell">
            <div class="skeleton-shimmer" style="width: 140px; height: 16px; border-radius: 4px; margin-bottom: 5px;"></div>
            <div class="skeleton-shimmer" style="width: 110px; height: 14px; border-radius: 4px;"></div>
          </div>
        </td>
        <td><div class="skeleton-shimmer skeleton-pill" style="width: 80px; height: 24px;"></div></td>
        <td><div class="skeleton-shimmer" style="width: 95px; height: 16px; border-radius: 4px;"></div></td>
        <td><div class="skeleton-shimmer skeleton-pill" style="width: 65px; height: 22px;"></div></td>
        <td><div class="skeleton-shimmer" style="width: 105px; height: 16px; border-radius: 4px;"></div></td>
        <td style="text-align: right;"><div class="skeleton-shimmer" style="width: 65px; height: 28px; border-radius: 6px; margin-left: auto;"></div></td>
      </tr>
    `).join('');
  }

  // Render Skeleton Shimmer Placeholder Cards while data loads
  function renderSkeletonCards(count = 6) {
    if (cardsContainer) {
      cardsContainer.innerHTML = Array(count).fill(0).map(() => `
        <article class="biz-card skeleton-card" aria-hidden="true">
          <!-- 30% SECTION: Image Avatar & Sector Badge Placeholder -->
          <div class="biz-card-visual">
            <div class="biz-avatar-box">
              <div class="skeleton-avatar skeleton-shimmer"></div>
            </div>
            <div class="skeleton-shimmer skeleton-pill" style="width: 82px; height: 26px; margin-top: 0.65rem;"></div>
          </div>

          <!-- 70% SECTION: Business Card Details Placeholder -->
          <div class="biz-card-content">
            <div>
              <div class="biz-card-header" style="margin-bottom: 0.75rem;">
                <div class="skeleton-shimmer" style="width: 48%; height: 26px; border-radius: 6px;"></div>
                <div style="display: flex; gap: 0.4rem;">
                  <div class="skeleton-shimmer skeleton-pill" style="width: 58px; height: 22px;"></div>
                  <div class="skeleton-shimmer skeleton-pill" style="width: 78px; height: 22px;"></div>
                </div>
              </div>

              <div class="biz-role-section" style="margin-bottom: 0.85rem;">
                <div class="skeleton-shimmer" style="width: 65%; height: 18px; border-radius: 4px; margin-bottom: 0.4rem;"></div>
                <div class="skeleton-shimmer" style="width: 42%; height: 16px; border-radius: 4px;"></div>
              </div>

              <div class="biz-meta-grid">
                <div class="skeleton-shimmer" style="height: 38px; border-radius: 8px;"></div>
                <div class="skeleton-shimmer" style="height: 38px; border-radius: 8px;"></div>
                <div class="skeleton-shimmer" style="height: 38px; border-radius: 8px;"></div>
                <div class="skeleton-shimmer" style="height: 38px; border-radius: 8px;"></div>
              </div>
            </div>

            <div class="biz-card-footer" style="margin-top: 1rem;">
              <div class="skeleton-shimmer" style="width: 72px; height: 28px; border-radius: 6px; margin-left: auto;"></div>
            </div>
          </div>
        </article>
      `).join('');
    }
    renderSkeletonTableRows(count);
  }

  // Render cards
  async function renderProfiles(forceRefresh = false) {
    if (!cardsContainer) return;

    const countDisplay = document.getElementById('filteredCount');
    // If cards container is currently empty or forcing refresh, show skeleton cards immediately
    if (cardsContainer.children.length === 0 || forceRefresh || cardsContainer.querySelector('.skeleton-card')) {
      renderSkeletonCards(6);
      if (countDisplay) {
        countDisplay.innerHTML = `<span class="loading-pulse-badge"><i class="fas fa-circle-notch fa-spin"></i> Loading alumni profiles from database...</span>`;
      }
    }

    const allProfiles = await ProfileManager.getProfiles(forceRefresh);

    // Filter logic
    let filtered = allProfiles.filter(profile => {
      // Career / Sector / Donor filter
      if (activeSectorFilter !== 'ALL') {
        if (activeSectorFilter === 'Donor') {
          if (profile.willingToDonate !== 'Yes' && profile.willingToDonate !== true) return false;
        } else if (activeSectorFilter === 'Business') {
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
        const matchesBlood = (profile.bloodGroup || '').toLowerCase().includes(query);
        const matchesDonor = (query.includes('donor') || query.includes('blood')) && (profile.willingToDonate === 'Yes' || profile.willingToDonate === true);
        return matchesName || matchesJob || matchesBiz || matchesCompany || matchesDesig || matchesCity || matchesBizLoc || matchesSector || matchesOcc || matchesBlood || matchesDonor;
      }
      return true;
    });

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
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 3.5rem 1.5rem;">
              <div class="empty-state" style="margin: 0 auto; max-width: 420px; border: none; box-shadow: none; background: transparent;">
                <i class="fas fa-id-card-alt" style="font-size: 2.2rem; color: var(--text-dim); margin-bottom: 0.75rem;"></i>
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.35rem;">No Profiles Found</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">No registered school friends match the current search or sector filters.</p>
                <a href="index.html" class="btn btn-primary btn-sm">
                  <i class="fas fa-user-plus"></i> Register New Profile
                </a>
              </div>
            </td>
          </tr>
        `;
      }
      setViewMode(currentViewMode);
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

      const hasBloodGroup = profile.bloodGroup && profile.bloodGroup.trim() !== '';
      const isDonor = profile.willingToDonate === 'Yes' || profile.willingToDonate === true;
      const bloodBadgeHtml = hasBloodGroup
        ? (isDonor
          ? `<span class="blood-badge donor" title="Blood Group: ${escapeHtml(profile.bloodGroup)} &bull; Willing Blood Donor"><i class="fas fa-heartbeat"></i> ${escapeHtml(profile.bloodGroup)} &bull; Donor</span>`
          : `<span class="blood-badge" title="Blood Group: ${escapeHtml(profile.bloodGroup)}"><i class="fas fa-tint"></i> ${escapeHtml(profile.bloodGroup)}</span>`)
        : `<span class="blood-badge neutral" title="Blood Group: Not specified"><i class="fas fa-tint"></i> Blood: N/A</span>`;

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
                <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; justify-content: flex-end;">
                  <span class="biz-gender-tag">
                    <i class="fas ${profile.gender === 'Female' ? 'fa-venus' : profile.gender === 'Male' ? 'fa-mars' : 'fa-genderless'}"></i>
                    ${escapeHtml(profile.gender)}
                  </span>
                  ${bloodBadgeHtml}
                </div>
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

                <div class="biz-meta-item" title="Blood Group &amp; Donation Willingness">
                  <i class="fas fa-heartbeat" style="color: #ef4444;"></i>
                  <div>Blood: <strong>${escapeHtml(profile.bloodGroup || 'Not specified')}</strong>${isDonor && hasBloodGroup ? ' <span style="color:#f87171; font-size:0.75rem; font-weight:700;">(Donor)</span>' : ''}</div>
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
              <div class="biz-card-actions" style="margin-left: auto;">
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

    // Render table rows
    if (tableBody) {
      tableBody.innerHTML = filtered.map(profile => {
        const formattedDob = profile.dob ? formatDate(profile.dob) : 'N/A';
        const isBusiness = profile.occupationType === 'Business';
        const sectorClass = isBusiness ? 'sector-self' : `sector-${(profile.workingSector || 'private').toLowerCase()}`;
        const isDonor = profile.willingToDonate === 'Yes' || profile.willingToDonate === true;
        const hasBloodGroup = profile.bloodGroup && profile.bloodGroup.trim() !== '';

        const sectorBadgeHtml = isBusiness
          ? `<span class="sector-badge sector-self"><i class="fas fa-store"></i> Business</span>`
          : `<span class="sector-badge ${sectorClass}"><i class="fas fa-briefcase"></i> ${escapeHtml(profile.workingSector || 'Private')}</span>`;

        const bloodBadgeHtml = hasBloodGroup
          ? (isDonor
            ? `<span class="blood-badge donor" title="Blood Donor"><i class="fas fa-heartbeat"></i> ${escapeHtml(profile.bloodGroup)} &bull; Donor</span>`
            : `<span class="blood-badge" title="Blood Group: ${escapeHtml(profile.bloodGroup)}"><i class="fas fa-tint"></i> ${escapeHtml(profile.bloodGroup)}</span>`)
          : `<span class="blood-badge neutral" title="Blood Group: Not specified"><i class="fas fa-tint"></i> -</span>`;

        const avatarInitials = getAvatarInitials(profile.name);
        const avatarGradient = getAvatarGradient(profile.name, profile.occupationType);
        const companyDisplay = isBusiness
          ? (profile.businessName || profile.currentJob) + (profile.companyName ? ` (${profile.companyName})` : '')
          : (profile.currentJob || '-');
        const locationDisplay = isBusiness
          ? (profile.businessLocation || profile.currentCity || '-')
          : (profile.currentCity || '-');

        return `
          <tr data-id="${profile.id}">
            <!-- Member Cell -->
            <td>
              <div class="table-member-cell">
                <div class="table-avatar" style="background: ${avatarGradient};">
                  <span>${avatarInitials}</span>
                </div>
                <div class="table-member-info">
                  <span class="table-name">${escapeHtml(profile.name)}</span>
                  <div class="table-meta-sub">
                    <span><i class="fas ${profile.gender === 'Female' ? 'fa-venus' : 'fa-mars'}"></i> ${escapeHtml(profile.gender || 'Alumni')}</span>
                    <span>&bull;</span>
                    <span>${formattedDob}</span>
                  </div>
                </div>
              </div>
            </td>

            <!-- Role & Organization -->
            <td>
              <div class="table-role-cell">
                <div class="table-designation">
                  <i class="fas ${isBusiness ? 'fa-crown' : 'fa-award'}" style="${isBusiness ? 'color: #fbbf24;' : 'color: var(--secondary);'}"></i>
                  <span>${escapeHtml(profile.jobDesignation || (isBusiness ? 'Founder & CEO' : 'Professional'))}</span>
                </div>
                <div class="table-company">
                  ${escapeHtml(companyDisplay)}
                </div>
              </div>
            </td>

            <!-- Sector -->
            <td>
              ${sectorBadgeHtml}
            </td>

            <!-- Location -->
            <td>
              <div style="display: flex; align-items: center; gap: 0.35rem; font-weight: 500;">
                <i class="fas fa-map-marker-alt" style="color: var(--secondary); font-size: 0.8rem;"></i>
                <span>${escapeHtml(locationDisplay)}</span>
              </div>
              ${isBusiness && profile.currentCity && profile.businessLocation && profile.currentCity !== profile.businessLocation ? `
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">
                  Living: ${escapeHtml(profile.currentCity)}
                </div>
              ` : ''}
            </td>

            <!-- Blood Group -->
            <td>
              ${bloodBadgeHtml}
            </td>

            <!-- Contact -->
            <td>
              ${profile.phone ? `
                <a href="tel:${escapeHtml(profile.phone)}" class="table-phone-link" title="Call or WhatsApp">
                  <i class="fas fa-phone-alt" style="color: #10b981;"></i>
                  <span>${escapeHtml(profile.phone)}</span>
                </a>
              ` : `<span style="color: var(--text-dim); font-size: 0.8rem;">-</span>`}
              ${profile.businessWebsite ? `
                <div style="margin-top: 3px;">
                  <a href="${escapeHtml(profile.businessWebsite)}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-light); font-size: 0.75rem; text-decoration: underline;">
                    <i class="fas fa-globe"></i> Website
                  </a>
                </div>
              ` : ''}
            </td>

            <!-- Action -->
            <td style="text-align: right;">
              <a href="index.html?editId=${profile.id}" class="action-btn edit-btn" title="Edit Profile">
                <i class="fas fa-edit"></i> Edit
              </a>
            </td>
          </tr>
        `;
      }).join('');
    }

    setViewMode(currentViewMode);
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

  // Expose global render function for Google Sheet sync
  window.renderProfilesFromRemote = async (force = true) => {
    await renderProfiles(force);
  };

  // Sync button if present
  const syncBtn = document.getElementById('syncSheetBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.classList.add('btn-loading');
      syncBtn.innerHTML = '<span class="btn-spinner"></span> Syncing...';
      renderSkeletonCards(6);
      if (window.LoadingManager) {
        window.LoadingManager.startProgress();
      }
      try {
        const data = await ProfileManager.fetchFromSheet();
        await renderProfiles(true);
        if (data && data.length > 0) {
          showToast(`⚡ Synced ${data.length} profile${data.length === 1 ? '' : 's'} from Google Sheet!`, 'success');
        } else {
          showToast('Directory synchronized with Google Sheet', 'info');
        }
      } catch (err) {
        showToast('Sync failed: ' + (err.message || 'Network error'), 'error');
      } finally {
        if (window.LoadingManager) {
          window.LoadingManager.stopProgress();
        }
        syncBtn.disabled = false;
        syncBtn.classList.remove('btn-loading');
        syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';
      }
    });
  }

  // Initial load
  setViewMode(currentViewMode);
  await renderProfiles();
});

