import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const fields=['affiliation','programs','fee','admission_deadline','scholarship','result','facilities','contact']
const methods=['manual','structured_import','automated_extraction']
const missing=(error:{code?:string}|null)=>error?.code==='42P01'

export async function GET(){
  if(!(await isStaff(['editor','owner'])))return NextResponse.json({error:'Editor access required'},{status:403})
  const {data,error}=await createAdminSupabaseClient().from('college_evidence').select('*,college:colleges(id,name,slug)').order('created_at',{ascending:false}).limit(500)
  if(missing(error))return NextResponse.json({setupRequired:true,items:[]})
  return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({setupRequired:false,items:data||[]})
}

export async function POST(request:Request){
  if(!(await isStaff(['editor','owner'])))return NextResponse.json({error:'Editor access required'},{status:403})
  const body=await request.json(),field=String(body.field_key||''),url=String(body.source_url||'').trim()
  if(!body.college_id||!fields.includes(field)||String(body.claim_summary||'').trim().length<3||!String(body.source_name||'').trim()||!/^https:\/\//i.test(url))return NextResponse.json({error:'College, field, claim, source name and an HTTPS source URL are required.'},{status:400})
  const row={college_id:body.college_id,field_key:field,claim_summary:String(body.claim_summary).trim().slice(0,500),source_name:String(body.source_name).trim().slice(0,200),source_url:url,source_published_at:body.source_published_at||null,checked_at:body.checked_at||new Date().toISOString(),confidence_score:Math.max(0,Math.min(100,Number(body.confidence_score)||0)),verification_status:'pending',extraction_method:methods.includes(body.extraction_method)?body.extraction_method:'manual'}
  const {data,error}=await createAdminSupabaseClient().from('college_evidence').insert(row).select('*,college:colleges(id,name,slug)').single()
  if(missing(error))return NextResponse.json({error:'Run migration 20261008_college_evidence_ledger.sql first.'},{status:503})
  if(error)return NextResponse.json({error:error.code==='23505'?'This source already supports the same current field.':error.message},{status:error.code==='23505'?409:500})
  await writeAudit('evidence.create','college_evidence',data.id,{college_id:body.college_id,field_key:field})
  return NextResponse.json(data,{status:201})
}
