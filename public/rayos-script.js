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
const toastNotification = document.getElementById('toast-notification');
const toastTitle = document.getElementById('toast-title');
const toastContent = document.getElementById('toast-content');
const modal = document.getElementById('modal');

// Diccionario de emojis para diferentes nombres
const emojiDictionary = {
    // Nombres específicos
    "rayettes_1": "💃",
    "rayoman": "🦸",
    "qrayos": "⚡",
    "promo": "📢",
    "cibacopa": "🏀",
    "househype": "🛼",
    "rayettes2": "👯",
    "ganamos": "🏆",
    "gallos90": "🐓",
    "photobooth": "📸",
    "encendido": "🔌",
    "ruido1": "🔉🎚️",
    "ramsey": "👨🎧",
    "lth": "🪫",
    "rayostore": "🛒",
    "momentomagico": "✨",
    "quetruene": "🌩️",
    "vamosrayos": "⚔️⚡",
    "ruido2": "🔊",
    "ruidomeh": "📣",
    "polloteria": "🍗",
    "yellowbar": "🍺",
    "altatension": "⚠️",
    "defense": "🛡️",
    "delzade3": "🏭",
    "vaquita": "🐄",
    "eatsalad": "🥗",
    "tomason": "🍅",
    "armando": "🦐",
    "pipeso": "🪠",
    "crujisalsa": "🌶️",
    "clavadataste": "🍴",
    "kissmaderan": "💋",
    "dermacy": "🧴",
    "orus": "🎰",
    "pastello": "🎂",
    "vwagricola": "🚜",
    "puntapeninsula": "🏝️",
    "sanbenito": "🏥",
    
    // Prefijos para coincidencias parciales
    "rayo": "⚡",
    "logo": "🔠",
    "jugadores": "👥",
    "visita": "🚶",
    "bandera": "🇲🇽",
    "ruido": "📢",
    "generadores": "⚙️",
    
    // Emojis aleatorios relacionados con electricidad y rayos
    // para elementos sin coincidencia específica
    "random": ["⚡", "💡", "🔌", "⚠️", "🔋", "📡", "⛈️", "🌩️", "🔆", "📶", "🌟", "⭐", "🌠", "✨"]
};

// Obtener un emoji para un nombre específico
function getEmojiForName(name) {
    // Verificar si existe una coincidencia exacta
    if (emojiDictionary[name]) {
        return emojiDictionary[name];
    }
    
    // Verificar coincidencias parciales por prefijo
    for (const prefix in emojiDictionary) {
        if (name.toLowerCase().includes(prefix.toLowerCase()) && prefix !== "random") {
            return emojiDictionary[prefix];
        }
    }
    
    // Si no hay coincidencia, devolver un emoji aleatorio
    const randomEmojis = emojiDictionary["random"];
    return randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
}

// Estado actual de los controles
let currentControls = {};
let gridItems = {};
let selectionTimer = null;

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
        
        const gridItemEmoji = document.createElement('div');
        gridItemEmoji.className = 'grid-item-emoji';
        
        const gridItemTitle = document.createElement('div');
        gridItemTitle.className = 'grid-item-title';
        gridItemTitle.textContent = 'Vacío';
        
        const gridItemType = document.createElement('div');
        gridItemType.className = 'grid-item-type';
        
        gridItemContent.appendChild(gridItemEmoji);
        gridItemContent.appendChild(gridItemTitle);
        gridItemContent.appendChild(gridItemType);
        gridItem.appendChild(gridItemContent);
        
        // Agregar evento de clic para mostrar detalles
        gridItem.addEventListener('click', () => {
            // Eliminar clase active de todos los elementos y limpiar timer previo
            clearSelectionAndTimer();
            
            // Agregar clase active al elemento seleccionado
            gridItem.classList.add('active');
            
            // Mostrar detalles del elemento en el toast
            showItemDetails(i);
            
            // Configurar el timer para remover la selección después de 5 segundos
            selectionTimer = setTimeout(() => {
                clearSelectionAndTimer();
            }, 5000);
        });
        
        rayosGrid.appendChild(gridItem);
        
        // Guardar referencia al elemento para acceso rápido
        gridItems[i] = {
            element: gridItem,
            emoji: gridItemEmoji,
            title: gridItemTitle,
            type: gridItemType
        };
    }
}

// Limpiar la selección actual y el timer
function clearSelectionAndTimer() {
    // Limpiar timer si existe
    if (selectionTimer) {
        clearTimeout(selectionTimer);
        selectionTimer = null;
    }
    
    // Quitar selección de todos los elementos
    document.querySelectorAll('.grid-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Ocultar el toast
    hideToast();
}

// Mostrar detalles de un elemento en el toast
function showItemDetails(gridIndex) {
    // Convertir el índice del grid al índice del objeto de controles
    const row = Math.floor(gridIndex / 8);
    const col = 7 - (gridIndex % 8); // Invertir para obtener el índice original
    const dataIndex = row * 8 + col;
    
    // Convertir el índice a la clave correspondiente
    const keys = Object.keys(currentControls);
    let foundKey = null;
    
    // Buscar la clave que tiene el valor de índice correcto
    keys.forEach(key => {
        if (currentControls[key] && parseInt(currentControls[key][0]) === dataIndex) {
            foundKey = key;
        }
    });
    
    if (!foundKey) {
        toastTitle.textContent = 'Elemento no disponible';
        toastContent.innerHTML = '<p>No hay información para mostrar</p>';
        showToast();
        return;
    }
    
    toastTitle.textContent = foundKey;
    
    const itemData = currentControls[foundKey];
    let detailsHTML = '';
    
    if (itemData) {
        detailsHTML += `<p><strong>Índice:</strong> ${itemData[0]}</p>`;
        
        if (itemData[1]) {
            detailsHTML += `<p><strong>Generador:</strong> ${itemData[1]}</p>`;
        }
        
        if (itemData[2]) {
            detailsHTML += `<p><strong>Archivo:</strong> ${itemData[2]}</p>`;
        }
        
        detailsHTML += `<p><strong>Estado:</strong> ${itemData[3] === "1" ? "Loop" : "Trigger"}</p>`;
    }
    
    toastContent.innerHTML = detailsHTML;
    showToast();
}

// Mostrar el toast de notificación
function showToast() {
    // Asegurarse que el toast está inicialmente sin animación
    toastNotification.classList.remove('fadeout');
    toastNotification.classList.remove('hidden');
    
    // Forzar un reflow para asegurar que la transición funcione
    void toastNotification.offsetWidth;
    
    // Ahora mostrar con la transición
    toastNotification.classList.add('show');
}

// Ocultar el toast de notificación
function hideToast() {
    toastNotification.classList.remove('show');
    toastNotification.classList.add('fadeout');
    
    // Esperar a que termine la animación antes de ocultarlo completamente
    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 300);
}

// Actualizar el grid con datos recibidos
function updateGrid(data) {
    // Limpiar el grid
    Object.values(gridItems).forEach(item => {
        item.title.textContent = 'Vacío';
        item.emoji.textContent = '';
        item.type.textContent = '';
        item.element.classList.remove('active');
        item.element.classList.remove('loop-active');
        item.element.classList.remove('trigger-active');
        item.element.classList.remove('generator-active');
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
        
        if (index >= 0 && index < 64) {
            // Convertir el índice lineal al formato de grid 8x8
            // El primer elemento (0) está en la esquina superior derecha
            // y avanza hacia la izquierda
            const row = Math.floor(index / 8);
            const col = 7 - (index % 8); // Invertir el orden de las columnas
            const gridIndex = row * 8 + col;
            
            if (gridItems[gridIndex]) {
                gridItems[gridIndex].title.textContent = key;
                
                // Asignar emoji según el nombre
                gridItems[gridIndex].emoji.textContent = getEmojiForName(key);
                
                // Determinar tipo
                let type = '';
                let isGenerator = false;
                
                if (itemData[1] && itemData[1].includes('generadores')) {
                    type = 'Generador';
                    isGenerator = true;
                } else if (itemData[2] && itemData[2] !== '') {
                    type = 'Video';
                }
                
                gridItems[gridIndex].type.textContent = type;
                
                // Marcar como loop o trigger según el valor, excepto si es generador
                if (isGenerator) {
                    // Los generadores siempre tienen el indicador de generador, sin importar el valor
                    gridItems[gridIndex].element.classList.add('generator-active');
                } else if (itemData[3] === "1") {
                    // Videos en loop
                    gridItems[gridIndex].element.classList.add('loop-active');
                } else if (itemData[3] === "0") {
                    // Videos en trigger
                    gridItems[gridIndex].element.classList.add('trigger-active');
                }
                
                // Aplicar color según la fila
                applyColorByRow(gridIndex, row);
            }
        }
    });
}

// Aplicar color según la fila
function applyColorByRow(gridIndex, row) {
    const element = gridItems[gridIndex].element;
    
    // Eliminar clases de color existentes
    element.classList.remove('row-red', 'row-blue', 'row-yellow', 'row-purple', 'row-multi');
    
    // Aplicar clase de color según la fila
    if (row < 2) {
        element.classList.add('row-red');
    } else if (row < 4) {
        element.classList.add('row-blue');
    } else if (row < 6) {
        element.classList.add('row-yellow');
    } else if (row < 7) {
        element.classList.add('row-purple');
    } else {
        element.classList.add('row-multi');
    }
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
    // Asegurarse que el toast esté completamente oculto inicialmente
    toastNotification.style.display = 'none';
    setTimeout(() => {
        toastNotification.style.display = '';
        toastNotification.classList.add('hidden');
    }, 100);
    
    initializeGrid();
    statusIndicator.textContent = 'Conectando...';
    statusIndicator.classList.add('disconnected');
}); 