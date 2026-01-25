// API Base URL
const API_URL = 'http://localhost:3000/api';

// Show/Hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');

    // Load data when section is shown
    switch(sectionId) {
        case 'colete': loadColete(); break;
        case 'expeditori': loadExpeditori(); break;
        case 'produse': loadProduse(); break;
        case 'livratori': loadLivratori(); break;
        case 'vehicule': loadVehicule(); break;
        case 'locatii': loadLocatii(); break;
        case 'depozite': loadDepozite(); break;
        case 'continut_colete': loadContinutColete(); break;
        case 'livrari_colete': loadLivrariColete(); break;
        case 'alocari_vehicule': loadAlocariVehicule(); break;
    }
}

// Show/Hide messages
function showMessage(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

async function loadColete() {
    const tbody = document.querySelector('#coleteTable tbody');
    tbody.innerHTML = '<tr><td colspan="11" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sort = document.getElementById('sortColete').value;
        const status = document.getElementById('filterStatus').value;

        let url = `${API_URL}/colete?`;
        if (sort) url += `sort=${sort}&`;
        if (status) url += `status=${encodeURIComponent(status)}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">Nu există colete în baza de date</td></tr>';
            return;
        }

        data.forEach(colet => {
            const row = `<tr>
                <td>${colet.AWB}</td>
                <td><span style="padding: 5px 10px; border-radius: 5px; background: ${getStatusColor(colet.STATUS)}; color: white; white-space: nowrap;">${colet.STATUS}</span></td>
                <td>${formatDate(colet.DATA_PRELUARE)}</td>
                <td>${colet.DESTINATAR_NUME} ${colet.DESTINATAR_PRENUME}</td>
                <td>${colet.DESTINATAR_ADRESA}</td>
                <td>${colet.GREUTATE || '-'}</td>
                <td>${colet.VALOARE_RON || '-'}</td>
                <td>${colet.DIMENSIUNE || '-'}</td>
                <td>${colet.ID_EXPEDITOR}</td>
                <td>${colet.ID_DEPOZIT || '-'}</td>
                <td>
                    <button class="btn btn-warning" onclick="updateStatusColet('${colet.AWB}')">Schimbă Status</button>
                    <button class="btn btn-danger" onclick="deleteColet('${colet.AWB}')">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="11" class="error">Eroare la încărcarea datelor: ' + error.message + '</td></tr>';
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'In Depozit': return '#ffc107';
        case 'In Tranzit': return '#007bff';
        case 'Livrat': return '#28a745';
        default: return '#6c757d';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO');
}

async function openAddColet() {
    // Load expeditori for dropdown
    const response = await fetch(`${API_URL}/expeditori`);
    const expeditori = await response.json();

    const select = document.getElementById('selectExpeditor');
    select.innerHTML = '<option value="">Selectează expeditor...</option>';
    expeditori.forEach(exp => {
        select.innerHTML += `<option value="${exp.ID_EXPEDITOR}">${exp.NUME} ${exp.PRENUME} (${exp.TIP_EXPEDITOR})</option>`;
    });

    // Load depozite for dropdown
    const responseD = await fetch(`${API_URL}/depozite`);
    const depozite = await responseD.json();

    const selectD = document.getElementById('selectDepozit');
    selectD.innerHTML = '<option value="">Fără depozit</option>';
    depozite.forEach(dep => {
        selectD.innerHTML += `<option value="${dep.ID_DEPOZIT}">Depozit ${dep.ID_DEPOZIT} - ${dep.LOCALITATE}</option>`;
    });

    openModal('modalColet');
}

document.getElementById('formColet').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Convert empty strings to null for optional fields
    if (!data.id_depozit) data.id_depozit = null;
    if (!data.greutate) data.greutate = null;
    if (!data.valoare_ron) data.valoare_ron = null;

    try {
        const response = await fetch(`${API_URL}/colete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('coleteMessage', 'Colet adăugat cu succes!');
            closeModal('modalColet');
            loadColete();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare la adăugarea coletului: ' + error.message);
    }
});

async function updateStatusColet(awb) {
    const newStatus = prompt('Introduceți noul status (In Depozit / In Tranzit / Livrat):');
    if (!newStatus) return;

    try {
        const response = await fetch(`${API_URL}/colete/${awb}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showMessage('coleteMessage', 'Status actualizat cu succes!');
            loadColete();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare la actualizare: ' + error.message);
    }
}

async function deleteColet(awb) {
    if (!confirm(`Sigur doriți să ștergeți coletul ${awb}?`)) return;

    try {
        const response = await fetch(`${API_URL}/colete/${awb}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('coleteMessage', 'Colet șters cu succes!');
            loadColete();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare la ștergere: ' + error.message);
    }
}

async function loadExpeditori() {
    const tbody = document.querySelector('#expeditoriTable tbody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sortSelect = document.getElementById('sortExpeditori');
        const sort = sortSelect ? sortSelect.value : '';
        let url = `${API_URL}/expeditori`;
        if (sort) url += `?sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        data.forEach(exp => {
            const row = `<tr>
                <td>${exp.ID_EXPEDITOR}</td>
                <td>${exp.TIP_EXPEDITOR}</td>
                <td>${exp.NUME}</td>
                <td>${exp.PRENUME}</td>
                <td>${exp.TELEFON}</td>
                <td>${exp.EMAIL}</td>
                <td>${exp.ADRESA}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteExpeditor(${exp.ID_EXPEDITOR})">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="8" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

function openAddExpeditor() {
    openModal('modalExpeditor');
}

document.getElementById('formExpeditor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/expeditori`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('expeditoriMessage', 'Expeditor adăugat cu succes!');
            closeModal('modalExpeditor');
            loadExpeditori();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
});

async function deleteExpeditor(id) {
    if (!confirm(`Sigur doriți să ștergeți expeditorul cu ID ${id}? Toate coletele asociate vor fi șterse!`)) return;

    try {
        const response = await fetch(`${API_URL}/expeditori/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('expeditoriMessage', 'Expeditor șters cu succes!');
            loadExpeditori();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
}

async function loadProduse() {
    const tbody = document.querySelector('#produseTable tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sortSelect = document.getElementById('sortProduse');
        const sort = sortSelect ? sortSelect.value : '';
        let url = `${API_URL}/produse`;
        if (sort) url += `?sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        data.forEach(prod => {
            const row = `<tr>
                <td>${prod.ID_PRODUS}</td>
                <td>${prod.NUME_PRODUS}</td>
                <td>${prod.NUME_CATEGORIE}</td>
                <td>${prod.FRAGILITATE}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteProdus(${prod.ID_PRODUS})">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

function openAddProdus() {
    openModal('modalProdus');
}

document.getElementById('formProdus').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/produse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('produseMessage', 'Produs adăugat cu succes!');
            closeModal('modalProdus');
            loadProduse();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
});

async function deleteProdus(id) {
    if (!confirm(`Sigur doriți să ștergeți produsul cu ID ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/produse/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('produseMessage', 'Produs șters cu succes!');
            loadProduse();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
}

async function loadLivratori() {
    const tbody = document.querySelector('#livratoriTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sortSelect = document.getElementById('sortLivratori');
        const sort = sortSelect ? sortSelect.value : '';
        let url = `${API_URL}/livratori`;
        if (sort) url += `?sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        data.forEach(liv => {
            const row = `<tr>
                <td>${liv.ID_LIVRATOR}</td>
                <td>${liv.NUME}</td>
                <td>${liv.PRENUME}</td>
                <td>${liv.SALARIU}</td>
                <td>${formatVehicles(liv.VEHICUL)}</td>
                <td>
                    <button class="btn btn-warning" onclick="editLivrator(${liv.ID_LIVRATOR}, ${liv.SALARIU})">Editează Salariu</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

function formatVehicles(vehicleString) {
    if (!vehicleString) return 'Niciun vehicul alocat';
    const vehicles = vehicleString.split(',');
    const counts = {};
    vehicles.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts).map(([v, count]) => `${v} (${count}x)`).join(', ');
}

async function editLivrator(id, salariuCurent) {
    const nouSalariu = prompt(`Introduceți noul salariu pentru livratorul ${id}:`, salariuCurent);
    if (!nouSalariu) return;

    try {
        const response = await fetch(`${API_URL}/livratori/${id}/salariu`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ salariu: parseFloat(nouSalariu) })
        });

        if (response.ok) {
            showMessage('livratoriMessage', 'Salariu actualizat cu succes!');
            loadLivratori();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
}

async function loadDepozite() {
    const tbody = document.querySelector('#depoziteTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sortSelect = document.getElementById('sortDepozite');
        const sort = sortSelect ? sortSelect.value : '';
        let url = `${API_URL}/depozite`;
        if (sort) url += `?sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        data.forEach(dep => {
            const row = `<tr>
                <td>${dep.ID_DEPOZIT}</td>
                <td>${dep.CAPACITATE_MAXIMA_M3 || dep.CAPACITATE_MAXIMA} m³</td>
                <td>${dep.LOCALITATE}</td>
                <td>${dep.JUDET}</td>
                <td>${dep.STRADA}</td>
                <td>
                    <button class="btn btn-warning" onclick="editDepozit(${dep.ID_DEPOZIT}, ${dep.CAPACITATE_MAXIMA_M3 || dep.CAPACITATE_MAXIMA})">Editează Capacitate</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

async function editDepozit(id, capacitateCurenta) {
    const nouaCapacitate = prompt(`Introduceți noua capacitate (m³) pentru depozitul ${id}:`, capacitateCurenta);
    if (!nouaCapacitate) return;

    try {
        const response = await fetch(`${API_URL}/depozite/${id}/capacitate`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ capacitate: parseFloat(nouaCapacitate) })
        });

        if (response.ok) {
            showMessage('depoziteMessage', 'Capacitate actualizată cu succes!');
            loadDepozite();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
}

async function loadVehicule() {
    const tbody = document.querySelector('#vehiculeTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sortSelect = document.getElementById('sortVehicule');
        const sort = sortSelect ? sortSelect.value : '';
        let url = `${API_URL}/vehicule`;
        if (sort) url += `?sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        data.forEach(veh => {
            const row = `<tr>
                <td>${veh.NR_INMATRICULARE}</td>
                <td>${veh.MARCA}</td>
                <td>${veh.MODEL}</td>
                <td>${veh.CAPACITATE_DIMENSIUNE || '-'} m³</td>
                <td>${veh.CAPACITATE_GREUTATE || '-'} kg</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteVehicul('${veh.NR_INMATRICULARE}')">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

async function deleteVehicul(nrInmatriculare) {
    if (!confirm(`Sigur doriți să ștergeți vehiculul ${nrInmatriculare}?`)) return;

    try {
        const response = await fetch(`${API_URL}/vehicule/${nrInmatriculare}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('vehiculeMessage', 'Vehicul șters cu succes!');
            loadVehicule();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
}

async function loadLocatii() {
    const tbody = document.querySelector('#locatiiTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sortSelect = document.getElementById('sortLocatii');
        const sort = sortSelect ? sortSelect.value : '';
        let url = `${API_URL}/locatii`;
        if (sort) url += `?sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        data.forEach(loc => {
            const row = `<tr>
                <td>${loc.ID_LOCATIE}</td>
                <td>${loc.COD_POSTAL}</td>
                <td>${loc.JUDET}</td>
                <td>${loc.LOCALITATE}</td>
                <td>${loc.STRADA}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteLocatie(${loc.ID_LOCATIE})">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

async function deleteLocatie(id) {
    if (!confirm(`Sigur doriți să ștergeți locația ${id}? Depozitele asociate vor fi șterse (CASCADE)!`)) return;

    try {
        const response = await fetch(`${API_URL}/locatii/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('locatiiMessage', 'Locație ștearsă cu succes!');
            loadLocatii();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare: ' + error.message);
    }
}

async function loadContinutColete() {
    const tbody = document.querySelector('#continutColeteTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sort = document.getElementById('sortContinutColete').value;
        let url = `${API_URL}/continut-colete?`;
        if (sort) url += `sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nu există date</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = `<tr>
                <td>${item.AWB}</td>
                <td>${item.ID_PRODUS}</td>
                <td>${item.CANTITATE}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteContinutColet('${item.AWB}', ${item.ID_PRODUS})">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

async function deleteContinutColet(awb, id_produs) {
    if (!confirm(`Sigur doriți să ștergeți înregistrarea?`)) return;

    try {
        const response = await fetch(`${API_URL}/continut-colete/${awb}/${id_produs}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('continutColeteMessage', 'Înregistrare ștearsă cu succes!');
            loadContinutColete();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare la ștergere: ' + error.message);
    }
}

async function loadLivrariColete() {
    const tbody = document.querySelector('#livrariColeteTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sort = document.getElementById('sortLivrariColete').value;
        let url = `${API_URL}/livrari-colete?`;
        if (sort) url += `sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nu există date</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = `<tr>
                <td>${item.AWB}</td>
                <td>${item.ID_LIVRATOR}</td>
                <td>${item.DATA_LIVRARE ? formatDate(item.DATA_LIVRARE) : 'Nelivrat'}</td>
                <td>
                     <button class="btn btn-danger" onclick="deleteLivrareColet('${item.AWB}', ${item.ID_LIVRATOR})">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

async function deleteLivrareColet(awb, id_livrator) {
    if (!confirm(`Sigur doriți să ștergeți înregistrarea?`)) return;

    try {
        const response = await fetch(`${API_URL}/livrari-colete/${awb}/${id_livrator}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('livrariColeteMessage', 'Înregistrare ștearsă cu succes!');
            loadLivrariColete();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare la ștergere: ' + error.message);
    }
}

async function loadAlocariVehicule() {
    const tbody = document.querySelector('#alocariVehiculeTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Se încarcă datele...</td></tr>';

    try {
        const sort = document.getElementById('sortAlocariVehicule').value;
        let url = `${API_URL}/alocari-vehicule?`;
        if (sort) url += `sort=${sort}`;

        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nu există date</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = `<tr>
                <td>${item.ID_LIVRATOR}</td>
                <td>${item.NR_INMATRICULARE}</td>
                <td>${formatDate(item.DATA_ALOCARE)}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteAlocareVehicul(${item.ID_LIVRATOR}, '${item.NR_INMATRICULARE}', '${item.DATA_ALOCARE_RAW}')">Șterge</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="error">Eroare: ' + error.message + '</td></tr>';
    }
}

async function deleteAlocareVehicul(id_livrator, nr_inmatriculare, data_alocare) {
    if (!confirm(`Sigur doriți să ștergeți înregistrarea?`)) return;

    try {
        const response = await fetch(`${API_URL}/alocari-vehicule/${id_livrator}/${nr_inmatriculare}/${data_alocare}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('alocariVehiculeMessage', 'Înregistrare ștearsă cu succes!');
            loadAlocariVehicule();
        } else {
            const error = await response.json();
            alert('Eroare: ' + error.error);
        }
    } catch (error) {
        alert('Eroare la ștergere: ' + error.message);
    }
}


// c) JOIN pe 3+ tabele cu 2+ condiții
async function loadRaportJoin() {
    const container = document.getElementById('rapoarteContainer');
    container.innerHTML = '<div class="loading">Se încarcă raportul...</div>';

    try {
        const response = await fetch(`${API_URL}/rapoarte/join-complex`);
        const data = await response.json();

        let html = '<table><thead><tr><th>AWB</th><th>Status</th><th>Valoare (RON)</th><th>Livrator</th><th>Salariu Livrator</th></tr></thead><tbody>';

        if (data.length === 0) {
            html += '<tr><td colspan="5" style="text-align:center;">Nu există date care să îndeplinească condițiile</td></tr>';
        } else {
            data.forEach(item => {
                html += `<tr>
                    <td>${item.AWB}</td>
                    <td>${item.Status}</td>
                    <td>${item['Valoare Colet']} RON</td>
                    <td>${item.Livrator}</td>
                    <td>${item['Salariu Livrator']} RON</td>
                </tr>`;
            });
        }

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="error">Eroare: ' + error.message + '</div>';
    }
}

// d) GROUP BY + HAVING
async function loadRaportGroupBy() {
    const container = document.getElementById('rapoarteContainer');
    container.innerHTML = '<div class="loading">Se încarcă raportul...</div>';

    try {
        const response = await fetch(`${API_URL}/rapoarte/group-by-having`);
        const data = await response.json();

        let html = '<table><thead><tr><th>AWB</th><th>Destinatar</th><th>Nr. Produse</th><th>Produse</th></tr></thead><tbody>';

        if (data.length === 0) {
            html += '<tr><td colspan="4" style="text-align:center;">Nu există colete cu mai mult de un produs</td></tr>';
        } else {
            data.forEach(item => {
                html += `<tr>
                    <td>${item.AWB}</td>
                    <td>${item.Destinatar}</td>
                    <td>${item.Nr_Produse}</td>
                    <td style="max-width: 400px; word-wrap: break-word;">${item.Produse}</td>
                </tr>`;
            });
        }

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="error">Eroare: ' + error.message + '</div>';
    }
}

// f.1) View Compus (permite LMD)
async function loadViewCompus() {
    const container = document.getElementById('rapoarteContainer');
    container.innerHTML = '<div class="loading">Se încarcă view-ul...</div>';

    try {
        const response = await fetch(`${API_URL}/rapoarte/view-compus`);
        const data = await response.json();

        let html = '<table><thead><tr><th>AWB</th><th>Status</th><th>Destinatar</th><th>Expeditor</th><th>Email</th><th>Telefon</th></tr></thead><tbody>';

        data.forEach(item => {
            html += `<tr>
                <td>${item.AWB}</td>
                <td>${item.STATUS}</td>
                <td>${item.DESTINATAR}</td>
                <td>${item.EXPEDITOR}</td>
                <td>${item.EMAIL}</td>
                <td>${item.TELEFON}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="error">Eroare: ' + error.message + '</div>';
    }
}

// Test UPDATE pe view
async function testUpdateView() {
    try {
        const response = await fetch(`${API_URL}/rapoarte/test-update-view`, {
            method: 'POST'
        });
        const result = await response.json();

        if (response.ok) {
            alert(' ' + result.message);
            loadViewCompus();
        } else {
            alert(' Eroare: ' + result.error);
        }
    } catch (error) {
        alert(' Eroare: ' + error.message);
    }
}

// f.2) View Complex
async function loadViewComplex() {
    const container = document.getElementById('rapoarteContainer');
    container.innerHTML = '<div class="loading">Se încarcă view-ul complex...</div>';

    try {
        const response = await fetch(`${API_URL}/rapoarte/view-complex`);
        const data = await response.json();

        let html = '<table><thead><tr><th>Depozit</th><th>Localitate</th><th>Total Colete</th><th>Valoare Totală</th></tr></thead><tbody>';

        data.forEach(item => {
            html += `<tr>
                <td>${item.DEPOZIT}</td>
                <td>${item.LOCALITATE}</td>
                <td>${item.TOTAL_COLETE}</td>
                <td style="font-weight: bold;">${item.VALOARE_TOTALA} RON</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="error">Eroare: ' + error.message + '</div>';
    }
}


// Load initial data
window.onload = () => {
    loadColete();
};