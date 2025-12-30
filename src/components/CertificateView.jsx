import { useRef } from 'react'
import './CertificateView.css'

// Função helper para obter nome do módulo dinamicamente
const getModuleName = (name) => name

function CertificateView({ certificate, courseData }) {
  const certificateRef = useRef(null)

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  // Gerar descrição do curso com tópicos principais
  const generateCourseDescription = () => {
    if (!courseData) return ''

    const modules = courseData.content?.modules || []
    if (modules.length === 0) {
      return 'adquirindo conhecimentos e competências essenciais.'
    }

    // Pegar os primeiros 3-4 módulos como tópicos principais
    const topics = modules.slice(0, 4).map(m => m.title).join(', ')
    return `adquirindo conhecimentos e competências em ${topics}.`
  }

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return

    try {
      // Importar bibliotecas dinamicamente apenas quando necessário
      // Usar função para obter nome do módulo e evitar análise estática pelo Vite
      const html2canvasModule = await import(/* @vite-ignore */ getModuleName('html2canvas'))
      const jsPDFModule = await import(/* @vite-ignore */ getModuleName('jspdf'))

      const html2canvas = html2canvasModule.default
      const jsPDF = jsPDFModule.default

      // Criar canvas do certificado
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      })

      const imgData = canvas.toDataURL('image/png')

      // Criar PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calcular dimensões mantendo proporção
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.264583 // Converter px para mm

      const imgScaledWidth = imgWidth * ratio
      const imgScaledHeight = imgHeight * ratio

      // Centralizar imagem no PDF
      const xOffset = (pdfWidth - imgScaledWidth) / 2
      const yOffset = (pdfHeight - imgScaledHeight) / 2

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)

      // Nome do arquivo
      const fileName = `Certificado_${certificate.courseTitle.replace(/\s+/g, '_')}_${certificate.studentName.replace(/\s+/g, '_')}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      if (error.message && error.message.includes('Failed to fetch')) {
        alert('Bibliotecas de PDF não estão instaladas.\n\nPor favor, execute:\nnpm install html2canvas jspdf\n\nDepois reinicie o servidor de desenvolvimento.')
      } else {
        alert('Erro ao gerar PDF. Tente novamente.')
      }
    }
  }

  if (!certificate) {
    return <div>Carregando certificado...</div>
  }

  return (
    <div className="certificate-view-container">
      <div className="certificate-actions">
        <button
          onClick={handleDownloadPDF}
          className="btn btn-primary"
          title="Baixar certificado em PDF"
        >
          📥 Baixar PDF
        </button>
      </div>

      <div ref={certificateRef} className="certificate-wrapper">
        <div className="certificate-base">
          {/* Painel Esquerdo (Verde Escuro) */}
          <div className="certificate-left-panel">
            <div className="certificate-date-box">
              <div className="date-label">Concede este certificado em</div>
              <div className="date-value">{certificate.issuedDate || formatDate(certificate.issuedAt)}</div>
            </div>
            <div className="certificate-logo">
              <div className="logo-square">
                <span className="logo-b">b</span>
              </div>
              <div className="logo-text">aSoftAcademy</div>
            </div>
          </div>

          {/* Painel Direito (Verde Claro) */}
          <div className="certificate-right-panel">
            <div className="certificate-title">
              <span className="title-main">Certificado</span>
              <span className="title-sub">de Conclusão</span>
            </div>

            <div className="certificate-intro">
              Este Certificado É Concedido A
            </div>

            <div className="certificate-student-name">
              {certificate.studentName}
            </div>

            <div className="certificate-description">
              Certificamos que <strong>{certificate.studentName}</strong> concluiu com êxito o curso{' '}
              <strong>{certificate.courseTitle}</strong> na plataforma <strong>aSoftAcademy</strong>,{' '}
              {generateCourseDescription()}
            </div>

            <div className="certificate-duration">
              Duração do Curso: <strong>{certificate.courseDuration}</strong>
            </div>

            <div className="certificate-signature">
              <div className="signature-line"></div>
              <div className="signature-name">Joaquim C. F. Marques</div>
              <div className="signature-title">Instrutor</div>
            </div>

            <div className="certificate-seal">
              <div className="seal-medal"></div>
              <div className="seal-ribbons">
                <div className="ribbon ribbon-left"></div>
                <div className="ribbon ribbon-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateView

