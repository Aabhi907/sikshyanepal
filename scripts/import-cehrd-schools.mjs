import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { createClient } from '@supabase/supabase-js'

function loadLocalEnv(filename) {
  const path = resolve(filename)
  if (!existsSync(path)) return

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    if (!(key in process.env)) process.env[key] = value
  }
}

function parseCsvLine(line) {
  const fields = []
  let field = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else {
      field += character
    }
  }
  fields.push(field)
  return fields
}

loadLocalEnv('.env.local')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local before importing. Never paste the service-role key into chat or commit it.')
}
if (serviceRoleKey === anonKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY must be the private service-role key, not the public anon key.')

const inputPath = resolve(process.argv[2] || 'data/imports/cehrd-schools-2026-09-08.csv')
if (!existsSync(inputPath)) throw new Error(`School import file not found: ${inputPath}. Run npm run schools:extract first.`)

const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
const reader = createInterface({ input: createReadStream(inputPath), crlfDelay: Infinity })
const batchSize = 500
let columns
let batch = []
let imported = 0

async function importBatch(rows) {
  const { error } = await client.from('schools').upsert(rows, { onConflict: 'iemis_code', ignoreDuplicates: false })
  if (error) throw new Error(`Supabase import failed after ${imported.toLocaleString()} rows: ${error.message}`)
  imported += rows.length
  process.stdout.write(`\rImported ${imported.toLocaleString()} schools`)
}

for await (const line of reader) {
  if (!line.trim()) continue
  const values = parseCsvLine(line)
  if (!columns) {
    columns = values
    continue
  }
  if (values.length !== columns.length) throw new Error(`Invalid CSV row near school ${imported + batch.length + 1}: expected ${columns.length} columns, received ${values.length}`)
  batch.push(Object.fromEntries(columns.map((column, index) => [column, values[index] || null])))
  if (batch.length >= batchSize) {
    await importBatch(batch)
    batch = []
  }
}
if (batch.length) await importBatch(batch)

const { count, error: countError } = await client.from('schools').select('id', { count: 'exact', head: true }).eq('status', 'active')
if (countError) throw new Error(`Import completed but verification failed: ${countError.message}`)
process.stdout.write(`\nImport complete. Supabase now has ${Number(count || 0).toLocaleString()} active schools available to /schools.\n`)
