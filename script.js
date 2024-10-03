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
        const fechaActual = new Date().toLocaleDateString(); // Fecha actual en formato local

        ventanaImpresion.document.write('<html><head><title>Imprimir Recibo de Sueldo</title>');

        // Estilos en línea para bordes redondeados y estructura organizada
        ventanaImpresion.document.write(`
       <style>
    body {
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    h1 {
        text-align: center;
        font-size: 24px;
        margin-bottom: 20px;
        color: #333;
    }
    .recibo-container {
        border: 2px solid #000; /* Borde externo */
        border-radius: 12px; /* Bordes redondeados del contorno de la tabla */
        padding: 20px;
    }
    .recibo {
        width: 100%;
        border-collapse: collapse; /* Mantener bordes internos sin redondeo */
        margin-bottom: 20px;
    }
    .recibo th, .recibo td {
        border: 1px solid #000; /* Borde normal entre celdas */
        padding: 10px;
        text-align: left;
    }
    .recibo th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    .totales {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    .totales th, .totales td {
        border: 1px solid #000;
        padding: 10px;
        text-align: right;
    }
    .totales td {
        font-weight: bold;
    }
    .columna-haberes, .columna-no-remunerativo, .columna-descuentos {
        width: 20%;
        text-align: right;
    }
    .separador {
        margin-top: 20px;
        margin-bottom: 20px;
        border-top: 1px solid #000;
    }
    /* Bordes redondeados solo en el contorno */
    .recibo-container {
        border-radius: 12px;
        overflow: hidden; /* Esto asegura que los bordes internos no sobresalgan */
    }
    @media print {
        body {
            margin: 0;
        }
    }
</style>

        `);

        ventanaImpresion.document.write('</head><body>');
        ventanaImpresion.document.write('<h1>Resumen de calulo</h1>');

        // Encapsular todo en un contenedor con bordes redondeados
        ventanaImpresion.document.write('<div class="recibo-container">');

        // Información del empleado y fecha de cálculo
        ventanaImpresion.document.write(`
            <table class="info-empleado">
                <tr>
                    <th>Planilla:</th><td>222</td>
                    <th>Fecha de cálculo:</th><td>` + fechaActual + `</td>
                </tr>
                <tr>
                    <th>Categoría:</th><td>` + document.getElementById('categoria').value + `</td>
                    <th>Convenio:</th><td>CCT 40/89</td>
                </tr>
            </table>
        `);

        ventanaImpresion.document.write('<div class="separador"></div>');

        // Tabla de recibo con 5 columnas
        ventanaImpresion.document.write(`
            <table class="recibo">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Unidades</th>
                        <th class="columna-haberes">Haberes</th>
                        <th class="columna-no-remunerativo">No Remunerativo</th>
                        <th class="columna-descuentos">Descuentos</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jornales</td>
                        <td>` + document.getElementById('diasTrabajadosValue').textContent + ` días</td>
                        <td class="columna-haberes">` + document.getElementById('jornales').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Horas extras 50%</td>
                        <td>` + document.getElementById('horas50Value').textContent + ` horas</td>
                        <td class="columna-haberes">` + document.getElementById('horasExtras50').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Horas extras 100%</td>
                        <td>` + document.getElementById('horas100Value').textContent + ` horas</td>
                        <td class="columna-haberes">` + document.getElementById('horasExtras100').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Ad CCT 1</td>
                        <td>` + document.getElementById('adCCT1Cantidad').textContent + ` %</td>
                        <td class="columna-haberes">` + document.getElementById('adicional1').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Ad CCT 2</td>
                        <td>` + document.getElementById('adCCT2Cantidad').textContent + ` %</td>
                        <td class="columna-haberes">` + document.getElementById('adicional2').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Ad CCT 3</td>
                        <td>` + document.getElementById('adCCT3Cantidad').textContent + ` %</td>
                        <td class="columna-haberes">` + document.getElementById('adicional3').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Antigüedad</td>
                        <td>` + document.getElementById('antiguedadValue').textContent + ` %</td>
                        <td class="columna-haberes">` + document.getElementById('antiguedadMonto').textContent + `</td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Viáticos</td>
                        <td>` + document.getElementById('viaticosCantidad').textContent + ` días</td>
                        <td class="columna-haberes"></td>
                        <td class="columna-no-remunerativo">` + document.getElementById('viaticosTotales').textContent + `</td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Comidas</td>
                        <td>` + document.getElementById('comidasCantidad').textContent + ` días</td>
                        <td class="columna-haberes"></td>
                        <td class="columna-no-remunerativo">` + document.getElementById('comidasTotales').textContent + `</td>
                        <td class="columna-descuentos"></td>
                    </tr>
                    <tr>
                        <td>Jubilación</td>
                        <td></td>
                        <td class="columna-haberes"></td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos">` + document.getElementById('jubilacion').textContent + `</td>
                    </tr>
                    <tr>
                        <td>Obra Social</td>
                        <td></td>
                        <td class="columna-haberes"></td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos">` + document.getElementById('obraSocial').textContent + `</td>
                    </tr>
                    <tr>
                        <td>Cuota Sindical</td>
                        <td></td>
                        <td class="columna-haberes"></td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos">` + document.getElementById('cuotaSindical').textContent + `</td>
                    </tr>
                    <tr>
                        <td>CCT 40/89</td>
                        <td></td>
                        <td class="columna-haberes"></td>
                        <td class="columna-no-remunerativo"></td>
                        <td class="columna-descuentos">` + document.getElementById('cct4089').textContent + `</td>
                    </tr>
                </tbody>
            </table>
        `);

        ventanaImpresion.document.write('<div class="separador"></div>');

        // Mostrar los totales al final
        ventanaImpresion.document.write(`
            <table class="totales">
                <tr>
                    <th>Total Haberes:</th><td class="columna-haberes">` + document.getElementById('haberesTotales').textContent + `</td>
                </tr>
                <tr>
                    <th>Total No Remunerativo:</th><td class="columna-no-remunerativo">` + document.getElementById('noRemunerativo').textContent + `</td>
                </tr>
                <tr>
                    <th>Total Descuentos:</th><td class="columna-descuentos">` + document.getElementById('descuentos').textContent + `</td>
                </tr>
                <tr>
                    <th>Total Neto:</th><td>` + document.getElementById('total').textContent + `</td>
                </tr>
            </table>
        `);

        ventanaImpresion.document.write('</div>'); // Cierre del contenedor con borde redondeado
        ventanaImpresion.document.write('</body></html>');
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    });

});
