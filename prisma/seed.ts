import { PrismaClient } from '../src/generated/prisma/client.js'

import { getDatabaseUrl } from '../src/database-url.js'

import { PrismaPg } from '@prisma/adapter-pg'

// mesmo usuário de src/lib/dev-auth.ts (login automático em dev)
const DEV_USER = {
  id: 'dev-user',
  name: 'Dev',
  email: 'dev@focus.local',
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.user.upsert({
    where: { id: DEV_USER.id },
    update: {},
    create: { ...DEV_USER, emailVerified: true },
  })

  console.log(`✅ Usuário dev pronto (${DEV_USER.email})`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
