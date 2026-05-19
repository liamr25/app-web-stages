const DEFAULT_STAGES = [
    {
        id: 1,
        student: 'Dupont Martin',
        classroom: 'SIO1 - 2026',
        company: 'Société Ex.',
        contact: 'contact@ex.com',
        phone: '+33 1 23 45 67 89',
        address: '12 rue Exemple, 75000 Paris',
        contactMode: 'email',
        contactDate: '2026-02-10',
        response: 'positif',
        remindDate: '2026-02-17',
        remindMode: 'email',
        contactPerson: 'Mme Dupont - Responsable RH',
        notes: 'Entreprise intéressée, stage confirmé',
        convention: {
            sent: true,
            signedByCo: true,
            signedByStudent: true,
            signedByEstablishment: false
        }
    },
    {
        id: 2,
        student: 'Leclerc Julie',
        classroom: 'SIO1 - 2026',
        company: 'Atelier Demo',
        contact: 'info@atelierdemo.fr',
        phone: '',
        address: '',
        contactMode: 'email',
        contactDate: '',
        response: 'attente',
        remindDate: '',
        remindMode: '',
        contactPerson: '',
        notes: 'Pas encore contactée',
        convention: {
            sent: false,
            signedByCo: false,
            signedByStudent: false,
            signedByEstablishment: false
        }
    }
];

// ====== STORAGE (via StorageAdapter -> Supabase ou localStorage) ======

async function initData() {
    if (window.StorageAdapter) {
        await window.StorageAdapter.init();
        // Pré-peupler seulement si localStorage vide ET pas de remote
        if (!window.StorageAdapter.isRemote) {
            const STORAGE_KEY = 'stages_data';
            if (!localStorage.getItem(STORAGE_KEY)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAGES));
            }
        }
    } else {
        const STORAGE_KEY = 'stages_data';
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAGES));
        }
    }
}

async function getAllStages() {
    if (window.StorageAdapter) {
        return await window.StorageAdapter.getAllStages();
    }
    return JSON.parse(localStorage.getItem('stages_data') || '[]');
}

async function saveStages(stages) {
    if (window.StorageAdapter) {
        await window.StorageAdapter.saveStages(stages);
    } else {
        localStorage.setItem('stages_data', JSON.stringify(stages));
    }
    await renderStages(stages);
}

async function addStage(stage) {
    try {
        await fetch("https://script.google.com/macros/s/AKfycbzX9Oo0vSYV7i8fmEpY1z2ZNt4Kwsh7IVGrhg_2c4D3tPYGVOcMV9-Qbp2mwkfPNzIP/exec", {
            method: "POST",
            body: JSON.stringify({
                student_name: stage.student,
                classroom: stage.classroom,
                company_name: stage.company,
                email: stage.contact,
                phone: stage.phone,
                address: stage.address,
                contact_mode: stage.contactMode,
                contact_date: stage.contactDate || null,
                status: stage.response,
                reminder_date: stage.remindDate || null,
                reminder_mode: stage.remindMode || null,
                contact_person: stage.contactPerson,
                notes: stage.notes,
                convention_sent: stage.convention.sent,
                signed_by_company: stage.convention.signedByCo,
                signed_by_student: stage.convention.signedByStudent,
                signed_by_school: stage.convention.signedByEstablishment
            })
        });

        showToast("✅ Stage enregistré dans Google Sheets !", "success");

        return stage;
    } catch (err) {
        console.error(err);
        showToast("❌ Erreur envoi Google Sheets", "error");
    }
}

async function deleteStage(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')) return;
    if (window.StorageAdapter) {
        await window.StorageAdapter.deleteStage(id);
    } else {
        const stages = JSON.parse(localStorage.getItem('stages_data') || '[]').filter(s => s.id !== id);
        localStorage.setItem('stages_data', JSON.stringify(stages));
    }
    await renderStages();
    showToast('Stage supprimé avec succès.', 'success');
}

async function updateStage(id, updates) {
    if (window.StorageAdapter) {
        await window.StorageAdapter.updateStage(id, updates);
    } else {
        const stages = JSON.parse(localStorage.getItem('stages_data') || '[]');
        const index = stages.findIndex(s => s.id === id);
        if (index !== -1) {
            stages[index] = { ...stages[index], ...updates };
            localStorage.setItem('stages_data', JSON.stringify(stages));
        }
    }
    await renderStages();
}

async function clearAllData() {
    if (!confirm('Êtes-vous sûr? Cette action supprimera tous les stages.')) return;
    if (window.StorageAdapter) {
        await window.StorageAdapter.clearAllData();
    } else {
        localStorage.removeItem('stages_data');
    }
    await initData();
    location.reload();
}

// ====== RENDU ======

async function renderStages(stages) {
    const listContainer = document.getElementById('stages-list');
    const noResults = document.getElementById('no-results');
    const countInfo = document.getElementById('count-info');

    if (!listContainer) return;

    if (!stages) {
        stages = await getAllStages();
    }

    if (stages.length === 0) {
        listContainer.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        if (countInfo) countInfo.textContent = 'Aucun stage';
        return;
    }

    if (noResults) noResults.style.display = 'none';
    if (countInfo) countInfo.textContent = `${stages.length} stage${stages.length > 1 ? 's' : ''}`;

    listContainer.innerHTML = stages.map(stage => `
        <article class="stage neon-primary">
            <div class="stage-header">
                <h3>${escapeHtml(stage.student)} — ${escapeHtml(stage.company)}</h3>
                <span class="stage-badge badge-${stage.response}">${formatResponse(stage.response)}</span>
            </div>
            <p class="stage-meta">Classe: ${escapeHtml(stage.classroom)} | Contact: ${escapeHtml(stage.contact || 'N/A')} | Réponse: ${formatResponse(stage.response)}</p>
            
            <div class="stage-details">
                <div class="detail-item">
                    <div class="detail-label">Entreprise</div>
                    <div class="detail-value">${escapeHtml(stage.company)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Adresse</div>
                    <div class="detail-value">${escapeHtml(stage.address) || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Téléphone</div>
                    <div class="detail-value">${escapeHtml(stage.phone) || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Mode contact</div>
                    <div class="detail-value">${escapeHtml(stage.contactMode)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date contact</div>
                    <div class="detail-value">${stage.contactDate || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date relance</div>
                    <div class="detail-value">${stage.remindDate || 'N/A'}</div>
                </div>
            </div>

            <div class="convention-checklist">
                <ul>
                    <li class="${stage.convention.sent ? 'done' : 'pending'}">Convention initiale envoyée</li>
                    <li class="${stage.convention.signedByCo ? 'done' : 'pending'}">Convention signée entreprise et tuteur</li>
                    <li class="${stage.convention.signedByStudent ? 'done' : 'pending'}">Convention signée étudiant et professeur</li>
                    <li class="${stage.convention.signedByEstablishment ? 'done' : 'pending'}">Convention signée par établissement</li>
                </ul>
            </div>

            ${stage.notes ? `<p style="margin: 12px 0 0; padding: 12px; background: var(--bg-main); border-radius: 4px; font-size: 0.9rem;"><strong>Notes:</strong> ${escapeHtml(stage.notes)}</p>` : ''}

            <div class="stage-actions">
                <button class="btn btn-primary neon-primary" onclick="window.location.href='formulaire.html?id=${stage.id}'">Modifier</button>
                <button class="btn btn-danger" onclick="deleteStage(${stage.id})">Supprimer</button>
            </div>
        </article>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatResponse(response) {
    const map = {
        'positif': '✓ Positif',
        'négatif': '✗ Négatif',
        'attente': '⏳ En attente'
    };
    return map[response] || response;
}

// ====== TOAST ======

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ====== EXPORT CSV ======

async function exportToCSV() {
    const stages = await getAllStages();
    if (stages.length === 0) {
        showToast('Aucun stage à exporter.', 'info');
        return;
    }

    const headers = ['ID', 'Etudiant', 'Classe', 'Entreprise', 'Contact', 'Telephone', 'Reponse', 'Date Contact', 'Notes'];
    const rows = stages.map(stage => [
        stage.id,
        `"${stage.student}"`,
        `"${stage.classroom}"`,
        `"${stage.company}"`,
        `"${stage.contact}"`,
        `"${stage.phone}"`,
        stage.response,
        stage.contactDate,
        `"${(stage.notes || '').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Export_Stages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Exportation CSV réussie !', 'success');
}

// ====== RECHERCHE / FILTRES ======

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const searchForm = document.querySelector('form[role="search"]');
    if (searchForm) {
        searchForm.addEventListener('submit', e => e.preventDefault());
    }
    if (!searchInput) return;

    const filterData = async () => {
        const query = searchInput.value.toLowerCase();
        const status = filterStatus ? filterStatus.value : 'all';
        const allStages = await getAllStages();

        const filtered = allStages.filter(stage => {
            const matchesText = stage.student.toLowerCase().includes(query) ||
                stage.company.toLowerCase().includes(query) ||
                stage.classroom.toLowerCase().includes(query) ||
                (stage.contactPerson && stage.contactPerson.toLowerCase().includes(query));
            const matchesStatus = status === 'all' || stage.response === status;
            return matchesText && matchesStatus;
        });
        renderStages(filtered);
    };

    searchInput.addEventListener('input', filterData);
    if (filterStatus) {
        filterStatus.addEventListener('change', filterData);
    }
}

// ====== NAVIGATION ======

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
    });
}

// ====== THÈME ======

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Activer thème clair' : 'Activer thème sombre');
        toggle.classList.toggle('dark', theme === 'dark');
        const use = toggle.querySelector('use');
        if (use) {
            use.setAttribute('xlink:href', theme === 'dark' ? '#sf-sun' : '#sf-moon');
        }
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }
}

// ====== SWIPE NAVIGATION ======

function addSwipeNavigation() {
    let startX = 0;
    let dist = 0;
    const threshold = 80;
    const pages = ['index.html', 'formulaire.html', 'conventions.html'];
    function onTouchStart(e) {
        const t = e.changedTouches[0];
        startX = t.pageX;
        dist = 0;
    }
    function onTouchMove(e) {
        const t = e.changedTouches[0];
        dist = t.pageX - startX;
    }
    function onTouchEnd(e) {
        if (Math.abs(dist) > threshold) {
            const current = window.location.pathname.split('/').pop() || 'index.html';
            const idx = pages.indexOf(current);
            if (dist < 0 && idx < pages.length - 1) {
                window.location.href = pages[idx + 1];
            } else if (dist > 0 && idx > 0) {
                window.location.href = pages[idx - 1];
            }
        }
        startX = 0;
        dist = 0;
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
}

// ====== INIT ======

document.addEventListener('DOMContentLoaded', async () => {
    await initData();
    await renderStages();
    setupSearch();
    initTheme();
    setActiveNav();
    addSwipeNavigation();

    // Indicateur mode de stockage (console)
    if (window.StorageAdapter && window.StorageAdapter.isRemote) {
        console.info('✅ Mode: Supabase (BDD distante)');
    } else {
        console.info('ℹ️ Mode: localStorage (fallback local)');
    }
});

// Exports globaux
window.deleteStage = deleteStage;
window.clearAllData = clearAllData;
window.addStage = addStage;
window.updateStage = updateStage;
window.getAllStages = getAllStages;
window.exportToCSV = exportToCSV;
window.showToast = showToast;
window.toggleTheme = toggleTheme;
