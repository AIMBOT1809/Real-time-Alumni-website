# Alumni Post Approval Workflow - Implementation Guide

## Overview

The Alumni Post Approval Workflow ensures that all posts created by alumni are reviewed by administrators before being visible to students, alumni, and faculty members. This maintains content quality and prevents inappropriate content from being published.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Alumni Creates Post                       │
│                          ↓                                   │
│              Post saved with status="pending"                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Admin Post Approval Page                    │
│  • View pending posts with author details                   │
│  • See post content, images, attachments                    │
│  • Approve or Reject posts                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
┌─────────────────────┐   ┌─────────────────────┐
│   APPROVED          │   │    REJECTED         │
│  status="approved"  │   │  status="rejected"  │
│  Visible to all     │   │  + rejection reason │
└─────────────────────┘   └─────────────────────┘
```

## Database Schema Changes

### New Fields Added to `posts` Table:

```sql
- status: TEXT (pending | approved | rejected) - Default: 'pending'
- rejection_reason: TEXT - Reason for rejection
- reviewed_by: TEXT - Admin user ID who reviewed
- reviewed_at: TIMESTAMP - When the post was reviewed
```

### Run the Migration:

1. Open your Supabase project SQL Editor
2. Run the SQL script from: `database/post_approval_migration.sql`
3. Verify the changes:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'posts';
   ```

## Features Implemented

### 1. Post Creation with Pending Status
- When an **Alumni** creates a post, it's saved with `status = "pending"`
- When an **Admin** creates a post, it's auto-approved with `status = "approved"`
- Alumni see a confirmation message: "Your post has been submitted for admin approval"

### 2. Post Visibility Control
- **Students, Alumni, Faculty**: Only see posts with `status = "approved"`
- **Admins**: Can see all posts (pending, approved, rejected)
- Posts are filtered at the database query level for security

### 3. Admin Post Approval Dashboard

#### Access:
- Navigate to Admin Dashboard → Click "Post Approval" card
- Direct URL: `/admin/post-approval`

#### Features:
- **Three Tabs**: Pending, Approved, Rejected
- **Real-time Updates**: Auto-refreshes when posts are created/updated
- **Search Functionality**: Search by content, title, author name, or email
- **Post Details Displayed**:
  - Alumni name and avatar
  - Alumni role and college
  - Post title and content
  - Uploaded images (displayed inline)
  - File attachments
  - Post type and created date
  - Like and comment counts

#### Actions:
- **Approve**: Updates status to "approved", makes post visible to all users
- **Reject**: Opens modal to enter rejection reason, updates status to "rejected"

### 4. Empty States
Clean, user-friendly empty states for each tab:
- Pending: "All posts have been reviewed"
- Approved: "No posts have been approved yet"
- Rejected: "No posts have been rejected yet"

### 5. Security Features
- Only admins can access the approval page
- Non-admins see "Access Denied" message
- Row Level Security (RLS) policies ensure:
  - Users can only see approved posts (unless admin)
  - Only admins can update post status
  - Alumni can only create posts, not approve them

## Usage Instructions

### For Alumni (Post Creators):

1. **Create a Post**:
   - Go to Community or Dashboard
   - Click "Create Post" or "+" button
   - Fill in title, content, upload images/files
   - Click "Post" or "Submit"

2. **Post Submission**:
   - Post is saved with status "pending"
   - You see: "Your post has been submitted for admin approval..."
   - Post is NOT visible in your feed or other users' feeds yet

3. **Check Post Status**:
   - Your pending posts won't appear in public feeds
   - Once approved, they'll appear normally
   - If rejected, you may see the rejection reason (future feature)

### For Admins:

1. **Access Post Approval**:
   - Login as admin
   - Go to Admin Dashboard
   - Click "Post Approval" card (shows pending count)

2. **Review Pending Posts**:
   - See all posts awaiting review
   - View complete post details including:
     - Author information
     - Post content
     - Images and attachments
   - Use search to find specific posts

3. **Approve a Post**:
   - Click "Approve" button on the post
   - Post status changes to "approved"
   - Post immediately becomes visible to all users
   - Success message confirms approval

4. **Reject a Post**:
   - Click "Reject" button
   - Enter rejection reason in the modal
   - Click "Confirm Rejection"
   - Post status changes to "rejected"
   - Post remains hidden from public view
   - Rejection reason is saved for reference

5. **View History**:
   - Switch to "Approved" tab to see all approved posts
   - Switch to "Rejected" tab to see rejected posts with reasons
   - Search across all tabs

## File Changes Made

### New Files Created:
1. `src/app/pages/PostApproval.tsx` - Complete approval UI component
2. `database/post_approval_migration.sql` - Database migration script
3. `POST_APPROVAL_GUIDE.md` - This documentation

### Modified Files:
1. `src/app/data/types.ts`:
   - Added `status`, `rejectionReason`, `reviewedBy`, `reviewedAt` fields to Post interface

2. `src/app/context/AuthContext.tsx`:
   - Modified `addPost` function to set status based on user role
   - Modified `fetchPosts` to filter by status for non-admin users
   - Added console logging for debugging

3. `src/app/routes.tsx`:
   - Added route: `/admin/post-approval`

4. `src/app/pages/AdminDashboard.tsx`:
   - Added Post Approval card with pending count
   - Linked to approval page

## Testing Checklist

### ✅ Post Creation
- [ ] Alumni creates post → status is "pending"
- [ ] Admin creates post → status is "approved"
- [ ] Post appears in Post Approval dashboard immediately
- [ ] Alumni sees confirmation message

### ✅ Post Visibility
- [ ] Pending posts NOT visible in student dashboard
- [ ] Pending posts NOT visible in alumni feed
- [ ] Pending posts NOT visible in faculty dashboard
- [ ] Approved posts visible to all users
- [ ] Rejected posts NOT visible to regular users

### ✅ Admin Approval Workflow
- [ ] Admin can access Post Approval page
- [ ] Pending tab shows all pending posts
- [ ] Post details display correctly (author, content, images)
- [ ] Approve button works and updates status
- [ ] Approved post appears in user feeds immediately
- [ ] Approved tab shows all approved posts

### ✅ Admin Rejection Workflow
- [ ] Reject button opens modal
- [ ] Rejection requires entering a reason
- [ ] Reject confirmation updates status
- [ ] Rejected post disappears from public view
- [ ] Rejected tab shows rejected posts with reasons

### ✅ Search and Filters
- [ ] Search works across post content
- [ ] Search works for author names
- [ ] Tab switching works correctly
- [ ] Counts update in real-time

### ✅ Security
- [ ] Non-admin users cannot access approval page
- [ ] Non-admin users cannot see pending posts
- [ ] RLS policies prevent unauthorized access

## Console Logging

The system includes comprehensive logging for debugging:

```javascript
// Post Creation
console.log('[AuthContext] Creating post with status:', status, 'for user role:', role);
console.log("[AuthContext] Post creation - INSERT ROW:", insertRow);
console.log("[AuthContext] Post creation - SUPABASE ERROR:", error);

// Post Fetching
console.log('[AuthContext] posts loaded, count =', mapped.length, 
           'status filter:', user?.role !== 'admin' ? 'approved only' : 'all');

// Post Approval
console.log('[PostApproval] Fetching posts for admin...');
console.log('[PostApproval] Posts loaded:', mappedPosts.length);
console.log('[PostApproval] Approving post:', postId);
console.log('[PostApproval] Post approved successfully');
console.log('[PostApproval] Rejecting post:', postId, 'Reason:', reason);
console.log('[PostApproval] Realtime update:', payload);
```

## Troubleshooting

### Issue: Posts not appearing in approval dashboard
**Solution**: 
1. Check browser console for errors
2. Verify Supabase connection
3. Run migration script again
4. Check RLS policies

### Issue: Approved posts not visible to users
**Solution**:
1. Verify post status is "approved" in database
2. Check fetchPosts query in AuthContext
3. Clear localStorage and refresh
4. Check console for filter logs

### Issue: Cannot approve/reject posts
**Solution**:
1. Verify user is logged in as admin
2. Check browser console for errors
3. Verify Supabase permissions
4. Test database connection

### Issue: Real-time updates not working
**Solution**:
1. Check Supabase realtime is enabled for posts table
2. Verify channel subscription in browser console
3. Refresh the page manually

## Best Practices

1. **Always Review Carefully**: Check post content, images, and context before approving
2. **Provide Clear Rejection Reasons**: Help alumni understand why their post was rejected
3. **Monitor Pending Queue**: Check the dashboard regularly to avoid delays
4. **Use Search**: Quickly find specific posts or authors
5. **Check All Tabs**: Review approved and rejected posts periodically

## Future Enhancements

Potential improvements for the system:

1. **Email Notifications**: Notify alumni when their posts are approved/rejected
2. **Bulk Actions**: Approve/reject multiple posts at once
3. **Edit Pending Posts**: Allow admins to edit posts before approval
4. **Appeal System**: Let alumni appeal rejected posts
5. **Analytics**: Track approval rates, response times, common rejection reasons
6. **Scheduled Posts**: Auto-approve posts at specific times
7. **Multiple Approvers**: Require multiple admin approvals for sensitive content
8. **Content Moderation AI**: Auto-flag potentially inappropriate content

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify database migration was run correctly
3. Review this guide thoroughly
4. Contact development team with:
   - Error messages
   - Steps to reproduce
   - Screenshots of the issue
   - Browser console logs