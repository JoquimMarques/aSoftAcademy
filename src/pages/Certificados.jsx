import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { hasAdminAccess } from '../admin/adminAccess'
import { FaGraduationCap, FaScroll, FaCheckCircle, FaInfoCircle, FaBriefcase } from 'react-icons/fa'
import './Certificados.css'

function Certificados() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const isAdmin = user && hasAdminAccess(user)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Não precisa carregar certificados - apenas mostrar exemplo
    setLoading(false)
  }, [user, navigate])

  if (loading) {
    return (
      <div className="certificados-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando certificados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="certificados-page">
      <div className="container">
        <div className="certificados-header">
          <h1 className="page-title">
            <FaGraduationCap style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Meus Certificados
          </h1>
          <p className="page-subtitle">
              Exemplo de certificado de conclusão de curso
          </p>
        </div>

        {/* Mostrar certificado de exemplo */}
        <div className="certificado-exemplo-section" style={{
          marginBottom: '3rem',
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Exemplo de Certificado</h3>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <img 
              src="/img/Certificado2.png" 
              alt="Exemplo de Certificado" 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              onError={(e) => {
                // Tentar outros caminhos possíveis
                if (e.target.src.includes('Certificado2.png')) {
                  e.target.src = '/img/certificado2.png'
                } else if (e.target.src.includes('certificado2.png')) {
                  e.target.src = '../img/Certificado2.png'
                } else {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">Imagem do certificado não encontrada. Adicione Certificado2.png em /public/img/</div>'
                }
              }}
            />
          </div>
        </div>

        <div className="no-certificados">
          <div className="no-certificados-icon">
            <FaScroll />
          </div>
          <h2>Como Solicitar Seu Certificado</h2>
          <p>
            Complete cursos e solicite seus certificados. 
            Após concluir um curso com 100% de progresso, você pode solicitar o certificado que será enviado por email após aprovação.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Explorar Cursos
          </button>
        </div>

        {!isAdmin && (
          <div className="certificados-info">
            <h3>
              <FaInfoCircle style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Sobre os Certificados
            </h3>
            <div className="info-cards">
              <div className="info-card">
                <h4>
                  <FaCheckCircle style={{ marginRight: '0.5rem', color: '#a855f7' }} />
                  Como obter
                </h4>
                <p>Complete 100% do curso e solicite o certificado. Após aprovação, você receberá por email.</p>
              </div>
              <div className="info-card">
                <h4>
                  <FaScroll style={{ marginRight: '0.5rem', color: '#a855f7' }} />
                  Validação
                </h4>
                <p>Certificados são verificáveis e incluem código único de autenticação.</p>
              </div>
              <div className="info-card">
                <h4>
                  <FaBriefcase style={{ marginRight: '0.5rem', color: '#a855f7' }} />
                  Profissional
                </h4>
                <p>Adicione seus certificados ao <a href='https://briolinke.vercel.app/' style={{ color: '#a855f7', textDecoration: 'none' }}>briolink</a> e portfólio profissional.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Certificados

