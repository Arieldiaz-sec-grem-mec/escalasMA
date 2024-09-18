document.addEventListener('DOMContentLoaded', () => {
    const categoriaSelect = document.getElementById('categoria');
    const calcularBtn = document.getElementById('calcular');
    let datosCSV = {};

    // Función para cargar el CSV
    async function cargarCSV() {
        try {
            const response = await fetch('salarios.csv');
            if (!response.ok) throw new Error('Error al cargar el archivo CSV');
            const data = await response.text();
            const filas = data.split('\n').map(fila => fila.split(','));

            for (let i = 1; i < filas.length; i++) {
                const fila = filas[i];
                if (fila.length < 7) continue;

                const categoria = fila[0];
                datosCSV[categoria] = {
                    sueldoMensual: parseFloat(fila[1].replace('.', ',').replace(',', '.')),
                    adCCT1: parseFloat(fila[2]),
                    adCCT2: parseFloat(fila[3]),
                    adCCT3: parseFloat(fila[4]),
                    viatico: parseFloat(fila[5].replace('.', ',').replace(',', '.')),
                    comida: parseFloat(fila[6].replace('.', ',', '.'))
                };
            }

            // Cargar las opciones de categoría
            Object.keys(datosCSV).forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                categoriaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    cargarCSV();

    calcularBtn.addEventListener('click', () => {
        const categoria = categoriaSelect.value;
        const diasTrabajados = parseFloat(document.getElementById('diasTrabajados').value) || 0;
        const horas50 = parseFloat(document.getElementById('horas50').value) || 0;
        const horas100 = parseFloat(document.getElementById('horas100').value) || 0;
        const antiguedadPorcentaje = parseFloat(document.getElementById('antiguedad').value) || 0;

        if (categoria && datosCSV[categoria]) {
            const datos = datosCSV[categoria];
            const sueldoMensual = datos.sueldoMensual;
            const jornal = sueldoMensual / 24;
            const extra50 = sueldoMensual / 128;
            const extra100 = sueldoMensual / 96;

            const jornales = jornal * diasTrabajados;
            const horasExtras50 = extra50 * horas50;
            const horasExtras100 = extra100 * horas100;

            const totalHorasJornales = jornales + horasExtras50 + horasExtras100;
            const adicionalCCT1 = (datos.adCCT1 / 100) * totalHorasJornales;
            const adicionalCCT2 = (datos.adCCT2 / 100) * totalHorasJornales;
            const adicionalCCT3 = (datos.adCCT3 / 100) * totalHorasJornales;

            // Aquí se calcula la antigüedad
            const antiguedadMonto = (antiguedadPorcentaje / 100) * (totalHorasJornales + adicionalCCT1 + adicionalCCT2 + adicionalCCT3);

            const haberesTotales = totalHorasJornales + adicionalCCT1 + adicionalCCT2 + adicionalCCT3 + antiguedadMonto;

            const viaticosTotales = datos.viatico * diasTrabajados;
            const comidasTotales = datos.comida * diasTrabajados;
            const noRemunerativo = viaticosTotales + comidasTotales;

            const jubilacion = haberesTotales * 0.11;
            const obraSocial = haberesTotales * 0.03;
            const cuotaSindical = haberesTotales * 0.03;
            const cct4089 = haberesTotales * 0.03;
            const descuentos = jubilacion + obraSocial + cuotaSindical + cct4089;

            const total = haberesTotales + noRemunerativo - descuentos;

            // Actualizar los resultados
            document.getElementById('jornales').textContent = jornales.toFixed(2);
            document.getElementById('horasExtras50').textContent = horasExtras50.toFixed(2);
            document.getElementById('horasExtras100').textContent = horasExtras100.toFixed(2);
            document.getElementById('adicional1').textContent = adicionalCCT1.toFixed(2);
            document.getElementById('adicional2').textContent = adicionalCCT2.toFixed(2);
            document.getElementById('adicional3').textContent = adicionalCCT3.toFixed(2);
            document.getElementById('antiguedadMonto').textContent = antiguedadMonto.toFixed(2);
            document.getElementById('haberesTotales').textContent = haberesTotales.toFixed(2);
            document.getElementById('viaticosTotales').textContent = viaticosTotales.toFixed(2);
            document.getElementById('comidasTotales').textContent = comidasTotales.toFixed(2);
            document.getElementById('noRemunerativo').textContent = noRemunerativo.toFixed(2);
            document.getElementById('jubilacion').textContent = jubilacion.toFixed(2);
            document.getElementById('obraSocial').textContent = obraSocial.toFixed(2);
            document.getElementById('cuotaSindical').textContent = cuotaSindical.toFixed(2);
            document.getElementById('cct4089').textContent = cct4089.toFixed(2);
            document.getElementById('descuentos').textContent = descuentos.toFixed(2);
            document.getElementById('total').textContent = total.toFixed(2);

            document.getElementById('sueldoMensual').textContent = sueldoMensual.toFixed(2);
            document.getElementById('jornal').textContent = jornal.toFixed(2);
            document.getElementById('extra50').textContent = extra50.toFixed(2);
            document.getElementById('extra100').textContent = extra100.toFixed(2);
            document.getElementById('viatico').textContent = datos.viatico.toFixed(2);
            document.getElementById('comida').textContent = datos.comida.toFixed(2);
            document.getElementById('adCCT1').textContent = `${datos.adCCT1}%`;
            document.getElementById('adCCT2').textContent = `${datos.adCCT2}%`;
            document.getElementById('adCCT3').textContent = `${datos.adCCT3}%`;
        } else {
            alert('Por favor, seleccione una categoría válida.');
        }
    });
});
