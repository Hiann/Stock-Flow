const API_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. UTILITÁRIOS E FORMATAÇÃO
// ==========================================

// Formata centavos para Real (Ex: 15000 -> R$ 150,00)
const formatPrice = (priceInCents) => {
    return (priceInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- CORREÇÃO DE DATA/HORA ---
// Adicionamos 'Z' ao final da string para o navegador saber que é UTC e converter para o horário local (Brasil)
const fixDate = (dateString) => {
    if (!dateString) return null;
    // Se a data já vier com Z ou offset, mantemos. Se não, forçamos UTC.
    if (!dateString.endsWith("Z") && !dateString.includes("+")) {
        return new Date(dateString + "Z");
    }
    return new Date(dateString);
};

// Formata Data (Ex: 04/02/2026 01:30)
const formatDate = (dateString) => {
    const date = fixDate(dateString);
    if (!date) return "-";
    return date.toLocaleString('pt-BR');
};

// Calcula tempo relativo (Ex: "Há 5 minutos")
const timeAgo = (dateString) => {
    const date = fixDate(dateString);
    if (!date) return "";

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    // Tratamento para evitar tempos negativos (caso o relógio do PC esteja levemente dessincronizado)
    if (seconds < 0) return "agora mesmo";

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min atrás";
    return "agora mesmo";
};

// ==========================================
// 2. LÓGICA DE TEMA (DARK / LIGHT MODE)
// ==========================================

const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    
    if (theme === 'light') {
        icon.className = 'bi bi-sun-fill text-warning';
    } else {
        icon.className = 'bi bi-moon-stars-fill text-white';
    }
};

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-bs-theme', savedTheme);

// ==========================================
// 3. DASHBOARD (LÓGICA DA HOME)
// ==========================================

async function loadDashboardData() {
    try {
        const productsRes = await fetch(`${API_URL}/products/`);
        const products = await productsRes.json();
        
        document.getElementById('total-products-count').innerText = products.length;
        
        const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
        document.getElementById('total-stock-value').innerText = formatPrice(totalValue);

        renderStockChart(products);

        const lowStockRes = await fetch(`${API_URL}/reports/low-stock`);
        const lowStockData = await lowStockRes.json();
        
        const tableBody = document.getElementById('low-stock-table-body');
        const alertHeader = document.getElementById('stock-alert-header');
        tableBody.innerHTML = '';

        if (lowStockData.length === 0) {
            if(alertHeader) {
                alertHeader.className = "card-title mb-0 fw-bold text-success";
                alertHeader.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Status do Estoque';
            }
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-success py-3 fw-bold">Tudo certo! Níveis saudáveis.</td></tr>';
        } else {
            if(alertHeader) {
                alertHeader.className = "card-title mb-0 fw-bold text-danger";
                alertHeader.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Alerta: Repor';
            }
            
            lowStockData.forEach(p => {
                tableBody.innerHTML += `
                    <tr>
                        <td class="fw-semibold text-truncate" style="max-width: 120px;">${p.name}</td>
                        <td class="text-danger fw-bold">${p.quantity}</td>
                        <td><span class="badge badge-stock-low">Baixo</span></td>
                    </tr>`;
            });
        }

        loadRecentActivity(products);

    } catch (e) { console.error("Erro no Dashboard:", e); }
}

function renderStockChart(products) {
    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    if (window.myStockChart) window.myStockChart.destroy();

    const topProducts = products.slice(0, 10);
    
    window.myStockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProducts.map(p => p.name),
            datasets: [{
                label: 'Quantidade em Estoque',
                data: topProducts.map(p => p.quantity),
                backgroundColor: 'rgba(13, 110, 253, 0.6)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: '#374151' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

async function loadRecentActivity(allProducts) {
    try {
        const res = await fetch(`${API_URL}/movements/recent`);
        const movements = await res.json();
        const list = document.getElementById('recent-activity-list');
        list.innerHTML = '';

        if (movements.length === 0) {
            list.innerHTML = '<div class="p-3 text-center text-muted">Nenhuma atividade recente.</div>';
            return;
        }

        movements.forEach(m => {
            const product = allProducts.find(p => p.id === m.product_id);
            const prodName = product ? product.name : "Produto Desconhecido";
            
            const icon = m.type === 'entrada' 
                ? '<i class="bi bi-arrow-down-circle-fill text-success fs-5"></i>' 
                : '<i class="bi bi-arrow-up-circle-fill text-danger fs-5"></i>';
            
            const textClass = m.type === 'entrada' ? 'text-success' : 'text-danger';
            const typeLabel = m.type === 'entrada' ? 'Entrada' : 'Saída';

            list.innerHTML += `
                <div class="list-group-item bg-transparent border-secondary d-flex align-items-center gap-3 py-3">
                    ${icon}
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-0 fw-bold">${prodName}</h6>
                            <small class="text-muted">${timeAgo(m.timestamp)}</small>
                        </div>
                        <small class="text-muted">
                            <span class="${textClass} fw-bold">${typeLabel}</span> de ${m.quantity} unidades
                        </small>
                    </div>
                </div>`;
        });
    } catch (e) { console.error("Erro ao carregar feed:", e); }
}

// ==========================================
// 4. GERENCIAMENTO DE PRODUTOS (CRUD)
// ==========================================

let allProducts = [];

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products/`);
        allProducts = await res.json();
        renderProductsTable(allProducts);
    } catch (e) { Swal.fire('Erro', 'Falha ao listar produtos', 'error'); }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-3">Nenhum produto encontrado.</td></tr>';
        return;
    }

    products.forEach(p => {
        const stockStatus = p.quantity <= p.min_stock 
            ? '<span class="badge bg-danger">Baixo</span>' 
            : '<span class="badge bg-success">Ok</span>';

        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td class="fw-bold">${p.name}</td>
                <td class="text-muted">${p.description || '-'}</td>
                <td>${formatPrice(p.price)}</td>
                <td class="fs-5">${p.quantity}</td>
                <td>${p.min_stock}</td>
                <td>${stockStatus}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="openHistoryModal(${p.id})" title="Ver Histórico">
                        <i class="bi bi-clock-history"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="openEditModal(${p.id})" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(term) || 
            (p.description && p.description.toLowerCase().includes(term))
        );
        renderProductsTable(filtered);
    });
}

async function openHistoryModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('historyProdName').innerText = product.name;
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4">Carregando histórico...</td></tr>';

    new bootstrap.Modal(document.getElementById('historyModal')).show();

    try {
        const res = await fetch(`${API_URL}/products/${id}/movements`);
        const history = await res.json();
        
        tbody.innerHTML = '';
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">Nenhuma movimentação registrada.</td></tr>';
            return;
        }

        history.forEach(h => {
            const badge = h.type === 'entrada' 
                ? '<span class="badge bg-success">Entrada</span>'
                : '<span class="badge bg-danger">Saída</span>';
            
            const color = h.type === 'entrada' ? 'text-success' : 'text-danger';
            const icon = h.type === 'entrada' ? '+' : '-';

            tbody.innerHTML += `
                <tr>
                    <td>${formatDate(h.timestamp)}</td>
                    <td>${badge}</td>
                    <td class="fw-bold ${color}">${icon} ${h.quantity}</td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Erro ao carregar dados.</td></tr>';
    }
}

function openCreateModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prodId').value = "";
    document.getElementById('modalTitle').innerText = "Cadastrar Novo Produto";
    document.getElementById('saveBtn').innerText = "Salvar Produto";
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function openEditModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    document.getElementById('prodId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodDesc').value = product.description;
    document.getElementById('prodPrice').value = (product.price / 100).toFixed(2);
    document.getElementById('prodMinStock').value = product.min_stock;
    document.getElementById('modalTitle').innerText = "Editar Produto";
    document.getElementById('saveBtn').innerText = "Atualizar";
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const isEdit = id ? true : false;
    const rawPrice = parseFloat(document.getElementById('prodPrice').value);
    const priceInCents = Math.round(rawPrice * 100);

    const data = {
        name: document.getElementById('prodName').value,
        description: document.getElementById('prodDesc').value,
        price: priceInCents,
        min_stock: parseInt(document.getElementById('prodMinStock').value)
    };

    try {
        let res;
        if (isEdit) {
            res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${API_URL}/products/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            Swal.fire('Sucesso!', isEdit ? 'Produto atualizado.' : 'Produto criado.', 'success');
            const modalEl = document.getElementById('productModal');
            bootstrap.Modal.getInstance(modalEl).hide();
            loadProducts();
        } else {
            Swal.fire('Erro', 'Operação falhou.', 'error');
        }
    } catch (error) { console.error(error); }
}

async function deleteProduct(id) {
    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: "Isso não pode ser desfeito!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, deletar!'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                Swal.fire('Deletado!', 'Produto removido.', 'success');
                loadProducts(); 
            } else { Swal.fire('Erro', 'Erro ao deletar produto.', 'error'); }
        } catch (e) { console.error(e); }
    }
}

async function loadMovementsOptions() {
    try {
        const res = await fetch(`${API_URL}/products/`);
        const products = await res.json();
        const select = document.getElementById('moveProduct');
        select.innerHTML = '<option value="" selected disabled>Selecione um produto...</option>';
        products.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.name} (Saldo: ${p.quantity})</option>`;
        });
    } catch (e) { console.error(e); }
}

async function handleMovement(e) {
    e.preventDefault();
    const data = {
        product_id: parseInt(document.getElementById('moveProduct').value),
        type: document.querySelector('input[name="moveType"]:checked').value,
        quantity: parseInt(document.getElementById('moveQty').value)
    };

    try {
        const res = await fetch(`${API_URL}/movements/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            Swal.fire('Sucesso!', 'Estoque atualizado.', 'success');
            document.getElementById('movement-form').reset();
            loadMovementsOptions(); 
        } else {
            const err = await res.json();
            Swal.fire('Erro', err.detail, 'warning'); 
        }
    } catch (e) { console.error(e); }
}

document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        updateThemeIcon(localStorage.getItem('theme') || 'dark');
    }

    const path = window.location.pathname;

    if (path === '/' || path.includes('dashboard')) {
        loadDashboardData();
    } else if (path.includes('products-ui')) {
        loadProducts();
        setupSearch();
        document.getElementById('product-form')?.addEventListener('submit', handleSaveProduct);
    } else if (path.includes('movements-ui')) {
        loadMovementsOptions();
        document.getElementById('movement-form')?.addEventListener('submit', handleMovement);
    }
});