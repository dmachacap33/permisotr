import puppeteer from 'puppeteer';
import type { Permit } from '@shared/schema';

export async function generatePermitPDF(permit: Permit): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Create HTML content for the permit
    const htmlContent = generatePermitHTML(permit);
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0' 
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

function generatePermitHTML(permit: Permit): string {
  const permitTypeMap = {
    excavation: 'Excavación FS.019',
    hot: 'Trabajo en Caliente FS.020',
    cold: 'Trabajo en Frío FS.021'
  };

  const permitTypeName = permitTypeMap[permit.type as keyof typeof permitTypeMap] || permit.type;
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Permiso de Trabajo - ${permit.permitNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .header h2 {
            font-size: 14px;
            color: #666;
        }
        
        .permit-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-section {
            border: 1px solid #ddd;
            padding: 10px;
        }
        
        .info-section h3 {
            background-color: #f5f5f5;
            padding: 5px;
            margin: -10px -10px 10px -10px;
            font-size: 13px;
            font-weight: bold;
        }
        
        .field {
            margin-bottom: 8px;
        }
        
        .field-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        
        .field-value {
            display: inline-block;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-approved {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-draft {
            background-color: #e2e3e5;
            color: #383d41;
        }
        
        .checklist-section {
            margin-top: 20px;
            page-break-inside: avoid;
        }
        
        .checklist-section h3 {
            background-color: #007bff;
            color: white;
            padding: 8px;
            margin-bottom: 10px;
        }
        
        .checklist-item {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            border-bottom: 1px solid #eee;
        }
        
        .ppe-section {
            margin-top: 20px;
        }
        
        .ppe-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .ppe-item {
            padding: 3px 0;
        }
        
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #333;
            margin-right: 5px;
            vertical-align: middle;
        }
        
        .checkbox.checked {
            background-color: #000;
        }
        
        .signatures {
            margin-top: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        
        .signature-box {
            border: 1px solid #333;
            height: 80px;
            padding: 10px;
            text-align: center;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        @media print {
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>YACIMIENTOS PETROLÍFEROS FISCALES BOLIVIANOS</h1>
        <h2>PERMISO DE TRABAJO - ${permitTypeName}</h2>
        <p><strong>Número:</strong> ${permit.permitNumber}</p>
    </div>

    <div class="permit-info">
        <div class="info-section">
            <h3>Información Básica</h3>
            <div class="field">
                <span class="field-label">Ejecutor:</span>
                <span class="field-value">${permit.executorCompany || 'N/A'}</span>
            </div>
            <div class="field">
                <span class="field-label">Estación/Ducto:</span>
                <span class="field-value">${permit.stationDuct || 'N/A'}</span>
            </div>
            <div class="field">
                <span class="field-label">Área/Sitio:</span>
                <span class="field-value">${permit.areaSite || 'N/A'}</span>
            </div>
            <div class="field">
                <span class="field-label">Orden de Trabajo:</span>
                <span class="field-value">${permit.workOrderNumber || 'N/A'}</span>
            </div>
        </div>
        
        <div class="info-section">
            <h3>Detalles del Trabajo</h3>
            <div class="field">
                <span class="field-label">Descripción:</span>
                <span class="field-value">${permit.workDescription || 'N/A'}</span>
            </div>
            <div class="field">
                <span class="field-label">Fecha:</span>
                <span class="field-value">${permit.workDate ? new Date(permit.workDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="field">
                <span class="field-label">Válido de:</span>
                <span class="field-value">${permit.validFrom || 'N/A'} a ${permit.validTo || 'N/A'}</span>
            </div>
            <div class="field">
                <span class="field-label">Estado:</span>
                <span class="status-badge status-${permit.status}">${permit.status?.toUpperCase()}</span>
            </div>
        </div>
    </div>

    ${permit.ppeRequirements && (permit.ppeRequirements as any[]).length > 0 ? `
    <div class="ppe-section">
        <h3>Equipo de Protección Personal Requerido</h3>
        <div class="ppe-grid">
            ${(permit.ppeRequirements as string[]).map(item => `
                <div class="ppe-item">
                    <span class="checkbox checked"></span>
                    ${item}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${permit.checklistResponses ? `
    <div class="checklist-section">
        <h3>Lista de Verificación de Seguridad</h3>
        ${Object.entries(permit.checklistResponses as Record<string, string>).map(([question, answer]) => `
            <div class="checklist-item">
                <span>${question}</span>
                <span><strong>${answer.toUpperCase()}</strong></span>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${permit.specialInstructions ? `
    <div class="info-section" style="margin-top: 20px;">
        <h3>Instrucciones Especiales</h3>
        <p>${permit.specialInstructions}</p>
    </div>
    ` : ''}

    <div class="signatures">
        <div class="signature-box">
            <div class="signature-title">SOLICITANTE</div>
            <div style="margin-top: 40px;">
                <div>_____________________</div>
                <div>Firma y Fecha</div>
            </div>
        </div>
        
        <div class="signature-box">
            <div class="signature-title">VALIDADOR</div>
            <div style="margin-top: 40px;">
                <div>_____________________</div>
                <div>Firma y Fecha</div>
            </div>
        </div>
        
        <div class="signature-box">
            <div class="signature-title">SUPERVISOR</div>
            <div style="margin-top: 40px;">
                <div>_____________________</div>
                <div>Firma y Fecha</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
        <p>YPFB - Yacimientos Petrolíferos Fiscales Bolivianos</p>
        <p>Sistema de Gestión de Permisos de Trabajo</p>
    </div>
</body>
</html>
  `;
}