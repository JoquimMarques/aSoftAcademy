import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Gera um certificado quando o curso é concluído
 */
export const generateCertificate = async (userId, courseId, courseData, userData) => {
  try {
    // Verificar se o certificado já existe
    const certificateId = `${userId}_${courseId}`
    const certificateRef = doc(db, 'certificates', certificateId)
    const certificateSnap = await getDoc(certificateRef)
    
    if (certificateSnap.exists()) {
      // Certificado já existe, retornar dados existentes
      return { 
        error: null, 
        certificateId,
        alreadyExists: true,
        data: certificateSnap.data()
      }
    }

    // Criar novo certificado
    const now = new Date()
    const certificateData = {
      id: certificateId,
      userId,
      courseId,
      courseTitle: courseData.title || courseData.subtitle || 'Curso',
      courseDuration: courseData.duration || 'N/A',
      studentName: userData?.fullName || userData?.displayName || userData?.email?.split('@')[0] || 'Aluno',
      studentEmail: userData?.email || '',
      issuedAt: now.toISOString(),
      issuedDate: formatDate(now),
      createdAt: now.toISOString(),
      // Informações adicionais do curso
      courseCategory: courseData.category || '',
      courseLevel: courseData.level || '',
      // Código único para validação
      verificationCode: generateVerificationCode(certificateId),
    }

    await setDoc(certificateRef, certificateData)

    return { 
      error: null, 
      certificateId,
      alreadyExists: false,
      data: certificateData
    }
  } catch (error) {
    console.error('Erro ao gerar certificado:', error)
    return { error: error.message }
  }
}

/**
 * Busca todos os certificados de um usuário
 */
export const getUserCertificates = async (userId) => {
  try {
    const certificatesRef = collection(db, 'certificates')
    const q = query(certificatesRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    
    const certificates = []
    snapshot.forEach((docSnap) => {
      certificates.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })

    // Ordenar por data de emissão (mais recente primeiro)
    certificates.sort((a, b) => {
      return new Date(b.issuedAt) - new Date(a.issuedAt)
    })

    return { error: null, certificates }
  } catch (error) {
    console.error('Erro ao buscar certificados:', error)
    return { error: error.message, certificates: [] }
  }
}

/**
 * Busca um certificado específico por ID
 */
export const getCertificateById = async (certificateId) => {
  try {
    const certificateRef = doc(db, 'certificates', certificateId)
    const certificateSnap = await getDoc(certificateRef)
    
    if (certificateSnap.exists()) {
      return { 
        error: null, 
        certificate: {
          id: certificateSnap.id,
          ...certificateSnap.data()
        }
      }
    }
    
    return { error: 'Certificado não encontrado', certificate: null }
  } catch (error) {
    console.error('Erro ao buscar certificado:', error)
    return { error: error.message, certificate: null }
  }
}

/**
 * Verifica se o usuário já tem certificado para um curso
 */
export const hasCertificate = async (userId, courseId) => {
  try {
    const certificateId = `${userId}_${courseId}`
    const certificateRef = doc(db, 'certificates', certificateId)
    const certificateSnap = await getDoc(certificateRef)
    
    return certificateSnap.exists()
  } catch (error) {
    console.error('Erro ao verificar certificado:', error)
    return false
  }
}

/**
 * Formata data para o formato brasileiro
 */
const formatDate = (date) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${day} ${month}, ${year}`
}

/**
 * Gera código de verificação único
 */
const generateVerificationCode = (certificateId) => {
  // Criar código baseado no ID do certificado
  const hash = certificateId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)
  
  // Converter para código alfanumérico de 8 caracteres
  const code = Math.abs(hash).toString(36).toUpperCase().substring(0, 8)
  return `BRC-${code}`
}

export default {
  generateCertificate,
  getUserCertificates,
  getCertificateById,
  hasCertificate
}

