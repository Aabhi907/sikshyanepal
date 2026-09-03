import { notFound } from 'next/navigation'
import AdmissionForm from '@/components/admin/AdmissionForm'
import { createAdminSupabaseClient } from '@/lib/supabase'
import type { Admission } from '@/types'
export const dynamic = 'force-dynamic'
export default async function Page({ params }: { params: { id: string } }) { const { data } = await createAdminSupabaseClient().from('admissions').select('*').eq('id', params.id).single(); if (!data) notFound(); return <AdmissionForm initialData={data as Admission} admissionId={params.id} /> }

