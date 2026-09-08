import { notFound } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import NewsForm from '@/components/admin/NewsForm'

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase.from('news').select('*').eq('id', params.id).single()
  if (!data) notFound()
  return <NewsForm initialData={{ ...data, published_date: data.published_date?.split('T')[0] }} newsId={params.id} isEdit />
}
