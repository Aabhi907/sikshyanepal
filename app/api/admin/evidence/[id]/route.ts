import { NextResponse } from 'next/server'
import { getAuthContext, isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const statuses=['pending','source_verified','editor_verified','rejected']
export async function PATCH(request:Request,{params}:{params:{id:string}}){
  if(!(await isStaff(['editor','owner'])))return NextResponse.json({error:'Editor access required'},{status:403})
  const auth=await getAuthContext()
  const body=await request.json(),status=String(body.verification_status||'')
  if(!statuses.includes(status)&&body.action!=='supersede')return NextResponse.json({error:'Invalid evidence action.'},{status:400})
  const now=new Date().toISOString()
  const update=body.action==='supersede'?{superseded_at:now,updated_at:now}:{verification_status:status,reviewed_at:status==='pending'?null:now,reviewed_by:status==='pending'?null:auth?.user.id||null,updated_at:now}
  const {data,error}=await createAdminSupabaseClient().from('college_evidence').update(update).eq('id',params.id).select('*,college:colleges(id,name,slug)').single()
  if(error)return NextResponse.json({error:error.message},{status:500})
  await writeAudit(body.action==='supersede'?'evidence.supersede':'evidence.review','college_evidence',params.id,{status:status||'superseded'})
  return NextResponse.json(data)
}
