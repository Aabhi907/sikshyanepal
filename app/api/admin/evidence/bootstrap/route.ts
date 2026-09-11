import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(){
  if(!(await isStaff(['editor','owner'])))return NextResponse.json({error:'Editor access required'},{status:403})
  const db=createAdminSupabaseClient()
  const {data:colleges,error:collegeError}=await db.from('colleges').select('id,name,affiliation,programs_offered,phone,email,website,source_name,source_url,last_verified_at').or('status.eq.active,status.is.null').not('source_url','is',null).order('created_at',{ascending:true}).limit(50)
  if(collegeError)return NextResponse.json({error:collegeError.message},{status:500})
  const ids=(colleges||[]).map(college=>college.id)
  const {data:existing,error:existingError}=await db.from('college_evidence').select('college_id,field_key,source_url').in('college_id',ids)
  if(existingError)return NextResponse.json({error:existingError.code==='42P01'?'Run migration 20261008_college_evidence_ledger.sql first.':existingError.message},{status:existingError.code==='42P01'?503:500})
  const known=new Set((existing||[]).map(item=>`${item.college_id}|${item.field_key}|${item.source_url}`)),rows:Record<string,unknown>[]=[]
  for(const college of colleges||[]){
    if(!/^https:\/\//i.test(college.source_url||''))continue
    const candidates=[
      college.affiliation&&{field_key:'affiliation',claim_summary:`${college.name} is listed as affiliated with ${college.affiliation}.`},
      college.programs_offered&&{field_key:'programs',claim_summary:`The profile source lists these programmes for ${college.name}: ${college.programs_offered}.`},
      (college.phone||college.email||college.website)&&{field_key:'contact',claim_summary:`Contact information is listed for ${college.name}: ${[college.phone,college.email,college.website].filter(Boolean).join(', ')}.`},
    ].filter(Boolean) as {field_key:string;claim_summary:string}[]
    for(const candidate of candidates){const key=`${college.id}|${candidate.field_key}|${college.source_url}`;if(known.has(key))continue;known.add(key);rows.push({college_id:college.id,field_key:candidate.field_key,claim_summary:candidate.claim_summary.slice(0,500),source_name:college.source_name||'Existing college profile source',source_url:college.source_url,checked_at:college.last_verified_at||new Date().toISOString(),confidence_score:60,verification_status:'pending',extraction_method:'structured_import'})}
  }
  if(!rows.length)return NextResponse.json({created:0,message:'No new sourced profile fields were available.'})
  const {data,error}=await db.from('college_evidence').insert(rows).select('id')
  if(error)return NextResponse.json({error:error.message},{status:500})
  await writeAudit('evidence.bootstrap','college_evidence',undefined,{college_count:ids.length,evidence_created:data?.length||0})
  return NextResponse.json({created:data?.length||0,colleges_scanned:ids.length})
}
