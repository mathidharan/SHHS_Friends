/**
 * School Friends Profile - Form Handling & Live Card Preview
 */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('profileForm');
  if (!form) return;

  // Form Fields
  const nameInput = document.getElementById('fullName');
  const genderInputs = document.querySelectorAll('input[name="gender"]');
  const dobInput = document.getElementById('dob');
  const occTypeInputs = document.querySelectorAll('input[name="occupationType"]');
  
  // Working fields
  const workingSection = document.getElementById('workingSection');
  const currentJobInput = document.getElementById('currentJob');
  const jobDesignationInput = document.getElementById('jobDesignation');
  const currentCityInput = document.getElementById('currentCity');
  const sectorInputs = document.querySelectorAll('input[name="workingSector"]');

  // Business fields
  const businessSection = document.getElementById('businessSection');
  const businessNameInput = document.getElementById('businessName');
  const bizCompanyNameInput = document.getElementById('bizCompanyName');
  const bizJobDesignationInput = document.getElementById('bizJobDesignation');
  const businessLocationInput = document.getElementById('businessLocation');
  const bizLivingCityInput = document.getElementById('bizLivingCity');
  const businessCategoryInput = document.getElementById('businessCategory');
  const businessWebsiteInput = document.getElementById('businessWebsite');

  // Shared fields
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');

  // Blood group & donation fields
  const bloodGroupInput = document.getElementById('bloodGroup');
  const willingDonateInputs = document.querySelectorAll('input[name="willingToDonate"]');
  const donateYesCard = document.getElementById('donateYesCard');
  const donateNoCard = document.getElementById('donateNoCard');

  // Preview elements
  const previewName = document.getElementById('previewName');
  const previewGender = document.getElementById('previewGender');
  const previewBloodBadge = document.getElementById('previewBloodBadge');
  const previewBloodText = document.getElementById('previewBloodText');
  const previewRole = document.getElementById('previewRole');
  const previewCompany = document.getElementById('previewCompany');
  const previewDob = document.getElementById('previewDob');
  const previewCity = document.getElementById('previewCity');
  const previewSectorBadge = document.getElementById('previewSectorBadge');
  const previewSectorText = document.getElementById('previewSectorText');
  
  // Avatar elements
  const previewAvatarCircle = document.getElementById('previewAvatarCircle');
  const previewAvatarInitials = document.getElementById('previewAvatarInitials');
  const previewAvatarBadge = document.getElementById('previewAvatarBadge');
  const formAvatarCircle = document.getElementById('formAvatarCircle');
  const formAvatarInitials = document.getElementById('formAvatarInitials');

  // Check if we are in Edit Mode
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('editId');
  let isEditMode = false;

  // Helper to get active occupation type
  function getSelectedOccType() {
    return document.querySelector('input[name="occupationType"]:checked')?.value || 'Working';
  }

  // Helper to get active blood donation willingness
  function getWillingToDonate() {
    return document.querySelector('input[name="willingToDonate"]:checked')?.value || 'Yes';
  }

  // Toggle Working vs Business sections
  function toggleCareerSections() {
    const occType = getSelectedOccType();
    const isWorking = occType === 'Working';

    if (workingSection) workingSection.style.display = isWorking ? 'grid' : 'none';
    if (businessSection) businessSection.style.display = isWorking ? 'none' : 'grid';

    // Visual card styling for selector
    const workCard = document.getElementById('occWorkingCard');
    const bizCard = document.getElementById('occBusinessCard');
    if (workCard && bizCard) {
      if (isWorking) {
        workCard.style.borderColor = 'var(--primary)';
        workCard.style.background = 'rgba(79, 70, 229, 0.15)';
        bizCard.style.borderColor = 'var(--border-color)';
        bizCard.style.background = 'var(--bg-input)';
      } else {
        bizCard.style.borderColor = '#fbbf24';
        bizCard.style.background = 'rgba(245, 158, 11, 0.15)';
        workCard.style.borderColor = 'var(--border-color)';
        workCard.style.background = 'var(--bg-input)';
      }
    }

    updateLivePreview();
  }

  // Live Preview Updating
  function updateLivePreview() {
    const occType = getSelectedOccType();
    const isWorking = occType === 'Working';

    // Name & Initials
    const nameVal = nameInput?.value.trim() || 'Your Name';
    if (previewName) previewName.textContent = nameVal;

    const initials = getAvatarInitials(nameVal);
    const gradient = getAvatarGradient(nameVal, occType);

    // Update Image Avatar on Preview & Form
    if (previewAvatarInitials) previewAvatarInitials.textContent = initials;
    if (previewAvatarCircle) previewAvatarCircle.style.background = gradient;
    if (formAvatarInitials) formAvatarInitials.textContent = initials;
    if (formAvatarCircle) formAvatarCircle.style.background = gradient;

    // Gender
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value || 'Not specified';
    if (previewGender) {
      const isFemale = selectedGender === 'Female';
      const isMale = selectedGender === 'Male';
      const iconClass = isFemale ? 'fa-venus' : (isMale ? 'fa-mars' : 'fa-user');
      const iconColor = isFemale ? '#f472b6' : (isMale ? '#38bdf8' : 'inherit');
      previewGender.innerHTML = `<i class="fas ${iconClass}" style="color: ${iconColor};"></i> ${selectedGender}`;
    }

    // Blood Group & Donor Badge Preview
    const bloodGroupVal = bloodGroupInput?.value || '';
    const isDonor = getWillingToDonate() === 'Yes';
    if (previewBloodBadge) {
      previewBloodBadge.style.display = 'inline-flex';
      if (bloodGroupVal) {
        if (isDonor) {
          previewBloodBadge.className = 'blood-badge donor';
          previewBloodBadge.innerHTML = `<i class="fas fa-heartbeat"></i> <span>${bloodGroupVal} &bull; Donor</span>`;
        } else {
          previewBloodBadge.className = 'blood-badge';
          previewBloodBadge.innerHTML = `<i class="fas fa-tint"></i> <span>${bloodGroupVal}</span>`;
        }
      } else {
        previewBloodBadge.className = 'blood-badge neutral';
        previewBloodBadge.innerHTML = `<i class="fas fa-tint"></i> <span>Blood: N/A</span>`;
      }
    }

    const previewMetaBlood = document.getElementById('previewMetaBlood');
    if (previewMetaBlood) {
      if (bloodGroupVal) {
        previewMetaBlood.innerHTML = `${bloodGroupVal}${isDonor ? ' <span style="color:#f87171; font-size:0.75rem; font-weight:700;">(Donor)</span>' : ''}`;
      } else {
        previewMetaBlood.textContent = 'Not specified';
      }
    }

    // Donor card visual toggle
    if (donateYesCard && donateNoCard) {
      if (isDonor) {
        donateYesCard.classList.add('active');
        donateNoCard.classList.remove('active');
      } else {
        donateNoCard.classList.add('active');
        donateYesCard.classList.remove('active');
      }
    }

    // Avatar Badge
    if (previewAvatarBadge) {
      if (!isWorking) {
        previewAvatarBadge.innerHTML = `<i class="fas fa-store" style="color: #fbbf24;"></i>`;
      } else {
        previewAvatarBadge.innerHTML = `<i class="fas ${selectedGender === 'Female' ? 'fa-venus' : 'fa-user-tie'}"></i>`;
      }
    }

    // Role & Company
    if (isWorking) {
      const desigVal = jobDesignationInput?.value.trim() || 'Designation / Role';
      const compVal = currentJobInput?.value.trim() || 'Organization / Company Name';
      if (previewRole) previewRole.textContent = desigVal;
      if (previewCompany) previewCompany.textContent = compVal;

      // City
      const cityVal = currentCityInput?.value.trim() || 'City Name';
      if (previewCity) previewCity.textContent = cityVal;

      // Sector Badge
      const selectedSector = document.querySelector('input[name="workingSector"]:checked')?.value || 'Private';
      if (previewSectorBadge && previewSectorText) {
        previewSectorText.textContent = selectedSector;
        previewSectorBadge.className = `sector-badge sector-${selectedSector.toLowerCase()}`;
        previewSectorBadge.innerHTML = `<i class="fas fa-building"></i> <span id="previewSectorText">${selectedSector}</span>`;
      }
    } else {
      // Business mode
      const bizDesig = bizJobDesignationInput?.value.trim() || 'Founder & Business Owner';
      const bizName = businessNameInput?.value.trim() || 'Business / Enterprise Name';
      const compName = bizCompanyNameInput?.value.trim();
      
      if (previewRole) previewRole.textContent = bizDesig;
      if (previewCompany) {
        previewCompany.textContent = compName ? `${bizName} (${compName})` : bizName;
      }

      // City / Location
      const bizLoc = businessLocationInput?.value.trim();
      const livingCity = bizLivingCityInput?.value.trim();
      const displayLoc = bizLoc || livingCity || 'Business Location';
      if (previewCity) previewCity.textContent = displayLoc;

      // Sector Badge for Business
      if (previewSectorBadge) {
        previewSectorBadge.className = 'sector-badge sector-self';
        previewSectorBadge.innerHTML = `<i class="fas fa-store"></i> <span id="previewSectorText">Business</span>`;
      }
    }

    // DOB
    const dobVal = dobInput?.value;
    if (previewDob) {
      if (dobVal) {
        previewDob.textContent = formatDate(dobVal);
      } else {
        previewDob.textContent = 'DD/MM/YYYY';
      }
    }
  }

  // Pre-fill fields if in Edit Mode
  async function checkAndApplyEditMode() {
    if (!editId) {
      toggleCareerSections();
      return;
    }

    if (window.LoadingManager) {
      window.LoadingManager.show({
        title: 'Loading Alumni Profile',
        subtitle: 'Fetching profile details for editing...',
        minDuration: 250
      });
    }

    try {
      const profiles = await ProfileManager.getProfiles();
      const target = profiles.find(p => p.id === editId);
      if (!target) {
        toggleCareerSections();
        return;
      }

      isEditMode = true;

    // Update UI headers
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    const formHeading = document.querySelector('.form-card h3');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (pageTitle) pageTitle.textContent = 'Edit Alumni Profile';
    if (pageSubtitle) pageSubtitle.textContent = `Update information and career details for ${target.name}.`;
    if (formHeading) formHeading.innerHTML = `<i class="fas fa-user-edit" style="color: var(--primary);"></i> Edit Profile Details`;
    if (submitBtn) submitBtn.innerHTML = `<i class="fas fa-save"></i> Save Changes`;

    // Populate common fields
    if (nameInput) nameInput.value = target.name || '';
    if (dobInput) dobInput.value = target.dob || '';
    if (phoneInput) phoneInput.value = target.phone || '';
    if (emailInput) emailInput.value = target.email || '';
    if (bloodGroupInput) bloodGroupInput.value = target.bloodGroup || '';

    // Blood Donation Willingness
    const targetWilling = target.willingToDonate === 'No' ? 'No' : 'Yes';
    const donateRadio = document.querySelector(`input[name="willingToDonate"][value="${targetWilling}"]`);
    if (donateRadio) donateRadio.checked = true;

    // Gender
    const genderRadio = document.querySelector(`input[name="gender"][value="${target.gender}"]`);
    if (genderRadio) {
      genderRadio.checked = true;
    }

    // Occupation Type
    const isBusiness = target.occupationType === 'Business';
    const occRadio = document.querySelector(`input[name="occupationType"][value="${isBusiness ? 'Business' : 'Working'}"]`);
    if (occRadio) {
      occRadio.checked = true;
    }

    toggleCareerSections();

    // Populate specific fields
    if (isBusiness) {
      if (businessNameInput) businessNameInput.value = target.businessName || target.currentJob || '';
      if (bizCompanyNameInput) bizCompanyNameInput.value = target.companyName || '';
      if (bizJobDesignationInput) bizJobDesignationInput.value = target.jobDesignation || '';
      if (businessLocationInput) businessLocationInput.value = target.businessLocation || '';
      if (bizLivingCityInput) bizLivingCityInput.value = target.currentCity || '';
      if (businessCategoryInput) businessCategoryInput.value = target.businessCategory || '';
      if (businessWebsiteInput) businessWebsiteInput.value = target.businessWebsite || '';
    } else {
      if (currentJobInput) currentJobInput.value = target.currentJob || '';
      if (jobDesignationInput) jobDesignationInput.value = target.jobDesignation || '';
      if (currentCityInput) currentCityInput.value = target.currentCity || '';
      const sectorRadio = document.querySelector(`input[name="workingSector"][value="${target.workingSector}"]`);
      if (sectorRadio) sectorRadio.checked = true;
    }

    updateLivePreview();
  } finally {
    if (window.LoadingManager) {
      window.LoadingManager.hide();
    }
  }
}

  // Handle Occupation Type Toggle
  occTypeInputs.forEach(radio => {
    radio.addEventListener('change', toggleCareerSections);
  });

  // Bind live input listeners
  const allTextInputs = [
    nameInput, dobInput, phoneInput, emailInput,
    currentJobInput, jobDesignationInput, currentCityInput,
    businessNameInput, bizCompanyNameInput, bizJobDesignationInput,
    businessLocationInput, bizLivingCityInput, businessCategoryInput, businessWebsiteInput
  ];

  allTextInputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', updateLivePreview);
    }
  });

  // Sector and gender change listeners
  [...genderInputs, ...sectorInputs, ...willingDonateInputs].forEach(radio => {
    radio.addEventListener('change', updateLivePreview);
  });

  if (bloodGroupInput) {
    bloodGroupInput.addEventListener('change', updateLivePreview);
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const dob = dobInput.value;
    const occType = getSelectedOccType();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';

    // Common Validation
    if (!name) {
      showToast('Please enter full name', 'error');
      nameInput.focus();
      return;
    }
    if (!gender) {
      showToast('Please select gender', 'error');
      return;
    }
    if (!dob) {
      showToast('Please select Date of Birth', 'error');
      dobInput.focus();
      return;
    }

    const bloodGroup = bloodGroupInput ? bloodGroupInput.value : '';
    const willingToDonate = getWillingToDonate();

    if (!bloodGroup) {
      showToast('Please select Blood Group', 'error');
      bloodGroupInput.focus();
      return;
    }

    let profilePayload = {
      name,
      gender,
      dob,
      bloodGroup,
      willingToDonate,
      occupationType: occType,
      phone,
      email
    };

    if (occType === 'Working') {
      const currentJob = currentJobInput.value.trim();
      const jobDesignation = jobDesignationInput.value.trim();
      const currentCity = currentCityInput.value.trim();
      const workingSector = document.querySelector('input[name="workingSector"]:checked')?.value || 'Private';

      if (!currentJob) {
        showToast('Please enter Current Job / Company name', 'error');
        currentJobInput.focus();
        return;
      }
      if (!jobDesignation) {
        showToast('Please enter Job Designation', 'error');
        jobDesignationInput.focus();
        return;
      }
      if (!currentCity) {
        showToast('Please enter Current Living City', 'error');
        currentCityInput.focus();
        return;
      }

      profilePayload = {
        ...profilePayload,
        currentJob,
        jobDesignation,
        currentCity,
        workingSector
      };
    } else {
      // Business mode
      const businessName = businessNameInput.value.trim();
      const companyName = bizCompanyNameInput.value.trim();
      const jobDesignation = bizJobDesignationInput.value.trim();
      const businessLocation = businessLocationInput.value.trim();
      const currentCity = bizLivingCityInput.value.trim() || businessLocation;
      const businessCategory = businessCategoryInput ? businessCategoryInput.value.trim() : '';
      const businessWebsite = businessWebsiteInput ? businessWebsiteInput.value.trim() : '';

      if (!businessName) {
        showToast('Please enter Business Name', 'error');
        businessNameInput.focus();
        return;
      }
      if (!companyName) {
        showToast('Please enter Company / Entity Name', 'error');
        bizCompanyNameInput.focus();
        return;
      }
      if (!jobDesignation) {
        showToast('Please enter Job Designation (e.g. Founder & CEO)', 'error');
        bizJobDesignationInput.focus();
        return;
      }
      if (!businessLocation) {
        showToast('Please enter Business Location', 'error');
        businessLocationInput.focus();
        return;
      }

      profilePayload = {
        ...profilePayload,
        businessName,
        companyName,
        jobDesignation,
        businessLocation,
        currentCity,
        currentJob: businessName,
        workingSector: 'Self',
        businessCategory,
        businessWebsite
      };
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      submitBtn.innerHTML = `<span class="btn-spinner"></span> ${isEditMode ? 'Saving Changes...' : 'Registering Member...'}`;
    }

    if (window.LoadingManager) {
      window.LoadingManager.show({
        title: isEditMode ? 'Updating Alumni Profile' : 'Registering Alumni Member',
        subtitle: isEditMode
          ? 'Saving changes and updating cloud database...'
          : 'Formatting executive business card and syncing with database...',
        minDuration: 300
      });
    }

    try {
      if (isEditMode) {
        await ProfileManager.updateProfile(editId, profilePayload);
        showToast(`🎉 Changes saved for "${name}"!`, 'success');
        setTimeout(() => {
          window.location.href = 'profiles.html';
        }, 900);
      } else {
        await ProfileManager.addProfile(profilePayload);
        showToast(`🎉 Profile for "${name}" registered successfully!`, 'success');

        // Show confirmation dialog
        const modal = document.getElementById('successModal');
        if (modal) {
          modal.classList.add('open');
        } else {
          setTimeout(() => {
            window.location.href = 'profiles.html';
          }, 1200);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      if (window.LoadingManager) {
        window.LoadingManager.hide();
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerHTML = originalBtnContent;
      }
    }
  });

  // Reset form
  const resetBtn = document.getElementById('resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      toggleCareerSections();
    });
  }

  // Initial call with edit detection
  await checkAndApplyEditMode();
});
