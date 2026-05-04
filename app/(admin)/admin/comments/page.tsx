import { createAdminClient } from '@/lib/supabase/admin-client'
import { CommentActions } from './CommentActions'

export default async function AdminCommentsPage() {
  const db = createAdminClient()

  const { data: comments } = await db
    .from('community_comments')
    .select(`
      id, post_id, content, is_approved, created_at,
      profiles ( full_name ),
      community_posts ( content )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <CommentActions comments={comments ?? []} />
    </div>
  )
}
