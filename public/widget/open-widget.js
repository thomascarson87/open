
(function() {
    'use strict';

    // Configuration
    const SUPABASE_URL = 'https://psjjcdxtjbdpopfbppkh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzampjZHh0amJkcG9wZmJwcGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI4NTEsImV4cCI6MjA3OTgxODg1MX0.IVlKtwSffiCtZhhABD_ev8RemlQ45WBWED_axj9Wcs4';
    const CONFIG = {
        API_BASE: `${SUPABASE_URL}/rest/v1`,
        MODAL_ID: 'open-widget-modal',
        WIDGET_VERSION: '2.0.0'
    };

    // State
    let state = {
        company: null,
        jobs: [],
        candidateProfile: null,
        activeJobId: null,
        companyId: null
    };

    // --- HELPER FUNCTIONS ---

    async function supabaseFetch(endpoint, options = {}) {
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers
        };
        const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, { ...options, headers });
        if (!response.ok) throw new Error(`Supabase API Error: ${response.statusText}`);
        return response.json();
    }

    function getCandidateProfile() {
        const profileData = localStorage.getItem('open_candidate_profile');
        if (!profileData) return null;
        try { return JSON.parse(profileData); } catch { return null; }
    }

    function saveCandidateProfile(profile) {
        localStorage.setItem('open_candidate_profile', JSON.stringify(profile));
        state.candidateProfile = profile;
        renderWidget(); // Re-render to show matches
    }

    function formatSalary(min, max) {
        if (!min) return 'Competitive';
        const k = (num) => `$${Math.round(num / 1000)}k`;
        if (max) return `${k(min)} - ${k(max)}`;
        return `${k(min)}+`;
    }

    function truncate(text, length) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- MATCH CALCULATION ---

    function calculateMatch(job, candidateProfile) {
        if (!candidateProfile) return { overall: 0, breakdown: { skills: 0, values: 0, perks: 0, traits: 0 } };

        const calculateOverlap = (required, candidate) => {
            if (!required || required.length === 0) return 0;
            if (!candidate || candidate.length === 0) return 0;
            // Case insensitive match
            const candidateLower = candidate.map(i => i.toLowerCase());
            const matches = required.filter(item => candidateLower.includes(item.toLowerCase()));
            return (matches.length / required.length) * 100;
        };

        // Extract raw arrays from profile object
        const cSkills = candidateProfile.skills || []; // format depends on storage, assuming string[] or object[]
        const cValues = candidateProfile.values || [];
        const cPerks = candidateProfile.desired_perks || [];
        const cTraits = candidateProfile.character_traits || [];

        // Handle skills if they are objects {name, years}
        const cSkillNames = cSkills.map(s => typeof s === 'string' ? s : s.name);
        
        // Handle job skills if they are objects {name, weight...} (depends on DB, prompt says TEXT[] but types say JobSkill[])
        let jSkills = [];
        if (Array.isArray(job.required_skills)) {
            jSkills = job.required_skills.map(s => typeof s === 'string' ? s : s.name);
        }

        const skillsMatch = calculateOverlap(jSkills, cSkillNames);
        const valuesMatch = calculateOverlap(job.values_list || [], cValues);
        const perksMatch = calculateOverlap(job.perks || [], cPerks);
        const traitsMatch = calculateOverlap(job.desired_traits || [], cTraits);

        const weights = { skills: 0.40, values: 0.20, perks: 0.20, traits: 0.20 };
        const overall = Math.round(
            (skillsMatch * weights.skills) +
            (valuesMatch * weights.values) +
            (perksMatch * weights.perks) +
            (traitsMatch * weights.traits)
        );

        return {
            overall,
            breakdown: {
                skills: Math.round(skillsMatch),
                values: Math.round(valuesMatch),
                perks: Math.round(perksMatch),
                traits: Math.round(traitsMatch)
            }
        };
    }

    function getMatchColor(percentage) {
        if (percentage >= 70) return 'op-match-high';
        if (percentage >= 40) return 'op-match-medium';
        return 'op-match-low';
    }

    // --- STYLES ---

    function injectStyles() {
        if (document.getElementById('open-widget-styles')) return;
        const style = document.createElement('style');
        style.id = 'open-widget-styles';
        style.textContent = `
            .op-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; max-width: 1200px; margin: 0 auto; line-height: 1.5; }
            .op-company-header { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 32px; }
            .op-header-top { display: flex; gap: 24px; align-items: start; margin-bottom: 24px; }
            .op-company-logo { width: 80px; height: 80px; border-radius: 12px; object-fit: cover; background: #f3f4f6; }
            .op-company-info { flex: 1; }
            .op-company-name { font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #111827; line-height: 1.2; }
            .op-tagline { font-size: 16px; color: #6b7280; margin: 0 0 16px 0; }
            .op-badges { display: flex; flex-wrap: wrap; gap: 8px; }
            .op-badge { background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
            
            /* Tabs */
            .op-tabs { display: flex; gap: 24px; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px; }
            .op-tab { padding: 12px 0; border: none; background: none; color: #6b7280; font-weight: 600; font-size: 15px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
            .op-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
            .op-tab:hover { color: #111827; }
            .op-tab-content { display: none; animation: fadeIn 0.3s; }
            .op-tab-content.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            /* Tab Contents */
            .op-about-text { font-size: 15px; color: #374151; margin-bottom: 24px; white-space: pre-line; }
            .op-company-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; }
            .op-stat-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px; }
            .op-stat-value { font-size: 16px; font-weight: 700; color: #111827; }
            
            .op-values-grid, .op-perks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
            .op-value-card, .op-perk-card { background: #f9fafb; padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; border: 1px solid #f3f4f6; }
            .op-value-icon, .op-perk-icon { font-size: 24px; }
            .op-value-text, .op-perk-text { font-weight: 600; color: #374151; font-size: 14px; }

            /* Jobs Grid */
            .op-jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
            .op-job-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; transition: all 0.2s; position: relative; display: flex; flex-direction: column; }
            .op-job-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #d1d5db; }
            .op-job-card.op-high-match { border: 2px solid #10b981; }
            
            .op-match-badge { position: absolute; top: 16px; right: 16px; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
            .op-match-high { background: #d1fae5; color: #065f46; }
            .op-match-medium { background: #fef3c7; color: #92400e; }
            .op-match-low { background: #fee2e2; color: #991b1b; }

            .op-job-title { font-size: 18px; font-weight: 700; margin: 0 0 8px 0; color: #111827; }
            .op-job-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #6b7280; margin-bottom: 16px; }
            .op-job-description { font-size: 14px; color: #4b5563; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            
            .op-job-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
            .op-skill-badge { background: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
            
            .op-job-actions { display: flex; gap: 12px; margin-top: auto; }
            .op-btn-primary { flex: 1; background: #2563eb; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
            .op-btn-primary:hover { background: #1d4ed8; }
            .op-btn-secondary { flex: 1; background: white; color: #374151; border: 1px solid #d1d5db; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
            .op-btn-secondary:hover { background: #f9fafb; border-color: #9ca3af; }

            /* Match Breakdown */
            .op-match-breakdown { margin: 16px 0; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
            .op-match-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
            .op-match-bar:last-child { margin-bottom: 0; }
            .op-match-label { width: 60px; font-size: 12px; font-weight: 600; color: #64748b; }
            .op-bar { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
            .op-bar-fill { height: 100%; border-radius: 3px; }
            .op-match-high .op-bar-fill { background: #10b981; }
            .op-match-medium .op-bar-fill { background: #f59e0b; }
            .op-match-low .op-bar-fill { background: #ef4444; }
            .op-match-percent { width: 30px; text-align: right; font-weight: 600; font-size: 12px; color: #334155; }

            /* Modal */
            .op-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(2px); animation: fadeIn 0.2s; }
            .op-modal-content { background: white; border-radius: 16px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.3s; padding: 0; }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            .op-modal-close { position: absolute; top: 16px; right: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; line-height: 1; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 10; }
            .op-modal-close:hover { background: #f3f4f6; color: #111827; }

            /* Job Detail Modal */
            .op-detail-header { padding: 32px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
            .op-detail-header h2 { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 12px 0; }
            .op-detail-meta { display: flex; gap: 16px; font-size: 14px; color: #64748b; font-weight: 500; }
            
            .op-detail-tabs { display: flex; padding: 0 32px; border-bottom: 1px solid #e2e8f0; background: white; position: sticky; top: 0; z-index: 5; }
            .op-detail-tab { padding: 16px 24px; border: none; background: none; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; }
            .op-detail-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
            
            .op-detail-body { padding: 32px; }
            .op-section { margin-bottom: 32px; }
            .op-section h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 16px 0; }
            .op-section p { color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
            .op-list { padding-left: 20px; color: #4b5563; }
            .op-list li { margin-bottom: 8px; }
            
            /* Application Form */
            .op-app-form { padding: 32px; max-width: 500px; margin: 0 auto; }
            .op-form-group { margin-bottom: 20px; }
            .op-form-group label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
            .op-form-input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; transition: border-color 0.2s; box-sizing: border-box; }
            .op-form-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
            
            .op-form-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
            .op-form-tab { padding: 8px 16px; border-radius: 6px; border: 1px solid #e5e7eb; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #6b7280; }
            .op-form-tab.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
            
            /* Responsive */
            @media (max-width: 768px) {
                .op-header-top { flex-direction: column; align-items: center; text-align: center; }
                .op-badges { justify-content: center; }
                .op-jobs-grid { grid-template-columns: 1fr; }
                .op-tabs { overflow-x: auto; padding-bottom: 4px; }
            }
        `;
        document.head.appendChild(style);
    }

    // --- DOM RENDERING ---

    function renderTabs() {
        return `
            <div class="op-tabs" id="op-company-tabs">
                <button class="op-tab active" data-tab="about">About</button>
                <button class="op-tab" data-tab="values">Values</button>
                <button class="op-tab" data-tab="perks">Perks</button>
                <button class="op-tab" data-tab="culture">Culture</button>
            </div>
        `;
    }

    function renderCompanyHeader() {
        if (!state.company) return '';
        const { company_name, logo_url, tagline, industry = [], headquarters_location, jobs } = state.company;
        const industries = Array.isArray(industry) ? industry : [industry];
        
        return `
            <div class="op-company-header">
                <div class="op-header-top">
                    <img src="${logo_url || 'https://via.placeholder.com/80'}" class="op-company-logo" alt="${escapeHtml(company_name)} Logo" />
                    <div class="op-company-info">
                        <h1 class="op-company-name">${escapeHtml(company_name)}</h1>
                        <p class="op-tagline">${escapeHtml(tagline)}</p>
                        <div class="op-badges">
                            ${industries.map(ind => `<span class="op-badge">${escapeHtml(ind)}</span>`).join('')}
                            <span class="op-badge">📍 ${escapeHtml(headquarters_location)}</span>
                            <span class="op-badge">${state.jobs.length} Open Positions</span>
                        </div>
                    </div>
                </div>
                ${renderTabs()}
                <div class="op-tab-content active" id="about-tab">
                    <div class="op-about-text">${escapeHtml(state.company.about)}</div>
                    ${state.company.mission_statement ? `<div class="op-section"><h3>Our Mission</h3><p>${escapeHtml(state.company.mission_statement)}</p></div>` : ''}
                    <div class="op-company-stats">
                        <div class="op-stat"><span class="op-stat-label">Team Size</span><span class="op-stat-value">${state.company.team_size || 'N/A'}</span></div>
                        <div class="op-stat"><span class="op-stat-label">Founded</span><span class="op-stat-value">${state.company.founded_year || 'N/A'}</span></div>
                        <div class="op-stat"><span class="op-stat-label">Funding</span><span class="op-stat-value">${escapeHtml(state.company.funding_stage || 'N/A')}</span></div>
                    </div>
                </div>
                <div class="op-tab-content" id="values-tab">
                    <div class="op-values-grid">
                        ${(state.company.values || []).map(val => `<div class="op-value-card"><div class="op-value-text">${escapeHtml(val)}</div></div>`).join('')}
                    </div>
                </div>
                <div class="op-tab-content" id="perks-tab">
                    <div class="op-perks-grid">
                        ${(state.company.perks || []).map(perk => `<div class="op-perk-card"><div class="op-perk-text">${escapeHtml(perk)}</div></div>`).join('')}
                    </div>
                </div>
                <div class="op-tab-content" id="culture-tab">
                    <div class="op-about-text">${escapeHtml(state.company.culture_description || 'No culture description available.')}</div>
                </div>
            </div>
        `;
    }

    function renderJobCard(job) {
        let matchHtml = '';
        let cardClass = 'op-job-card';
        
        if (state.candidateProfile) {
            const match = calculateMatch(job, state.candidateProfile);
            const color = getMatchColor(match.overall);
            if (match.overall >= 70) cardClass += ' op-high-match';
            
            matchHtml = `
                <div class="op-match-badge ${color}">${match.overall}% MATCH</div>
                <div class="op-match-breakdown">
                    <div class="op-match-bar">
                        <span class="op-match-label">Skills</span>
                        <div class="op-bar ${getMatchColor(match.breakdown.skills)}"><div class="op-bar-fill" style="width: ${match.breakdown.skills}%"></div></div>
                        <span class="op-match-percent">${match.breakdown.skills}%</span>
                    </div>
                    <div class="op-match-bar">
                        <span class="op-match-label">Values</span>
                        <div class="op-bar ${getMatchColor(match.breakdown.values)}"><div class="op-bar-fill" style="width: ${match.breakdown.values}%"></div></div>
                        <span class="op-match-percent">${match.breakdown.values}%</span>
                    </div>
                </div>
            `;
        }

        // Skills - handle object or string
        const skillList = Array.isArray(job.required_skills) 
            ? job.required_skills.map(s => typeof s === 'string' ? s : s.name).slice(0, 4)
            : [];

        return `
            <div class="${cardClass}" data-job-id="${job.id}">
                ${matchHtml}
                <div class="op-job-header">
                    <h3 class="op-job-title">${escapeHtml(job.title)}</h3>
                    <div class="op-job-meta">
                        <span>📍 ${escapeHtml(job.location)}</span>
                        <span>💰 ${formatSalary(job.salary_min, job.salary_max)}</span>
                        <span>⚡ ${escapeHtml(job.work_mode)}</span>
                    </div>
                </div>
                <div class="op-job-description">${escapeHtml(truncate(job.description, 140))}</div>
                <div class="op-job-skills">
                    ${skillList.map(s => `<span class="op-skill-badge">${escapeHtml(s)}</span>`).join('')}
                </div>
                <div class="op-job-actions">
                    <button class="op-btn-secondary" data-action="detail" data-id="${job.id}">Details</button>
                    <button class="op-btn-primary" data-action="apply" data-id="${job.id}">Apply Now</button>
                </div>
            </div>
        `;
    }

    function renderWidget() {
        const container = document.getElementById('open-careers-widget');
        if (!container) return;

        container.innerHTML = `
            <div class="op-widget">
                ${renderCompanyHeader()}
                <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">Open Positions</h2>
                <div class="op-jobs-grid">
                    ${state.jobs.map(job => renderJobCard(job)).join('')}
                </div>
            </div>
        `;

        // Attach listeners
        attachEventListeners(container);
    }

    function attachEventListeners(container) {
        // Tabs
        container.querySelectorAll('.op-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                container.querySelectorAll('.op-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                container.querySelectorAll('.op-tab-content').forEach(c => c.classList.remove('active'));
                container.querySelector(`#${tab}-tab`).classList.add('active');
            });
        });

        // Job Actions
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                const job = state.jobs.find(j => j.id === id);
                if (action === 'detail') openJobDetail(job);
                if (action === 'apply') openApplication(job);
            });
        });
    }

    // --- MODALS ---

    function openModal(contentHtml) {
        const overlay = document.createElement('div');
        overlay.className = 'op-modal-overlay';
        overlay.innerHTML = `
            <div class="op-modal-content">
                <button class="op-modal-close">&times;</button>
                ${contentHtml}
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.op-modal-close').onclick = () => overlay.remove();
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    }

    function openJobDetail(job) {
        const responsibilities = job.responsibilities || [];
        
        const html = `
            <div class="op-detail-header">
                <h2>${escapeHtml(job.title)}</h2>
                <div class="op-detail-meta">
                    <span>📍 ${escapeHtml(job.location)}</span>
                    <span>💰 ${formatSalary(job.salary_min, job.salary_max)}</span>
                    <span>⚡ ${escapeHtml(job.work_mode)}</span>
                </div>
            </div>
            <div class="op-detail-body">
                <div class="op-section">
                    <h3>About the Role</h3>
                    <p>${escapeHtml(job.description)}</p>
                </div>
                ${job.impact_statement ? `<div class="op-section"><h3>Impact</h3><p>${escapeHtml(job.impact_statement)}</p></div>` : ''}
                ${responsibilities.length > 0 ? `
                    <div class="op-section">
                        <h3>Responsibilities</h3>
                        <ul class="op-list">${responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                <button class="op-btn-primary op-btn-large" id="modal-apply-btn">Apply Now</button>
            </div>
        `;
        openModal(html);
        document.getElementById('modal-apply-btn').onclick = () => {
            document.querySelector('.op-modal-overlay').remove();
            openApplication(job);
        };
    }

    function openApplication(job) {
        const html = `
            <div class="op-app-form">
                <h2 style="margin-bottom: 8px;">Apply for ${escapeHtml(job.title)}</h2>
                <p style="color: #6b7280; margin-bottom: 24px;">Takes less than 2 minutes</p>
                <form id="op-app-form">
                    <div class="op-form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" class="op-form-input" required placeholder="Jane Doe" />
                    </div>
                    <div class="op-form-group">
                        <label>Email *</label>
                        <input type="email" name="email" class="op-form-input" required placeholder="jane@example.com" />
                    </div>
                    <div class="op-form-group">
                        <label>Resume / LinkedIn URL *</label>
                        <input type="url" name="resume" class="op-form-input" required placeholder="https://linkedin.com/in/..." />
                    </div>
                    <button type="submit" class="op-btn-primary op-btn-large">Submit Application</button>
                </form>
            </div>
        `;
        openModal(html);
        
        document.getElementById('op-app-form').onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.innerText = 'Submitting...';
            
            const formData = new FormData(e.target);
            const data = {
                job_id: job.id,
                company_id: state.companyId,
                candidate_name: formData.get('name'),
                candidate_email: formData.get('email'),
                resume_url: formData.get('resume'),
                source: 'widget',
                status: 'applied'
            };

            try {
                const res = await supabaseFetch('/applications', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                
                // Track this "login" for future
                saveCandidateProfile({
                    email: data.candidate_email,
                    name: data.candidate_name,
                    // Empty skills for now, typically we'd parse them
                    skills: [],
                    values: [],
                    character_traits: []
                });

                document.querySelector('.op-modal-overlay').remove();
                openSuccessModal(data.candidate_email);
            } catch (err) {
                alert('Error submitting application. Please try again.');
                btn.disabled = false;
                btn.innerText = 'Submit Application';
                console.error(err);
            }
        };
    }

    function openSuccessModal(email) {
        const html = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h2 style="margin-bottom: 16px;">Application Sent!</h2>
                <p style="color: #4b5563; margin-bottom: 32px;">We've sent a confirmation to <strong>${escapeHtml(email)}</strong>.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; border-radius: 12px; text-align: left;">
                    <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 18px;">Boost your chances 🚀</h3>
                    <p style="color: #15803d; font-size: 14px; margin-bottom: 16px;">Complete your profile on Open Platform to see match scores and get discovered by other companies.</p>
                    <a href="https://open-sable.vercel.app/?view=login&email=${encodeURIComponent(email)}" target="_blank" class="op-btn-primary" style="display: block; text-align: center; text-decoration: none;">Complete Profile</a>
                </div>
            </div>
        `;
        openModal(html);
    }

    // --- INIT ---

    async function init() {
        const script = document.currentScript;
        const companyId = script?.getAttribute('data-company-id');
        if (!companyId) return console.error('Open Widget: data-company-id missing');
        state.companyId = companyId;

        // Load profile from local storage
        state.candidateProfile = getCandidateProfile();

        injectStyles();

        try {
            // Fetch Company
            const companies = await supabaseFetch(`/company_profiles?id=eq.${companyId}&select=*`);
            state.company = companies[0];

            // Fetch Jobs
            const jobs = await supabaseFetch(`/jobs?company_id=eq.${companyId}&status=eq.published&order=posted_date.desc&select=*`);
            state.jobs = jobs;

            renderWidget();
        } catch (e) {
            console.error('Open Widget Init Error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
