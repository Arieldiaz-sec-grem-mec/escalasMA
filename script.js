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

    // Función para formatear en pesos argentinos
    function formatearPesos(valor) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
    }

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
        document.getElementById('jornales').textContent = formatearPesos(total.jornales);
        document.getElementById('horasExtras50').textContent = formatearPesos(total.horasExtras50);
        document.getElementById('horasExtras100').textContent = formatearPesos(total.horasExtras100);
        document.getElementById('adicional1').textContent = formatearPesos(total.adicionalCCT1Monto);
        document.getElementById('adicional2').textContent = formatearPesos(total.adicionalCCT2Monto);
        document.getElementById('adicional3').textContent = formatearPesos(total.adicionalCCT3Monto);
        document.getElementById('antiguedadMonto').textContent = formatearPesos(total.antiguedadMonto);
        document.getElementById('haberesTotales').textContent = formatearPesos(total.haberesTotales);
        document.getElementById('viaticosTotales').textContent = formatearPesos(total.viaticosTotales);
        document.getElementById('comidasTotales').textContent = formatearPesos(total.comidasTotales);
        document.getElementById('noRemunerativo').textContent = formatearPesos(total.noRemunerativo);
        document.getElementById('jubilacion').textContent = formatearPesos(total.jubilacion);
        document.getElementById('obraSocial').textContent = formatearPesos(total.obraSocial);
        document.getElementById('cuotaSindical').textContent = formatearPesos(total.cuotaSindical);
        document.getElementById('cct4089').textContent = formatearPesos(total.cct4089);
        document.getElementById('descuentos').textContent = formatearPesos(total.descuentos);
        document.getElementById('total').textContent = formatearPesos(total.total);
        document.getElementById('sueldoMensual').textContent = formatearPesos(datos.sueldoMensual);
        document.getElementById('jornal').textContent = formatearPesos(datos.sueldoMensual / 24);
        document.getElementById('extra50').textContent = formatearPesos(datos.sueldoMensual / 128);
        document.getElementById('extra100').textContent = formatearPesos(datos.sueldoMensual / 96);
        document.getElementById('viatico').textContent = formatearPesos(datos.viatico);
        document.getElementById('comida').textContent = formatearPesos(datos.comida);
        document.getElementById('adCCT1').textContent = `${adicionalCCT1}%`;
        document.getElementById('adCCT2').textContent = `${adicionalCCT2}%`;
        document.getElementById('adCCT3').textContent = `${adicionalCCT3}%`;
    }

    // Crear botón de imprimir
    const imprimirBtn = document.createElement('button');
    imprimirBtn.textContent = 'Imprimir';
    imprimirBtn.type = 'button';
    imprimirBtn.id = 'imprimir';
    imprimirBtn.className = 'boton-imprimir'; // Puedes agregar clases para el estilo
    document.getElementById('formulario-calculo').appendChild(imprimirBtn);

    // Funcionalidad del botón de imprimir
    imprimirBtn.addEventListener('click', () => {
        const ventanaImpresion = window.open('', '', 'width=800,height=600');
        ventanaImpresion.document.write('<html><head><title>Imprimir Resultados</title>');
        // Enlazar el archivo CSS externo
        ventanaImpresion.document.write('<link rel="stylesheet" type="text/css" href="print.css">');
        ventanaImpresion.document.write('</head><body>');
        ventanaImpresion.document.write('<h1>Recibo de Sueldo</h1>');

        // Mostrar todos los resultados en la ventana de impresión
        ventanaImpresion.document.write('<p><strong>Jornales:</strong> ' + document.getElementById('jornales').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Horas extras 50%:</strong> ' + document.getElementById('horasExtras50').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Horas extras 100%:</strong> ' + document.getElementById('horasExtras100').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Ad CCT 1:</strong> ' + document.getElementById('adicional1').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Ad CCT 2:</strong> ' + document.getElementById('adicional2').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Ad CCT 3:</strong> ' + document.getElementById('adicional3').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Antigüedad:</strong> ' + document.getElementById('antiguedadMonto').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Haberes Totales:</strong> ' + document.getElementById('haberesTotales').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Viático Total:</strong> ' + document.getElementById('viaticosTotales').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Comida Total:</strong> ' + document.getElementById('comidasTotales').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>No Remunerativo:</strong> ' + document.getElementById('noRemunerativo').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Jubilación:</strong> ' + document.getElementById('jubilacion').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Obra Social:</strong> ' + document.getElementById('obraSocial').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Cuota Sindical:</strong> ' + document.getElementById('cuotaSindical').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>CCT 40/89:</strong> ' + document.getElementById('cct4089').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Descuentos Totales:</strong> ' + document.getElementById('descuentos').textContent + '</p>');
        ventanaImpresion.document.write('<p><strong>Total Neto:</strong> ' + document.getElementById('total').textContent + '</p>');
        ventanaImpresion.document.write('</body></html>');
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    });
});
