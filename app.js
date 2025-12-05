// Global data storage
let artistsData = [];
let artworksData = [];
let artistToArtworksMap = new Map();
let artistsWithArtworks = [];

// The file upload handling
const artistsFileInput = document.getElementById('artistsFile');
const artworksFileInput = document.getElementById('artworksFile');
const processBtn = document.getElementById('processBtn');
const uploadStatus = document.getElementById('uploadStatus');
const loadLocalBtn = document.getElementById('loadLocalBtn');
const toggleUploadBtn = document.getElementById('toggleUploadBtn');
const uploadGrid = document.getElementById('uploadGrid');

let artistsFileContent = null;
let artworksFileContent = null;

// Load local CSV files automatically
loadLocalBtn.addEventListener('click', async () => {
    loadLocalBtn.disabled = true;
    uploadStatus.textContent = 'Loading local data files...';
    uploadStatus.className = 'upload-status';
    
    try {
        // Fetch the local CSV files
        const artistsResponse = await fetch('Artists.csv');
        const artworksResponse = await fetch('artworks_sampled.csv');
        
        if (!artistsResponse.ok || !artworksResponse.ok) {
            throw new Error('Could not load CSV files. Please ensure Artists.csv and artworks_sampled.csv are in the same folder.');
        }
        
        artistsFileContent = await artistsResponse.text();
        artworksFileContent = await artworksResponse.text();
        
        await processData();
        
    } catch (error) {
        console.error('Error loading local files:', error);
        uploadStatus.textContent = '✗ Error loading local files: ' + error.message;
        uploadStatus.className = 'upload-status error';
        loadLocalBtn.disabled = false;
    }
});

// Toggle upload section visibility
toggleUploadBtn.addEventListener('click', () => {
    const isHidden = uploadGrid.style.display === 'none';
    uploadGrid.style.display = isHidden ? 'grid' : 'none';
    toggleUploadBtn.textContent = isHidden ? 'Hide Upload Options' : 'Upload Your Own Files';
});

// Update filename displays
artistsFileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || 'No file selected';
    document.getElementById('artistsFileName').textContent = fileName;
    checkFilesReady();
});

artworksFileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || 'No file selected';
    document.getElementById('artworksFileName').textContent = fileName;
    checkFilesReady();
});

function checkFilesReady() {
    processBtn.disabled = !(artistsFileInput.files[0] && artworksFileInput.files[0]);
}

// Process button click
processBtn.addEventListener('click', async () => {
    processBtn.disabled = true;
    uploadStatus.textContent = 'Processing files...';
    uploadStatus.className = 'upload-status';
    
    try {
        // Read files
        const artistsFile = artistsFileInput.files[0];
        const artworksFile = artworksFileInput.files[0];
        
        artistsFileContent = await readFile(artistsFile);
        artworksFileContent = await readFile(artworksFile);
        
        await processData();
        
    } catch (error) {
        console.error('Error processing files:', error);
        uploadStatus.textContent = '✗ Error processing files: ' + error.message;
        uploadStatus.className = 'upload-status error';
        processBtn.disabled = false;
    }
});

// Main data processing function
async function processData() {
    try {
        // Parse CSV files
        artistsData = parseCSV(artistsFileContent);
        artworksData = parseCSV(artworksFileContent);
        
        console.log('Initial artworks rows:', artworksData.length);
        console.log('Initial artists rows:', artistsData.length);
        
        // Remove rows where ConstituentID is empty
        artworksData = artworksData.filter(artwork => {
            const constituentID = artwork.ConstituentID;
            return constituentID && constituentID.trim() !== '';
        });
        
        console.log('Artworks after filtering empty ConstituentID:', artworksData.length);
        
        // Identify duplicate columns (columns that exist in both datasets)
        const artistColumns = artistsData.length > 0 ? Object.keys(artistsData[0]) : [];
        const artworkColumns = artworksData.length > 0 ? Object.keys(artworksData[0]) : [];
        
        // Find columns that exist in both datasets
        const duplicateColumns = _.intersection(artistColumns, artworkColumns)
            .filter(col => col !== 'ConstituentID'); // Keep ConstituentID as it's needed for mapping
        
        console.log('Duplicate columns to remove from artworks:', duplicateColumns);
        
        // Remove duplicate columns from artworks data
        artworksData = artworksData.map(artwork => {
            const cleaned = { ...artwork };
            duplicateColumns.forEach(col => {
                delete cleaned[col];
            });
            return cleaned;
        });
        
        console.log('Final artworks rows:', artworksData.length);
        console.log('Remaining artwork columns:', Object.keys(artworksData[0] || {}));
        
        // Create artist to artworks mapping using Map
        createArtistToArtworksMap();
        
        // Display the tables
        displayTables();
        
        uploadStatus.textContent = `✓ Successfully processed ${artistsData.length} artists and ${artworksData.length} artworks`;
        uploadStatus.className = 'upload-status success';
        
        // Show sections
        document.getElementById('tablesSection').style.display = 'block';
        document.getElementById('gallerySection').style.display = 'block';
        
        // Scroll to tables
        setTimeout(() => {
            document.getElementById('tablesSection').scrollIntoView({ behavior: 'smooth' });
        }, 300);
        
    } catch (error) {
        throw error;
    }
}

// Read file as text
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

// Parse CSV content
function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            data.push(obj);
        }
    }
    
    return data;
}

// Parse a single CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Create Map of artist IDs to their artworks
function createArtistToArtworksMap() {
    artistToArtworksMap.clear();
    
    artworksData.forEach(artwork => {
        // ConstituentID might contain multiple artists separated by commas
        const constituentIDs = artwork.ConstituentID.split(',').map(id => id.trim());
        
        constituentIDs.forEach(id => {
            if (!artistToArtworksMap.has(id)) {
                artistToArtworksMap.set(id, []);
            }
            artistToArtworksMap.get(id).push(artwork);
        });
    });
    
    // Create list of artists who have artworks in the collection
    artistsWithArtworks = artistsData.filter(artist => 
        artistToArtworksMap.has(artist.ConstituentID)
    );
    
    console.log('Artist to artworks map created:', artistToArtworksMap.size, 'artists with artworks');
    console.log('Artists with artworks in collection:', artistsWithArtworks.length);
}

// Display data tables
function displayTables() {
    displayArtistsTable();
    displayArtworksTable();
}

function displayArtistsTable() {
    const table = document.getElementById('artistsTable');
    const count = document.getElementById('artistsCount');
    
    if (artistsData.length === 0) {
        table.innerHTML = '<p>No data available</p>';
        return;
    }
    
    count.textContent = `${artistsData.length} artists`;
    
    const headers = Object.keys(artistsData[0]);
    const maxRows = 50; // Limit display for performance
    const displayData = artistsData.slice(0, maxRows);
    
    let html = '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${_.escape(header)}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    displayData.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            html += `<td>${_.escape(row[header] || '')}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody>';
    
    if (artistsData.length > maxRows) {
        html += `<tfoot><tr><td colspan="${headers.length}" style="text-align: center; padding: 15px; color: var(--text-secondary);">Showing first ${maxRows} of ${artistsData.length} rows</td></tr></tfoot>`;
    }
    
    table.innerHTML = html;
}

function displayArtworksTable() {
    const table = document.getElementById('artworksTable');
    const count = document.getElementById('artworksCount');
    
    if (artworksData.length === 0) {
        table.innerHTML = '<p>No data available</p>';
        return;
    }
    
    count.textContent = `${artworksData.length} artworks`;
    
    const headers = Object.keys(artworksData[0]);
    const maxRows = 50; // Limit display for performance
    const displayData = artworksData.slice(0, maxRows);
    
    let html = '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${_.escape(header)}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    displayData.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            html += `<td>${_.escape(row[header] || '')}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody>';
    
    if (artworksData.length > maxRows) {
        html += `<tfoot><tr><td colspan="${headers.length}" style="text-align: center; padding: 15px; color: var(--text-secondary);">Showing first ${maxRows} of ${artworksData.length} rows</td></tr></tfoot>`;
    }
    
    table.innerHTML = html;
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Artist search functionality
const searchInput = document.getElementById('artistSearch');
const searchResults = document.getElementById('searchResults');
const artistInfo = document.getElementById('artistInfo');
const noResults = document.getElementById('noResults');
const artworksList = document.getElementById('artworksList');

let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }
    
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
});

function performSearch(query) {
    // Search only among artists who have artworks
    const matches = artistsWithArtworks.filter(artist => {
        const displayName = artist.DisplayName || '';
        const artistBio = artist.ArtistBio || '';
        const nationality = artist.Nationality || '';
        
        return displayName.toLowerCase().includes(query) ||
               artistBio.toLowerCase().includes(query) ||
               nationality.toLowerCase().includes(query);
    }).slice(0, 20); // Limit to 20 results
    
    if (matches.length === 0) {
        searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No artists found with artworks in collection</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    let html = '';
    matches.forEach(artist => {
        const artworkCount = artistToArtworksMap.get(artist.ConstituentID)?.length || 0;
        html += `
            <div class="search-result-item" data-artist-id="${_.escape(artist.ConstituentID)}">
                <div class="result-name">${_.escape(artist.DisplayName || 'Unknown Artist')}</div>
                <div class="result-details">
                    ${artist.Nationality ? _.escape(artist.Nationality) : ''} 
                    ${artist.BeginDate && artist.EndDate ? `(${_.escape(artist.BeginDate)}-${_.escape(artist.EndDate)})` : ''}
                    • ${artworkCount} artwork${artworkCount !== 1 ? 's' : ''}
                </div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
    
    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const artistId = item.getAttribute('data-artist-id');
            selectArtist(artistId);
        });
    });
}

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        searchResults.style.display = 'none';
    }
});

// Select and display artist's artworks
function selectArtist(artistId) {
    searchResults.style.display = 'none';
    
    const artist = artistsData.find(a => a.ConstituentID === artistId);
    const artworks = artistToArtworksMap.get(artistId) || [];
    
    if (!artist) return;
    
    // Display artist info
    document.getElementById('artistName').textContent = artist.DisplayName || 'Unknown Artist';
    
    let detailsHtml = '';
    if (artist.Nationality) {
        detailsHtml += `<p><strong>Nationality:</strong> ${_.escape(artist.Nationality)}</p>`;
    }
    if (artist.BeginDate && artist.EndDate) {
        detailsHtml += `<p><strong>Born:</strong> ${_.escape(artist.BeginDate)} <strong>Died:</strong> ${_.escape(artist.EndDate)}</p>`;
    }
    if (artist.Gender) {
        detailsHtml += `<p><strong>Gender:</strong> ${_.escape(artist.Gender)}</p>`;
    }
    detailsHtml += `<p><strong>Artworks in collection:</strong> ${artworks.length}</p>`;
    
    document.getElementById('artistDetails').innerHTML = detailsHtml;
    artistInfo.style.display = 'block';
    
    // Display artworks
    if (artworks.length === 0) {
        noResults.style.display = 'block';
        artworksList.innerHTML = '';
    } else {
        noResults.style.display = 'none';
        displayArtworks(artworks);
    }
    
    // Scroll to artworks
    artistInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display artworks in a grid
function displayArtworks(artworks) {
    let html = '';
    
    artworks.forEach(artwork => {
        const title = artwork.Title || 'Untitled';
        const date = artwork.Date || 'Unknown Date';
        const medium = artwork.Medium || 'Unknown Medium';
        const dimensions = artwork.Dimensions || 'Unknown Dimensions';
        const imageUrl = artwork.ThumbnailURL || artwork.ImageURL || '';
        
        html += `
            <div class="artwork-card">
                <div class="artwork-image-container">
                    ${imageUrl ? 
                        `<img src="${_.escape(imageUrl)}" alt="${_.escape(title)}" class="artwork-image" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><svg class=\\'placeholder-icon\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'></rect><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'></circle><polyline points=\\'21 15 16 10 5 21\\'></polyline></svg></div>'">` :
                        `<div class="placeholder-image">
                            <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>`
                    }
                </div>
                <div class="artwork-content">
                    <h3 class="artwork-title">${_.escape(title)}</h3>
                    <div class="artwork-info">
                        <p><strong>Date:</strong> ${_.escape(date)}</p>
                        <p><strong>Medium:</strong> ${_.escape(medium)}</p>
                        <p><strong>Dimensions:</strong> ${_.escape(dimensions)}</p>
                        ${artwork.Department ? `<p><strong>Department:</strong> ${_.escape(artwork.Department)}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    artworksList.innerHTML = html;
}
