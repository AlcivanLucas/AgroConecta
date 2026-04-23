/**
 * Seed script for AgroConecta
 * 
 * Execute with: npx tsx src/scripts/seed.ts
 * 
 * Note: Make sure to configure your Firebase environment variables before running
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'

// Initialize Firebase Admin SDK
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

// Sample data
const users = [
  {
    name: 'João Silva',
    email: 'joao@fazenda.com',
    password: 'senha123',
    role: 'produtor',
    farmName: 'Fazenda Santa Maria',
    city: 'Ribeirão Preto',
    state: 'SP',
    isVerified: true,
    avgRating: 4.8,
    totalRatings: 12,
    totalDeals: 8,
  },
  {
    name: 'Maria Santos',
    email: 'maria@agro.com',
    password: 'senha123',
    role: 'prestador',
    city: 'Uberlândia',
    state: 'MG',
    crea: 'CREA-MG 12345',
    isVerified: true,
    avgRating: 4.9,
    totalRatings: 25,
    totalDeals: 20,
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro@campo.com',
    password: 'senha123',
    role: 'prestador',
    city: 'Goiânia',
    state: 'GO',
    isVerified: false,
    avgRating: 4.5,
    totalRatings: 8,
    totalDeals: 5,
  },
]

const announcements = [
  {
    title: 'Aluguel de Colheitadeira John Deere S760',
    description: 'Colheitadeira de última geração com tecnologia de ponta. Equipamento em perfeito estado de conservação, com manutenção em dia. Operador experiente incluso. Atendo em toda região de Ribeirão Preto e cidades vizinhas. Disponibilidade imediata para safra 2026.',
    price: 2500,
    chargeType: 'dia',
    category: 'mecanizacao',
    imageUrls: [],
  },
  {
    title: 'Consultoria em Manejo de Pastagens',
    description: 'Consultoria especializada em manejo rotacionado de pastagens. Mais de 15 anos de experiência no setor pecuário. Elaboração de projetos completos com análise de solo, recomendação de espécies forrageiras e planejamento de divisão de piquetes. Resultados comprovados de aumento de lotação animal por hectare.',
    price: 350,
    chargeType: 'hora',
    category: 'consultoria',
    imageUrls: [],
  },
  {
    title: 'Serviços Veterinários para Bovinos',
    description: 'Atendimento veterinário completo para rebanhos bovinos. Vacinação, vermifugação, diagnóstico de gestação, assistência a partos, tratamento de doenças. Equipamentos modernos e medicamentos de qualidade. Emissão de atestados e laudos. Atendimento emergencial 24h.',
    price: 200,
    chargeType: 'servico',
    category: 'veterinaria',
    imageUrls: [],
  },
  {
    title: 'Pulverização Agrícola com Drone',
    description: 'Serviço de pulverização de precisão utilizando drones de última geração. Menor desperdício de defensivos, maior eficiência na aplicação. Ideal para áreas de difícil acesso. Relatórios detalhados de aplicação com mapeamento por GPS.',
    price: 45,
    chargeType: 'hectare',
    category: 'agronomia',
    imageUrls: [],
  },
  {
    title: 'Transporte de Grãos - Frota Própria',
    description: 'Transporte de grãos com frota própria de caminhões graneleiros. Capacidade de 30 a 45 toneladas por viagem. Rastreamento em tempo real, seguro de carga incluso. Rotas para todo o estado de SP e triângulo mineiro.',
    price: 180,
    chargeType: 'servico',
    category: 'transporte',
    imageUrls: [],
  },
  {
    title: 'Manutenção de Tratores e Colheitadeiras',
    description: 'Serviço de manutenção preventiva e corretiva para máquinas agrícolas. Especialista em John Deere, Case, New Holland e Massey Ferguson. Atendimento no local, peças originais e garantia de serviço. Contratos de manutenção com condições especiais.',
    price: 150,
    chargeType: 'hora',
    category: 'manutencao',
    imageUrls: [],
  },
]

async function seed() {
  console.log('Starting seed...')

  const createdUsers: { id: string; data: typeof users[0] }[] = []

  // Create users
  for (const userData of users) {
    const userRef = db.collection('users').doc()
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const now = new Date()

    const user = {
      id: userRef.id,
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: userData.role,
      farmName: userData.farmName || null,
      city: userData.city,
      state: userData.state,
      cnpj: null,
      crea: (userData as { crea?: string }).crea || null,
      isVerified: userData.isVerified,
      avgRating: userData.avgRating,
      totalRatings: userData.totalRatings,
      totalDeals: userData.totalDeals,
      createdAt: now,
      updatedAt: now,
    }

    await userRef.set(user, { merge: true })
    createdUsers.push({ id: userRef.id, data: userData })
    console.log(`Created user: ${userData.name}`)
  }

  // Create announcements (assign to prestador users)
  const prestadores = createdUsers.filter(u => u.data.role === 'prestador')
  
  for (let i = 0; i < announcements.length; i++) {
    const announcementData = announcements[i]
    const owner = prestadores[i % prestadores.length]
    const ownerUser = await db.collection('users').doc(owner.id).get()
    const ownerData = ownerUser.data()!

    const announcementRef = db.collection('announcements').doc()
    const now = new Date()

    const announcement = {
      id: announcementRef.id,
      title: announcementData.title,
      description: announcementData.description,
      price: announcementData.price,
      chargeType: announcementData.chargeType,
      category: announcementData.category,
      city: ownerData.city,
      state: ownerData.state,
      imageUrls: announcementData.imageUrls,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      userId: owner.id,
      userSnapshot: {
        name: ownerData.name,
        farmName: ownerData.farmName,
        avgRating: ownerData.avgRating,
        isVerified: ownerData.isVerified,
        city: ownerData.city,
        state: ownerData.state,
        role: ownerData.role,
      },
    }

    await announcementRef.set(announcement, { merge: true })
    console.log(`Created announcement: ${announcementData.title}`)
  }

  console.log('Seed completed successfully!')
}

seed().catch(console.error)
