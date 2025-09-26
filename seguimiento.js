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

function calcularTotal() {
  const total =
    parseInt(presentes.value || 0) +
    parseInt(licencia.value || 0) +
    parseInt(faltas.value || 0);
  resultado.textContent = "Total Estudiantes: " + total;
  return total;
}

// Actualiza en tiempo real
[presentes, licencia, faltas].forEach(input => {
  input.addEventListener('input', calcularTotal);
});

// Registrar datos
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const total = calcularTotal();

  // Guardar en Google Sheets
  const data = {
    dia: dia.value,
    mes: mes.value,
    fecha: fechaNum.value,
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
  .then(data => console.log("✅ Datos guardados en Google Sheets:", data))
  .catch(error => console.error("❌ Error al guardar los datos:", error));

  // Mostrar modal de éxito
  modal.style.display = "block";
});

// Cerrar modal
btnCerrar.addEventListener('click', () => {
  modal.style.display = "none";
});

// Descargar PDF desde modal
btnDescargar.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("📊 Reporte de Seguimiento de Estudiantes", 14, 20);
  doc.setFontSize(12);
  doc.text(`📅 Día: ${dia.value}`, 14, 30);
  doc.text(`📆 Fecha: ${fechaNum.value} de ${mes.value}`, 14, 36);

  doc.autoTable({
    startY: 50,
    head: [['Presentes', 'Con licencia', 'Faltas', 'Total']],
    body: [
      [presentes.value, licencia.value, faltas.value, calcularTotal()]
    ],
    theme: 'grid'
  });

  doc.save("seguimiento_estudiantes.pdf");
});

