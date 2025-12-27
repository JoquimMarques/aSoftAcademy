import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from './adminAccess'
import { useNavigate } from 'react-router-dom'
import {
  getAllCertificateRequests,
  approveCertificateRequest,
  markCertificateAsSent,
  rejectCertificateRequest,
  CERTIFICATE_REQUEST_STATUS
} from '../services/certificateRequestService'
import './AdminCertificates.css'

function AdminCertificates() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved, sent, rejected
  const [processing, setProcessing] = useState({})
  const [rejectModal, setRejectModal] = useState({ open: false, requestId: null })
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !hasAdminAccess(user))) {
      navigate('/')
      return
    }

    if (user && hasAdminAccess(user)) {
      loadRequests()
    }
  }, [user, authLoading, navigate])

  const loadRequests = async () => {
    setLoading(true)
    setError(null)

    try {
      const { requests: fetchedRequests, error: fetchError } = await getAllCertificateRequests()

      if (fetchError) {
        setError(fetchError)
      } else {
        setRequests(fetchedRequests)
      }
    } catch (err) {
      console.error('Erro ao carregar solicitações:', err)
      setError('Erro ao carregar solicitações de certificado')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    setProcessing(prev => ({ ...prev, [requestId]: 'approving' }))

    try {
      const { error: approveError } = await approveCertificateRequest(requestId)

      if (approveError) {
        alert(`Erro ao aprovar: ${approveError}`)
      } else {
        await loadRequests()
      }
    } catch (err) {
      console.error('Erro ao aprovar:', err)
      alert('Erro ao aprovar solicitação')
    } finally {
      setProcessing(prev => {
        const newState = { ...prev }
        delete newState[requestId]
        return newState
      })
    }
  }

  const handleMarkAsSent = async (requestId) => {
    setProcessing(prev => ({ ...prev, [requestId]: 'sending' }))

    try {
      const { error: sendError } = await markCertificateAsSent(requestId)

      if (sendError) {
        alert(`Erro ao marcar como enviado: ${sendError}`)
      } else {
        alert('✅ Certificado marcado como enviado!')
        await loadRequests()
      }
    } catch (err) {
      console.error('Erro ao marcar como enviado:', err)
      alert('Erro ao marcar como enviado')
    } finally {
      setProcessing(prev => {
        const newState = { ...prev }
        delete newState[requestId]
        return newState
      })
    }
  }

  const handleReject = async () => {
    if (!rejectModal.requestId) return

    setProcessing(prev => ({ ...prev, [rejectModal.requestId]: 'rejecting' }))

    try {
      const { error: rejectError } = await rejectCertificateRequest(rejectModal.requestId, rejectReason)

      if (rejectError) {
        alert(`Erro ao rejeitar: ${rejectError}`)
      } else {
        alert('Solicitação rejeitada')
        setRejectModal({ open: false, requestId: null })
        setRejectReason('')
        await loadRequests()
      }
    } catch (err) {
      console.error('Erro ao rejeitar:', err)
      alert('Erro ao rejeitar solicitação')
    } finally {
      setProcessing(prev => {
        const newState = { ...prev }
        delete newState[rejectModal.requestId]
        return newState
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      [CERTIFICATE_REQUEST_STATUS.PENDING]: { text: 'Pendente', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' },
      [CERTIFICATE_REQUEST_STATUS.APPROVED]: { text: 'Aprovado', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
      [CERTIFICATE_REQUEST_STATUS.SENT]: { text: 'Enviado', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' },
      [CERTIFICATE_REQUEST_STATUS.REJECTED]: { text: 'Rejeitado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
    }
    return badges[status] || badges[CERTIFICATE_REQUEST_STATUS.PENDING]
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter)

  if (loading || authLoading) {
    return (
      <div className="admin-certificates-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando solicitações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-certificates-page">
      <div className="container">
        <div className="admin-header">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Voltar
          </button>
          <h1>🎓 Gestão de Certificados</h1>
          <button onClick={loadRequests} className="btn btn-secondary">
            🔄 Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="certificates-stats">
          <div className="stat-card total" onClick={() => setFilter('all')}>
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card pending" onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.PENDING)}>
            <span className="stat-value">{requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.PENDING).length}</span>
            <span className="stat-label">Pendentes</span>
          </div>
          <div className="stat-card approved" onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.APPROVED)}>
            <span className="stat-value">{requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.APPROVED).length}</span>
            <span className="stat-label">Aprovados</span>
          </div>
          <div className="stat-card sent" onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.SENT)}>
            <span className="stat-value">{requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.SENT).length}</span>
            <span className="stat-label">Enviados</span>
          </div>
          <div className="stat-card rejected" onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.REJECTED)}>
            <span className="stat-value">{requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.REJECTED).length}</span>
            <span className="stat-label">Rejeitados</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({requests.length})
          </button>
          <button
            className={`filter-btn ${filter === CERTIFICATE_REQUEST_STATUS.PENDING ? 'active' : ''}`}
            onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.PENDING)}
          >
            Pendentes ({requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.PENDING).length})
          </button>
          <button
            className={`filter-btn ${filter === CERTIFICATE_REQUEST_STATUS.APPROVED ? 'active' : ''}`}
            onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.APPROVED)}
          >
            Aprovados ({requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.APPROVED).length})
          </button>
          <button
            className={`filter-btn ${filter === CERTIFICATE_REQUEST_STATUS.SENT ? 'active' : ''}`}
            onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.SENT)}
          >
            Enviados ({requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.SENT).length})
          </button>
          <button
            className={`filter-btn ${filter === CERTIFICATE_REQUEST_STATUS.REJECTED ? 'active' : ''}`}
            onClick={() => setFilter(CERTIFICATE_REQUEST_STATUS.REJECTED)}
          >
            Rejeitados ({requests.filter(r => r.status === CERTIFICATE_REQUEST_STATUS.REJECTED).length})
          </button>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Email</th>
                  <th>Curso</th>
                  <th>Duração</th>
                  <th>Data da Solicitação</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const statusBadge = getStatusBadge(request.status)
                  return (
                    <tr key={request.id}>
                      <td>{request.userName}</td>
                      <td>{request.userEmail}</td>
                      <td>{request.courseTitle}</td>
                      <td>{request.courseDuration}</td>
                      <td>{formatDate(request.requestedAt)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            color: statusBadge.color,
                            background: statusBadge.bg,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}
                        >
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {request.status === CERTIFICATE_REQUEST_STATUS.PENDING && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={processing[request.id]}
                                className="btn btn-approve"
                              >
                                {processing[request.id] === 'approving' ? 'Aprovando...' : '✅ Aprovar'}
                              </button>
                              <button
                                onClick={() => setRejectModal({ open: true, requestId: request.id })}
                                disabled={processing[request.id]}
                                className="btn btn-reject"
                              >
                                ❌ Rejeitar
                              </button>
                            </>
                          )}
                          {request.status === CERTIFICATE_REQUEST_STATUS.APPROVED && (
                            <button
                              onClick={() => handleMarkAsSent(request.id)}
                              disabled={processing[request.id]}
                              className="btn btn-send"
                            >
                              {processing[request.id] === 'sending' ? 'Enviando...' : '📧 Marcar como Enviado'}
                            </button>
                          )}
                          {request.status === CERTIFICATE_REQUEST_STATUS.SENT && (
                            <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>
                              ✅ Enviado
                            </span>
                          )}
                          {request.status === CERTIFICATE_REQUEST_STATUS.REJECTED && (
                            <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                              ❌ Rejeitado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Rejeição */}
        {rejectModal.open && (
          <div className="modal-overlay" onClick={() => setRejectModal({ open: false, requestId: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Rejeitar Solicitação</h3>
              <p>Digite o motivo da rejeição (opcional):</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motivo da rejeição..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  marginBottom: '1rem',
                  fontFamily: 'inherit'
                }}
              />
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setRejectModal({ open: false, requestId: null })
                    setRejectReason('')
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing[rejectModal.requestId]}
                  className="btn btn-reject"
                >
                  {processing[rejectModal.requestId] === 'rejecting' ? 'Rejeitando...' : 'Rejeitar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCertificates

