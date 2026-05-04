const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
require('dotenv').config()

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations')
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(fullPath, 'utf8')
    console.log(`Running ${file}...`)
    await client.query(sql)
  }

  await client.end()
  console.log('Supabase migrations completed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})