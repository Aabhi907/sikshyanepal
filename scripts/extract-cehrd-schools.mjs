import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SCHOOLS_URL = 'https://emis.cehrd.gov.np/v1/api/iemisPortal/getAllOrganizationsForSchoolGIS'
const GEOGRAPHY_URL = 'https://emis.cehrd.gov.np/v1/api/iemisPortal/getAllProvinceWithDistrictAndMunicipality'
const SOURCE_PAGE = 'https://emis.cehrd.gov.np/school-gis'
const outputDir = resolve(process.argv[2] || 'data/imports')
const checkedAt = new Date().toISOString()
const dateTag = checkedAt.slice(0, 10)

function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 110)
}

function csv(value) {
  const text = value == null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function normalizeProvince(value) {
  return value.replace(/\s+Province$/i, '').replace(/^Bagamati$/i, 'Bagmati').trim()
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'SikshyaNepal school directory importer' } })
  if (!response.ok) throw new Error(`CEHRD request failed (${response.status}): ${url}`)
  const body = await response.json()
  if (!Array.isArray(body.data)) throw new Error(`Unexpected CEHRD response: ${url}`)
  return body.data
}

const [rawSchools, provinces] = await Promise.all([getJson(SCHOOLS_URL), getJson(GEOGRAPHY_URL)])
const provinceById = new Map()
const districtById = new Map()
const municipalityById = new Map()
for (const province of provinces) {
  provinceById.set(province.provinceId, normalizeProvince(province.provinceName))
  for (const district of province.districts || []) {
    districtById.set(district.districtId, district.districtName?.trim())
    for (const municipality of district.municipalities || []) municipalityById.set(municipality.municipalityId, municipality.municipalityName?.trim())
  }
}

const seenCodes = new Set()
const rows = []
const rejected = []
for (const school of rawSchools) {
  const match = String(school.name || '').trim().match(/^(\d{7,})\s*-\s*(.+)$/)
  const iemisCode = match?.[1]
  const name = match?.[2]?.trim()
  const province = provinceById.get(school.provinceId)
  const district = districtById.get(school.districtId)
  const localLevel = municipalityById.get(school.municipalityId)
  if (!iemisCode || !name || !province || !district || !localLevel || seenCodes.has(iemisCode)) {
    rejected.push({ ...school, reason: seenCodes.has(iemisCode) ? 'duplicate_iemis_code' : 'missing_required_field' })
    continue
  }
  seenCodes.add(iemisCode)
  rows.push({
    iemis_code: iemisCode,
    name,
    slug: `${slugify(name) || 'school'}-${iemisCode}`,
    province,
    district,
    local_level: localLevel,
    status: 'active',
    verification_status: 'source_verified',
    source_name: 'CEHRD Integrated Educational Management Information System (IEMIS)',
    source_url: SOURCE_PAGE,
    last_verified_at: checkedAt,
  })
}

rows.sort((a, b) => a.province.localeCompare(b.province) || a.district.localeCompare(b.district) || a.name.localeCompare(b.name))
const columns = ['iemis_code', 'name', 'slug', 'province', 'district', 'local_level', 'status', 'verification_status', 'source_name', 'source_url', 'last_verified_at']
const csvText = [columns.join(','), ...rows.map(row => columns.map(column => csv(row[column])).join(','))].join('\n') + '\n'
const batchSize = 5000
const batches = []
for (let offset = 0; offset < rows.length; offset += batchSize) {
  const batchNumber = String(batches.length + 1).padStart(2, '0')
  const filename = `cehrd-schools-${dateTag}-part-${batchNumber}.csv`
  const batchRows = rows.slice(offset, offset + batchSize)
  const content = [columns.join(','), ...batchRows.map(row => columns.map(column => csv(row[column])).join(','))].join('\n') + '\n'
  batches.push({ filename, count: batchRows.length, content })
}
const report = {
  extracted_at: checkedAt,
  official_sources: { schools: SCHOOLS_URL, geography: GEOGRAPHY_URL, public_page: SOURCE_PAGE },
  raw_records: rawSchools.length,
  accepted_records: rows.length,
  rejected_records: rejected.length,
  provinces: [...new Set(rows.map(row => row.province))],
  districts: new Set(rows.map(row => row.district)).size,
  municipalities: new Set(rows.map(row => row.local_level)).size,
  import_batches: batches.map(({ filename, count }) => ({ filename, count })),
  note: 'CEHRD public GIS supplies registry identity and geography. Contact, fee, facility, grade-range and marketing details are intentionally left blank until separately verified.',
}

await mkdir(outputDir, { recursive: true })
await Promise.all([
  writeFile(resolve(outputDir, `cehrd-schools-${dateTag}.csv`), csvText),
  writeFile(resolve(outputDir, `cehrd-schools-${dateTag}-report.json`), JSON.stringify(report, null, 2) + '\n'),
  writeFile(resolve(outputDir, `cehrd-schools-${dateTag}-rejected.json`), JSON.stringify(rejected, null, 2) + '\n'),
  ...batches.map(batch => writeFile(resolve(outputDir, batch.filename), batch.content)),
])
console.log(JSON.stringify(report, null, 2))
