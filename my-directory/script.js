// Load and render the directory
let allStores = [];

// Fetch the JSON data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allStores = data;
        populateStateFilter();
        renderStores(allStores);
    })
    .catch(error => {
        console.error('Error loading data:', error);
        document.getElementById('directoryGrid').innerHTML = '<div class="no-results">Failed to load directory. Please refresh.</div>';
    });

// Populate state filter dropdown with unique states
function populateStateFilter() {
    const states = [...new Set(allStores.map(store => store.state))].sort();
    const stateSelect = document.getElementById('stateFilter');
    stateSelect.innerHTML = '<option value="">All States</option>';
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// Render stores based on filtered list
function renderStores(stores) {
    const grid = document.getElementById('directoryGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (stores.length === 0) {
        grid.innerHTML = '<div class="no-results">No thrift stores match your filters. Try resetting or suggest a new store!</div>';
        resultsCount.textContent = '0 stores found';
        return;
    }
    
    resultsCount.textContent = `${stores.length} store${stores.length !== 1 ? 's' : ''} found`;
    
    grid.innerHTML = stores.map(store => `
        <div class="store-card">
            <div class="card-content">
                <h3 class="store-name">${escapeHtml(store.name)}</h3>
                <div class="store-address">${escapeHtml(store.address)}</div>
                <div class="store-city-state">${escapeHtml(store.city)}, ${escapeHtml(store.state)} ${store.zip || ''}</div>
                ${store.notes ? `<div class="store-notes">📌 ${escapeHtml(store.notes)}</div>` : ''}
            </div>
            <div class="card-footer">
                <a href="${store.maps_url}" target="_blank" rel="noopener noreferrer" class="btn-map">📍 Get Directions</a>
                ${store.website ? `<a href="${store.website}" target="_blank" rel="noopener noreferrer" class="btn-website">🌐 Visit Website</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Helper to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Filtering logic
function filterStores() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedState = document.getElementById('stateFilter').value;
    
    const filtered = allStores.filter(store => {
        const matchesSearch = searchTerm === '' || 
            store.name.toLowerCase().includes(searchTerm) ||
            store.city.toLowerCase().includes(searchTerm) ||
            store.state.toLowerCase().includes(searchTerm) ||
            (store.notes && store.notes.toLowerCase().includes(searchTerm));
        
        const matchesState = selectedState === '' || store.state === selectedState;
        
        return matchesSearch && matchesState;
    });
    
    renderStores(filtered);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterStores);
document.getElementById('stateFilter').addEventListener('change', filterStores);
document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('stateFilter').value = '';
    renderStores(allStores);
});