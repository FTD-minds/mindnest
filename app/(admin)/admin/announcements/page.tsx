import { createAdminClient } from '@/lib/supabase/admin-client'
import { AnnouncementActions } from './AnnouncementActions'

export default async function AdminAnnouncementsPage() {
  const db = createAdminClient()

  const { data: announcements } = await db
    .from('nest_announcements')
    .select('id, title, content, is_pinned, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <AnnouncementActions announcements={announcements ?? []} />
    </div>
  )
}
