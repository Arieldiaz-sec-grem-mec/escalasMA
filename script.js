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
        // Mostrar las cantidades ingresadas
        document.getElementById('diasTrabajadosValue').textContent = document.getElementById('diasTrabajados').value || 0;
        document.getElementById('horas50Value').textContent = document.getElementById('horas50').value || 0;
        document.getElementById('horas100Value').textContent = document.getElementById('horas100').value || 0;
        document.getElementById('antiguedadValue').textContent = document.getElementById('antiguedad').value || 0;

        // Mostrar los cálculos
        document.getElementById('jornales').textContent = formatearPesos(total.jornales);
        document.getElementById('horasExtras50').textContent = formatearPesos(total.horasExtras50);
        document.getElementById('horasExtras100').textContent = formatearPesos(total.horasExtras100);
        document.getElementById('adicional1').textContent = formatearPesos(total.adicionalCCT1Monto);
        document.getElementById('adicional2').textContent = formatearPesos(total.adicionalCCT2Monto);
        document.getElementById('adicional3').textContent = formatearPesos(total.adicionalCCT3Monto);
        document.getElementById('antiguedadMonto').textContent = formatearPesos(total.antiguedadMonto);
        document.getElementById('haberesTotales').textContent = formatearPesos(total.haberesTotales);
        document.getElementById('noRemunerativo').textContent = formatearPesos(total.noRemunerativo);
        document.getElementById('jubilacion').textContent = formatearPesos(total.jubilacion);
        document.getElementById('obraSocial').textContent = formatearPesos(total.obraSocial);
        document.getElementById('cuotaSindical').textContent = formatearPesos(total.cuotaSindical);
        document.getElementById('cct4089').textContent = formatearPesos(total.cct4089);
        document.getElementById('descuentos').textContent = formatearPesos(total.descuentos);
        document.getElementById('total').textContent = formatearPesos(total.total);

        // Mostrar detalles de la categoría
        document.getElementById('sueldoMensual').textContent = formatearPesos(datos.sueldoMensual);
        document.getElementById('jornal').textContent = formatearPesos(datos.sueldoMensual / 24);
        document.getElementById('extra50').textContent = formatearPesos(datos.sueldoMensual / 128);
        document.getElementById('extra100').textContent = formatearPesos(datos.sueldoMensual / 96);
        document.getElementById('viatico').textContent = formatearPesos(datos.viatico);
        document.getElementById('comida').textContent = formatearPesos(datos.comida);
        document.getElementById('adCCT1').textContent = `${adicionalCCT1}%`;
        document.getElementById('adCCT2').textContent = `${adicionalCCT2}%`;
        document.getElementById('adCCT3').textContent = `${adicionalCCT3}%`;

        // Mostrar cantidades para viáticos y comidas
        const diasTrabajados = document.getElementById('diasTrabajados').value || 0;
        document.getElementById('viaticosCantidad').textContent = diasTrabajados;
        document.getElementById('comidasCantidad').textContent = diasTrabajados;

        // Calcular y mostrar los totales para viáticos y comidas
        document.getElementById('viaticosTotales').textContent = formatearPesos(datos.viatico * diasTrabajados);
        document.getElementById('comidasTotales').textContent = formatearPesos(datos.comida * diasTrabajados);

        // Mostrar cantidades para los adicionales
        document.getElementById('adCCT1Cantidad').textContent = adicionalCCT1; // Aquí ya se tiene el porcentaje
        document.getElementById('adCCT2Cantidad').textContent = adicionalCCT2;
        document.getElementById('adCCT3Cantidad').textContent = adicionalCCT3;
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
        ventanaImpresion.document.write('<html><head><title>Imprimir Recibo de Sueldo</title>');

        // Estilos en línea dentro del script para formato parecido al PDF
        ventanaImpresion.document.write(`
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
            h1 {
                text-align: center;
                font-size: 22px;
                margin-bottom: 20px;
            }
            .info-empleado, .totales {
                width: 100%;
                margin-bottom: 20px;
            }
            .info-empleado td, .info-empleado th {
                padding: 8px;
                text-align: left;
            }
            .info-empleado th {
                font-weight: bold;
                text-align: right;
            }
            .recibo {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .recibo th, .recibo td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
            }
            .recibo th {
                background-color: #f2f2f2;
            }
            .totales {
                width: 100%;
                border-collapse: collapse;
            }
            .totales th, .totales td {
                padding: 8px;
                text-align: right;
            }
            .totales td {
                font-weight: bold;
            }
            .separador {
                margin-top: 20px;
                margin-bottom: 20px;
                border-top: 1px solid #000;
            }
        </style>
    `);

        ventanaImpresion.document.write('</head><body>');
        ventanaImpresion.document.write('<h1>Recibo de Sueldo</h1>');

        // Información del empleado y de pago
        ventanaImpresion.document.write(`
        <table class="info-empleado">
            <tr>
                <th>Periodo de pago:</th><td>1/5/2024</td>
                <th>Fecha de pago:</th><td>1/6/2024</td>
            </tr>
            <tr>
                <th>Categoría:</th><td>` + document.getElementById('categoria').value + `</td>
                <th>Convenio:</th><td>CCT 40/89</td>
            </tr>
        </table>
    `);

        ventanaImpresion.document.write('<div class="separador"></div>');

        // Formato de tabla para los datos del recibo con columna de unidades calculadas
        ventanaImpresion.document.write('<table class="recibo">');
        ventanaImpresion.document.write('<tr><th>Concepto</th><th>Unidades</th><th>Valor</th></tr>');

        ventanaImpresion.document.write('<tr><td>Jornales</td><td>' + document.getElementById('diasTrabajadosValue').textContent + ' días</td><td>' + document.getElementById('jornales').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Horas extras 50%</td><td>' + document.getElementById('horas50Value').textContent + ' horas</td><td>' + document.getElementById('horasExtras50').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Horas extras 100%</td><td>' + document.getElementById('horas100Value').textContent + ' horas</td><td>' + document.getElementById('horasExtras100').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Ad CCT 1</td><td>' + document.getElementById('adCCT1Cantidad').textContent + ' %</td><td>' + document.getElementById('adicional1').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Ad CCT 2</td><td>' + document.getElementById('adCCT2Cantidad').textContent + ' %</td><td>' + document.getElementById('adicional2').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Ad CCT 3</td><td>' + document.getElementById('adCCT3Cantidad').textContent + ' %</td><td>' + document.getElementById('adicional3').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Antigüedad</td><td>' + document.getElementById('antiguedadValue').textContent + ' %</td><td>' + document.getElementById('antiguedadMonto').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Haberes Totales</td><td></td><td>' + document.getElementById('haberesTotales').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Viático Total</td><td>' + document.getElementById('viaticosCantidad').textContent + ' días</td><td>' + document.getElementById('viaticosTotales').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Comida Total</td><td>' + document.getElementById('comidasCantidad').textContent + ' días</td><td>' + document.getElementById('comidasTotales').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>No Remunerativo</td><td></td><td>' + document.getElementById('noRemunerativo').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Jubilación</td><td></td><td>' + document.getElementById('jubilacion').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Obra Social</td><td></td><td>' + document.getElementById('obraSocial').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Cuota Sindical</td><td></td><td>' + document.getElementById('cuotaSindical').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>CCT 40/89</td><td></td><td>' + document.getElementById('cct4089').textContent + '</td></tr>');
        ventanaImpresion.document.write('<tr><td>Descuentos Totales</td><td></td><td>' + document.getElementById('descuentos').textContent + '</td></tr>');

        ventanaImpresion.document.write('</table>');

        ventanaImpresion.document.write('<div class="separador"></div>');

        // Totales
        ventanaImpresion.document.write(`
        <table class="totales">
            <tr><th>Total Neto:</th><td>` + document.getElementById('total').textContent + `</td></tr>
        </table>
    `);

        ventanaImpresion.document.write('</body></html>');
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    });
});
