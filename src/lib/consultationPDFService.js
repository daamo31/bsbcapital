import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/customSupabaseClient';

class ConsultationPDFService {
  
  generateConsultationSummaryPDF(consultation, detailedData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Consultoría BSB Capital', margin, yPosition);
    
    yPosition += 20;
    
    // Información básica
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Información de la Consultoría', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const basicInfo = [
      `Tipo: ${consultation.consultation_type || 'N/A'}`,
      `Fecha programada: ${new Date(consultation.scheduled_at).toLocaleDateString('es-ES')}`,
      `Duración: ${consultation.duration_minutes} minutos`,
      `Estado: ${consultation.status || 'Programada'}`,
      `Cliente: ${consultation.client_name || detailedData.client_name || 'N/A'}`,
      `Email: ${consultation.client_email || detailedData.client_email || 'N/A'}`
    ];
    
    basicInfo.forEach(info => {
      doc.text(info, margin, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;

    // Datos personales del formulario detallado
    if (detailedData) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos Personales', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      if (detailedData.country) {
        doc.text(`País de residencia: ${detailedData.country}`, margin, yPosition);
        yPosition += 8;
      }
      
      if (detailedData.age_range) {
        doc.text(`Rango de edad: ${detailedData.age_range}`, margin, yPosition);
        yPosition += 8;
      }
      
      yPosition += 10;

      // Situación financiera actual
      if (detailedData.monthly_income_range || detailedData.savings_percentage || detailedData.has_debts) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Situación Financiera Actual', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        if (detailedData.monthly_income_range) {
          doc.text(`Ingresos mensuales: ${this.formatIncomeRange(detailedData.monthly_income_range)}`, margin, yPosition);
          yPosition += 8;
        }
        
        if (detailedData.savings_percentage) {
          doc.text(`Porcentaje de ahorro: ${detailedData.savings_percentage}`, margin, yPosition);
          yPosition += 8;
        }
        
        if (detailedData.has_debts) {
          doc.text(`Deudas: ${this.formatDebtType(detailedData.has_debts)}`, margin, yPosition);
          yPosition += 8;
        }
        
        yPosition += 10;
      }

      // Objetivos financieros
      if (detailedData.consultation_main_goal || detailedData.time_horizon || detailedData.risk_tolerance) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Objetivos Financieros', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        if (detailedData.consultation_main_goal) {
          doc.text(`Objetivo principal: ${this.formatMainGoal(detailedData.consultation_main_goal)}`, margin, yPosition);
          yPosition += 8;
        }
        
        if (detailedData.time_horizon) {
          doc.text(`Horizonte temporal: ${this.formatTimeHorizon(detailedData.time_horizon)}`, margin, yPosition);
          yPosition += 8;
        }
        
        if (detailedData.risk_tolerance) {
          doc.text(`Tolerancia al riesgo: ${detailedData.risk_tolerance}`, margin, yPosition);
          yPosition += 8;
        }
        
        if (detailedData.priorities && detailedData.priorities.length > 0) {
          doc.text('Prioridades:', margin, yPosition);
          yPosition += 8;
          detailedData.priorities.forEach(priority => {
            doc.text(`• ${this.formatPriority(priority)}`, margin + 10, yPosition);
            yPosition += 6;
          });
        }
        
        yPosition += 10;
      }

      // Información de cartera (si aplica)
      if (detailedData.portfolio_value || detailedData.current_distribution) {
        // Nueva página si es necesario
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Información de Cartera', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        if (detailedData.portfolio_value) {
          doc.text(`Valor de cartera: ${detailedData.portfolio_value}`, margin, yPosition);
          yPosition += 8;
        }
        
        if (detailedData.current_distribution && detailedData.current_distribution.length > 0) {
          doc.text('Distribución actual:', margin, yPosition);
          yPosition += 8;
          detailedData.current_distribution.forEach(asset => {
            doc.text(`• ${this.formatAssetType(asset)}`, margin + 10, yPosition);
            yPosition += 6;
          });
        }
        
        if (detailedData.main_broker) {
          doc.text(`Broker principal: ${detailedData.main_broker}`, margin, yPosition);
          yPosition += 8;
        }
        
        yPosition += 10;
      }

      // Expectativas y comentarios
      if (detailedData.consultation_expectations || detailedData.pre_consultation_comments) {
        // Nueva página si es necesario
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Expectativas y Comentarios', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        if (detailedData.consultation_expectations) {
          doc.text('Expectativas de la consultoría:', margin, yPosition);
          yPosition += 8;
          const expectations = doc.splitTextToSize(detailedData.consultation_expectations, pageWidth - 2 * margin);
          doc.text(expectations, margin, yPosition);
          yPosition += expectations.length * 6 + 5;
        }
        
        if (detailedData.pre_consultation_comments) {
          doc.text('Comentarios adicionales:', margin, yPosition);
          yPosition += 8;
          const comments = doc.splitTextToSize(detailedData.pre_consultation_comments, pageWidth - 2 * margin);
          doc.text(comments, margin, yPosition);
          yPosition += comments.length * 6;
        }
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`BSB Capital - Consultoría Financiera | Página ${i} de ${pageCount}`, 
               pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    return doc;
  }

  formatIncomeRange(range) {
    const ranges = {
      '<1500': 'Menos de 1.500 €',
      '1500-3000': '1.500–3.000 €',
      '3000-5000': '3.000–5.000 €',
      '5000+': 'Más de 5.000 €'
    };
    return ranges[range] || range;
  }

  formatDebtType(type) {
    const types = {
      'none': 'Sin deudas relevantes',
      'consumer': 'Deudas de consumo',
      'mortgage': 'Hipoteca',
      'mixed': 'Deudas mixtas'
    };
    return types[type] || type;
  }

  formatMainGoal(goal) {
    const goals = {
      'organize_finances': 'Ordenar finanzas y mejorar capacidad de ahorro',
      'investment_plan': 'Definir un plan de inversión',
      'tax_optimization': 'Optimizar situación fiscal',
      'milestone_preparation': 'Preparar un hito importante'
    };
    return goals[goal] || goal;
  }

  formatTimeHorizon(horizon) {
    const horizons = {
      'short': 'Corto plazo (1–3 años)',
      'medium': 'Medio plazo (3–10 años)',
      'long': 'Largo plazo (+10 años)'
    };
    return horizons[horizon] || horizon;
  }

  formatPriority(priority) {
    const priorities = {
      'emergency_fund': 'Crear un fondo de emergencia',
      'periodic_investment': 'Invertir de forma periódica',
      'insurance': 'Protección / seguros',
      'tax_optimization': 'Optimización fiscal',
      'diversification': 'Diversificación de activos'
    };
    return priorities[priority] || priority;
  }

  formatAssetType(asset) {
    const assets = {
      'stocks': 'Acciones',
      'etfs': 'ETFs / fondos indexados',
      'bonds': 'Bonos / renta fija',
      'real_estate': 'Inmobiliario',
      'crypto': 'Criptoactivos',
      'others': 'Otros'
    };
    return assets[asset] || asset;
  }

  async sendConsultationSummaryEmail(consultation, detailedData, clientEmail) {
    try {
      // Generar PDF
      const pdf = this.generateConsultationSummaryPDF(consultation, detailedData);
      const pdfBlob = pdf.output('blob');
      
      // Convertir blob a base64 para Supabase
      const buffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const base64 = btoa(String.fromCharCode.apply(null, uint8Array));

      // Enviar email usando la función de Supabase
      const { data, error } = await supabase.functions.invoke('resend-email-secure', {
        body: JSON.stringify({
          to: [clientEmail],
          subject: `Resumen de tu consultoría - BSB Capital`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">¡Gracias por completar el formulario de consultoría!</h2>
              
              <p>Hola ${consultation.client_name || 'estimado cliente'},</p>
              
              <p>Hemos recibido correctamente tu información detallada para la consultoría programada.</p>
              
              <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2d3748; margin-top: 0;">Detalles de tu consultoría:</h3>
                <ul style="color: #4a5568;">
                  <li><strong>Tipo:</strong> ${consultation.consultation_type}</li>
                  <li><strong>Fecha:</strong> ${new Date(consultation.scheduled_at).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</li>
                  <li><strong>Hora:</strong> ${new Date(consultation.scheduled_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</li>
                  <li><strong>Duración:</strong> ${consultation.duration_minutes} minutos</li>
                </ul>
              </div>
              
              <p>Adjunto encontrarás un resumen completo con toda la información que nos has proporcionado. 
              Nuestro equipo revisará estos datos antes de la consultoría para ofrecerte el mejor servicio personalizado.</p>
              
              <p><strong>Próximos pasos:</strong></p>
              <ul>
                <li>Te contactaremos 24-48 horas antes de la consultoría con el enlace de la reunión</li>
                <li>Revisaremos tu información para personalizar la sesión</li>
                <li>Prepararemos material específico según tus objetivos</li>
              </ul>
              
              <p>Si tienes alguna pregunta antes de la consultoría, no dudes en contactarnos.</p>
              
              <p>¡Esperamos poder ayudarte a alcanzar tus objetivos financieros!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px;">
                  Saludos cordiales,<br>
                  <strong>Equipo BSB Capital</strong><br>
                  Asesoramiento Financiero Personalizado
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `consultoria-resumen-${consultation.id}.pdf`,
              content: base64,
              type: 'application/pdf',
              disposition: 'attachment'
            }
          ]
        })
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in sendConsultationSummaryEmail:', error);
      throw error;
    }
  }
}

export default new ConsultationPDFService();