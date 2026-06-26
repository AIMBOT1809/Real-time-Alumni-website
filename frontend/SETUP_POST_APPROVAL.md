# Quick Setup Guide - Post Approval System

## Step-by-Step Setup Instructions

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com
   - Open your project
   - Navigate to: SQL Editor (left sidebar)

2. **Run the Migration Script**:
   - Click "New Query"
   - Copy the entire content from `database/post_approval_migration.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl/Cmd + Enter`
   - Wait for "Success" message

3. **Verify the Changes**:
   ```sql
   -- Check if new columns exist
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns 
   WHERE table_name = 'posts' 
   AND column_name IN ('status', 'rejection_reason', 'reviewed_by', 'reviewed_at');
   ```

   Expected output: 4 rows showing the new columns

### Step 2: Update Existing Posts (If Any)

If you have existing posts in your database, they need a status:

```sql
-- Set all existing posts to 'approved' (backward compatibility)
UPDATE posts 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- Verify
SELECT COUNT(*), status 
FROM posts 
GROUP BY status;
```

### Step 3: Enable Realtime (If Not Already Enabled)

```sql
-- Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Verify
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'posts';
```

### Step 4: Test the System

#### Test 1: Admin Login
1. Login with admin credentials:
   - Email: `alumniconnect03@gmail.com`
   - Password: `Alumni123@`
2. Navigate to Admin Dashboard
3. Verify "Post Approval" card is visible
4. Check the pending count

#### Test 2: Create Test Post as Alumni
1. Logout from admin
2. Login as an alumni user
3. Create a new post (Community or Dashboard)
4. After submission, verify you see: "Your post has been submitted for admin approval..."
5. Check that the post is NOT visible in your feed

#### Test 3: Approve Post as Admin
1. Login as admin again
2. Go to Admin Dashboard → Post Approval
3. You should see the test post in "Pending" tab
4. Click "Approve"
5. Verify post moves to "Approved" tab
6. Logout and login as alumni
7. Verify the post is now visible in feeds

#### Test 4: Reject Post
1. As alumni, create another test post
2. As admin, go to Post Approval
3. Click "Reject" on the post
4. Enter a reason: "Test rejection - inappropriate content"
5. Confirm rejection
6. Verify post moves to "Rejected" tab
7. Verify post is NOT visible to regular users

### Step 5: Configure Storage (If Using Images)

Ensure posts storage bucket exists:

1. Go to Supabase → Storage
2. Check if "posts" bucket exists
3. If not, create it:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('posts', 'posts', true)
   ON CONFLICT (id) DO NOTHING;
   ```

### Step 6: Deploy to Production

#### Option A: Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```

2. Upload `dist` folder to your hosting service

#### Option B: Automated Deployment (Vercel)
1. Push changes to GitHub
2. Vercel will auto-deploy
3. Remember to set environment variables in Vercel dashboard

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] All 4 new columns exist in posts table
- [ ] Existing posts have status = 'approved'
- [ ] Realtime is enabled for posts table
- [ ] Post Approval page is accessible at `/admin/post-approval`
- [ ] Alumni posts create with status = 'pending'
- [ ] Admin posts create with status = 'approved'
- [ ] Pending posts are hidden from non-admin users
- [ ] Approve button works correctly
- [ ] Reject button works with reason modal
- [ ] Search functionality works
- [ ] Tab switching works (Pending/Approved/Rejected)
- [ ] Real-time updates work (new posts appear automatically)
- [ ] Empty states display correctly

## Common Issues and Solutions

### Issue: "column does not exist" error
**Solution**: Migration script didn't run. Re-run the migration SQL.

### Issue: Admin can't see pending posts
**Solution**: 
- Check if user role is actually 'admin' in database
- Verify query is not filtering by status
- Check browser console for errors

### Issue: Posts not visible after approval
**Solution**:
- Clear browser localStorage
- Hard refresh the page (Ctrl+Shift+R)
- Check post status in database
- Verify RLS policies

### Issue: Realtime updates not working
**Solution**:
```sql
-- Enable realtime for specific events
ALTER TABLE posts REPLICA IDENTITY FULL;

-- Re-enable publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
```

### Issue: "Access Denied" even for admin
**Solution**:
- Verify admin user in localStorage
- Check user.role === 'admin'
- Re-login as admin
- Check AuthContext

## Testing Queries

Use these SQL queries to test the system:

```sql
-- 1. Check all posts with their status
SELECT id, alumni_id, content, status, created_at, reviewed_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;

-- 2. Count posts by status
SELECT status, COUNT(*) as count
FROM posts
GROUP BY status;

-- 3. View pending posts with author details
SELECT 
    p.id,
    p.content,
    p.status,
    ap.First_Name || ' ' || ap.Last_name as author,
    ap.Email_Address as email
FROM posts p
LEFT JOIN alumni_profiles ap ON p.alumni_id = ap.user_id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- 4. View rejected posts with reasons
SELECT 
    id,
    content,
    rejection_reason,
    reviewed_by,
    reviewed_at
FROM posts
WHERE status = 'rejected'
ORDER BY reviewed_at DESC;

-- 5. Test RLS policy (run as authenticated user)
SET ROLE authenticated;
SELECT * FROM posts WHERE status = 'pending';
-- Should return 0 rows for non-admin users
RESET ROLE;
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend (if separate)
BACKEND_PORT=5000
NODE_ENV=development
```

## Next Steps After Setup

1. **Train Administrators**:
   - Show them how to access Post Approval
   - Explain approval and rejection process
   - Set guidelines for what to approve/reject

2. **Notify Alumni**:
   - Inform them about the new approval process
   - Let them know posts won't be immediately visible
   - Provide estimated approval timeframe

3. **Monitor the System**:
   - Check pending queue daily
   - Review approval/rejection patterns
   - Gather feedback from users

4. **Optimize**:
   - Add email notifications (future enhancement)
   - Create approval guidelines document
   - Set up performance monitoring

## Support

If you encounter issues:

1. **Check Browser Console**: Look for error messages
2. **Check Database**: Verify data structure and content
3. **Check Network Tab**: Look for failed API calls
4. **Review Logs**: Check Supabase logs for errors
5. **Contact Support**: Provide error messages and screenshots

---

**Ready to Launch!** 🚀

Once all verification steps pass, your Post Approval system is ready for production use.