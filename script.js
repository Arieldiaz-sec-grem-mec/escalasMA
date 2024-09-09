document.addEventListener("DOMContentLoaded", () => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlLYnwCnBMNbbtLUspbZXIOJqO6iIIUq7F9Ogto42qmfF4wJ-U-EqD1VrIGhBImQ1fcKovodQ2TtLV/pub?gid=0&single=true&output=csv';
    const dataList = document.getElementById('data-list');
    const detailView = document.getElementById('detail-view');
    const detailContent = document.getElementById('detail-content');
    const closeDetailBtn = document.getElementById('close-detail');
    const copyDetailBtn = document.getElementById('copy-detail');

    fetch(sheetUrl)
        .then(response => response.text())
        .then(data => {
            const rows = parseCSV(data);
            let listHtml = '';

            // Generar el HTML para cada ítem de datos
            rows.slice(1).forEach(row => {
                listHtml += `<div class="data-item" data-row='${JSON.stringify(row)}'>${row[0]}</div>`;
            });

            dataList.innerHTML = listHtml;

            // Añadir evento de clic a los ítems de datos
            dataList.addEventListener('click', event => {
                if (event.target.classList.contains('data-item')) {
                    const row = JSON.parse(event.target.getAttribute('data-row'));
                    const headers = [
                        'Categoria',
                        'Sueldo básico mensual',
                        'Sueldo básico jornal',
                        'Hora ex. 50 %',
                        'Hora ex. 100 %',
                        'Viatico', // Cambia "Columna 6" por el nombre real de la columna
                        'Comida'  // Cambia "Columna 7" por el nombre real de la columna
                    ];

                    // Mostrar los detalles en el modal
                    detailContent.innerHTML = headers.map((header, index) =>
                        `<p class="label">${header} : ${row[index] || ''}</p>`
                    ).join('');
                    detailView.classList.remove('hidden');
                    detailView.style.transform = 'scale(1)'; // Restablece el efecto de acercamiento
                }
            });

            // Añadir evento para cerrar la vista de detalles
            closeDetailBtn.addEventListener('click', () => {
                detailView.classList.add('hidden');
            });

            // Añadir evento para copiar los detalles al portapapeles
            copyDetailBtn.addEventListener('click', () => {
                const textToCopy = detailContent.innerText;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Detalles copiados al portapapeles.');
                }).catch(err => {
                    console.error('Error al copiar al portapapeles: ', err);
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
            dataList.innerHTML = '<div>No se pudieron cargar los datos.</div>';
        });
});

// Función para parsear el CSV
function parseCSV(data) {
    const rows = [];
    let row = [];
    let cell = '';
    let insideQuote = false;

    for (const char of data) {
        if (char === '"') {
            insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
            row.push(cell.trim());
            cell = '';
        } else if (char === '\n' && !insideQuote) {
            row.push(cell.trim());
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }

    if (cell) {
        row.push(cell.trim());
    }
    if (row.length) {
        rows.push(row);
    }

    return rows;
}
