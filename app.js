/**
 * 남양주시 화물팀 민원서비스 포털 어플리케이션
 * Namyangju City Cargo Civil Service Portal Application Logic
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 0. MULTI-TIER PERSISTENCE ENGINE (서버 없이 100% 브라우저 영구 저장)
  // -------------------------------------------------------------------------
  const FAV_STORAGE_KEY = 'nyj_cargo_favorites_v1';
  const RECENT_STORAGE_KEY = 'nyj_cargo_recent_v1';
  const DOCS_STORAGE_KEY = 'nyj_cargo_checked_docs_v1';

  // Multi-tier storage manager: localStorage + sessionStorage + Cookie + IndexedDB fallback
  const LocalStore = {
    get: function (key, defaultVal) {
      let data = null;
      // Tier 1: localStorage
      try {
        const item = localStorage.getItem(key);
        if (item) data = JSON.parse(item);
      } catch (e) {}

      // Tier 2: sessionStorage (if localStorage was cleared or in sandbox)
      if (data === null || (Array.isArray(data) && data.length === 0)) {
        try {
          const sItem = sessionStorage.getItem(key);
          if (sItem) data = JSON.parse(sItem);
        } catch (e) {}
      }

      // Tier 3: Cookies (persistent for 10 years across reloads/domains)
      if (data === null || (Array.isArray(data) && data.length === 0)) {
        try {
          const cookieMatch = document.cookie.match(new RegExp('(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
          if (cookieMatch) {
            data = JSON.parse(decodeURIComponent(cookieMatch[1]));
          }
        } catch (e) {}
      }

      return data !== null ? data : defaultVal;
    },

    set: function (key, value) {
      const jsonStr = JSON.stringify(value);

      // Tier 1: localStorage
      try {
        localStorage.setItem(key, jsonStr);
      } catch (e) {}

      // Tier 2: sessionStorage
      try {
        sessionStorage.setItem(key, jsonStr);
      } catch (e) {}

      // Tier 3: Cookie (10 Years Expiration)
      try {
        const expires = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(jsonStr)}; expires=${expires}; path=/; SameSite=Lax`;
      } catch (e) {}

      // Tier 4: IndexedDB async background sync
      this.syncIndexedDB(key, value);
    },

    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) {}
      try { sessionStorage.removeItem(key); } catch (e) {}
      try {
        document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      } catch (e) {}
    },

    // IndexedDB persistence layer
    syncIndexedDB: function (key, value) {
      if (!window.indexedDB) return;
      try {
        const req = indexedDB.open('NYJCargoPortalDB', 1);
        req.onupgradeneeded = function (e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('keyvalue')) {
            db.createObjectStore('keyvalue', { keyPath: 'k' });
          }
        };
        req.onsuccess = function (e) {
          const db = e.target.result;
          const tx = db.transaction('keyvalue', 'readwrite');
          tx.objectStore('keyvalue').put({ k: key, v: value, updatedAt: Date.now() });
        };
      } catch (e) {}
    },

    loadFromIndexedDB: function (key, callback) {
      if (!window.indexedDB) return;
      try {
        const req = indexedDB.open('NYJCargoPortalDB', 1);
        req.onsuccess = function (e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('keyvalue')) return;
          const tx = db.transaction('keyvalue', 'readonly');
          const getReq = tx.objectStore('keyvalue').get(key);
          getReq.onsuccess = function () {
            if (getReq.result && getReq.result.v) {
              callback(getReq.result.v);
            }
          };
        };
      } catch (e) {}
    }
  };

  // -------------------------------------------------------------------------
  // 1. STATE & DATA STORE
  // -------------------------------------------------------------------------
  let civilServices = [];

  // Industry Mapping helper (업종 카테고리 매핑)
  const INDUSTRY_MAP = {
    // 화물운송사업 (10건)
    'cargo-yard': 'transport',
    'permit-reissue': 'transport',
    'transfer': 'transport',
    'transport-terms': 'transport',
    'permit-change': 'transport',
    'permit-minor-change': 'transport',
    'permit': 'transport',
    'permit-declaration': 'transport',
    'inheritance': 'transport',
    'fuel-subsidy-written': 'transport',

    // 물류창고업 (1건)
    'warehouse-registration': 'warehouse',

    // 물류주선업 (4건)
    'intl-logistics-reg': 'forwarding',
    'intl-logistics-transfer': 'forwarding',
    'intl-logistics-inheritance': 'forwarding',
    'intl-logistics-merger': 'forwarding'
  };

  const INDUSTRY_LABELS = {
    transport: { name: '화물운송사업', short: '화물운송', colorClass: 'transport', icon: 'fa-truck-fast' },
    warehouse: { name: '물류창고업', short: '물류창고', colorClass: 'warehouse', icon: 'fa-warehouse' },
    forwarding: { name: '물류주선업', short: '물류주선', colorClass: 'forwarding', icon: 'fa-route' }
  };

  function getItemIndustry(item) {
    if (!item) return 'transport';
    if (INDUSTRY_MAP[item.id]) return INDUSTRY_MAP[item.id];
    if (item.id && item.id.includes('warehouse')) return 'warehouse';
    if (item.id && item.id.includes('intl-logistics')) return 'forwarding';
    return 'transport';
  }
  
  const state = {
    searchQuery: '',
    selectedCategory: 'all',
    selectedIndustry: 'all', // 'all' | 'transport' | 'warehouse' | 'forwarding'
    viewMode: 'card', // 'card' | 'table'
    sortBy: 'number-asc',
    formsSearchQuery: '',
    formsSelectedCat: 'all',
    currentDetailId: null,
    lightboxId: null,
    lightboxZoom: 1,
    favoriteIds: LocalStore.get(FAV_STORAGE_KEY, []),
    recentIds: LocalStore.get(RECENT_STORAGE_KEY, []),
    checkedDocs: LocalStore.get(DOCS_STORAGE_KEY, {})
  };

  // -------------------------------------------------------------------------
  // 2. DOM ELEMENTS
  // -------------------------------------------------------------------------
  const elements = {
    // Header & Nav
    siteHeader: document.getElementById('site-header'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileNavDrawer: document.getElementById('mobile-nav-drawer'),
    btnMobileMenu: document.getElementById('btn-mobile-menu'),
    btnMobileClose: document.getElementById('btn-mobile-close'),
    btnRecentToggle: document.getElementById('btn-recent-toggle'),
    recentCountBadge: document.getElementById('recent-count-badge'),
    btnFavoriteToggle: document.getElementById('btn-favorite-toggle'),
    favoriteCountBadge: document.getElementById('favorite-count-badge'),
    countFavorites: document.getElementById('count-favorites'),

    // Hero & Search
    heroSearchInput: document.getElementById('hero-search-input'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    btnSearchSubmit: document.getElementById('btn-search-submit'),
    tagChips: document.querySelectorAll('.tag-chip'),

    // Business Industry Filter Tabs
    industryTabs: document.querySelectorAll('.industry-tab'),
    countIndAll: document.getElementById('count-ind-all'),
    countIndTransport: document.getElementById('count-ind-transport'),
    countIndWarehouse: document.getElementById('count-ind-warehouse'),
    countIndForwarding: document.getElementById('count-ind-forwarding'),

    // All Civil Services
    civilCardsContainer: document.getElementById('civil-cards-container'),
    civilTableContainer: document.getElementById('civil-table-container'),
    civilTableBody: document.getElementById('civil-table-body'),
    emptyState: document.getElementById('empty-state'),
    currentResultCount: document.getElementById('current-result-count'),
    activeFilterIndicators: document.getElementById('active-filter-indicators'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    categoryTabs: document.querySelectorAll('.cat-tab'),
    inpageSearch: document.getElementById('inpage-search'),
    sortSelect: document.getElementById('sort-select'),
    btnViewCard: document.getElementById('btn-view-card'),
    btnViewTable: document.getElementById('btn-view-table'),

    // Forms Gallery
    formsGridContainer: document.getElementById('forms-grid-container'),
    formsSearchInput: document.getElementById('forms-search-input'),
    formsCatBtns: document.querySelectorAll('.forms-cat-btn'),

    // Civil Detail Modal
    civilModalBackdrop: document.getElementById('civil-modal-backdrop'),
    btnModalClose: document.getElementById('btn-modal-close'),
    btnModalCloseBottom: document.getElementById('btn-modal-close-bottom'),
    btnModalBack: document.getElementById('btn-modal-back'),
    btnModalPrint: document.getElementById('btn-modal-print'),
    btnModalShare: document.getElementById('btn-modal-share'),
    btnModalFavorite: document.getElementById('btn-modal-favorite'),
    modalBadges: document.getElementById('modal-badges-container'),
    modalCivilCode: document.getElementById('modal-civil-code'),
    modalCivilTitle: document.getElementById('modal-civil-title'),
    modalCivilSummary: document.getElementById('modal-civil-summary'),
    modalCivilNotice: document.getElementById('modal-civil-notice'),
    modalCoreLaw: document.getElementById('modal-core-law'),
    modalCorePeriod: document.getElementById('modal-core-period'),
    modalCoreFee: document.getElementById('modal-core-fee'),
    modalCoreDept: document.getElementById('modal-core-dept'),
    modalMetaSubmit: document.getElementById('modal-meta-submit'),
    modalMetaAuthority: document.getElementById('modal-meta-authority'),
    modalMetaVia: document.getElementById('modal-meta-via'),
    modalMetaSource: document.getElementById('modal-meta-source'),
    modalRequiredDocs: document.getElementById('modal-required-docs'),
    modalOfficialChecks: document.getElementById('modal-official-checks'),
    modalReviewCriteria: document.getElementById('modal-review-criteria'),
    modalProcessFlow: document.getElementById('modal-process-flow'),
    modalFormRule: document.getElementById('modal-form-rule'),
    modalFormTitle: document.getElementById('modal-form-title'),
    modalFormRev: document.getElementById('modal-form-rev'),
    modalFormThumb: document.getElementById('modal-form-thumb'),
    btnPreviewLightbox: document.getElementById('btn-preview-lightbox'),
    btnDownloadPdf: document.getElementById('btn-download-pdf'),
    btnDownloadImg: document.getElementById('btn-download-img'),
    btnZoomFormModal: document.getElementById('btn-zoom-form-modal'),

    // Lightbox Modal
    formLightbox: document.getElementById('form-lightbox'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxFullImg: document.getElementById('lightbox-full-img'),
    lightboxImgWrapper: document.getElementById('lightbox-img-wrapper'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    btnZoomReset: document.getElementById('btn-zoom-reset'),
    lightboxDownloadPdf: document.getElementById('lightbox-download-pdf'),
    btnLightboxClose: document.getElementById('btn-lightbox-close'),

    // Recent Drawer
    recentDrawer: document.getElementById('recent-drawer'),
    btnRecentClose: document.getElementById('btn-recent-close'),
    recentItemsContainer: document.getElementById('recent-items-container'),
    btnClearRecent: document.getElementById('btn-clear-recent'),

    // Favorite Drawer
    favoriteDrawer: document.getElementById('favorite-drawer'),
    btnFavoriteClose: document.getElementById('btn-favorite-close'),
    favoriteItemsContainer: document.getElementById('favorite-items-container'),
    btnClearFavorite: document.getElementById('btn-clear-favorite'),
    btnExportFavorite: document.getElementById('btn-export-favorite'),
    btnImportFavoriteTrigger: document.getElementById('btn-import-favorite-trigger'),
    favoriteFileInput: document.getElementById('favorite-file-input'),

    // Contact Direct Phone Accordion
    btnPhoneAccordion: document.getElementById('btn-phone-accordion'),
    phoneAccordionPanel: document.getElementById('phone-accordion-content'),

    // Toast
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg')
  };

  // -------------------------------------------------------------------------
  // 3. INITIALIZATION
  // -------------------------------------------------------------------------
  async function init() {
    // 1. Load Data
    if (window.CIVIL_SERVICES_DATA && Array.isArray(window.CIVIL_SERVICES_DATA)) {
      civilServices = window.CIVIL_SERVICES_DATA;
    } else {
      try {
        const response = await fetch('data/civil_services.json');
        civilServices = await response.json();
      } catch (err) {
        console.error('Failed to fetch civil services data:', err);
      }
    }

    // 2. Multi-tier check for favorites
    state.favoriteIds = LocalStore.get(FAV_STORAGE_KEY, []);
    state.recentIds = LocalStore.get(RECENT_STORAGE_KEY, []);
    state.checkedDocs = LocalStore.get(DOCS_STORAGE_KEY, {});

    // Try background IndexedDB recovery if empty
    if (state.favoriteIds.length === 0) {
      LocalStore.loadFromIndexedDB(FAV_STORAGE_KEY, (val) => {
        if (Array.isArray(val) && val.length > 0) {
          state.favoriteIds = val;
          updateCategoryCounts();
          updateFavoriteBadge();
          filterAndRenderCivilServices();
        }
      });
    }

    // 3. Update industry, category & favorite counts
    updateIndustryCounts();
    updateCategoryCounts();
    updateFavoriteBadge();
    updateRecentBadge();

    // 4. Render Views
    filterAndRenderCivilServices();
    renderFormsGallery();

    // 5. Setup Event Listeners
    setupEventListeners();

    // 6. Handle initial URL Hash Routing
    handleHashRoute();

    // 7. Multi-tab Sync Listener
    window.addEventListener('storage', (e) => {
      if (e.key === FAV_STORAGE_KEY) {
        state.favoriteIds = LocalStore.get(FAV_STORAGE_KEY, []);
        updateCategoryCounts();
        updateFavoriteBadge();
        renderFavoriteDrawer();
        renderFeaturedServices();
        filterAndRenderCivilServices();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. INDUSTRY COUNTS, CATEGORY COUNTS & FAVORITES LOGIC
  // -------------------------------------------------------------------------
  function isFavorite(id) {
    return state.favoriteIds.includes(id);
  }

  function updateIndustryCounts() {
    const counts = {
      all: civilServices.length,
      transport: 0,
      warehouse: 0,
      forwarding: 0
    };

    civilServices.forEach(item => {
      const ind = getItemIndustry(item);
      if (counts[ind] !== undefined) {
        counts[ind]++;
      }
    });

    if (elements.countIndAll) elements.countIndAll.textContent = counts.all;
    if (elements.countIndTransport) elements.countIndTransport.textContent = counts.transport;
    if (elements.countIndWarehouse) elements.countIndWarehouse.textContent = counts.warehouse;
    if (elements.countIndForwarding) elements.countIndForwarding.textContent = counts.forwarding;
  }

  function updateCategoryCounts() {
    // When an industry is selected, calculate category counts scoped to that industry for high usability
    const targetServices = state.selectedIndustry === 'all' 
      ? civilServices 
      : civilServices.filter(item => getItemIndustry(item) === state.selectedIndustry);

    const counts = {
      all: targetServices.length,
      favorites: targetServices.filter(item => state.favoriteIds.includes(item.id)).length,
      허가: 0,
      신고: 0,
      등록: 0,
      확인: 0,
      단순민원: 0
    };

    targetServices.forEach(item => {
      const cat = item.category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    const countAll = document.getElementById('count-all');
    const countFav = document.getElementById('count-favorites');
    const countPermit = document.getElementById('count-허가');
    const countReport = document.getElementById('count-신고');
    const countReg = document.getElementById('count-등록');
    const countCheck = document.getElementById('count-확인');
    const countSimple = document.getElementById('count-단순민원');

    if (countAll) countAll.textContent = counts.all;
    if (countFav) countFav.textContent = counts.favorites;
    if (countPermit) countPermit.textContent = counts.허가;
    if (countReport) countReport.textContent = counts.신고;
    if (countReg) countReg.textContent = counts.등록;
    if (countCheck) countCheck.textContent = counts.확인;
    if (countSimple) countSimple.textContent = counts.단순민원;
  }

  function toggleFavorite(id, showNotification = true) {
    const item = civilServices.find(s => s.id === id);
    const index = state.favoriteIds.indexOf(id);
    let isAdded = false;

    if (index > -1) {
      state.favoriteIds.splice(index, 1);
      isAdded = false;
    } else {
      state.favoriteIds.unshift(id);
      isAdded = true;
    }

    // Persist across multi-tier storage
    LocalStore.set(FAV_STORAGE_KEY, state.favoriteIds);

    updateFavoriteBadge();
    updateCategoryCounts();
    renderFavoriteDrawer();

    // Update Modal favorite button if active
    updateModalFavoriteState(id);

    // Update all star icons in currently visible views
    updateAllFavoriteIcons(id, isAdded);

    // If current tab is favorites, update list view
    if (state.selectedCategory === 'favorites') {
      filterAndRenderCivilServices();
    }

    if (showNotification) {
      const title = item ? item.title : '민원사무';
      if (isAdded) {
        showToast(`⭐ [${title}] 즐겨찾기에 등록되었습니다.`);
      } else {
        showToast(`[${title}] 즐겨찾기에서 해제되었습니다.`);
      }
    }
  }

  function updateFavoriteBadge() {
    if (elements.favoriteCountBadge) {
      elements.favoriteCountBadge.textContent = state.favoriteIds.length;
    }
    if (elements.countFavorites) {
      elements.countFavorites.textContent = state.favoriteIds.length;
    }
  }

  function updateModalFavoriteState(id) {
    if (!elements.btnModalFavorite) return;
    const currentId = id || state.currentDetailId;
    if (!currentId) return;

    const isFav = isFavorite(currentId);
    elements.btnModalFavorite.classList.toggle('active', isFav);
    elements.btnModalFavorite.innerHTML = `
      <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
      <span class="action-text">${isFav ? '즐겨찾기 됨' : '즐겨찾기'}</span>
    `;
    elements.btnModalFavorite.title = isFav ? '즐겨찾기에서 해제' : '즐겨찾기 등록';
  }

  function updateAllFavoriteIcons(id, isAdded) {
    document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', isAdded);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = `${isAdded ? 'fa-solid' : 'fa-regular'} fa-star`;
      }
      btn.title = isAdded ? '즐겨찾기 해제' : '즐겨찾기 추가';
    });
  }

  function renderFavoriteDrawer() {
    if (!elements.favoriteItemsContainer) return;

    if (state.favoriteIds.length === 0) {
      elements.favoriteItemsContainer.innerHTML = `
        <div class="fav-empty-box">
          <i class="fa-regular fa-star"></i>
          <p><strong>즐겨찾기한 민원이 없습니다.</strong><br>자주 찾는 민원 카드의 ⭐ 별표를 눌러 즐겨찾기에 추가해보세요.</p>
        </div>
      `;
      return;
    }

    const items = state.favoriteIds.map(id => civilServices.find(s => s.id === id)).filter(Boolean);

    elements.favoriteItemsContainer.innerHTML = items.map(item => {
      return `
        <div class="fav-item-card" data-id="${item.id}">
          <div class="fav-item-top">
            <div class="card-badges-wrap">
              <span class="card-num-chip">제${item.number}호</span>
              <span class="badge-type ${item.category}">${item.category}</span>
            </div>
            <button class="btn-fav-item-remove" data-remove-id="${item.id}" title="즐겨찾기 해제" aria-label="${item.title} 즐겨찾기 해제">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="fav-item-title">${escapeHtml(item.title)}</div>
          <div style="font-size: 0.775rem; color: var(--slate-500);">
            처리기간 ${item.processingPeriod} · ${item.feeSimple || item.fee}
          </div>
        </div>
      `;
    }).join('');

    elements.favoriteItemsContainer.querySelectorAll('.fav-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-fav-item-remove')) return;
        elements.favoriteDrawer.setAttribute('hidden', '');
        openCivilDetail(card.dataset.id);
      });
    });

    elements.favoriteItemsContainer.querySelectorAll('.btn-fav-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.removeId);
      });
    });
  }

  // Export Favorites to JSON file
  function exportFavoritesToFile() {
    if (state.favoriteIds.length === 0) {
      showToast('내보낼 즐겨찾기 목록이 없습니다.');
      return;
    }

    const exportData = {
      portal: '남양주시 화물팀 민원서비스 포털',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      favoriteIds: state.favoriteIds
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url;
    a.download = `화물민원_즐겨찾기_백업_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('즐겨찾기 백업 파일이 다운로드되었습니다.');
  }

  // Import Favorites from JSON file
  function importFavoritesFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        let ids = [];
        if (Array.isArray(data)) {
          ids = data;
        } else if (data && Array.isArray(data.favoriteIds)) {
          ids = data.favoriteIds;
        }

        if (ids.length > 0) {
          // Merge unique ids
          const merged = Array.from(new Set([...ids, ...state.favoriteIds]));
          state.favoriteIds = merged;
          LocalStore.set(FAV_STORAGE_KEY, state.favoriteIds);
          updateCategoryCounts();
          updateFavoriteBadge();
          renderFavoriteDrawer();
          renderFeaturedServices();
          filterAndRenderCivilServices();
          showToast(`즐겨찾기 ${ids.length}개가 성공적으로 복원되었습니다.`);
        } else {
          showToast('올바른 즐겨찾기 백업 파일이 아닙니다.');
        }
      } catch (err) {
        showToast('파일 읽기 오류: 올바른 JSON 형식이 아닙니다.');
      }
    };
    reader.readAsText(file);
  }

  // -------------------------------------------------------------------------
  // 5. FILTER, SORT & RENDER: ALL CIVIL SERVICES (전체 민원)
  // -------------------------------------------------------------------------
  function filterAndRenderCivilServices() {
    const q = state.searchQuery.toLowerCase().trim();
    const cat = state.selectedCategory;
    const ind = state.selectedIndustry;

    // Filter
    let filtered = civilServices.filter(item => {
      // Industry match
      if (ind !== 'all' && getItemIndustry(item) !== ind) {
        return false;
      }

      // Category or Favorites match
      if (cat === 'favorites') {
        if (!state.favoriteIds.includes(item.id)) return false;
      } else if (cat !== 'all' && item.category !== cat) {
        return false;
      }

      // Query match
      if (q) {
        const titleMatch = item.title.toLowerCase().includes(q);
        const numMatch = item.number.includes(q);
        const lawMatch = item.law.toLowerCase().includes(q);
        const deptMatch = item.department.toLowerCase().includes(q);
        const formMatch = item.form.title.toLowerCase().includes(q);
        const docMatch = item.requiredDocuments.some(d => d.name.toLowerCase().includes(q));

        if (!titleMatch && !numMatch && !lawMatch && !deptMatch && !formMatch && !docMatch) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'number-asc':
          return parseInt(a.number, 10) - parseInt(b.number, 10);
        case 'title-asc':
          return a.title.localeCompare(b.title, 'ko');
        case 'period-asc':
          const getDays = (p) => {
            if (p.includes('즉시')) return 0;
            const match = p.match(/(\d+)일/);
            return match ? parseInt(match[1], 10) : 99;
          };
          return getDays(a.processingPeriod) - getDays(b.processingPeriod);
        case 'fee-asc':
          const getFee = (f) => {
            if (f.includes('없음') || f.includes('무료')) return 0;
            const match = f.replace(/,/g, '').match(/(\d+)원/);
            return match ? parseInt(match[1], 10) : 999999;
          };
          return getFee(a.fee) - getFee(b.fee);
        default:
          return 0;
      }
    });

    // Update count & active filter chips
    if (elements.currentResultCount) {
      elements.currentResultCount.textContent = filtered.length;
    }
    renderActiveFilterChips();

    // Toggle Empty State
    if (filtered.length === 0) {
      if (elements.emptyState) {
        elements.emptyState.style.display = 'block';
        if (cat === 'favorites') {
          elements.emptyState.innerHTML = `
            <div class="empty-icon text-amber"><i class="fa-solid fa-star"></i></div>
            <h4 class="empty-title">등록된 즐겨찾기 민원이 없습니다</h4>
            <p class="empty-desc">자주 확인하는 민원의 ⭐ 별표 아이콘을 클릭하여 즐겨찾기로 등록해보세요.</p>
            <button id="btn-reset-filters-fav" class="btn-primary-sm"><i class="fa-solid fa-rotate-left"></i> 전체 민원 보기</button>
          `;
          const resetBtn = document.getElementById('btn-reset-filters-fav');
          if (resetBtn) {
            resetBtn.addEventListener('click', () => {
              resetAllFilters();
            });
          }
        } else {
          elements.emptyState.innerHTML = `
            <div class="empty-icon"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
            <h4 class="empty-title">일치하는 민원사무가 없습니다</h4>
            <p class="empty-desc">선택된 업종/구분 필터를 변경하시거나 검색어를 확인해보세요.</p>
            <button id="btn-reset-filters-empty" class="btn-primary-sm"><i class="fa-solid fa-rotate-left"></i> 필터 및 검색 초기화</button>
          `;
          const resetBtn = document.getElementById('btn-reset-filters-empty');
          if (resetBtn) {
            resetBtn.addEventListener('click', () => {
              resetAllFilters();
            });
          }
        }
      }
      if (elements.civilCardsContainer) elements.civilCardsContainer.style.display = 'none';
      if (elements.civilTableContainer) elements.civilTableContainer.style.display = 'none';
      return;
    } else {
      if (elements.emptyState) elements.emptyState.style.display = 'none';
    }

    // Render Cards or Table
    if (state.viewMode === 'card') {
      if (elements.civilCardsContainer) {
        elements.civilCardsContainer.style.display = 'grid';
        renderCardsView(filtered);
      }
      if (elements.civilTableContainer) {
        elements.civilTableContainer.style.display = 'none';
      }
    } else {
      if (elements.civilCardsContainer) {
        elements.civilCardsContainer.style.display = 'none';
      }
      if (elements.civilTableContainer) {
        elements.civilTableContainer.style.display = 'block';
        renderTableView(filtered);
      }
    }
  }

  function renderActiveFilterChips() {
    if (!elements.activeFilterIndicators) return;

    const chips = [];

    if (state.selectedIndustry !== 'all') {
      const indInfo = INDUSTRY_LABELS[state.selectedIndustry];
      if (indInfo) {
        chips.push(`
          <button class="filter-chip" data-filter-type="industry" title="업종 필터 해제">
            <i class="fa-solid ${indInfo.icon}"></i> ${indInfo.name}
            <span class="filter-chip-remove"><i class="fa-solid fa-xmark"></i></span>
          </button>
        `);
      }
    }

    if (state.selectedCategory !== 'all') {
      const catLabel = state.selectedCategory === 'favorites' ? '즐겨찾기' : state.selectedCategory;
      const catIcon = state.selectedCategory === 'favorites' ? 'fa-star' : 'fa-filter';
      chips.push(`
        <button class="filter-chip" data-filter-type="category" title="구분 필터 해제">
          <i class="fa-solid ${catIcon}"></i> ${catLabel}
          <span class="filter-chip-remove"><i class="fa-solid fa-xmark"></i></span>
        </button>
      `);
    }

    if (state.searchQuery) {
      chips.push(`
        <button class="filter-chip" data-filter-type="search" title="검색어 초기화">
          <i class="fa-solid fa-magnifying-glass"></i> "${escapeHtml(state.searchQuery)}"
          <span class="filter-chip-remove"><i class="fa-solid fa-xmark"></i></span>
        </button>
      `);
    }

    elements.activeFilterIndicators.innerHTML = chips.join('');

    elements.activeFilterIndicators.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.filterType;
        if (type === 'industry') {
          setIndustryFilter('all');
        } else if (type === 'category') {
          setCategoryFilter('all');
        } else if (type === 'search') {
          state.searchQuery = '';
          elements.heroSearchInput.value = '';
          if (elements.inpageSearch) elements.inpageSearch.value = '';
          if (elements.btnClearSearch) elements.btnClearSearch.hidden = true;
          filterAndRenderCivilServices();
        }
      });
    });
  }

  function setIndustryFilter(industryKey) {
    state.selectedIndustry = industryKey;
    elements.industryTabs.forEach(tab => {
      const match = tab.dataset.industry === industryKey;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    updateCategoryCounts();
    filterAndRenderCivilServices();
  }

  function setCategoryFilter(categoryKey) {
    state.selectedCategory = categoryKey;
    elements.categoryTabs.forEach(tab => {
      const match = tab.dataset.category === categoryKey;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    filterAndRenderCivilServices();
  }

  function resetAllFilters() {
    state.searchQuery = '';
    state.selectedCategory = 'all';
    state.selectedIndustry = 'all';
    elements.heroSearchInput.value = '';
    if (elements.inpageSearch) elements.inpageSearch.value = '';
    if (elements.btnClearSearch) elements.btnClearSearch.hidden = true;

    elements.industryTabs.forEach(tab => {
      const match = tab.dataset.industry === 'all';
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    elements.categoryTabs.forEach(tab => {
      const match = tab.dataset.category === 'all';
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    updateCategoryCounts();
    filterAndRenderCivilServices();
  }

  function renderCardsView(items) {
    elements.civilCardsContainer.innerHTML = items.map(item => {
      const isFav = isFavorite(item.id);
      const indKey = getItemIndustry(item);
      const indInfo = INDUSTRY_LABELS[indKey] || { short: '화물운송', colorClass: 'transport', icon: 'fa-truck-fast' };

      return `
        <article class="civil-card" data-id="${item.id}">
          <div class="civil-card-header">
            <div class="card-badges-wrap" style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <span class="card-num-chip">제${item.number}호</span>
              <span class="badge-type ${item.category}">${item.category}</span>
              <span class="badge-industry ${indInfo.colorClass}"><i class="fa-solid ${indInfo.icon}"></i> ${indInfo.short}</span>
            </div>
            <button class="btn-card-fav ${isFav ? 'active' : ''}" data-fav-id="${item.id}" aria-label="즐겨찾기 토글" title="${isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
          </div>

          <h4 class="civil-card-title">${escapeHtml(item.title)}</h4>
          <p class="civil-law-text" title="${escapeHtml(item.law)}"><i class="fa-solid fa-scale-balanced"></i> ${escapeHtml(item.law)}</p>

          <div class="civil-info-pill-grid">
            <div class="info-pill">
              <span class="info-pill-label">처리기간</span>
              <span class="info-pill-value">${item.processingPeriod}</span>
            </div>
            <div class="info-pill">
              <span class="info-pill-label">수수료</span>
              <span class="info-pill-value">${item.feeSimple || item.fee}</span>
            </div>
          </div>

          <div class="civil-card-actions">
            <button class="btn-card-form" data-form-id="${item.id}" title="서식 미리보기">
              <i class="fa-regular fa-file-lines"></i> 서식보기
            </button>
            <button class="btn-card-detail" data-detail-id="${item.id}">
              <span>상세보기</span> <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach listeners
    elements.civilCardsContainer.querySelectorAll('.btn-card-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      });
    });

    elements.civilCardsContainer.querySelectorAll('.btn-card-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCivilDetail(btn.dataset.detailId);
      });
    });

    elements.civilCardsContainer.querySelectorAll('.btn-card-form').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFormLightbox(btn.dataset.formId);
      });
    });

    elements.civilCardsContainer.querySelectorAll('.civil-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-fav') || e.target.closest('.btn-card-form') || e.target.closest('.btn-card-detail')) return;
        openCivilDetail(card.dataset.id);
      });
    });
  }

  function renderTableView(items) {
    elements.civilTableBody.innerHTML = items.map(item => {
      const isFav = isFavorite(item.id);
      const indKey = getItemIndustry(item);
      const indInfo = INDUSTRY_LABELS[indKey] || { short: '화물운송', colorClass: 'transport', icon: 'fa-truck-fast' };

      return `
        <tr>
          <td class="td-num">
            <button class="btn-table-fav ${isFav ? 'active' : ''}" data-fav-id="${item.id}" title="${isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}" aria-label="즐겨찾기 토글">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
            <span>제${item.number}호</span>
          </td>
          <td class="td-title">
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="badge-industry ${indInfo.colorClass}" style="font-size: 0.675rem; padding: 0.1rem 0.45rem;"><i class="fa-solid ${indInfo.icon}"></i> ${indInfo.short}</span>
            </div>
            <span class="td-law">${escapeHtml(item.law)}</span>
          </td>
          <td><span class="badge-type ${item.category}">${item.category}</span></td>
          <td>
            <div class="td-period-box">
              <span class="period-main">${item.processingPeriod}</span>
              ${item.shortenedPeriod !== '-' ? `<span class="period-sub">단축 ${item.shortenedPeriod}</span>` : ''}
            </div>
          </td>
          <td>${item.feeSimple || item.fee}</td>
          <td>${item.department}</td>
          <td>
            <button class="btn-table-view" data-table-id="${item.id}">
              <span>상세</span> <i class="fa-solid fa-arrow-right"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    elements.civilTableBody.querySelectorAll('.btn-table-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      });
    });

    elements.civilTableBody.querySelectorAll('.btn-table-view').forEach(btn => {
      btn.addEventListener('click', () => {
        openCivilDetail(btn.dataset.tableId);
      });
    });
  }

  // -------------------------------------------------------------------------
  // 7. RENDER: FORMS GALLERY (민원서식 자료실)
  // -------------------------------------------------------------------------
  function renderFormsGallery() {
    if (!elements.formsGridContainer) return;

    const q = state.formsSearchQuery.toLowerCase().trim();
    const cat = state.formsSelectedCat;

    let filtered = civilServices.filter(item => {
      if (cat !== 'all') {
        if (cat === '확인' && (item.category !== '확인' && item.category !== '단순민원')) return false;
        if (cat !== '확인' && item.category !== cat) return false;
      }

      if (q) {
        const formTitle = item.form.title.toLowerCase();
        const formRule = item.form.formNumber.toLowerCase();
        const civilTitle = item.title.toLowerCase();
        if (!formTitle.includes(q) && !formRule.includes(q) && !civilTitle.includes(q)) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      elements.formsGridContainer.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-icon"><i class="fa-regular fa-folder-open"></i></div>
          <h4 class="empty-title">일치하는 신청서식이 없습니다</h4>
          <p class="empty-desc">서식명 또는 관련 민원명으로 다시 검색해보세요.</p>
        </div>
      `;
      return;
    }

    elements.formsGridContainer.innerHTML = filtered.map(item => {
      const form = item.form;
      const isFav = isFavorite(item.id);
      return `
        <article class="form-item-card" data-id="${item.id}">
          <div class="form-thumb-wrap">
            <button class="btn-form-fav ${isFav ? 'active' : ''}" data-fav-id="${item.id}" title="${isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}" aria-label="즐겨찾기 토글">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
            <img src="${form.image}" alt="${escapeHtml(form.title)} 미리보기" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' fill=\'%23f1f5f9\'><text x=\'50%\' y=\'50%\' text-anchor=\'middle\' dominant-baseline=\'middle\' font-size=\'10\' fill=\'%2394a3b8\'>서식 준비중</text></svg>'">
            <div class="form-thumb-overlay">
              <button class="btn-thumb-zoom" data-zoom-id="${item.id}">
                <i class="fa-solid fa-magnifying-glass-plus"></i> 서식 크게보기
              </button>
            </div>
          </div>

          <div class="form-item-body">
            <span class="form-item-tag">${escapeHtml(form.formNumber)}</span>
            <h5 class="form-item-title">${escapeHtml(form.title)}</h5>
            <div class="form-item-civil-link">
              <i class="fa-solid fa-link"></i> <span>관련 민원: ${escapeHtml(item.title)}</span>
            </div>

            <div class="form-item-actions">
              <a href="${form.pdf}" class="btn-form-action-pdf" download="${item.title}_신청서.pdf">
                <i class="fa-solid fa-file-pdf"></i> PDF 다운
              </a>
              <a href="${form.image}" class="btn-form-action-img" download="${item.title}_서식.png">
                <i class="fa-solid fa-image"></i> 이미지 다운
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach listeners
    elements.formsGridContainer.querySelectorAll('.btn-form-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      });
    });

    elements.formsGridContainer.querySelectorAll('.btn-thumb-zoom').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFormLightbox(btn.dataset.zoomId);
      });
    });

    elements.formsGridContainer.querySelectorAll('.form-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a') && !e.target.closest('button')) {
          openFormLightbox(card.dataset.id);
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 8. CIVIL DETAIL MODAL CONTROLLER
  // -------------------------------------------------------------------------
  function openCivilDetail(id) {
    const item = civilServices.find(s => s.id === id);
    if (!item) return;

    state.currentDetailId = id;

    // Track recently viewed
    trackRecentView(id);

    // Update Modal favorite button state
    updateModalFavoriteState(id);

    const indKey = getItemIndustry(item);
    const indInfo = INDUSTRY_LABELS[indKey] || { name: '화물운송사업', colorClass: 'transport', icon: 'fa-truck-fast' };

    // Populate Fields
    elements.modalBadges.innerHTML = `
      <span class="badge-type ${item.category}">${item.category}</span>
      <span class="badge-industry ${indInfo.colorClass}"><i class="fa-solid ${indInfo.icon}"></i> ${indInfo.name}</span>
      <span class="card-num-chip">민원편람 제${item.number}호</span>
    `;

    elements.modalCivilCode.textContent = `남양주시 민원사무편람 제${item.number}호 [${item.category}]`;
    elements.modalCivilTitle.textContent = item.title;
    elements.modalCivilSummary.textContent = `${item.title} 민원에 관한 법령, 구비서류, 수수료 및 업무처리 절차 안내입니다.`;

    // Reference Notice (e.g. * 신청 전 참고 : 화물자동차 유가보조금 관리 규정)
    if (elements.modalCivilNotice) {
      if (item.referenceNote) {
        elements.modalCivilNotice.removeAttribute('hidden');
        elements.modalCivilNotice.innerHTML = `
          <div class="modal-notice-item">
            <span class="notice-prefix">${escapeHtml(item.referenceNote.prefix || '* 신청 전 참고 :')}</span>
            <a href="${escapeHtml(item.referenceNote.file)}" target="_blank" rel="noopener noreferrer" class="notice-link" title="${escapeHtml(item.referenceNote.title)} 원문 규정 PDF 열람하기 (새 창)">
              <i class="fa-solid fa-book-open"></i>
              <span class="notice-link-text">${escapeHtml(item.referenceNote.title)}</span>
              <i class="fa-solid fa-arrow-up-right-from-square notice-ext-icon"></i>
            </a>
          </div>
        `;
      } else {
        elements.modalCivilNotice.setAttribute('hidden', '');
        elements.modalCivilNotice.innerHTML = '';
      }
    }

    // 4 Core cards
    elements.modalCoreLaw.textContent = item.law;
    elements.modalCorePeriod.textContent = `법정 ${item.processingPeriod} ${item.shortenedPeriod !== '-' ? `(단축 ${item.shortenedPeriod})` : ''}`;
    elements.modalCoreFee.textContent = item.fee;
    elements.modalCoreDept.textContent = `${item.department} (${item.phone})`;

    // Meta details
    elements.modalMetaSubmit.textContent = item.submissionTo;
    elements.modalMetaAuthority.textContent = item.dispositionAuthority;
    elements.modalMetaVia.textContent = item.viaInquiry;
    elements.modalMetaSource.textContent = `${item.source.file} (p.${item.source.bookletPage})`;

    // Checklist of required documents
    const checkedSet = new Set(state.checkedDocs[id] || []);
    elements.modalRequiredDocs.innerHTML = item.requiredDocuments.map((doc, idx) => {
      const isChecked = checkedSet.has(idx);
      const hasDownload = !!doc.downloadUrl;
      return `
        <div class="doc-check-item ${isChecked ? 'checked' : ''}" data-doc-idx="${idx}">
          <div class="doc-checkbox"><i class="fa-solid fa-check"></i></div>
          <span class="doc-badge-pill ${doc.type === '필수' ? '필수' : '해당'}">${doc.type}</span>
          <div class="doc-content-wrap">
            <div class="doc-name ${hasDownload ? 'doc-name-downloadable' : ''}" ${hasDownload ? `data-download-url="${escapeHtml(doc.downloadUrl)}" data-download-name="${escapeHtml(doc.downloadName || '이행서약서.pdf')}" title="클릭하여 ${escapeHtml(doc.downloadName || '서식')} 다운로드"` : ''}>
              ${escapeHtml(doc.name)}
              ${hasDownload ? `<span class="doc-download-chip"><i class="fa-solid fa-file-arrow-down"></i> 서식 다운로드</span>` : ''}
            </div>
            ${doc.note ? `<div class="doc-note"><i class="fa-solid fa-circle-info"></i> ${escapeHtml(doc.note)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach download confirmation handlers for downloadable doc items
    elements.modalRequiredDocs.querySelectorAll('.doc-name-downloadable').forEach(dlElem => {
      dlElem.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent toggling checklist
        const url = dlElem.dataset.downloadUrl;
        const filename = dlElem.dataset.downloadName || '이행서약서.pdf';
        if (confirm('다운로드하겠습니까?')) {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    });

    // Attach checklist toggle listeners
    elements.modalRequiredDocs.querySelectorAll('.doc-check-item').forEach(checkItem => {
      checkItem.addEventListener('click', () => {
        const idx = parseInt(checkItem.dataset.docIdx, 10);
        checkItem.classList.toggle('checked');
        
        if (!state.checkedDocs[id]) {
          state.checkedDocs[id] = [];
        }

        if (checkItem.classList.contains('checked')) {
          if (!state.checkedDocs[id].includes(idx)) state.checkedDocs[id].push(idx);
        } else {
          state.checkedDocs[id] = state.checkedDocs[id].filter(i => i !== idx);
        }

        LocalStore.set(DOCS_STORAGE_KEY, state.checkedDocs);
      });
    });

    // Official Checks
    elements.modalOfficialChecks.innerHTML = `
      <ul class="official-check-list">
        ${item.officialCheck.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
      </ul>
    `;

    // Review Criteria
    elements.modalReviewCriteria.innerHTML = `
      <ul class="criteria-list">
        ${item.reviewCriteria.map(cr => `<li>${escapeHtml(cr)}</li>`).join('')}
      </ul>
    `;

    // Process Flowchart
    elements.modalProcessFlow.innerHTML = item.process.map((step, idx) => {
      const isLast = idx === item.process.length - 1;
      return `
        <div class="flow-step-node">
          <span class="step-badge">STEP 0${idx + 1}</span>
          <span class="step-text">${escapeHtml(step)}</span>
        </div>
        ${!isLast ? '<div class="flow-arrow"><i class="fa-solid fa-chevron-right"></i></div>' : ''}
      `;
    }).join('');

    // Form Preview Card
    const form = item.form;
    elements.modalFormRule.textContent = form.formNumber;
    elements.modalFormTitle.textContent = form.title;
    elements.modalFormRev.textContent = `서식 개정: ${form.revisionDate || '최신 개정본'}`;
    elements.modalFormThumb.src = form.image;
    elements.modalFormThumb.alt = `${form.title} 미리보기`;

    elements.btnDownloadPdf.href = form.pdf;
    elements.btnDownloadPdf.setAttribute('download', `${item.title}_신청서.pdf`);

    elements.btnDownloadImg.href = form.image;
    elements.btnDownloadImg.setAttribute('download', `${item.title}_서식.png`);

    // Open modal
    elements.civilModalBackdrop.removeAttribute('hidden');
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
    elements.civilModalBackdrop.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    // Update URL hash
    window.location.hash = `civil/${id}`;
  }

  function closeCivilDetail() {
    elements.civilModalBackdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';
    state.currentDetailId = null;

    if (window.location.hash.startsWith('#civil/')) {
      history.replaceState(null, null, '#civil-list');
    }
  }

  // -------------------------------------------------------------------------
  // 9. LIGHTBOX MODAL CONTROLLER (서식 크게보기)
  // -------------------------------------------------------------------------
  function openFormLightbox(id) {
    const item = civilServices.find(s => s.id === id);
    if (!item) return;

    state.lightboxId = id;
    state.lightboxZoom = 1;

    elements.lightboxTitle.textContent = `${item.form.title} (${item.form.formNumber})`;
    elements.lightboxFullImg.src = item.form.image;
    elements.lightboxImgWrapper.style.transform = 'scale(1)';

    elements.lightboxDownloadPdf.href = item.form.pdf;
    elements.lightboxDownloadPdf.setAttribute('download', `${item.title}_신청서.pdf`);

    elements.formLightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    window.location.hash = `forms/${id}`;
  }

  function closeFormLightbox() {
    elements.formLightbox.setAttribute('hidden', '');
    if (!state.currentDetailId) {
      document.body.style.overflow = '';
    }
    state.lightboxId = null;

    if (window.location.hash.startsWith('#forms/')) {
      history.replaceState(null, null, '#forms-list');
    }
  }

  function applyZoom(delta) {
    state.lightboxZoom = Math.max(0.5, Math.min(3.0, state.lightboxZoom + delta));
    elements.lightboxImgWrapper.style.transform = `scale(${state.lightboxZoom})`;
  }

  function resetZoom() {
    state.lightboxZoom = 1;
    elements.lightboxImgWrapper.style.transform = 'scale(1)';
  }

  // -------------------------------------------------------------------------
  // 10. RECENT VIEWS MANAGEMENT
  // -------------------------------------------------------------------------
  function trackRecentView(id) {
    state.recentIds = state.recentIds.filter(i => i !== id);
    state.recentIds.unshift(id);
    if (state.recentIds.length > 8) state.recentIds.pop();

    LocalStore.set(RECENT_STORAGE_KEY, state.recentIds);
    updateRecentBadge();
    renderRecentDrawer();
  }

  function updateRecentBadge() {
    if (elements.recentCountBadge) {
      elements.recentCountBadge.textContent = state.recentIds.length;
    }
  }

  function renderRecentDrawer() {
    if (!elements.recentItemsContainer) return;

    if (state.recentIds.length === 0) {
      elements.recentItemsContainer.innerHTML = `
        <div style="text-align: center; color: var(--slate-400); padding: 3rem 1rem;">
          <i class="fa-regular fa-clock" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <p>최근 확인한 민원이 없습니다.</p>
        </div>
      `;
      return;
    }

    const items = state.recentIds.map(id => civilServices.find(s => s.id === id)).filter(Boolean);

    elements.recentItemsContainer.innerHTML = items.map(item => {
      return `
        <div class="recent-item-card" data-id="${item.id}">
          <div class="recent-item-top">
            <span class="card-num-chip">제${item.number}호</span>
            <span class="badge-type ${item.category}">${item.category}</span>
          </div>
          <div class="recent-item-title">${escapeHtml(item.title)}</div>
          <div style="font-size: 0.775rem; color: var(--slate-500);">
            처리기간 ${item.processingPeriod} · ${item.feeSimple || item.fee}
          </div>
        </div>
      `;
    }).join('');

    elements.recentItemsContainer.querySelectorAll('.recent-item-card').forEach(card => {
      card.addEventListener('click', () => {
        elements.recentDrawer.setAttribute('hidden', '');
        openCivilDetail(card.dataset.id);
      });
    });
  }

  // -------------------------------------------------------------------------
  // 11. TOAST & SHARING & PRINTING
  // -------------------------------------------------------------------------
  function showToast(message) {
    if (!elements.toast || !elements.toastMsg) return;
    elements.toastMsg.textContent = message;
    elements.toast.removeAttribute('hidden');

    setTimeout(() => {
      elements.toast.setAttribute('hidden', '');
    }, 3000);
  }

  function copyCurrentLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('민원안내 링크가 클립보드에 복사되었습니다.');
      });
    } else {
      showToast('링크 복사 완료!');
    }
  }

  function printCivilDetail() {
    window.print();
  }

  // -------------------------------------------------------------------------
  // 12. ROUTING & EVENT LISTENERS
  // -------------------------------------------------------------------------
  function handleHashRoute() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    if (hash.startsWith('civil/')) {
      const id = hash.replace('civil/', '');
      openCivilDetail(id);
    } else if (hash.startsWith('forms/')) {
      const id = hash.replace('forms/', '');
      openFormLightbox(id);
    }
  }

  function setupEventListeners() {
    // Window Hash Change
    window.addEventListener('hashchange', handleHashRoute);

    // Hero Search Input
    elements.heroSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.searchQuery = val;
      if (elements.btnClearSearch) {
        elements.btnClearSearch.hidden = !val;
      }
      if (elements.inpageSearch) {
        elements.inpageSearch.value = val;
      }
      filterAndRenderCivilServices();
    });

    elements.btnClearSearch.addEventListener('click', () => {
      elements.heroSearchInput.value = '';
      state.searchQuery = '';
      elements.btnClearSearch.hidden = true;
      if (elements.inpageSearch) elements.inpageSearch.value = '';
      filterAndRenderCivilServices();
    });

    elements.btnSearchSubmit.addEventListener('click', () => {
      const civilSection = document.getElementById('civil-list');
      if (civilSection) {
        civilSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Quick Tag Chips
    elements.tagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const keyword = chip.dataset.keyword;
        elements.heroSearchInput.value = keyword;
        state.searchQuery = keyword;
        if (elements.btnClearSearch) elements.btnClearSearch.hidden = false;
        if (elements.inpageSearch) elements.inpageSearch.value = keyword;
        filterAndRenderCivilServices();

        const civilSection = document.getElementById('civil-list');
        if (civilSection) {
          civilSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Business Industry Filter Tabs & Direct Civil Actions
    elements.industryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.dataset.civilId) {
          openCivilDetail(tab.dataset.civilId);
          return;
        }
        const ind = tab.dataset.industry;
        if (ind) setIndustryFilter(ind);
      });
    });

    // Category Tabs
    elements.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setCategoryFilter(tab.dataset.category);
      });
    });

    // Inpage Search
    if (elements.inpageSearch) {
      elements.inpageSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        elements.heroSearchInput.value = e.target.value;
        if (elements.btnClearSearch) elements.btnClearSearch.hidden = !e.target.value;
        filterAndRenderCivilServices();
      });
    }

    // Sort Select
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        filterAndRenderCivilServices();
      });
    }

    // View Toggle
    if (elements.btnViewCard && elements.btnViewTable) {
      elements.btnViewCard.addEventListener('click', () => {
        elements.btnViewCard.classList.add('active');
        elements.btnViewCard.setAttribute('aria-pressed', 'true');
        elements.btnViewTable.classList.remove('active');
        elements.btnViewTable.setAttribute('aria-pressed', 'false');
        state.viewMode = 'card';
        filterAndRenderCivilServices();
      });

      elements.btnViewTable.addEventListener('click', () => {
        elements.btnViewTable.classList.add('active');
        elements.btnViewTable.setAttribute('aria-pressed', 'true');
        elements.btnViewCard.classList.remove('active');
        elements.btnViewCard.setAttribute('aria-pressed', 'false');
        state.viewMode = 'table';
        filterAndRenderCivilServices();
      });
    }

    // Reset Filters
    if (elements.btnResetFilters) {
      elements.btnResetFilters.addEventListener('click', resetAllFilters);
    }

    // Forms Search & Category Filter
    if (elements.formsSearchInput) {
      elements.formsSearchInput.addEventListener('input', (e) => {
        state.formsSearchQuery = e.target.value;
        renderFormsGallery();
      });
    }

    elements.formsCatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.formsCatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.formsSelectedCat = btn.dataset.formcat;
        renderFormsGallery();
      });
    });

    // Civil Detail Modal Actions
    elements.btnModalClose.addEventListener('click', closeCivilDetail);
    elements.btnModalCloseBottom.addEventListener('click', closeCivilDetail);
    elements.btnModalBack.addEventListener('click', closeCivilDetail);
    elements.btnModalPrint.addEventListener('click', printCivilDetail);
    elements.btnModalShare.addEventListener('click', copyCurrentLink);

    if (elements.btnModalFavorite) {
      elements.btnModalFavorite.addEventListener('click', () => {
        if (state.currentDetailId) {
          toggleFavorite(state.currentDetailId);
        }
      });
    }

    elements.btnPreviewLightbox.addEventListener('click', () => {
      if (state.currentDetailId) openFormLightbox(state.currentDetailId);
    });

    elements.btnZoomFormModal.addEventListener('click', () => {
      if (state.currentDetailId) openFormLightbox(state.currentDetailId);
    });

    // Lightbox Modal Actions
    elements.btnLightboxClose.addEventListener('click', closeFormLightbox);
    elements.btnZoomIn.addEventListener('click', () => applyZoom(0.25));
    elements.btnZoomOut.addEventListener('click', () => applyZoom(-0.25));
    elements.btnZoomReset.addEventListener('click', resetZoom);

    // Mouse wheel zoom in Lightbox
    const lightboxBody = document.getElementById('lightbox-pan-area');
    if (lightboxBody) {
      lightboxBody.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        applyZoom(delta);
      }, { passive: false });
    }

    // Recent Drawer Actions
    elements.btnRecentToggle.addEventListener('click', () => {
      renderRecentDrawer();
      elements.recentDrawer.removeAttribute('hidden');
    });

    elements.btnRecentClose.addEventListener('click', () => {
      elements.recentDrawer.setAttribute('hidden', '');
    });

    elements.btnClearRecent.addEventListener('click', () => {
      state.recentIds = [];
      LocalStore.remove(RECENT_STORAGE_KEY);
      updateRecentBadge();
      renderRecentDrawer();
      showToast('최근 본 민원 목록이 삭제되었습니다.');
    });

    // Favorite Drawer Actions
    if (elements.btnFavoriteToggle) {
      elements.btnFavoriteToggle.addEventListener('click', () => {
        renderFavoriteDrawer();
        elements.favoriteDrawer.removeAttribute('hidden');
      });
    }

    if (elements.btnFavoriteClose) {
      elements.btnFavoriteClose.addEventListener('click', () => {
        elements.favoriteDrawer.setAttribute('hidden', '');
      });
    }

    if (elements.btnClearFavorite) {
      elements.btnClearFavorite.addEventListener('click', () => {
        if (state.favoriteIds.length === 0) return;
        state.favoriteIds = [];
        LocalStore.remove(FAV_STORAGE_KEY);
        updateFavoriteBadge();
        updateCategoryCounts();
        renderFavoriteDrawer();
        document.querySelectorAll('.btn-card-fav, .btn-table-fav, .btn-form-fav, .btn-modal-fav').forEach(btn => {
          btn.classList.remove('active');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-regular fa-star';
        });
        if (state.selectedCategory === 'favorites') {
          filterAndRenderCivilServices();
        }
        showToast('즐겨찾기 목록이 모두 비워졌습니다.');
      });
    }

    // Export & Import Favorites Backup
    if (elements.btnExportFavorite) {
      elements.btnExportFavorite.addEventListener('click', exportFavoritesToFile);
    }

    if (elements.btnImportFavoriteTrigger && elements.favoriteFileInput) {
      elements.btnImportFavoriteTrigger.addEventListener('click', () => {
        elements.favoriteFileInput.click();
      });

      elements.favoriteFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          importFavoritesFromFile(file);
          elements.favoriteFileInput.value = '';
        }
      });
    }

    // Contact Direct Phone Numbers Accordion Toggle
    if (elements.btnPhoneAccordion && elements.phoneAccordionPanel) {
      elements.btnPhoneAccordion.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = elements.btnPhoneAccordion.getAttribute('aria-expanded') === 'true';
        const itemWrap = elements.btnPhoneAccordion.closest('.contact-accordion-item');

        if (isExpanded) {
          elements.btnPhoneAccordion.setAttribute('aria-expanded', 'false');
          elements.phoneAccordionPanel.setAttribute('hidden', '');
          if (itemWrap) itemWrap.classList.remove('active');
        } else {
          elements.btnPhoneAccordion.setAttribute('aria-expanded', 'true');
          elements.phoneAccordionPanel.removeAttribute('hidden');
          if (itemWrap) itemWrap.classList.add('active');
        }
      });
    }

    // Mobile Navigation Drawer
    elements.btnMobileMenu.addEventListener('click', () => {
      elements.mobileNavDrawer.removeAttribute('hidden');
    });

    elements.btnMobileClose.addEventListener('click', () => {
      elements.mobileNavDrawer.setAttribute('hidden', '');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        elements.mobileNavDrawer.setAttribute('hidden', '');
      });
    });

    // Close Modals on ESC Key or Backdrop Click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!elements.formLightbox.hasAttribute('hidden')) {
          closeFormLightbox();
        } else if (!elements.civilModalBackdrop.hasAttribute('hidden')) {
          closeCivilDetail();
        } else if (elements.favoriteDrawer && !elements.favoriteDrawer.hasAttribute('hidden')) {
          elements.favoriteDrawer.setAttribute('hidden', '');
        } else if (!elements.recentDrawer.hasAttribute('hidden')) {
          elements.recentDrawer.setAttribute('hidden', '');
        } else if (!elements.mobileNavDrawer.hasAttribute('hidden')) {
          elements.mobileNavDrawer.setAttribute('hidden', '');
        }
      }
    });

    elements.civilModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.civilModalBackdrop) {
        closeCivilDetail();
      }
    });

    elements.formLightbox.addEventListener('click', (e) => {
      if (e.target === elements.formLightbox) {
        closeFormLightbox();
      }
    });

    elements.recentDrawer.addEventListener('click', (e) => {
      if (e.target === elements.recentDrawer) {
        elements.recentDrawer.setAttribute('hidden', '');
      }
    });

    if (elements.favoriteDrawer) {
      elements.favoriteDrawer.addEventListener('click', (e) => {
        if (e.target === elements.favoriteDrawer) {
          elements.favoriteDrawer.setAttribute('hidden', '');
        }
      });
    }
  }

  // Helper: HTML Escape
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------------------
  // 13. DOM READY TRIGGER
  // -------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
