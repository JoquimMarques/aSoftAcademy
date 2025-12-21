import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Status das solicitações de certificado
 */
export const CERTIFICATE_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SENT: 'sent'
}

/**
 * Solicita um certificado para um curso concluído
 */
export const requestCertificate = async (userId, courseId, courseData, userData) => {
  try {
    const requestId = `${userId}_${courseId}`
    const requestRef = doc(db, 'certificateRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    // Verificar se já existe uma solicitação
    if (requestSnap.exists()) {
      const existingData = requestSnap.data()
      return { 
        error: null, 
        requestId,
        alreadyExists: true,
        status: existingData.status,
        data: existingData
      }
    }

    // Criar nova solicitação
    const now = new Date()
    const requestData = {
      id: requestId,
      userId,
      userEmail: userData?.email || '',
      userName: userData?.fullName || userData?.displayName || userData?.email?.split('@')[0] || 'Aluno',
      courseId,
      courseTitle: courseData.title || courseData.subtitle || 'Curso',
      courseDuration: courseData.duration || 'N/A',
      status: CERTIFICATE_REQUEST_STATUS.PENDING,
      requestedAt: now.toISOString(),
      createdAt: now.toISOString(),
      // Informações adicionais
      courseCategory: courseData.category || '',
      courseLevel: courseData.level || '',
    }

    await setDoc(requestRef, requestData)

    return { 
      error: null, 
      requestId,
      alreadyExists: false,
      status: CERTIFICATE_REQUEST_STATUS.PENDING,
      data: requestData
    }
  } catch (error) {
    console.error('Erro ao solicitar certificado:', error)
    return { error: error.message }
  }
}

/**
 * Verifica se o usuário já solicitou certificado para um curso
 */
export const hasCertificateRequest = async (userId, courseId) => {
  try {
    const requestId = `${userId}_${courseId}`
    const requestRef = doc(db, 'certificateRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    return requestSnap.exists()
  } catch (error) {
    console.error('Erro ao verificar solicitação:', error)
    return false
  }
}

/**
 * Busca o status da solicitação de certificado
 */
export const getCertificateRequestStatus = async (userId, courseId) => {
  try {
    const requestId = `${userId}_${courseId}`
    const requestRef = doc(db, 'certificateRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    if (requestSnap.exists()) {
      return { 
        error: null, 
        status: requestSnap.data().status,
        data: requestSnap.data()
      }
    }
    
    return { error: null, status: null, data: null }
  } catch (error) {
    console.error('Erro ao buscar status da solicitação:', error)
    return { error: error.message, status: null, data: null }
  }
}

/**
 * Busca todas as solicitações de certificado (para admin)
 */
export const getAllCertificateRequests = async () => {
  try {
    const requestsRef = collection(db, 'certificateRequests')
    const q = query(requestsRef, orderBy('requestedAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const requests = []
    snapshot.forEach((docSnap) => {
      requests.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })

    return { error: null, requests }
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return { error: error.message, requests: [] }
  }
}

/**
 * Aprova uma solicitação de certificado (admin)
 */
export const approveCertificateRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'certificateRequests', requestId)
    await updateDoc(requestRef, {
      status: CERTIFICATE_REQUEST_STATUS.APPROVED,
      approvedAt: new Date().toISOString()
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error)
    return { error: error.message }
  }
}

/**
 * Marca certificado como enviado (admin)
 */
export const markCertificateAsSent = async (requestId) => {
  try {
    const requestRef = doc(db, 'certificateRequests', requestId)
    await updateDoc(requestRef, {
      status: CERTIFICATE_REQUEST_STATUS.SENT,
      sentAt: new Date().toISOString()
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao marcar como enviado:', error)
    return { error: error.message }
  }
}

/**
 * Rejeita uma solicitação de certificado (admin)
 */
export const rejectCertificateRequest = async (requestId, reason) => {
  try {
    const requestRef = doc(db, 'certificateRequests', requestId)
    await updateDoc(requestRef, {
      status: CERTIFICATE_REQUEST_STATUS.REJECTED,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || ''
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error)
    return { error: error.message }
  }
}

/**
 * Busca todas as solicitações de um usuário
 */
export const getUserCertificateRequests = async (userId) => {
  try {
    const requestsRef = collection(db, 'certificateRequests')
    const q = query(requestsRef, where('userId', '==', userId), orderBy('requestedAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const requests = []
    snapshot.forEach((docSnap) => {
      requests.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })

    return { error: null, requests }
  } catch (error) {
    console.error('Erro ao buscar solicitações do usuário:', error)
    return { error: error.message, requests: [] }
  }
}

export default {
  requestCertificate,
  hasCertificateRequest,
  getCertificateRequestStatus,
  getAllCertificateRequests,
  approveCertificateRequest,
  markCertificateAsSent,
  rejectCertificateRequest,
  getUserCertificateRequests,
  CERTIFICATE_REQUEST_STATUS
}

