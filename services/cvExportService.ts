import { CandidateProfile } from '../types';

const CV_PRINT_STYLES = `
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    color: #333;
    background: white;
  }
  .cv-container {
    background: white;
  }
  .cv-header {
    border-bottom: 2px solid #333;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .cv-header h1 {
    margin: 0 0 5px 0;
    font-size: 28px;
    font-weight: bold;
  }
  .headline {
    font-size: 16px;
    color: #666;
    margin: 5px 0;
    font-style: italic;
  }
  .contact {
    font-size: 14px;
    color: #888;
  }
  .cv-section {
    margin-bottom: 25px;
  }
  .cv-section h2 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-bottom: 15px;
    font-weight: bold;
  }
  .experience-item {
    margin-bottom: 15px;
  }
  .exp-header {
    font-weight: bold;
  }
  .exp-dates {
    font-size: 13px;
    color: #666;
    margin: 3px 0;
  }
  .exp-description {
    margin-top: 5px;
    font-size: 14px;
  }
  .education-item {
    margin-bottom: 10px;
  }
  .edu-year {
    color: #666;
    font-size: 13px;
    margin-left: 10px;
  }
  .skills-list {
    font-size: 14px;
    line-height: 1.8;
  }
  .languages-list {
    font-size: 14px;
  }
  .values-list {
    font-size: 14px;
    color: #555;
  }
  @media print {
    body {
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

function formatSkillLevel(level: number | undefined): string {
  const levels: Record<number, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Expert',
    5: 'Master'
  };
  return levels[level || 3] || 'Intermediate';
}

function generateCVHtml(profile: CandidateProfile): string {
  const contactParts = [profile.email, profile.location].filter(Boolean);

  return `
    <div class="cv-container">
      <header class="cv-header">
        <h1>${profile.name || 'Your Name'}</h1>
        ${profile.headline ? `<p class="headline">${profile.headline}</p>` : ''}
        ${contactParts.length > 0 ? `<p class="contact">${contactParts.join(' | ')}</p>` : ''}
      </header>

      ${profile.bio ? `
        <section class="cv-section">
          <h2>Professional Summary</h2>
          <p>${profile.bio}</p>
        </section>
      ` : ''}

      ${profile.experience && profile.experience.length > 0 ? `
        <section class="cv-section">
          <h2>Experience</h2>
          ${profile.experience.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <strong>${exp.role || exp.title || 'Role'}</strong> at ${exp.company || 'Company'}
              </div>
              <div class="exp-dates">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
              ${exp.description ? `<p class="exp-description">${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${profile.education_level ? `
        <section class="cv-section">
          <h2>Education</h2>
          <div class="education-item">
            <strong>${profile.education_level}</strong>
            ${profile.education_field ? ` in ${profile.education_field}` : ''}
            ${profile.education_institution ? ` - ${profile.education_institution}` : ''}
            ${profile.education_graduation_year ? `<span class="edu-year">${profile.education_graduation_year}</span>` : ''}
          </div>
        </section>
      ` : ''}

      ${profile.skills && profile.skills.length > 0 ? `
        <section class="cv-section">
          <h2>Skills</h2>
          <div class="skills-list">
            ${profile.skills.map(s => `${s.name} (${formatSkillLevel(s.level)})`).join(' &bull; ')}
          </div>
        </section>
      ` : ''}

      ${profile.languages && profile.languages.length > 0 ? `
        <section class="cv-section">
          <h2>Languages</h2>
          <div class="languages-list">
            ${profile.languages.map(l => `${l.language} (${l.proficiency})`).join(' &bull; ')}
          </div>
        </section>
      ` : ''}

      ${profile.values && profile.values.length > 0 ? `
        <section class="cv-section">
          <h2>Values & Interests</h2>
          <div class="values-list">
            ${profile.values.join(' &bull; ')}
          </div>
        </section>
      ` : ''}

      ${profile.portfolio && profile.portfolio.length > 0 ? `
        <section class="cv-section">
          <h2>Portfolio & Links</h2>
          <ul>
            ${profile.portfolio.map(p => `<li><a href="${p.url}">${p.title || p.url}</a></li>`).join('')}
          </ul>
        </section>
      ` : ''}
    </div>
  `;
}

export function exportProfileAsCV(profile: CandidateProfile): void {
  const cvHtml = generateCVHtml(profile);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export your CV');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${profile.name || 'Profile'} - CV</title>
      <style>
        ${CV_PRINT_STYLES}
      </style>
    </head>
    <body>
      ${cvHtml}
      <script>
        // Auto-trigger print dialog after load
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

export default exportProfileAsCV;
