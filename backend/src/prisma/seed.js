import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.prescriptionRenewal.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.testResult.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  const hashedPassword = await bcrypt.hash('Test1234', 12)
  const user = await prisma.user.create({
    data: {
      email: 'test@demo.com',
      password: hashedPassword,
      firstName: 'Moran',
      lastName: 'Demo',
      phone: '+2250123456789',
      dateOfBirth: new Date('1990-06-15'),
      bloodType: 'O+',
      heightCm: 175,
      weightKg: 72,
      allergies: JSON.stringify(['Pénicilline', 'Arachides']),
      chronicConditions: JSON.stringify(['Myopie']),
      emergencyContact: 'Amara Demo',
      emergencyPhone: '+2250198765432',
      address: '123 Rue de la Santé, Angré, Abidjan, Côte d\'Ivoire',
    },
  })

  console.log('✅ Demo user created: test@demo.com / Test1234')

  // Create doctors
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: 'Dr. Kouassi Martin',
        specialty: 'Ophtalmologue',
        phone: '+225 21 23 45 67 80',
        email: 'dr.martin@centremedicaldanan.ci',
        consultationDays: 'Lundi, Mercredi, Vendredi',
        availableSlots: JSON.stringify(['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00']),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Kouadio Olivier',
        specialty: 'Ophtalmologue',
        phone: '+225 21 23 45 67 81',
        email: 'dr.kouadio@centremedicaldanan.ci',
        consultationDays: 'Mardi, Jeudi, Samedi',
        availableSlots: JSON.stringify(['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Coulibaly Amina',
        specialty: 'Optométriste',
        phone: '+225 21 23 45 67 82',
        email: 'dr.coulibalyamina@centremedicaldanan.ci',
        consultationDays: 'Lundi à Vendredi',
        availableSlots: JSON.stringify(['08:30', '09:30', '10:30', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']),
      },
    }),
  ])

  console.log('✅ Doctors created')

  // Create appointments
  const now = new Date()
  const future1 = new Date(now); future1.setDate(now.getDate() + 3)
  const future2 = new Date(now); future2.setDate(now.getDate() + 10)
  const future3 = new Date(now); future3.setDate(now.getDate() + 21)
  const past1 = new Date(now); past1.setDate(now.getDate() - 14)
  const past2 = new Date(now); past2.setDate(now.getDate() - 45)
  const past3 = new Date(now); past3.setDate(now.getDate() - 90)

  await prisma.appointment.createMany({
    data: [
      {
        userId: user.id,
        doctor: 'Dr. Kouassi Martin',
        specialty: 'Ophtalmologue',
        type: 'Contrôle de routine',
        date: future1,
        time: '09:00',
        location: 'Centre Medical Danan - Salle 3',
        status: 'confirmed',
      },
      {
        userId: user.id,
        doctor: 'Dr. Coulibaly Amina',
        specialty: 'Optométriste',
        type: 'Examen de la vue',
        date: future2,
        time: '14:30',
        location: 'Centre Medical Danan - Salle 1',
        status: 'pending',
      },
      {
        userId: user.id,
        doctor: 'Dr. Kouadio Olivier',
        specialty: 'Ophtalmologue',
        type: 'Suivi post-opératoire',
        date: future3,
        time: '10:00',
        location: 'Centre Medical Danan - Salle 2',
        status: 'confirmed',
      },
      {
        userId: user.id,
        doctor: 'Dr. Kouassi Martin',
        specialty: 'Ophtalmologue',
        type: 'Consultation',
        date: past1,
        time: '11:00',
        location: 'Centre Medical Danan - Salle 3',
        status: 'completed',
      },
      {
        userId: user.id,
        doctor: 'Dr. Coulibaly Amina',
        specialty: 'Optométriste',
        type: 'Examen de la vue',
        date: past2,
        time: '15:00',
        location: 'Centre Medical Danan - Salle 1',
        status: 'completed',
      },
      {
        userId: user.id,
        doctor: 'Dr. Kouadio Olivier',
        specialty: 'Ophtalmologue',
        type: 'Urgence',
        date: past3,
        time: '08:30',
        location: 'Centre Medical Danan - Urgences',
        status: 'completed',
      },
    ],
  })

  console.log('✅ Appointments created')

  // Create prescriptions
  const prescs = await Promise.all([
    prisma.prescription.create({
      data: {
        userId: user.id,
        medication: 'Timolol 0.5% Collyre',
        medicationType: 'Collyre',
        dosage: '1 goutte par oeil',
        frequency: '2 fois par jour (matin et soir)',
        duration: '3 mois',
        instructions: 'Appliquer dans chaque oeil. Attendre 5 minutes entre deux collyres différents. Garder les yeux fermés 1 minute après application.',
        sideEffects: 'Sensation de brûlure temporaire, vision trouble passagère, sécheresse oculaire',
        prescribedBy: 'Dr. Kouassi Martin',
        prescribedDate: past1,
        expiryDate: new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
        status: 'active',
        refillsRemaining: 2,
        totalRefills: 3,
      },
    }),
    prisma.prescription.create({
      data: {
        userId: user.id,
        medication: 'Latanoprost 0.005% Collyre',
        medicationType: 'Collyre',
        dosage: '1 goutte par oeil',
        frequency: '1 fois par jour (le soir)',
        duration: '6 mois',
        instructions: 'Appliquer le soir avant le coucher. Ne pas utiliser avec des lentilles de contact.',
        sideEffects: 'Changement de couleur de l\'iris possible, croissance des cils, rougeur oculaire',
        prescribedBy: 'Dr. Kouadio Olivier',
        prescribedDate: past2,
        expiryDate: new Date(now.getFullYear(), now.getMonth() + 5, now.getDate()),
        status: 'active',
        refillsRemaining: 4,
        totalRefills: 6,
      },
    }),
    prisma.prescription.create({
      data: {
        userId: user.id,
        medication: 'Larmes Artificielles Hylo-Tear',
        medicationType: 'Collyre',
        dosage: '1-2 gouttes par oeil',
        frequency: '4 à 6 fois par jour selon besoin',
        duration: 'Continu',
        instructions: 'Utiliser dès que les yeux sont secs ou irrités. Compatible avec les lentilles de contact.',
        sideEffects: 'Aucun effet secondaire notable',
        prescribedBy: 'Dr. Coulibaly Amina',
        prescribedDate: past2,
        expiryDate: new Date(now.getFullYear(), now.getMonth() + 12, now.getDate()),
        status: 'active',
        refillsRemaining: 10,
        totalRefills: 12,
      },
    }),
    prisma.prescription.create({
      data: {
        userId: user.id,
        medication: 'Tobramycine 0.3% Collyre',
        medicationType: 'Antibiotique',
        dosage: '1 goutte',
        frequency: '4 fois par jour pendant 7 jours',
        duration: '7 jours',
        instructions: 'Traitement antibiotique. Compléter le traitement même si les symptômes disparaissent.',
        prescribedBy: 'Dr. Kouassi Martin',
        prescribedDate: past3,
        expiryDate: past2,
        status: 'completed',
        refillsRemaining: 0,
        totalRefills: 0,
      },
    }),
  ])

  console.log('✅ Prescriptions created')

  // Create a renewal request
  await prisma.prescriptionRenewal.create({
    data: {
      prescriptionId: prescs[0].id,
      medication: prescs[0].medication,
      status: 'approved',
      requestDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      estimatedApproval: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Prescription renewals created')

  // Create test results
  await prisma.testResult.createMany({
    data: [
      {
        userId: user.id,
        testName: 'Acuité Visuelle',
        doctor: 'Dr. Coulibaly Amina',
        date: past1,
        status: 'normal',
        trend: 'stable',
        results: JSON.stringify({
          oeil_droit: '10/10',
          oeil_gauche: '8/10',
          vision_binoculaire: '10/10',
          correction_od: '-1.50',
          correction_og: '-2.25',
        }),
        notes: 'Acuité visuelle stable. Correction adaptée. Prochain contrôle dans 6 mois.',
      },
      {
        userId: user.id,
        testName: 'Tonométrie (Pression Oculaire)',
        doctor: 'Dr. Kouassi Martin',
        date: past1,
        status: 'attention',
        trend: 'up',
        results: JSON.stringify({
          pression_od: '19 mmHg',
          pression_og: '21 mmHg',
          seuil_normal: '10-21 mmHg',
          methode: 'Tonométrie à aplanation',
        }),
        notes: 'Pression oculaire gauche à la limite supérieure. Surveillance renforcée recommandée.',
      },
      {
        userId: user.id,
        testName: 'Fond d\'Oeil',
        doctor: 'Dr. Kouadio Olivier',
        date: past2,
        status: 'normal',
        trend: 'stable',
        results: JSON.stringify({
          retine: 'Normale',
          nerf_optique: 'Aspect normal',
          vaisseaux: 'Calibre normal',
          macula: 'Normale',
        }),
        notes: 'Examen du fond d\'oeil sans anomalie. Aucun signe de rétinopathie.',
      },
      {
        userId: user.id,
        testName: 'Champ Visuel (Périmétrie)',
        doctor: 'Dr. Kouassi Martin',
        date: past2,
        status: 'normal',
        trend: 'stable',
        results: JSON.stringify({
          oeil_droit: 'Champ complet',
          oeil_gauche: 'Champ complet',
          sensibilite: 'Normale',
          scotomes: 'Aucun',
        }),
        notes: 'Champ visuel normal bilatéral. Pas de déficit.',
      },
      {
        userId: user.id,
        testName: 'OCT Rétinien',
        doctor: 'Dr. Kouadio Olivier',
        date: past3,
        status: 'normal',
        trend: 'stable',
        results: JSON.stringify({
          epaisseur_maculaire: '260 µm (normal)',
          fibres_nerveuses: 'Épaisseur normale',
          couche_ganglionnaire: 'Normale',
        }),
        notes: 'OCT rétinien normal. Épaisseur maculaire dans les normes.',
      },
      {
        userId: user.id,
        testName: 'Test de Schirmer (Sécheresse)',
        doctor: 'Dr. Coulibaly Amina',
        date: past3,
        status: 'attention',
        trend: 'down',
        results: JSON.stringify({
          oeil_droit: '8 mm/5min',
          oeil_gauche: '7 mm/5min',
          seuil_normal: '> 10 mm/5min',
          diagnostic: 'Sécheresse oculaire modérée',
        }),
        notes: 'Sécheresse oculaire modérée bilatérale. Larmes artificielles recommandées.',
      },
    ],
  })

  console.log('✅ Test results created')

  // Create medical records
  await prisma.medicalRecord.createMany({
    data: [
      {
        userId: user.id,
        recordType: 'Consultation',
        doctor: 'Dr. Kouassi Martin',
        date: past1,
        diagnosis: 'Myopie bilatérale stable',
        treatment: 'Correction optique maintenue. Collyre Timolol pour surveillance pression.',
        notes: 'Patient en bonne santé oculaire. Surveillance régulière de la pression intraoculaire.',
      },
      {
        userId: user.id,
        recordType: 'Examen complet',
        doctor: 'Dr. Coulibaly Amina',
        date: past2,
        diagnosis: 'Sécheresse oculaire modérée + Myopie',
        treatment: 'Larmes artificielles + Correction optique ajustée',
        notes: 'Nouvelles lunettes prescrites. Suivi sécheresse oculaire dans 3 mois.',
      },
      {
        userId: user.id,
        recordType: 'Urgence',
        doctor: 'Dr. Kouadio Olivier',
        date: past3,
        diagnosis: 'Conjonctivite bactérienne',
        treatment: 'Tobramycine 0.3% collyre — 4x/jour pendant 7 jours',
        notes: 'Infection traitée avec succès. Contrôle post-traitement effectué.',
      },
      {
        userId: user.id,
        recordType: 'Vaccination',
        doctor: 'Dr. Kouassi Martin',
        date: new Date(now.getFullYear() - 1, 2, 15),
        diagnosis: null,
        treatment: 'Vaccin Hépatite B — Rappel',
        notes: 'Rappel vaccinal effectué. Prochain rappel dans 5 ans.',
      },
    ],
  })

  console.log('✅ Medical records created')

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: 'Rendez-vous confirmé',
        message: `Votre rendez-vous avec Dr. Kouassi Martin le ${future1.toLocaleDateString('fr-FR')} à 09:00 est confirmé.`,
        type: 'appointment',
        read: false,
        link: '/appointments',
      },
      {
        userId: user.id,
        title: 'Résultats disponibles',
        message: 'Vos résultats de tonométrie sont disponibles. Consultez-les dans la section Résultats.',
        type: 'result',
        read: false,
        link: '/test-results',
      },
      {
        userId: user.id,
        title: 'Renouvellement approuvé',
        message: 'Votre demande de renouvellement pour Timolol 0.5% a été approuvée par Dr. Kouassi Martin.',
        type: 'prescription',
        read: true,
        link: '/prescriptions',
      },
      {
        userId: user.id,
        title: 'Rappel de rendez-vous',
        message: `N'oubliez pas votre examen de la vue avec Dr. Coulibaly Amina le ${future2.toLocaleDateString('fr-FR')}.`,
        type: 'reminder',
        read: false,
        link: '/appointments',
      },
      {
        userId: user.id,
        title: 'Bienvenue sur le portail',
        message: 'Bienvenue sur le portail patient du Centre Medical Danan. Explorez vos dossiers médicaux.',
        type: 'info',
        read: true,
        link: '/',
      },
    ],
  })

  console.log('✅ Notifications created')
  console.log('')
  console.log('🎉 Seed completed!')
  console.log('   📧 Email: test@demo.com')
  console.log('   🔑 Password: Test1234')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
