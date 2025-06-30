let entries = [];
let appIcons = {
  "YouTube": "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
  "Instagram": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
};

function unlock() {
  const masterPassword = document.getElementById('masterPassword').value;
  generateKey(masterPassword).then(() => {
    loadVault();
    document.getElementById('app').style.display = 'block';
  });
}

function addEntry() {
  const type = prompt("Type 'wifi' or 'account':").toLowerCase();
  if (type === "wifi") {
    const entry = {
      type: "wifi",
      ssid: prompt("SSID:"),
      password: prompt("Password:"),
      security: prompt("Security:"),
      signal: prompt("Signal:"),
      routerIP: prompt("Router IP:"),
      deviceIP: prompt("Device IP:"),
      subnet: prompt("Subnet Mask:"),
      dns: prompt("DNS:")
    };
    entries.push(entry);
  } else {
    const websites = [];
    let site;
    while ((site = prompt("Add website URL (leave blank to stop):"))) websites.push(site);

    const apps = [];
    let app;
    while ((app = prompt("Add app name (leave blank to stop):"))) apps.push(app);

    const entry = {
      type: "account",
      email: prompt("Email:"),
      username: prompt("Username:"),
      password: prompt("Password:"),
      websites,
      apps
    };
    entries.push(entry);
  }
  saveVault();
  renderList();
}

function renderList(filtered = entries) {
  const list = document.getElementById('entryList');
  list.innerHTML = '';
  filtered.forEach((entry, i) => {
    const li = document.createElement('li');
    if (entry.type === "wifi") {
      li.innerHTML = `
        <b>Wi-Fi: ${entry.ssid}</b><br>
        Password: ${entry.password}<br>
        Security: ${entry.security}<br>
        Signal: ${entry.signal}<br>
        Router IP: ${entry.routerIP}<br>
        IP: ${entry.deviceIP}<br>
        Subnet: ${entry.subnet}<br>
        DNS: ${entry.dns}<br>
      `;
    } else {
      let appsHTML = entry.apps.map(app => {
        const icon = appIcons[app] ? `<img src="${appIcons[app]}" height="16">` : '';
        return `${icon} ${app}`;
      }).join(", ");
      li.innerHTML = `
        <b>Account: ${entry.username || entry.email}</b><br>
        Email: ${entry.email}<br>
        Username: ${entry.username}<br>
        Password: ${entry.password}<br>
        Websites: ${entry.websites.map(w => `<a href="${w}" target="_blank">${w}</a>`).join(", ")}<br>
        Apps: ${appsHTML}<br>
      `;
    }
    li.innerHTML += `<button onclick="copy('${entry.password}')">Copy Password</button>
                     <button onclick="removeEntry(${i})">Delete</button>`;
    list.appendChild(li);
  });
}

function copy(text) {
  navigator.clipboard.writeText(text).then(() => alert('Copied!'));
}

function removeEntry(index) {
  if (confirm("Delete this entry?")) {
    entries.splice(index, 1);
    saveVault();
    renderList();
  }
}

function searchEntries(term) {
  const filtered = entries.filter(e => 
    (e.ssid || '').toLowerCase().includes(term.toLowerCase()) ||
    (e.username || '').toLowerCase().includes(term.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(term.toLowerCase())
  );
  renderList(filtered);
}

function saveVault() {
  encryptData(entries, key).then(encrypted => {
    localStorage.setItem('vault', JSON.stringify(encrypted));
  });
}

function loadVault() {
  const vault = localStorage.getItem('vault');
  if (!vault) return;
  const parsed = JSON.parse(vault);
  decryptData(parsed.data, parsed.iv, key).then(decrypted => {
    entries = decrypted;
    renderList();
  }).catch(() => alert("Decryption failed — wrong password?"));
}
