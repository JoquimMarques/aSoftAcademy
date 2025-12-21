// Script para configurar o pagamento do curso Portugol Studio
// Execute: import { setupPortugolPayment } from './utils/setupPayment'; setupPortugolPayment();

import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const setupPortugolPayment = async () => {
  try {
    const courseId = 'portugol-studio'
    const courseRef = doc(db, 'courses', courseId)
    
    // Verificar se o curso já existe
    const courseSnap = await getDoc(courseRef)
    
    const paymentData = {
      paymentEnabled: true,
      price: 500, // 500 Kz
      updatedAt: new Date().toISOString()
    }
    
    if (courseSnap.exists()) {
      // Atualizar curso existente mantendo os dados anteriores
      await setDoc(courseRef, paymentData, { merge: true })
    } else {
      // Criar documento do curso com pagamento
      await setDoc(courseRef, {
        id: courseId,
        title: 'Logica de Programação com Portugol Studio',
        ...paymentData,
        createdAt: new Date().toISOString()
      })
    }
    
    console.log('✅ Pagamento configurado para Portugol Studio: 500 Kz')
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao configurar pagamento:', error)
    return { success: false, error: error.message }
  }
}

export default setupPortugolPayment

