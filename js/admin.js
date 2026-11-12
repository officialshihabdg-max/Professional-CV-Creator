const ADMIN_PASSWORD = 'Metadata Shihab 2.004 ok@';

function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadRequests();
  } else {
    alert('Wrong password! Access Denied.');
  }
}

function loadRequests() {
  const requests = JSON.parse(localStorage.getItem('cv_secure_admin_data') || '[]');
  const list = document.getElementById('requestsList');

  if (requests.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;">No requests yet.</p>';
    return;
  }

  list.innerHTML = requests.slice().reverse().map(r => `
    <div class="request-card ${r.status}">
      <div class="req-info">
        <h4>${r.name} — <span style="color:${r.status === 'approved' ? '#10b981' : '#f59e0b'}">${r.status.toUpperCase()}</span></h4>
        <p>📞 ${r.contact}</p>
        <p>CV: ${r.cvData.fullName || 'Untitled'} (${r.cvData.jobTitle || 'No title'})</p>
      </div>
      <div class="req-actions">
        <button class="btn-view" onclick="viewCV(${r.id})">👁 View</button>
        ${r.status === 'pending' ? `
          <button class="btn-approve" onclick="approveReq(${r.id})">✓ Approve</button>
          <button class="btn-reject" onclick="rejectReq(${r.id})">✗ Reject</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function approveReq(id) {
  let reqs = JSON.parse(localStorage.getItem('cv_secure_admin_data') || '[]');
  reqs.find(r => r.id === id).status = 'approved';
  localStorage.setItem('cv_secure_admin_data', JSON.stringify(reqs));
  loadRequests();
}

function rejectReq(id) {
  let reqs = JSON.parse(localStorage.getItem('cv_secure_admin_data') || '[]');
  reqs.find(r => r.id === id).status = 'rejected';
  localStorage.setItem('cv_secure_admin_data', JSON.stringify(reqs));
  loadRequests();
}

function viewCV(id) {
  const req = JSON.parse(localStorage.getItem('cv_secure_admin_data') || '[]').find(r => r.id === id);
  if (!req) return;
  const d = req.cvData;

  const html = `
    <html><head><title>CV - ${d.fullName}</title>
    <style>
      body{font-family:'Outfit',sans-serif;max-width:800px;margin:40px auto;color:#333;line-height:1.6;}
      h1{color:#1e293b;margin-bottom:5px;} h3{color:#4f46e5;margin-bottom:20px;}
      h2{border-bottom:2px solid #4f46e5;padding-bottom:5px;margin-top:30px;font-size:16px;text-transform:uppercase;letter-spacing:1px;}
      .photo{width:120px;height:120px;border-radius:50%;object-fit:cover;float:right;border:3px solid #4f46e5;}
      .contact{color:#64748b;font-size:14px;margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid #e2e8f0;}
    </style></head><body>
    ${d.photo ? `<img src="${d.photo}" class="photo">` : ''}
    <h1>${d.fullName}</h1><h3>${d.jobTitle}</h3>
    <div class="contact">${d.email} ${d.phone ? ' | ' + d.phone : ''}</div>
    ${d.summary ? `<h2>Summary</h2><p>${d.summary}</p>` : ''}
    ${d.expTitle ? `<h2>Experience</h2><p><b>${d.expTitle}</b> at ${d.expCompany} (${d.expDuration})</p><p>${d.expDesc}</p>` : ''}
    ${d.eduDegree ? `<h2>Education</h2><p><b>${d.eduDegree}</b> - ${d.eduSchool} (${d.eduYear})</p>` : ''}
    ${d.skills ? `<h2>Skills</h2><p>${d.skills}</p>` : ''}
    ${d.languages ? `<h2>Languages</h2><p>${d.languages}</p>` : ''}
    </body></html>
  `;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}
