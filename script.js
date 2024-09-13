const apiUrl = 'https://script.google.com/macros/s/AKfycbzrsDHezYeOCaOt_Q26pBC5c5SktmBPN3vN1HxLa4VqlnhPZPt3epms0YsUXsGRRvEREg/exec';
let categories = [];
let currentIndex = 0;

// Obtener datos desde el Apps Script
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        categories = data;
        showCategory();
    })
    .catch(error => console.error('Error al obtener los datos:', error));

const categoryField = document.getElementById('category');
const detailsField = document.getElementById('details');
const resultDetails = document.getElementById('result-details');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const calculateBtn = document.getElementById('calculate-btn');

// Mostrar la categoría actual
function showCategory() {
    if (categories.length > 0) {
        const currentCategory = categories[currentIndex];
        categoryField.textContent = currentCategory['Categoría'];
        showDetails(currentCategory);
    }
}

// Mostrar detalles de la categoría
function showDetails(category) {
    const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

    detailsField.innerHTML = `
        <div class="detail-item"><span>Salario Básico:</span> ${currencyFormatter.format(parseFloat(category['Salario Básico']))}</div>
        <div class="detail-item"><span>Jornal:</span> ${currencyFormatter.format(parseFloat(category['Jornal']))}</div>
        <div class="detail-item"><span>Hora Extra 50%:</span> ${currencyFormatter.format(parseFloat(category['Hora Extra 50%']))}</div>
        <div class="detail-item"><span>Hora Extra 100%:</span> ${currencyFormatter.format(parseFloat(category['Hora Extra 100%']))}</div>
        <div class="detail-item"><span>Ad cct 1:</span> ${parseFloat(category['Ad cct 1'])} %</div>
        <div class="detail-item"><span>Ad cct 2:</span> ${parseFloat(category['Ad cct 2'])} %</div>
        <div class="detail-item"><span>Ad cct 3:</span> ${parseFloat(category['Ad cct 3'])} %</div>
    `;
}

// Navegar entre categorías
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex === 0) ? categories.length - 1 : currentIndex - 1;
    showCategory();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex === categories.length - 1) ? 0 : currentIndex + 1;
    showCategory();
});

// Cálculo dinámico de sueldo
// Función para calcular el total y mostrar los detalles
calculateBtn.addEventListener('click', () => {
    const diasTrabajados = parseFloat(document.getElementById('dias-trabajados').value);
    const horasExtra50 = parseFloat(document.getElementById('horas-extra-50').value);
    const horasExtra100 = parseFloat(document.getElementById('horas-extra-100').value);
    const antiguedad = parseFloat(document.getElementById('antiguedad').value);

    const category = categories[currentIndex];

    const salarioBasico = parseFloat(category['Salario Básico']);
    const jornal = parseFloat(category['Jornal']);
    const horaExtra50 = parseFloat(category['Hora Extra 50%']);
    const horaExtra100 = parseFloat(category['Hora Extra 100%']);
    const adCct1 = parseFloat(category['Ad cct 1']);
    const adCct2 = parseFloat(category['Ad cct 2']);
    const adCct3 = parseFloat(category['Ad cct 3']);

    const jornalTotal = jornal * diasTrabajados;

    const totalHorasExtra50 = horaExtra50 * horasExtra50;
    const totalHorasExtra100 = horaExtra100 * horasExtra100;

    const adicionalCct1 = ((jornalTotal + totalHorasExtra50 + totalHorasExtra100) * adCct1) / 100;
    const adicionalCct2 = ((jornalTotal + totalHorasExtra50 + totalHorasExtra100) * adCct2) / 100;
    const adicionalCct3 = ((jornalTotal + totalHorasExtra50 + totalHorasExtra100) * adCct3) / 100;

    const antiguedadPorc = antiguedad * 0.01; // 1% por cada año
    const antiguedadTotal = (jornalTotal + totalHorasExtra50 + totalHorasExtra100 + adicionalCct1 + adicionalCct2 + adicionalCct3) * antiguedadPorc;

    const totalSueldo =jornalTotal + adicionalCct1 + adicionalCct2 + adicionalCct3 + totalHorasExtra50 + totalHorasExtra100 + antiguedadTotal;

    // Mostrar resultados
    document.getElementById('basic-salary').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(salarioBasico);
    document.getElementById('jornal-total').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(jornalTotal);
    document.getElementById('ad-cct-1').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(adicionalCct1);
    document.getElementById('ad-cct-2').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(adicionalCct2);
    document.getElementById('ad-cct-3').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(adicionalCct3);
    document.getElementById('extra-50').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalHorasExtra50);
    document.getElementById('extra-100').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalHorasExtra100);
    document.getElementById('antiguedad-info').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(antiguedadTotal);
    document.getElementById('total-salary').textContent = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalSueldo);
});
