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
            alert('No se pudo cargar el archivo CSV. Verifica la ruta o el formato.');
        }
    }

    cargarCSV();

    calcularBtn.addEventListener('click', () => {
        const categoria = categoriaSelect.value;
        const diasTrabajados = parseFloat(document.getElementById('diasTrabajados').value) || 0;
        const horas50 = parseFloat(document.getElementById('horas50').value) || 0;
        const horas100 = parseFloat(document.getElementById('horas100').value) || 0;
        const antiguedadPorcentaje = parseFloat(document.getElementById('antiguedad').value) || 0;
        const adicionalCCT1 = parseFloat(document.getElementById('adicionalCCT1').value) || 0;
        const adicionalCCT2 = parseFloat(document.getElementById('adicionalCCT2').value) || 0;
        const adicionalCCT3 = parseFloat(document.getElementById('adicionalCCT3').value) || 0;

        if (categoria && datosCSV[categoria]) {
            const datos = datosCSV[categoria];
            const total = calcularHaberes(datos, diasTrabajados, horas50, horas100, antiguedadPorcentaje, adicionalCCT1, adicionalCCT2, adicionalCCT3);
            mostrarResultados(total, datos, adicionalCCT1, adicionalCCT2, adicionalCCT3);
        } else {
            alert('Por favor, seleccione una categoría válida.');
        }
    });

    function calcularHaberes(datos, diasTrabajados, horas50, horas100, antiguedadPorcentaje, adicionalCCT1, adicionalCCT2, adicionalCCT3) {
        const sueldoMensual = datos.sueldoMensual;
        const jornal = sueldoMensual / 24;
        const extra50 = sueldoMensual / 128;
        const extra100 = sueldoMensual / 96;

        const jornales = jornal * diasTrabajados;
        const horasExtras50 = extra50 * horas50;
        const horasExtras100 = extra100 * horas100;

        const totalHorasJornales = jornales + horasExtras50 + horasExtras100;
        const adicionalCCT1Monto = (adicionalCCT1 / 100) * totalHorasJornales;
        const adicionalCCT2Monto = (adicionalCCT2 / 100) * totalHorasJornales;
        const adicionalCCT3Monto = (adicionalCCT3 / 100) * totalHorasJornales;

        const antiguedadMonto = (antiguedadPorcentaje / 100) * (totalHorasJornales + adicionalCCT1Monto + adicionalCCT2Monto + adicionalCCT3Monto);

        const haberesTotales = totalHorasJornales + adicionalCCT1Monto + adicionalCCT2Monto + adicionalCCT3Monto + antiguedadMonto;

        const viaticosTotales = datos.viatico * diasTrabajados;
        const comidasTotales = datos.comida * diasTrabajados;
        const noRemunerativo = viaticosTotales + comidasTotales;

        const jubilacion = haberesTotales * 0.11;
        const obraSocial = haberesTotales * 0.03;
        const cuotaSindical = haberesTotales * 0.03;
        const cct4089 = haberesTotales * 0.03;
        const descuentos = jubilacion + obraSocial + cuotaSindical + cct4089;

        const total = haberesTotales + noRemunerativo - descuentos;

        return {
            jornales,
            horasExtras50,
            horasExtras100,
            adicionalCCT1Monto,
            adicionalCCT2Monto,
            adicionalCCT3Monto,
            antiguedadMonto,
            haberesTotales,
            viaticosTotales,
            comidasTotales,
            noRemunerativo,
            jubilacion,
            obraSocial,
            cuotaSindical,
            cct4089,
            descuentos,
            total
        };
    }

    function mostrarResultados(total, datos, adicionalCCT1, adicionalCCT2, adicionalCCT3) {
        document.getElementById('jornales').textContent = total.jornales.toFixed(2);
        document.getElementById('horasExtras50').textContent = total.horasExtras50.toFixed(2);
        document.getElementById('horasExtras100').textContent = total.horasExtras100.toFixed(2);
        document.getElementById('adicional1').textContent = total.adicionalCCT1Monto.toFixed(2);
        document.getElementById('adicional2').textContent = total.adicionalCCT2Monto.toFixed(2);
        document.getElementById('adicional3').textContent = total.adicionalCCT3Monto.toFixed(2);
        document.getElementById('antiguedadMonto').textContent = total.antiguedadMonto.toFixed(2);
        document.getElementById('haberesTotales').textContent = total.haberesTotales.toFixed(2);
        document.getElementById('viaticosTotales').textContent = total.viaticosTotales.toFixed(2);
        document.getElementById('comidasTotales').textContent = total.comidasTotales.toFixed(2);
        document.getElementById('noRemunerativo').textContent = total.noRemunerativo.toFixed(2);
        document.getElementById('jubilacion').textContent = total.jubilacion.toFixed(2);
        document.getElementById('obraSocial').textContent = total.obraSocial.toFixed(2);
        document.getElementById('cuotaSindical').textContent = total.cuotaSindical.toFixed(2);
        document.getElementById('cct4089').textContent = total.cct4089.toFixed(2);
        document.getElementById('descuentos').textContent = total.descuentos.toFixed(2);
        document.getElementById('total').textContent = total.total.toFixed(2);

        document.getElementById('sueldoMensual').textContent = datos.sueldoMensual.toFixed(2);
        document.getElementById('jornal').textContent = (datos.sueldoMensual / 24).toFixed(2);
        document.getElementById('extra50').textContent = (datos.sueldoMensual / 128).toFixed(2);
        document.getElementById('extra100').textContent = (datos.sueldoMensual / 96).toFixed(2);
        document.getElementById('viatico').textContent = datos.viatico.toFixed(2);
        document.getElementById('comida').textContent = datos.comida.toFixed(2);
        document.getElementById('adCCT1').textContent = `${adicionalCCT1}%`;
        document.getElementById('adCCT2').textContent = `${adicionalCCT2}%`;
        document.getElementById('adCCT3').textContent = `${adicionalCCT3}%`;
    }
});
