let selectedTemplate = 'modern';
let currentPhoto = null;

function openBuilder() {
  document.getElementById('builderModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  updatePreview();
}

function closeBuilder() {
  document.getElementById('builderModal').classList.remove('open');
  document.body.style.overflow = 'auto';
}

function selectTemplate(t, el) {
  selectedTemplate = t;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('cvPreview').className = 'cv-preview ' + t;
  openBuilder();
}

function switchTab(e, name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { currentPhoto = ev.target.result; updatePreview(); };
  reader.readAsDataURL(file);
}

function updatePreview() {
  const val = (id) => document.getElementById(id)?.value || '';
  const photoHTML = currentPhoto ? `<img src="${currentPhoto}" class="photo">` : '';
  const skillsArr = val('skills') ? val('skills').split(',').map(s => s.trim()).filter(Boolean) : [];

  document.getElementById('cvPreview').innerHTML = `
    ${photoHTML}
    <h1>${val('fullName') || 'Your Name'}</h1>
    <div class="job-title">${val('jobTitle') || 'Job Title'}</div>
    <div class="contact-info">${val('email')} ${val('phone') ? ' | ' + val('phone') : ''}</div>
    ${val('summary') ? `<div class="section"><h2>Summary</h2><p>${val('summary')}</p></div>` : ''}
    ${val('expTitle') ? `<div class="section"><h2>Experience</h2><p><strong>${val('expTitle')}</strong> at ${val('expCompany')} (${val('expDuration')})</p><p>${val('expDesc')}</p></div>` : ''}
    ${val('eduDegree') ? `<div class="section"><h2>Education</h2><p><strong>${val('eduDegree')}</strong> - ${val('eduSchool')} (${val('eduYear')})</p></div>` : ''}
    ${skillsArr.length ? `<div class="section"><h2>Skills</h2><p>${skillsArr.join(' • ')}</p></div>` : ''}
    ${val('languages') ? `<div class="section"><h2>Languages</h2><p>${val('languages')}</p></div>` : ''}
  `;
}

function requestDownload() { document.getElementById('downloadModal').classList.add('open'); }
function closeDownloadModal() {
  document.getElementById('downloadModal').classList.remove('open');
  document.getElementById('successModal').classList.remove('open');
}

function submitDownloadRequest() {
  const name = document.getElementById('reqName').value;
  const contact = document.getElementById('reqContact').value;
  if (!name || !contact) { alert('Please fill both fields'); return; }

  const val = (id) => document.getElementById(id)?.value || '';
  const cvData = {
    fullName: val('fullName'), jobTitle: val('jobTitle'), email: val('email'), phone: val('phone'),
    summary: val('summary'), expTitle: val('expTitle'), expCompany: val('expCompany'), expDuration: val('expDuration'),
    expDesc: val('expDesc'), eduDegree: val('eduDegree'), eduSchool: val('eduSchool'), eduYear: val('eduYear'),
    skills: val('skills'), languages: val('languages'), photo: currentPhoto, template: selectedTemplate
  };

  const requests = JSON.parse(localStorage.getItem('cv_secure_admin_data') || '[]');
  requests.push({ id: Date.now(), name, contact, cvData, status: 'pending' });
  localStorage.setItem('cv_secure_admin_data', JSON.stringify(requests));

  document.getElementById('downloadModal').classList.remove('open');
  document.getElementById('successModal').classList.add('open');
}

async function askAI() {
  const query = document.getElementById('aiQuery').value.trim();
  if (!query) { alert('Please type something'); return; }
  
  const resDiv = document.getElementById('aiResponse');
  const btn = document.getElementById('aiBtn');
  resDiv.textContent = '✨ AI is working its magic...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a professional CV writing assistant. Write concise, modern, and impactful text.' },
          { role: 'user', content: query }
        ]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    
    resDiv.textContent = data.choices[0].message.content;
  } catch (err) {
    resDiv.textContent = '❌ Error: ' + err.message;
  } finally {
    btn.disabled = false;
  }
}

function applyAIToSummary() {
  const reply = document.getElementById('aiResponse').textContent;
  if (!reply || reply.startsWith('✨') || reply.startsWith('❌')) { alert('Generate text first!'); return; }
  document.getElementById('summary').value = reply;
  updatePreview();
}
