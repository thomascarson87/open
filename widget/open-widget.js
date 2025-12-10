
/**
 * Open Platform Embeddable Widget
 * Usage: <script src="https://[your-domain]/widget/open-widget.js" data-company-id="[UUID]"></script>
 */

(function() {
    'use strict';
    
    // Configuration - pointing to Supabase directly for Serverless operation
    const SUPABASE_URL = 'https://psjjcdxtjbdpopfbppkh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzampjZHh0amJkcG9wZmJwcGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI4NTEsImV4cCI6MjA3OTgxODg1MX0.IVlKtwSffiCtZhhABD_ev8RemlQ45WBWED_axj9Wcs4';
    
    const CONFIG = {
      API_BASE: `${SUPABASE_URL}/rest/v1`,
      MODAL_OVERLAY_ID: 'open-widget-modal-overlay',
      WIDGET_VERSION: '1.0.0'
    };
    
    // Helper for Supabase Fetch
    async function supabaseFetch(endpoint, options = {}) {
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation', // Helper to get data back on inserts
            ...options.headers
        };
        
        const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`Supabase API Error: ${response.statusText}`);
        }
        return response.json();
    }

    // Get company ID from script tag
    const script = document.currentScript;
    const companyId = script?.getAttribute('data-company-id');
    
    if (!companyId) {
      console.error('[Open Widget] Missing data-company-id attribute');
      return;
    }
    
    // Initialize widget on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    
    async function init() {
      try {
        // Load widget configuration and jobs
        const [configData, jobs] = await Promise.all([
          fetchWidgetConfig(companyId),
          fetchJobs(companyId)
        ]);

        const config = configData[0] || { 
            brand_color_primary: '#0f172a', 
            brand_color_secondary: '#3b82f6',
            show_company_logo: true,
            show_salary_range: true
        };

        // Add Company Name to config (fetched from jobs or separate call)
        // For efficiency we'll assume the first job has the company name or we fetch profile
        if (jobs.length > 0) {
            config.companyName = jobs[0].company_name;
            config.companyLogoUrl = jobs[0].company_logo;
        } else {
             // Fallback fetch
             const profiles = await supabaseFetch(`/company_profiles?id=eq.${companyId}&select=company_name,logo_url`);
             if (profiles[0]) {
                 config.companyName = profiles[0].company_name;
                 config.companyLogoUrl = profiles[0].logo_url;
             }
        }
        
        // Inject styles
        injectStyles(config);
        
        // Find container
        const container = document.getElementById('open-careers-widget');
        if (!container) {
          console.error('[Open Widget] Container #open-careers-widget not found. Please add <div id="open-careers-widget"></div> to your page.');
          return;
        }
        
        // Render job board
        renderJobBoard(container, jobs, config);
        
        // Track page view
        trackEvent('widget_loaded', { companyId, jobCount: jobs.length });
        
      } catch (error) {
        console.error('[Open Widget] Initialization failed:', error);
      }
    }
    
    async function fetchWidgetConfig(id) {
      return supabaseFetch(`/widget_configurations?company_id=eq.${id}&select=*`);
    }
    
    async function fetchJobs(id) {
      return supabaseFetch(`/jobs?company_id=eq.${id}&status=eq.published&order=posted_date.desc&select=*`);
    }
    
    function injectStyles(config) {
      const styleId = 'open-widget-styles';
      if (document.getElementById(styleId)) return;
      
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .open-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          color: #111827;
        }
        
        .open-widget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }
        
        .open-job-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }
        
        .open-job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: ${config.brand_color_primary};
        }
        
        .open-job-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }
        
        .open-job-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin: 8px 0;
          font-size: 13px;
          color: #6b7280;
        }
        
        .open-job-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .open-job-skills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: auto;
          padding-top: 16px;
        }
        
        .open-skill-tag {
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
          color: #4b5563;
        }
        
        .open-apply-btn {
          margin-top: 16px;
          width: 100%;
          padding: 12px;
          background: ${config.brand_color_primary};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .open-apply-btn:hover {
          opacity: 0.9;
        }
        
        /* Modal Styles */
        .open-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s;
          padding: 16px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .open-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          position: relative;
          animation: slideUp 0.3s;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .open-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
          line-height: 1;
        }
        
        .open-form-group {
          margin-bottom: 16px;
        }
        
        .open-form-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 6px;
          color: #374151;
        }
        
        .open-form-input,
        .open-form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        
        .open-form-input:focus,
        .open-form-textarea:focus {
          outline: none;
          border-color: ${config.brand_color_primary};
          box-shadow: 0 0 0 3px ${config.brand_color_primary}20;
        }
        
        .open-form-textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .open-submit-btn {
          width: 100%;
          padding: 14px;
          background: ${config.brand_color_primary};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 8px;
        }
        
        .open-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        ${config.custom_css || ''}
      `;
      document.head.appendChild(style);
    }
    
    function renderJobBoard(container, jobs, config) {
      container.innerHTML = `
        <div class="open-widget">
          ${config.show_company_logo && config.companyLogoUrl ? `
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="${config.companyLogoUrl}" alt="Company Logo" style="max-height: 50px; height: auto;">
            </div>
          ` : ''}
          
          <h2 style="font-size: 24px; font-weight: 800; text-align: center; margin: 0 0 8px 0; color: #111827;">
            Careers at ${escapeHtml(config.companyName || 'Us')}
          </h2>
          <p style="text-align: center; color: #6b7280; margin: 0 0 32px 0; font-size: 16px;">
            ${jobs.length} ${jobs.length === 1 ? 'position' : 'positions'} available
          </p>
          
          <div class="open-widget-grid">
            ${jobs.map(job => renderJobCard(job, config)).join('')}
          </div>
        </div>
      `;
      
      // Attach event listeners
      jobs.forEach(job => {
        const button = container.querySelector(`[data-job-id="${job.id}"]`);
        if (button) {
          button.addEventListener('click', (e) => {
              e.stopPropagation();
              openApplicationModal(job, config);
          });
        }
        // Also make card clickable
        const card = container.querySelector(`[data-job-card-id="${job.id}"]`);
        if (card) {
            card.addEventListener('click', () => openApplicationModal(job, config));
        }
      });
    }
    
    function renderJobCard(job, config) {
        // Safe access for skills array
        const skills = Array.isArray(job.required_skills) ? job.required_skills.map(s => typeof s === 'string' ? s : s.name) : [];

      return `
        <div class="open-job-card" data-job-card-id="${job.id}">
          <h3 class="open-job-title">${escapeHtml(job.title)}</h3>
          <div class="open-job-meta">
            <span class="open-job-meta-item">
              📍 ${escapeHtml(job.location || 'Remote')}
            </span>
            ${job.work_mode ? `
            <span class="open-job-meta-item">
              🏢 ${escapeHtml(job.work_mode)}
            </span>` : ''}
            ${config.show_salary_range && job.salary_min ? `
              <span class="open-job-meta-item">
                💰 ${formatSalary(job.salary_min, job.salary_max)}
              </span>
            ` : ''}
          </div>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 8px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml((job.description || '').substring(0, 150))}...
          </p>
          ${skills.length > 0 ? `
            <div class="open-job-skills">
              ${skills.slice(0, 3).map(skill => 
                `<span class="open-skill-tag">${escapeHtml(skill)}</span>`
              ).join('')}
              ${skills.length > 3 ? `<span class="open-skill-tag">+${skills.length - 3}</span>` : ''}
            </div>
          ` : '<div style="flex-grow: 1;"></div>'}
          <button class="open-apply-btn" data-job-id="${job.id}">
            Apply Now
          </button>
        </div>
      `;
    }
    
    function formatSalary(min, max) {
        if (!min) return '';
        const k = (num) => `$${Math.round(num/1000)}k`;
        if (max) return `${k(min)} - ${k(max)}`;
        return `${k(min)}+`;
    }

    function openApplicationModal(job, config) {
      // Track click
      trackEvent('job_clicked', { jobId: job.id, companyId });
      
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.id = CONFIG.MODAL_OVERLAY_ID;
      overlay.className = 'open-modal-overlay';
      overlay.innerHTML = `
        <div class="open-modal">
          <button class="open-modal-close">×</button>
          
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #111827;">
            Apply for ${escapeHtml(job.title)}
          </h2>
          <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">
            at ${escapeHtml(config.companyName || 'us')}
          </p>
          
          <form id="open-application-form">
            <div class="open-form-group">
              <label class="open-form-label">Full Name *</label>
              <input type="text" name="name" class="open-form-input" required placeholder="Jane Doe">
            </div>
            
            <div class="open-form-group">
              <label class="open-form-label">Email *</label>
              <input type="email" name="email" class="open-form-input" required placeholder="jane@example.com">
            </div>
            
            <div class="open-form-group">
              <label class="open-form-label">Phone</label>
              <input type="tel" name="phone" class="open-form-input" placeholder="+1 (555) 000-0000">
            </div>
            
            <div class="open-form-group">
              <label class="open-form-label">Resume/CV URL *</label>
              <input type="url" name="resume" class="open-form-input" required placeholder="https://drive.google.com/file/...">
              <small style="color: #6b7280; font-size: 12px; display: block; margin-top: 4px;">Link to Google Drive, Dropbox, or LinkedIn PDF</small>
            </div>
            
            <div class="open-form-group">
              <label class="open-form-label">Why are you a good fit?</label>
              <textarea name="cover_letter" class="open-form-textarea" placeholder="Briefly describe your experience..."></textarea>
            </div>
            
            <button type="submit" class="open-submit-btn" id="open-submit-btn">
              Submit Application
            </button>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px; text-align: center; line-height: 1.4;">
              By applying, you agree to create an Open Platform profile to track your application status.
            </p>
          </form>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      // Event Listeners
      const form = document.getElementById('open-application-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleApplicationSubmit(form, job, config);
      });
      
      const closeBtn = overlay.querySelector('.open-modal-close');
      closeBtn.addEventListener('click', () => overlay.remove());
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });
    }
    
    async function handleApplicationSubmit(form, job, config) {
      const submitBtn = document.getElementById('open-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      try {
        const formData = new FormData(form);
        const email = formData.get('email');
        
        // 1. Check for existing candidate profile by email
        // Note: In strict RLS, we might not be able to query users table directly.
        // We will insert application and let the backend/trigger handle association logic or assume new.
        // For MVP, we pass null candidate_id if we can't find them, but store email.
        
        const applicationData = {
          job_id: job.id,
          company_id: companyId,
          candidate_name: formData.get('name'),
          candidate_email: email,
          candidate_phone: formData.get('phone'),
          resume_url: formData.get('resume'),
          cover_letter: formData.get('cover_letter'),
          source: 'widget',
          status: 'applied'
        };
        
        // Insert Application
        const result = await supabaseFetch('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
        
        const appId = result[0]?.id;
        
        // Track conversion
        trackEvent('application_submitted', { 
          jobId: job.id, 
          companyId,
          applicationId: appId 
        });
        
        // Show success modal
        showConversionModal(result[0], config, email);
        
      } catch (error) {
        console.error('[Open Widget] Application error:', error);
        alert('Sorry, there was an error submitting your application. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }
    }
    
    function showConversionModal(app, config, email) {
      document.getElementById(CONFIG.MODAL_OVERLAY_ID)?.remove();
      
      const overlay = document.createElement('div');
      overlay.id = CONFIG.MODAL_OVERLAY_ID;
      overlay.className = 'open-modal-overlay';
      overlay.innerHTML = `
        <div class="open-modal" style="max-width: 600px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 12px; color: #111827;">
            Application Sent!
          </h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 32px; line-height: 1.5;">
            Thanks for applying to <strong>${escapeHtml(config.companyName)}</strong>. <br/>
            We've sent a confirmation email to ${escapeHtml(email)}.
          </p>
          
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                      padding: 32px; border-radius: 12px; color: white; margin-bottom: 24px; text-align: left;">
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">
              ⚡️ Boost your chances
            </h3>
            <p style="font-size: 14px; opacity: 0.95; margin-bottom: 24px; line-height: 1.5;">
              Create your profile on Open Platform to track this application, see real-time status updates, and get matched with other top tech companies.
            </p>
            
            <a href="https://openplatform-demo.vercel.app/?view=login&email=${encodeURIComponent(email)}" target="_blank"
               style="display: block; width: 100%; padding: 14px; 
                      background: white; color: #4f46e5; text-decoration: none; border-radius: 8px; 
                      font-size: 16px; font-weight: 700; text-align: center;
                      transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
               onmouseover="this.style.transform='scale(1.02)'"
               onmouseout="this.style.transform='scale(1)'">
              Create Candidate Profile
            </a>
          </div>
          
          <button class="open-modal-close-final"
                  style="background: none; border: none; color: #6b7280; 
                         text-decoration: underline; cursor: pointer; padding: 8px; font-size: 14px;">
            Close and return to jobs
          </button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      overlay.querySelector('.open-modal-close-final').addEventListener('click', () => overlay.remove());
    }
    
    async function trackEvent(eventType, metadata = {}) {
      try {
        await supabaseFetch('/widget_analytics', {
            method: 'POST',
            body: JSON.stringify({
                company_id: companyId,
                event_type: eventType,
                page_url: window.location.href,
                referrer: document.referrer,
                user_agent: navigator.userAgent,
                metadata
            })
        });
      } catch (error) {
        // Silent fail for analytics
        // console.warn('[Open Widget] Analytics error:', error);
      }
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
})();
