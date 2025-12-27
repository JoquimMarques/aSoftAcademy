import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  PAYMENT_IBAN, 
  PAYMENT_STATUS,
  CERTIFICATE_PRICE,
  createCertificatePaymentOrder,
  getUserCertificatePaymentStatus
} from '../services/paymentService'
import './PaymentModal.css'

function CertificatePaymentModal({ isOpen, onClose, course, onPaymentSubmitted }) {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)

  if (!isOpen || !course) return null

  const copyIBAN = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_IBAN)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard
      const textArea = document.createElement('textarea')
      textArea.value = PAYMENT_IBAN
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConfirmPayment = async () => {
    if (!user) {
      setError('Você precisa estar logado para confirmar o pagamento.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verificar se já existe um pedido
      const { status } = await getUserCertificatePaymentStatus(user.uid, course.id)
      
      if (status === PAYMENT_STATUS.AWAITING_VERIFICATION) {
        setPaymentStatus('awaiting')
        setLoading(false)
        return
      }
      
      if (status === PAYMENT_STATUS.APPROVED) {
        setPaymentStatus('approved')
        if (onPaymentSubmitted) {
          onPaymentSubmitted()
        }
        setLoading(false)
        return
      }

      // Criar novo pedido de pagamento de certificado
      const { error: orderError } = await createCertificatePaymentOrder(
        user.uid,
        user.email,
        userData?.fullName || user.displayName || 'Usuário',
        course.id,
        course.title
      )

      if (orderError) {
        setError(orderError)
      } else {
        setPaymentStatus('awaiting')
        if (onPaymentSubmitted) {
          onPaymentSubmitted()
        }
      }
    } catch (err) {
      console.error('Erro ao confirmar pagamento de certificado:', err)
      setError('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Grátis'
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price).replace('AOA', 'Kz')
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="payment-modal-header">
          <div className="payment-icon">🎓</div>
          <h2>Pagamento do Certificado</h2>
          <p className="course-name">{course.title}</p>
        </div>

        {paymentStatus === 'awaiting' ? (
          <div className="payment-status-message awaiting">
            <div className="status-icon">⏳</div>
            <h3>Aguardando Verificação</h3>
            <p>
              Seu pagamento está sendo verificado pelo administrador.
              Você poderá solicitar o certificado assim que o pagamento for confirmado.
            </p>
            <p className="status-hint">
              Este processo pode levar até 24 horas.
            </p>
            <button className="btn-close-modal" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : paymentStatus === 'approved' ? (
          <div className="payment-status-message approved">
            <div className="status-icon">✅</div>
            <h3>Pagamento Aprovado!</h3>
            <p>
              Seu pagamento foi confirmado. Agora você pode solicitar o certificado!
            </p>
            <button className="btn-close-modal" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="payment-modal-body">
              <div className="payment-amount">
                <span className="amount-label">Valor a pagar:</span>
                <span className="amount-value">{formatPrice(CERTIFICATE_PRICE)}</span>
              </div>

              <div className="affordable-message">
                <span className="affordable-icon">💰</span>
                <p>
                  <strong>Preço que cabe no bolso!</strong> Acreditamos que educação de qualidade 
                  deve ser acessível para todos. Invista no seu futuro sem pesar no orçamento.
                </p>
              </div>

              <div className="payment-instructions">
                <h3>📋 Instruções de Pagamento</h3>
                <ol>
                  <li>Faça uma transferência bancária para o IBAN abaixo</li>
                  <li>Use o valor exato: <strong>{formatPrice(CERTIFICATE_PRICE)}</strong></li>
                  <li>Na descrição, coloque: <strong>certificado_{course.id}</strong></li>
                  <li>Após a transferência, clique em "Já Paguei"</li>
                  <li>Aguarde a confirmação do administrador</li>
                </ol>
              </div>

              <div className="iban-section">
                <div className="iban-holder">
                  <label>Titular da Conta:</label>
                  <span className="holder-name">Joaquim César Francisco Marques</span>
                </div>
                <label>IBAN para Transferência:</label>
                <div className="iban-container">
                  <span className="iban-value">{PAYMENT_IBAN}</span>
                  <button 
                    className={`btn-copy ${copied ? 'copied' : ''}`}
                    onClick={copyIBAN}
                  >
                    {copied ? '✓ Copiado!' : '📋 Copiar'}
                  </button>
                </div>
              </div>

              <div className="payment-warning">
                <span className="warning-icon">⚠️</span>
                <p>
                  <strong>Importante:</strong> Só clique em "Já Paguei" após ter 
                  realizado a transferência. Pagamentos não confirmados serão rejeitados.
                </p>
              </div>

              {error && (
                <div className="payment-error">
                  <span>❌</span> {error}
                </div>
              )}
            </div>

            <div className="payment-modal-footer">
              <button 
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-payment"
                onClick={handleConfirmPayment}
                disabled={loading}
              >
                {loading ? 'Processando...' : '✓ Já Paguei'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CertificatePaymentModal


