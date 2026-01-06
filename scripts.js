// ============================================
// SISTEMA DE PLANILLAS DOCENTES - VERSIÓN COMPLETA
// ============================================

// Variables globales para almacenar datos
let datosDocente = {
    nombre: "",
    dni: "",
    cuil: "",
    telefono: "",
    domicilio: "",
    titulo: ""
};

let cursos = [];
let contadorHorarios = 0;

// Horarios disponibles según turno
const horariosMañana = [
    "07:45-08:25", "08:25-09:05", "09:15-09:55", "09:55-10:35",
    "10:45-11:25", "11:25-12:05", "12:05-12:45"
];

const horariosTarde = [
    "14:00-14:40", "14:40-15:20", "15:30-16:10", "16:10-16:50",
    "17:00-17:40", "17:40-18:20", "18:20-19:00"
];

const diasSemana = [
    { valor: "LUNES", texto: "Lunes" },
    { valor: "MARTES", texto: "Martes" },
    { valor: "MIÉRCOLES", texto: "Miércoles" },
    { valor: "JUEVES", texto: "Jueves" },
    { valor: "VIERNES", texto: "Viernes" }
];

// ============================================
// SISTEMA DE GUARDADO AUTOMÁTICO
// ============================================

function guardarEnLocalStorage() {
    const datos = {
        docente: datosDocente,
        cursos: cursos,
        ultimaModificacion: new Date().toISOString(),
        version: "2.0"
    };
    localStorage.setItem('planillasDocente', JSON.stringify(datos));
    console.log('Datos guardados automáticamente');
}

function cargarDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem('planillasDocente');
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            datosDocente = datos.docente || datosDocente;
            cursos = datos.cursos || [];
            
            if (datosDocente.nombre) {
                document.getElementById('nombre').value = datosDocente.nombre;
                document.getElementById('dni').value = datosDocente.dni;
                document.getElementById('cuil').value = datosDocente.cuil;
                document.getElementById('telefono').value = datosDocente.telefono;
                document.getElementById('domicilio').value = datosDocente.domicilio;
                document.getElementById('titulo').value = datosDocente.titulo;
            }
            
            actualizarTablaCursos();
            mostrarNotificacion(`Datos cargados: ${cursos.length} curso(s)`, 'success');
            
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }
}

// ============================================
// FUNCIONES PRINCIPALES DEL FORMULARIO
// ============================================

function guardarDatosDocente() {
    const nombre = document.getElementById('nombre').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const cuil = document.getElementById('cuil').value.trim();
    
    if (!nombre || !dni || !cuil) {
        mostrarNotificacion('Complete Nombre, DNI y CUIL', 'warning');
        return;
    }
    
    datosDocente = {
        nombre: nombre,
        dni: dni,
        cuil: cuil,
        telefono: document.getElementById('telefono').value.trim(),
        domicilio: document.getElementById('domicilio').value.trim(),
        titulo: document.getElementById('titulo').value.trim()
    };
    
    guardarEnLocalStorage();
    mostrarNotificacion('Datos del docente guardados', 'success');
}

function agregarHorario() {
    contadorHorarios++;
    const container = document.getElementById('horariosContainer');
    const turno = document.getElementById('turno').value;
    const horariosDisponibles = turno === 'Tarde' ? horariosTarde : horariosMañana;
    
    const horarioDiv = document.createElement('div');
    horarioDiv.className = 'col-md-6 mb-2';
    horarioDiv.innerHTML = `
        <div class="horario-item">
            <div class="row g-2">
                <div class="col-5">
                    <select class="form-select form-select-sm dia-select" id="dia${contadorHorarios}" onchange="actualizarResumenHorarios()">
                        <option value="">Seleccione día</option>
                        ${diasSemana.map(dia => `<option value="${dia.valor}">${dia.texto}</option>`).join('')}
                    </select>
                </div>
                <div class="col-5">
                    <select class="form-select form-select-sm hora-select" id="hora${contadorHorarios}" onchange="actualizarResumenHorarios()">
                        <option value="">Seleccione horario</option>
                        ${horariosDisponibles.map(hora => `<option value="${hora}">${hora}</option>`).join('')}
                    </select>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger btn-sm w-100" onclick="eliminarHorario(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(horarioDiv);
}

function eliminarHorario(boton) {
    const horarioItem = boton.closest('.col-md-6');
    horarioItem.remove();
    actualizarResumenHorarios();
}

function actualizarResumenHorarios() {
    const resumenContainer = document.getElementById('resumenHorarios');
    const diaSelects = document.querySelectorAll('.dia-select');
    const horaSelects = document.querySelectorAll('.hora-select');
    
    let horariosSeleccionados = [];
    
    diaSelects.forEach((select, index) => {
        const dia = select.value;
        const hora = horaSelects[index] ? horaSelects[index].value : '';
        
        if (dia && hora) {
            horariosSeleccionados.push({ dia, hora });
        }
    });
    
    if (horariosSeleccionados.length === 0) {
        resumenContainer.innerHTML = '<span class="text-muted">No hay horarios agregados</span>';
        return;
    }
    
    const horariosPorDia = {};
    horariosSeleccionados.forEach(h => {
        if (!horariosPorDia[h.dia]) {
            horariosPorDia[h.dia] = [];
        }
        horariosPorDia[h.dia].push(h.hora);
    });
    
    let html = '';
    Object.keys(horariosPorDia).sort().forEach(dia => {
        const horas = horariosPorDia[dia].sort();
        const textoDia = diasSemana.find(d => d.valor === dia)?.texto || dia;
        html += `<div class="badge-curso">${textoDia}: ${horas.join(', ')}</div>`;
    });
    
    resumenContainer.innerHTML = html;
}

function obtenerHorariosSeleccionados() {
    const diaSelects = document.querySelectorAll('.dia-select');
    const horaSelects = document.querySelectorAll('.hora-select');
    const horarios = [];
    
    diaSelects.forEach((select, index) => {
        const dia = select.value;
        const hora = horaSelects[index] ? horaSelects[index].value : '';
        
        if (dia && hora) {
            horarios.push({ dia, hora });
        }
    });
    
    return horarios;
}

function agregarCurso() {
    const colegio = document.getElementById('colegio').value.trim();
    const materia = document.getElementById('materia').value;
    const curso = document.getElementById('curso').value;
    const division = document.getElementById('division').value;
    const turno = document.getElementById('turno').value;
    const horas = document.getElementById('horas').value;
    const caracter = document.getElementById('caracter').value;
    const horarios = obtenerHorariosSeleccionados();
    const traslado = document.querySelector('input[name="traslado"]:checked').value;
    
    if (!colegio) {
        mostrarNotificacion('Ingrese el nombre del colegio', 'warning');
        return;
    }
    
    if (horarios.length === 0) {
        mostrarNotificacion('Agregue al menos un horario', 'warning');
        return;
    }
    
    const nuevoCurso = {
        id: Date.now(),
        colegio,
        materia,
        curso: curso,
        division: division,
        turno,
        horas: parseInt(horas),
        caracter,
        horarios,
        traslado
    };
    
    cursos.push(nuevoCurso);
    actualizarTablaCursos();
    guardarEnLocalStorage();
    
    document.getElementById('horariosContainer').innerHTML = '';
    document.getElementById('resumenHorarios').innerHTML = '<span class="text-muted">No hay horarios agregados</span>';
    contadorHorarios = 0;
    agregarHorario();
    
    mostrarNotificacion(`Curso agregado: ${curso} ${division} - ${materia}`, 'success');
}

function actualizarTablaCursos() {
    const tabla = document.getElementById('tablaCursos');
    tabla.innerHTML = '';
    
    if (cursos.length === 0) {
        const filaVacia = document.createElement('tr');
        filaVacia.innerHTML = `
            <td colspan="7" class="text-center text-muted py-4">
                <i class="fas fa-book-open me-2"></i>No hay cursos registrados
            </td>
        `;
        tabla.appendChild(filaVacia);
        return;
    }
    
    cursos.forEach(curso => {
        const diasResumen = {};
        curso.horarios.forEach(h => {
            if (!diasResumen[h.dia]) {
                diasResumen[h.dia] = [];
            }
            diasResumen[h.dia].push(h.hora);
        });
        
        let diasTexto = '';
        Object.keys(diasResumen).sort().forEach(dia => {
            const textoDia = diasSemana.find(d => d.valor === dia)?.texto || dia;
            diasTexto += `<div class="small">${textoDia}: ${diasResumen[dia].join(', ')}</div>`;
        });
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${curso.colegio}</td>
            <td>
                <strong>${curso.curso} ${curso.division}</strong><br>
                <small class="text-muted">${curso.materia}</small>
            </td>
            <td>${curso.turno}</td>
            <td>${curso.horas} hs</td>
            <td>${diasTexto}</td>
            <td><span class="badge bg-secondary">${curso.caracter}</span></td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="eliminarCurso(${curso.id})" title="Eliminar curso">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

function eliminarCurso(id) {
    if (!confirm('¿Está seguro de eliminar este curso?')) return;
    
    cursos = cursos.filter(curso => curso.id !== id);
    actualizarTablaCursos();
    guardarEnLocalStorage();
    mostrarNotificacion('Curso eliminado', 'info');
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacionesAnteriores = document.querySelectorAll('.notificacion-flotante');
    notificacionesAnteriores.forEach(n => n.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-flotante alert alert-${tipo} alert-dismissible fade show`;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border-radius: 8px;
        animation: slideIn 0.3s ease-out;
    `;
    
    const iconos = {
        'success': 'fa-check-circle',
        'danger': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    notificacion.innerHTML = `
        <div class="d-flex align-items-start">
            <i class="fas ${iconos[tipo] || 'fa-info-circle'} fa-lg me-3 mt-1"></i>
            <div class="flex-grow-1">
                <div style="font-size: 0.95rem;">${mensaje}</div>
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.classList.add('fade');
            setTimeout(() => notificacion.remove(), 300);
        }
    }, 5000);
}

function agregarEstilosNotificaciones() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notificacion-flotante {
            transition: all 0.3s ease;
        }
        
        .notificacion-flotante.fade {
            opacity: 0;
            transform: translateX(100%);
        }
    `;
    document.head.appendChild(estilo);
}

function calcularTotalHoras() {
    return cursos.reduce((total, curso) => total + curso.horas, 0);
}

function obtenerHorariosPorDia(horarios) {
    const horariosPorDia = {
        LUNES: [],
        MARTES: [],
        MIÉRCOLES: [],
        JUEVES: [],
        VIERNES: []
    };
    
    horarios.forEach(h => {
        if (horariosPorDia[h.dia]) {
            horariosPorDia[h.dia].push(h.hora);
        }
    });
    
    Object.keys(horariosPorDia).forEach(dia => {
        horariosPorDia[dia].sort((a, b) => {
            const horaA = parseInt(a.split('-')[0].replace(':', ''));
            const horaB = parseInt(b.split('-')[0].replace(':', ''));
            return horaA - horaB;
        });
    });
    
    return horariosPorDia;
}

function convertirNombreDia(dia) {
    const mapaDias = {
        'LUNES': 'Lunes',
        'MARTES': 'Martes',
        'MIÉRCOLES': 'Miércoles',
        'JUEVES': 'Jueves',
        'VIERNES': 'Viernes'
    };
    return mapaDias[dia] || dia;
}

function generarMatrizHorarios() {
    const matriz = {
        LUNES: {},
        MARTES: {},
        MIÉRCOLES: {},
        JUEVES: {},
        VIERNES: {}
    };
    
    const todosHorarios = [
        '07:45-08:25', '08:25-09:05', '09:15-09:55', '09:55-10:35',
        '10:45-11:25', '11:25-12:05', '12:05-12:45',
        '14:00-14:40', '14:40-15:20', '15:30-16:10',
        '16:10-16:50', '17:00-17:40', '17:40-18:20', '18:20-19:00'
    ];
    
    Object.keys(matriz).forEach(dia => {
        todosHorarios.forEach(hora => {
            matriz[dia][hora] = [];
        });
    });
    
    cursos.forEach(curso => {
        curso.horarios.forEach(horario => {
            const dia = horario.dia;
            const hora = horario.hora;
            
            if (matriz[dia] && matriz[dia][hora]) {
                matriz[dia][hora].push({
                    curso: `${curso.curso} ${curso.division}`,
                    materia: curso.materia,
                    colegio: curso.colegio,
                    turno: curso.turno
                });
            }
        });
    });
    
    return matriz;
}

// ============================================
// GENERACIÓN DE DECLARACIÓN JURADA (PDF)
// ============================================

function generarDeclaracionJurada() {
    if (!datosDocente.nombre) {
        mostrarNotificacion('Complete primero los datos del docente', 'warning');
        return;
    }
    
    if (cursos.length === 0) {
        mostrarNotificacion('Agregue al menos un curso', 'warning');
        return;
    }
    
    mostrarNotificacion('Generando Declaración Jurada...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    const marginLeft = 15;
    let yPosition = 20;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("B -- DECLARACIÓN JURADA DE EMPLEOS PÚBLICOS Y PRIVADOS", 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const declaracionText = "Declaro bajo juramento que todos los datos consignados a continuación son veraces y exactos y que no incurro en superposición horaria en mi desempeño. Me notifico que cualquier falsedad, ocultamiento y omisión dará motivo a grave sanción y que estoy obligado/a a denunciar cualquier modificación dentro de las 48 (Cuarenta y ocho) horas de producida. Toda prestación de servicios en contravención a las normas legales vigentes implicará la pérdida al derecho a la remuneración de los días trabajados.";
    
    const lines = doc.splitTextToSize(declaracionText, 260);
    doc.text(lines, marginLeft, yPosition);
    yPosition += 20;
    
    doc.setFont("helvetica", "bold");
    doc.text("CÓDIGO PENAL (Art. 239)", marginLeft, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    const codigoText = '"Será reprimido con reclusión o prisión de uno a seis años al que insertare o hiciere insertar en un Instrumento Público declaraciones falsas concerniente a un hecho que el instrumento deba probar y pueda resultar perjudicado"';
    const codigoLines = doc.splitTextToSize(codigoText, 260);
    doc.text(codigoLines, marginLeft, yPosition);
    yPosition += 15;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft, yPosition, 260, 25);
    
    yPosition += 7;
    doc.setFontSize(9);
    doc.text(`Presentado en: Ministerio de Educación     Apellido y Nombre: ${datosDocente.nombre}     DNI N°: ${datosDocente.dni}`, marginLeft + 5, yPosition);
    yPosition += 5;
    doc.text(`CUIL N°: ${datosDocente.cuil}     Domicilio: ${datosDocente.domicilio}     Teléfono: ${datosDocente.telefono}`, marginLeft + 5, yPosition);
    yPosition += 5;
    doc.text(`Título: ${datosDocente.titulo}`, marginLeft + 5, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CARGOS Y/O FUNCIONES PÚBLICAS QUE DESEMPEÑO", marginLeft, yPosition);
    yPosition += 10;
    
    const tableData = [];
    
    cursos.forEach(curso => {
        const horariosPorDia = obtenerHorariosPorDia(curso.horarios);
        const cargaHoraria = (curso.horas * 40) / 60;
        const detalleEstablecimiento = 
            `${curso.colegio}\n${curso.curso} ${curso.division}\nTurno: ${curso.turno}\n${curso.materia}\n${curso.horas} hs. Cátedra`;
        
        tableData.push([
            "MINISTERIO DE EDUCACIÓN, CULTURA Y TECNOLOGÍA - D.G.E. SECUNDARIA",
            detalleEstablecimiento,
            curso.caracter,
            horariosPorDia.LUNES.join('\n'),
            horariosPorDia.MARTES.join('\n'),
            horariosPorDia.MIÉRCOLES.join('\n'),
            horariosPorDia.JUEVES.join('\n'),
            horariosPorDia.VIERNES.join('\n'),
            `${cargaHoraria.toFixed(2)}`,
            curso.traslado,
            ""
        ]);
    });
    
    const filasNecesarias = Math.max(5, cursos.length);
    for (let i = cursos.length; i < filasNecesarias; i++) {
        tableData.push([
            "MINISTERIO DE EDUCACIÓN, CULTURA Y TECNOLOGÍA - D.G.E. SECUNDARIA",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ]);
    }
    
    doc.autoTable({
        startY: yPosition,
        head: [[
            {content: 'MINISTERIO Y/O REPARTICIÓN', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'ESTABLECIMIENTO Y DETALLE\nCARGO/FUNCIÓN/PASIVIDAD', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'CARÁCTER\nDEL CARGO', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'LUNES', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'MARTES', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'MIÉRCOLES', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'JUEVES', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'VIERNES', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'CARGA HORARIA\nEN RELOJ', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'SOLICITA\nTRASLADO', styles: {fontStyle: 'bold', fontSize: 7}},
            {content: 'FIRMA DEL\nDIRECTOR', styles: {fontStyle: 'bold', fontSize: 7}}
        ]],
        body: tableData,
        margin: {left: marginLeft},
        styles: {fontSize: 7, cellPadding: 1.5, lineWidth: 0.1, halign: 'center'},
        headStyles: {fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 7, lineWidth: 0.1},
        columnStyles: {
            0: {cellWidth: 35, fontSize: 6, halign: 'center'},
            1: {cellWidth: 45, fontSize: 6, halign: 'left'},
            2: {cellWidth: 18, fontSize: 7, halign: 'center'},
            3: {cellWidth: 18, fontSize: 6, halign: 'center'},
            4: {cellWidth: 18, fontSize: 6, halign: 'center'},
            5: {cellWidth: 20, fontSize: 6, halign: 'center'},
            6: {cellWidth: 18, fontSize: 6, halign: 'center'},
            7: {cellWidth: 18, fontSize: 6, halign: 'center'},
            8: {cellWidth: 20, fontSize: 7, halign: 'center'},
            9: {cellWidth: 18, fontSize: 7, halign: 'center'},
            10: {cellWidth: 25, fontSize: 6, halign: 'center'}
        },
        didDrawPage: function(data) {
            const finalY = data.cursor ? data.cursor.y : yPosition + 100;
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            let lineY = finalY + 15;
            for (let i = marginLeft; i < 260; i += 2) {
                doc.text('.', i, lineY);
            }
            
            doc.text('LUGAR', marginLeft, lineY + 5);
            doc.text('DÍA', marginLeft + 30, lineY + 5);
            doc.text('MES', marginLeft + 60, lineY + 5);
            doc.text('AÑO', marginLeft + 90, lineY + 5);
            doc.text('FIRMA DEL DECLARANTE:', marginLeft + 160, lineY + 5);
            
            lineY += 15;
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.rect(marginLeft, lineY, 260, 15);
            
            doc.setFont("helvetica", "bold");
            doc.text('A completar por la mesa de entradas', marginLeft + 5, lineY + 6);
            
            doc.setFont("helvetica", "normal");
            doc.text('Fecha de entrada', marginLeft + 5, lineY + 12);
            doc.text('Hora de Entrada', marginLeft + 80, lineY + 12);
            doc.text('Firma', marginLeft + 160, lineY + 12);
            
            lineY += 20;
            doc.setFontSize(8);
            doc.text('DGP. Art. 39° Dcto. 4118/97 (Circular N°140/98 DGP)', marginLeft, lineY);
            
            if (cursos.length < 5) {
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('* Trazar una línea diagonal sobre las filas en blanco', marginLeft, lineY + 10);
                doc.setTextColor(0, 0, 0);
            }
        }
    });
    
    doc.save(`Declaracion_Jurada_${datosDocente.nombre.replace(/\s+/g, '_')}.pdf`);
    mostrarNotificacion('Declaración Jurada generada', 'success');
}

// ============================================
// GENERACIÓN DE HORARIO ESCOLAR (PDF)
// ============================================

function generarHorarioEscolar() {
    if (!datosDocente.nombre) {
        mostrarNotificacion('Complete primero los datos del docente', 'warning');
        return;
    }
    
    if (cursos.length === 0) {
        mostrarNotificacion('Agregue al menos un curso', 'warning');
        return;
    }
    
    mostrarNotificacion('Generando Horario Escolar...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HORARIO ESCOLAR", 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`DOCENTE: ${datosDocente.nombre.toUpperCase()}`, 105, 35, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Período Lectivo: 2023`, 20, 45);
    doc.text(`Horas totales: ${calcularTotalHoras()} hs cátedra`, 150, 45);
    
    const horas = generarMatrizHorarios();
    const tableData = [];
    const bloquesHorarios = [
        { hora: '07:45-08:25', esMañana: true },
        { hora: '08:25-09:05', esMañana: true },
        { hora: '09:15-09:55', esMañana: true },
        { hora: '09:55-10:35', esMañana: true },
        { hora: '10:45-11:25', esMañana: true },
        { hora: '11:25-12:05', esMañana: true },
        { hora: '12:05-12:45', esMañana: true },
        { hora: '14:00-14:40', esMañana: false },
        { hora: '14:40-15:20', esMañana: false },
        { hora: '15:30-16:10', esMañana: false },
        { hora: '16:10-16:50', esMañana: false },
        { hora: '17:00-17:40', esMañana: false },
        { hora: '17:40-18:20', esMañana: false },
        { hora: '18:20-19:00', esMañana: false }
    ];
    
    let ultimoTurno = null;
    
    bloquesHorarios.forEach((bloque) => {
        const hora = bloque.hora;
        const esMañana = bloque.esMañana;
        
        if (ultimoTurno !== esMañana && ultimoTurno !== null) {
            tableData.push(['---', '---', '---', '---', '---', '---']);
        }
        ultimoTurno = esMañana;
        
        const fila = [hora];
        ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'].forEach(dia => {
            const cursosEnEsteHorario = horas[dia] && horas[dia][hora] ? horas[dia][hora] : [];
            
            if (cursosEnEsteHorario.length > 0) {
                let texto = '';
                cursosEnEsteHorario.forEach(cursoInfo => {
                    if (texto !== '') texto += '\n\n';
                    texto += `${cursoInfo.colegio.toUpperCase()}\n${cursoInfo.materia} - ${cursoInfo.curso}`;
                });
                fila.push(texto);
            } else {
                fila.push('');
            }
        });
        
        tableData.push(fila);
    });
    
    const headers = [['HORA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']];
    
    doc.autoTable({
        startY: 55,
        head: headers,
        body: tableData,
        styles: { 
            fontSize: 8, 
            cellPadding: 2, 
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
        },
        headStyles: { 
            fillColor: [66, 139, 202], 
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
            0: { cellWidth: 25, fontSize: 8, fontStyle: 'bold', halign: 'center' },
            1: { cellWidth: 33, fontSize: 7, halign: 'center' },
            2: { cellWidth: 33, fontSize: 7, halign: 'center' },
            3: { cellWidth: 33, fontSize: 7, halign: 'center' },
            4: { cellWidth: 33, fontSize: 7, halign: 'center' },
            5: { cellWidth: 33, fontSize: 7, halign: 'center' }
        },
        didParseCell: function(data) {
            if (data.cell.raw === '---') {
                data.cell.styles.fillColor = [200, 200, 200];
                data.cell.styles.textColor = [100, 100, 100];
                data.cell.styles.fontStyle = 'bolditalic';
                data.cell.styles.lineWidth = 0.5;
            }
            
            if (data.cell.raw && typeof data.cell.raw === 'string' && data.cell.raw.includes('\n')) {
                data.cell.styles.cellPadding = 1.5;
                data.cell.styles.fontSize = 6;
            }
        },
        didDrawCell: function(data) {
            if (data.cell.raw === '---' && data.column.index === 0) {
                data.doc.setDrawColor(0, 0, 0);
                data.doc.setLineWidth(0.8);
                data.doc.line(
                    data.cell.x,
                    data.cell.y + data.cell.height / 2,
                    data.cell.x + data.table.width,
                    data.cell.y + data.cell.height / 2
                );
                
                data.doc.setFontSize(6);
                data.doc.setTextColor(100, 100, 100);
                data.doc.text('CAMBIO DE TURNO', 
                    data.cell.x + data.table.width / 2,
                    data.cell.y + data.cell.height / 2 - 2,
                    { align: 'center' }
                );
            }
            
            if (data.cell.raw && typeof data.cell.raw === 'string' && 
                data.cell.raw.includes('\n') && data.cell.raw !== '---') {
                
                const lines = data.cell.raw.split('\n');
                let yPos = data.cell.y + 3;
                
                lines.forEach((line, index) => {
                    if (index === 0) {
                        data.doc.setFont("helvetica", "bold");
                        data.doc.setFontSize(6);
                        data.doc.text(line, 
                            data.cell.x + data.cell.width / 2,
                            yPos,
                            { align: 'center', maxWidth: data.cell.width - 4 }
                        );
                    } else if (index === 1) {
                        data.doc.setFont("helvetica", "normal");
                        data.doc.setFontSize(6);
                        data.doc.text(line, 
                            data.cell.x + data.cell.width / 2,
                            yPos,
                            { align: 'center', maxWidth: data.cell.width - 4 }
                        );
                    } else if (line === '') {
                        // No hacer nada
                    } else {
                        data.doc.setFontSize(5);
                        data.doc.text(line, 
                            data.cell.x + data.cell.width / 2,
                            yPos,
                            { align: 'center', maxWidth: data.cell.width - 4 }
                        );
                    }
                    
                    yPos += index === 0 ? 3.5 : 3;
                });
                
                data.doc.setFont("helvetica", "normal");
                data.doc.setFontSize(8);
            }
        }
    });
    
    const finalY = doc.lastAutoTable.finalY || 150;
    if (finalY < 250) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("LEYENDA DE CURSOS:", 20, finalY + 15);
        
        doc.setFont("helvetica", "normal");
        let yPos = finalY + 22;
        
        const cursosPorColegio = {};
        cursos.forEach(curso => {
            if (!cursosPorColegio[curso.colegio]) {
                cursosPorColegio[curso.colegio] = [];
            }
            cursosPorColegio[curso.colegio].push(curso);
        });
        
        Object.keys(cursosPorColegio).forEach(colegio => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text(colegio.toUpperCase(), 25, yPos);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            cursosPorColegio[colegio].forEach(curso => {
                yPos += 5;
                const cursoTexto = `${curso.curso} ${curso.division} - ${curso.materia} - ${curso.turno}`;
                doc.text(cursoTexto, 30, yPos);
                
                doc.setFontSize(7);
                const horariosTexto = curso.horarios.map(h => `${convertirNombreDia(h.dia)}: ${h.hora}`).join(' | ');
                doc.text(horariosTexto, 35, yPos + 3.5);
                yPos += 7;
            });
            
            yPos += 5;
        });
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, 195, 285);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 285);
    }
    
    doc.save(`Horario_Escolar_${datosDocente.nombre.replace(/\s+/g, '_')}.pdf`);
    mostrarNotificacion('Horario Escolar generado', 'success');
}

// ============================================
// FUNCIONES PARA OTRAS PLANILLAS
// ============================================

function generarPlanillaAsistencia() {
    if (!datosDocente.nombre) {
        mostrarNotificacion('Complete primero los datos del docente', 'warning');
        return;
    }
    
    mostrarNotificacion('Generando Planilla de Asistencia...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PLANILLA DE ASISTENCIA", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Docente: ${datosDocente.nombre}`, 20, 35);
    if (cursos.length > 0) {
        doc.text(`Materia: ${cursos[0].materia}`, 20, 42);
        doc.text(`Curso: ${cursos[0].curso} ${cursos[0].division}`, 20, 49);
        doc.text(`Colegio: ${cursos[0].colegio}`, 20, 56);
    }
    doc.text(`Mes: ________________`, 150, 35);
    doc.text(`Año: 2023`, 150, 42);
    
    const estudiantes = [
        ['N°', 'Apellido y Nombre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 'T', 'F', 'J']
    ];
    
    for (let i = 1; i <= 30; i++) {
        estudiantes.push([i.toString(), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }
    
    estudiantes.push(['', 'TOTALES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    
    doc.autoTable({
        startY: 70,
        head: [estudiantes[0]],
        body: estudiantes.slice(1, 15),
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontSize: 6 },
        pageBreak: 'auto'
    });
    
    doc.setFontSize(10);
    doc.text("Leyenda: P = Presente, A = Ausente, T = Total Presentes, F = Faltas, J = Justificadas", 20, 280);
    
    doc.save(`Planilla_Asistencia_${datosDocente.nombre.replace(/\s+/g, '_')}.pdf`);
    mostrarNotificacion('Planilla de Asistencia generada', 'success');
}

function generarPlanillaCalificaciones() {
    if (!datosDocente.nombre) {
        mostrarNotificacion('Complete primero los datos del docente', 'warning');
        return;
    }
    
    mostrarNotificacion('Generando Planilla de Calificaciones...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PLANILLA DE CALIFICACIONES", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Docente: ${datosDocente.nombre}`, 20, 35);
    if (cursos.length > 0) {
        doc.text(`Materia: ${cursos[0].materia}`, 20, 42);
    } else {
        doc.text(`Materia: ________________`, 20, 42);
    }
    doc.text(`Curso: ________________`, 20, 49);
    doc.text(`Trimestre: __________`, 150, 35);
    doc.text(`Año: 2023`, 150, 42);
    
    const calificaciones = [
        ['N°', 'Apellido y Nombre', 'Eval. 1', 'Eval. 2', 'Eval. 3', 'Eval. 4', 'Prom. Trab. Pract.', 'Prom. Trim.', 'Recup.', 'Calif. Final']
    ];
    
    for (let i = 1; i <= 30; i++) {
        calificaciones.push([i.toString(), '', '', '', '', '', '', '', '', '']);
    }
    
    calificaciones.push(['', 'PROMEDIO GENERAL', '', '', '', '', '', '', '', '']);
    
    doc.autoTable({
        startY: 60,
        head: [calificaciones[0]],
        body: calificaciones.slice(1, 12),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.setFontSize(10);
    doc.text("Firma del Docente: _____________________________", 20, 260);
    doc.text("Firma del Director: _____________________________", 120, 260);
    
    doc.save(`Planilla_Calificaciones_${datosDocente.nombre.replace(/\s+/g, '_')}.pdf`);
    mostrarNotificacion('Planilla de Calificaciones generada', 'success');
}

function generarPlanillaCalificacionFinal() {
    if (!datosDocente.nombre) {
        mostrarNotificacion('Complete primero los datos del docente', 'warning');
        return;
    }
    
    mostrarNotificacion('Generando Planilla de Calificación Final...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PLANILLA DE CALIFICACIÓN FINAL", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Docente: ${datosDocente.nombre}`, 20, 35);
    if (cursos.length > 0) {
        doc.text(`Materia: ${cursos[0].materia}`, 20, 42);
    } else {
        doc.text(`Materia: ________________`, 20, 42);
    }
    doc.text(`Curso: ________________`, 20, 49);
    doc.text(`Año: 2023`, 150, 35);
    doc.text(`Turno: ______________`, 150, 42);
    
    const finales = [
        ['N°', 'Apellido y Nombre', '1er Trim.', '2do Trim.', '3er Trim.', 'Prom. Anual', 'Diciembre', 'Febrero', 'Marzo', 'Situación']
    ];
    
    for (let i = 1; i <= 30; i++) {
        finales.push([i.toString(), '', '', '', '', '', '', '', '', '']);
    }
    
    finales.push(['', 'TOTALES', '', '', '', '', '', '', '', '']);
    
    doc.autoTable({
        startY: 60,
        head: [finales[0]],
        body: finales.slice(1, 12),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        pageBreak: 'auto'
    });
    
    doc.setFontSize(10);
    doc.text("Situaciones: Promovido, Aprobado, Regular, Libre, Ausente", 20, 280);
    
    doc.save(`Planilla_Calificacion_Final_${datosDocente.nombre.replace(/\s+/g, '_')}.pdf`);
    mostrarNotificacion('Planilla de Calificación Final generada', 'success');
}

function generarPlanillaEstudiantes() {
    if (!datosDocente.nombre) {
        mostrarNotificacion('Complete primero los datos del docente', 'warning');
        return;
    }
    
    mostrarNotificacion('Generando Planilla de Estudiantes...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PLANILLA DE ESTUDIANTES", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Docente: ${datosDocente.nombre}`, 20, 35);
    if (cursos.length > 0) {
        doc.text(`Materia: ${cursos[0].materia}`, 20, 42);
        doc.text(`Curso: ${cursos[0].curso} ${cursos[0].division}`, 20, 49);
    } else {
        doc.text(`Materia: ________________`, 20, 42);
        doc.text(`Curso: ________________`, 20, 49);
    }
    doc.text(`Año: 2023`, 150, 35);
    doc.text(`División: __________`, 150, 42);
    
    const estudiantes = [
        ['N°', 'Apellido y Nombre', 'DNI', 'Fecha Nac.', 'Domicilio', 'Teléfono', 'Email', 'Observaciones']
    ];
    
    for (let i = 1; i <= 40; i++) {
        estudiantes.push([i.toString(), '', '', '', '', '', '', '']);
    }
    
    doc.autoTable({
        startY: 60,
        head: [estudiantes[0]],
        body: estudiantes.slice(1, 15),
        styles: { fontSize: 6, cellPadding: 1.5 },
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontSize: 6 },
        pageBreak: 'auto'
    });
    
    doc.setFontSize(10);
    doc.text(`Total de estudiantes: __________`, 20, 280);
    doc.text(`Fecha de elaboración: ${new Date().toLocaleDateString()}`, 150, 280);
    
    doc.save(`Planilla_Estudiantes_${datosDocente.nombre.replace(/\s+/g, '_')}.pdf`);
    mostrarNotificacion('Planilla de Estudiantes generada', 'success');
}

// ============================================
// SISTEMA DE EXPORTACIÓN E IMPORTACIÓN
// ============================================

function exportarDatos() {
    if (cursos.length === 0 && !datosDocente.nombre) {
        mostrarNotificacion('No hay datos para exportar', 'warning');
        return;
    }
    
    const datos = {
        docente: datosDocente,
        cursos: cursos,
        fechaExportacion: new Date().toISOString(),
        version: "2.0",
        totalCursos: cursos.length,
        totalHoras: calcularTotalHoras()
    };
    
    const nombreArchivo = `backup_docente_${datosDocente.nombre?.replace(/\s+/g, '_') || 'datos'}_${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarNotificacion(`Datos exportados: ${nombreArchivo}`, 'success');
}

function importarDatos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const datos = JSON.parse(event.target.result);
                
                if (!datos.docente && !datos.cursos) {
                    throw new Error('Archivo no válido');
                }
                
                const mensaje = datos.docente?.nombre 
                    ? `¿Importar datos de ${datos.docente.nombre}?\n${datos.cursos?.length || 0} cursos encontrados.`
                    : '¿Importar datos?';
                
                if (!confirm(mensaje + '\n\nLos datos actuales serán reemplazados.')) {
                    return;
                }
                
                datosDocente = datos.docente || datosDocente;
                cursos = datos.cursos || [];
                
                if (datosDocente.nombre) {
                    document.getElementById('nombre').value = datosDocente.nombre;
                    document.getElementById('dni').value = datosDocente.dni;
                    document.getElementById('cuil').value = datosDocente.cuil;
                    document.getElementById('telefono').value = datosDocente.telefono;
                    document.getElementById('domicilio').value = datosDocente.domicilio;
                    document.getElementById('titulo').value = datosDocente.titulo;
                }
                
                actualizarTablaCursos();
                guardarEnLocalStorage();
                
                mostrarNotificacion(`Datos importados: ${cursos.length} cursos cargados`, 'success');
                
            } catch (error) {
                mostrarNotificacion(`Error al importar: ${error.message}`, 'danger');
            }
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

function eliminarTodosLosDatos() {
    if (!confirm('¿ESTÁ SEGURO?\n\nSe eliminarán TODOS los datos:\n- Datos del docente\n- Todos los cursos\n- Historial guardado\n\nEsta acción NO se puede deshacer.')) {
        return;
    }
    
    localStorage.removeItem('planillasDocente');
    datosDocente = {
        nombre: "",
        dni: "",
        cuil: "",
        telefono: "",
        domicilio: "",
        titulo: ""
    };
    cursos = [];
    
    document.getElementById('nombre').value = '';
    document.getElementById('dni').value = '';
    document.getElementById('cuil').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('domicilio').value = '';
    document.getElementById('titulo').value = 'Profesor/a del Tercer Ciclo de la EGB3 y de la Educación Polimodal en Lengua';
    
    document.getElementById('tablaCursos').innerHTML = '';
    document.getElementById('horariosContainer').innerHTML = '';
    document.getElementById('resumenHorarios').innerHTML = '<span class="text-muted">No hay horarios agregados</span>';
    contadorHorarios = 0;
    agregarHorario();
    
    mostrarNotificacion('Todos los datos han sido eliminados', 'danger');
}

// ============================================
// SECCIÓN: TRANSFERIR DATOS ENTRE COMPUTADORAS
// ============================================

function agregarSeccionTransferencia() {
    const footer = document.querySelector('.footer');
    const container = document.querySelector('.container');
    
    const seccionTransferencia = document.createElement('div');
    seccionTransferencia.className = 'row mt-5 mb-4';
    seccionTransferencia.innerHTML = `
        <div class="col-12">
            <div class="card border-primary">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-exchange-alt me-2"></i>Transferir Datos entre Computadoras</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h6><i class="fas fa-info-circle me-2"></i>¿Cómo transferir datos a otra computadora?</h6>
                            <p>Los datos se guardan automáticamente en ESTA computadora. Para usarlos en otra PC:</p>
                            <ol>
                                <li><strong>En ESTA computadora:</strong> Haz clic en "Exportar Datos"</li>
                                <li><strong>Guarda el archivo .json</strong> en un pendrive o envíalo por email</li>
                                <li><strong>En la OTRA computadora:</strong> Abre el sistema y haz clic en "Importar Datos"</li>
                                <li><strong>Selecciona el archivo .json</strong> y ¡listo! Los datos estarán disponibles</li>
                            </ol>
                            <div class="alert alert-info mt-3 mb-0">
                                <i class="fas fa-save me-2"></i>
                                <strong>Datos actuales:</strong> ${datosDocente.nombre ? datosDocente.nombre + ' - ' : ''}${cursos.length} curso(s) registrado(s) - ${calcularTotalHoras()} horas cátedra
                            </div>
                        </div>
                        <div class="col-md-4">
                            <h6><i class="fas fa-cogs me-2"></i>Acciones</h6>
                            <div class="d-grid gap-2">
                                <button class="btn btn-success" onclick="exportarDatos()">
                                    <i class="fas fa-file-export me-2"></i>Exportar Datos (.json)
                                </button>
                                <button class="btn btn-info" onclick="importarDatos()">
                                    <i class="fas fa-file-import me-2"></i>Importar Datos (.json)
                                </button>
                                <button class="btn btn-outline-danger" onclick="eliminarTodosLosDatos()">
                                    <i class="fas fa-trash-alt me-2"></i>Eliminar Todos los Datos
                                </button>
                            </div>
                            <div class="mt-3 small text-muted">
                                <i class="fas fa-history me-1"></i>
                                Último guardado: ${new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (footer && container) {
        container.insertBefore(seccionTransferencia, footer);
    } else {
        document.body.appendChild(seccionTransferencia);
    }
}

// ============================================
// INICIALIZACIÓN DEL SISTEMA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Planillas Docentes - Inicializando...');
    
    agregarEstilosNotificaciones();
    cargarDesdeLocalStorage();
    agregarHorario();
    agregarSeccionTransferencia();
    
    const camposDocente = ['nombre', 'dni', 'cuil', 'telefono', 'domicilio', 'titulo'];
    camposDocente.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('change', function() {
                guardarEnLocalStorage();
            });
        }
    });
    
    setTimeout(() => {
        if (datosDocente.nombre || cursos.length > 0) {
            mostrarNotificacion(
                `Sistema listo. ${cursos.length} curso(s) registrado(s)`,
                'info'
            );
        }
    }, 1500);
    
    console.log('Sistema inicializado correctamente');
});