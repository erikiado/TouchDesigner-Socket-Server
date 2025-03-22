// Configuración de WebSocket
let wsUrl;
if (window.location.hostname === 'tds.nu9ve.xyz' || window.location.hostname.includes('nu9ve')) {
    wsUrl = 'wss://tds.nu9ve.xyz/:443';
} else {
    wsUrl = `ws://${window.location.hostname}:5009`;
}

let ws = new WebSocket(wsUrl);
const statusIndicator = document.getElementById('connection-status');
const rayosGrid = document.getElementById('rayos-grid');
const selectedItemTitle = document.getElementById('selected-item-title');
const selectedItemDetails = document.getElementById('selected-item-details');
const modal = document.getElementById('modal');

// Estado actual de los controles
let currentControls = {};
let gridItems = {};

// Inicializar el grid 8x8
function initializeGrid() {
    rayosGrid.innerHTML = '';
    
    // Crear 64 celdas (8x8 grid)
    for (let i = 0; i < 64; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.dataset.index = i;
        
        const gridItemContent = document.createElement('div');
        gridItemContent.className = 'grid-item-content';
        
        const gridItemTitle = document.createElement('div');
        gridItemTitle.className = 'grid-item-title';
        gridItemTitle.textContent = 'Vacío';
        
        const gridItemType = document.createElement('div');
        gridItemType.className = 'grid-item-type';
        
        gridItemContent.appendChild(gridItemTitle);
        gridItemContent.appendChild(gridItemType);
        gridItem.appendChild(gridItemContent);
        
        // Agregar evento de clic para mostrar detalles
        gridItem.addEventListener('click', () => {
            // Eliminar clase active de todos los elementos
            document.querySelectorAll('.grid-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Agregar clase active al elemento seleccionado
            gridItem.classList.add('active');
            
            // Mostrar detalles del elemento
            showItemDetails(i);
        });
        
        rayosGrid.appendChild(gridItem);
        
        // Guardar referencia al elemento para acceso rápido
        gridItems[i] = {
            element: gridItem,
            title: gridItemTitle,
            type: gridItemType
        };
    }
}

// Mostrar detalles de un elemento
function showItemDetails(index) {
    const itemKey = Object.keys(currentControls)[index];
    
    if (!itemKey || itemKey === '') {
        selectedItemTitle.textContent = 'Ningún elemento seleccionado';
        selectedItemDetails.innerHTML = '<p>No hay información disponible</p>';
        return;
    }
    
    selectedItemTitle.textContent = itemKey;
    
    const itemData = currentControls[itemKey];
    let detailsHTML = '';
    
    if (itemData) {
        detailsHTML += `<p><strong>Índice:</strong> ${itemData[0]}</p>`;
        
        if (itemData[1]) {
            detailsHTML += `<p><strong>Generador:</strong> ${itemData[1]}</p>`;
        }
        
        if (itemData[2]) {
            detailsHTML += `<p><strong>Archivo:</strong> ${itemData[2]}</p>`;
        }
        
        detailsHTML += `<p><strong>Estado:</strong> ${itemData[3] === "1" ? "Activo" : "Inactivo"}</p>`;
    }
    
    selectedItemDetails.innerHTML = detailsHTML;
}

// Actualizar el grid con datos recibidos
function updateGrid(data) {
    // Limpiar el grid
    Object.values(gridItems).forEach(item => {
        item.title.textContent = 'Vacío';
        item.type.textContent = '';
        item.element.classList.remove('active');
    });
    
    // Ordenar las claves por el primer elemento del array (índice)
    const sortedKeys = Object.keys(data).sort((a, b) => {
        if (!a || a === '') return 1;
        if (!b || b === '') return -1;
        return data[a][0] - data[b][0];
    });
    
    // Actualizar el grid con los datos ordenados
    sortedKeys.forEach(key => {
        if (!key || key === '') return;
        
        const itemData = data[key];
        const index = parseInt(itemData[0]);
        
        if (index >= 0 && index < 64 && gridItems[index]) {
            gridItems[index].title.textContent = key;
            
            // Determinar tipo
            let type = '';
            if (itemData[1] && itemData[1].includes('generadores')) {
                type = 'Generador';
            } else if (itemData[2] && itemData[2] !== '') {
                type = 'Video';
            }
            
            gridItems[index].type.textContent = type;
            
            // Marcar como activo si corresponde
            if (itemData[3] === "1") {
                gridItems[index].element.classList.add('active');
            }
        }
    });
}

// Manejar eventos de WebSocket
ws.addEventListener('open', () => {
    console.log('Conexión WebSocket abierta');
    statusIndicator.textContent = 'Conectado';
    statusIndicator.classList.add('connected');
    statusIndicator.classList.remove('disconnected');
    ws.send('pong'); // Mantener conexión viva
});

ws.addEventListener('message', (event) => {
    if (event.data === 'ping') {
        console.log('Ping recibido, enviando pong');
        ws.send('pong');
        return;
    }
    
    try {
        const data = JSON.parse(event.data);
        console.log('Datos recibidos:', data);
        
        // Verificar si los datos tienen el formato esperado para controles de Rayos
        if (Object.values(data).some(val => Array.isArray(val) && val.length >= 4)) {
            currentControls = data;
            updateGrid(data);
        }
    } catch (error) {
        console.error('Error al procesar los datos recibidos:', error);
    }
});

ws.addEventListener('error', (error) => {
    console.error('Error en la conexión WebSocket:', error);
    statusIndicator.textContent = 'Desconectado';
    statusIndicator.classList.add('disconnected');
    statusIndicator.classList.remove('connected');
    openModal();
});

ws.addEventListener('close', () => {
    console.log('Conexión WebSocket cerrada');
    statusIndicator.textContent = 'Desconectado';
    statusIndicator.classList.add('disconnected');
    statusIndicator.classList.remove('connected');
    openModal();
});

// Funciones auxiliares
function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    statusIndicator.textContent = 'Conectando...';
    statusIndicator.classList.add('disconnected');
}); 