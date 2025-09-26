const urlSheetBest = "https://api.sheetbest.com/sheets/f2d3ddfd-5e35-4781-9eb1-80c1aca77502";

const form = document.getElementById('seguimientoForm');
const presentes = document.getElementById('presentes');
const licencia = document.getElementById('licencia');
const faltas = document.getElementById('faltas');
const resultado = document.getElementById('resultado');
const dia = document.getElementById('dia');
const mes = document.getElementById('mes');
const fechaNum = document.getElementById('fechaNum');

const modal = document.getElementById('modalExito');
const btnDescargar = document.getElementById('btnDescargar');
const btnCerrar = document.getElementById('btnCerrar');
const loading = document.getElementById('loading');

function calcularTotal() {
  const total =
    parseInt(presentes.value || 0) +
    parseInt(licencia.value || 0) +
    parseInt(faltas.value || 0);
  resultado.textContent = "Total Estudiantes: " + total;
  return total;
}

// Actualizar total en tiempo real
[presentes, licencia, faltas].forEach(input => {
  input.addEventListener('input', calcularTotal);
});

// Registrar datos
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const total = calcularTotal();

  loading.style.display = "flex";

  // Datos a enviar
  const data = {
    dia: dia.value,
    fecha: fechaNum.value,
    mes: mes.value,
    presentes: presentes.value,
    licencia: licencia.value,
    faltas: faltas.value,
    total: total
  };

  fetch(urlSheetBest, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    console.log("✅ Datos guardados:", data);
    loading.style.display = "none";
    modal.style.display = "flex";
  })
  .catch(error => {
    console.error("❌ Error al guardar:", error);
    loading.style.display = "none";
    alert("Ocurrió un error al guardar los datos.");
  });
});

// Cerrar modal
btnCerrar.addEventListener('click', () => {
  modal.style.display = "none";
});

// DESCARGAR PDF
btnDescargar.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Fecha de descarga
  const fecha = new Date();
  const fechaStr = `${fecha.getDate().toString().padStart(2,"0")}/${(fecha.getMonth()+1).toString().padStart(2,"0")}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2,"0")}:${fecha.getMinutes().toString().padStart(2,"0")}`;

  // Fuente Times para soportar caracteres especiales
  doc.setFont("times", "bold");
  doc.setFontSize(16);

  // Título centrado
  const titulo = "REPORTES DE SEGUIMIENTO DE ESTUDIANTES";
  const tituloLines = doc.splitTextToSize(titulo, pageWidth - 2 * margin);
  tituloLines.forEach(line => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 10;
  });

  y += 5;

  // Subtítulo con día y fecha
  doc.setFont("times", "normal");
  doc.setFontSize(14);
  const subtitulo = `Para el día ${dia.value}, ${fechaNum.value} de ${mes.value}`;
  const subLines = doc.splitTextToSize(subtitulo, pageWidth - 2 * margin);
  subLines.forEach(line => {
      doc.text(line, pageWidth / 2, y, { align: "center" });
      y += 10;
  });

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Tabla con los datos de asistencia
  doc.autoTable({
      startY: y,
      head: [['Presentes', 'Con licencia', 'Faltas', 'Total']],
      body: [
          [presentes.value, licencia.value, faltas.value, calcularTotal()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 115, 232], textColor: 255, halign: 'center' },
      bodyStyles: { halign: 'center' },
      styles: { font: 'times' }
  });

  // Ajustar y después de la tabla
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setLineWidth(0.3);
  doc.line(margin, finalY, pageWidth - margin, finalY);
  
  doc.setFont("times", "italic");
  doc.text(`Fecha y hora de descarga: ${fechaStr}`, pageWidth / 2, finalY + 10, { align: "center" });
  doc.text("Gracias por registrar el seguimiento de estudiantes.", pageWidth / 2, finalY + 20, { align: "center" });

  // Guardar PDF con nombre dinámico
  const filename = `seguimiento_${dia.value}_${fechaNum.value}_${mes.value}.pdf`;
  doc.save(filename);
});


