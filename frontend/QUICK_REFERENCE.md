# Post Approval System - Quick Reference Card

## 🚀 Quick Start

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- database/post_approval_migration.sql
```

### 2. Access Post Approval
```
URL: /admin/post-approval
Login: alumniconnect03@gmail.com / Alumni123@
```

### 3. Test the System
1. Create post as alumni → Status: Pending
2. Login as admin → Go to Post Approval
3. Approve or Reject the post

---

## 📋 Key Concepts

| Concept | Description |
|---------|-------------|
| **Pending** | Post awaiting admin review (hidden from users) |
| **Approved** | Post reviewed and published (visible to all) |
| **Rejected** | Post denied with reason (hidden from users) |

---

## 🎯 User Roles & Permissions

### Alumni
- ✅ Create posts (status: pending)
- ✅ View approved posts only
- ❌ Cannot approve own posts
- ❌ Cannot see pending/rejected posts

### Admin
- ✅ Create posts (status: approved, auto-published)
- ✅ View all posts (pending, approved, rejected)
- ✅ Approve/reject any post
- ✅ Access Post Approval dashboard

### Students & Faculty
- ✅ View approved posts only
- ❌ Cannot create posts
- ❌ Cannot see pending/rejected posts

---

## 🔑 Important Files

```
src/app/pages/PostApproval.tsx         → Main approval UI
src/app/context/AuthContext.tsx        → Post creation logic
src/app/data/types.ts                  → Post type definition
database/post_approval_migration.sql   → Database schema
```

---

## 💾 Database Schema

```sql
posts table:
├── id (UUID)
├── alumni_id (TEXT)
├── content (TEXT)
├── status (TEXT) ← NEW: 'pending' | 'approved' | 'rejected'
├── rejection_reason (TEXT) ← NEW
├── reviewed_by (TEXT) ← NEW
├── reviewed_at (TIMESTAMP) ← NEW
└── created_at (TIMESTAMP)
```

---

## 🎨 UI Components

### Post Approval Dashboard
- **Location**: `/admin/post-approval`
- **Tabs**: Pending | Approved | Rejected
- **Features**: Search, Filter, Real-time updates
- **Actions**: Approve, Reject (with reason)

### Admin Dashboard Card
- **Shows**: Pending post count
- **Link**: To Post Approval page
- **Color**: Yellow highlight

---

## 🔄 Workflow Diagrams

### Alumni Post Creation
```
Alumni → Create Post → Save (status: pending) 
→ Alert shown → Post hidden from public
→ Appears in Admin Approval
```

### Admin Approval
```
Admin → Post Approval → Review Post
→ Approve: status = approved, visible to all
→ Reject: status = rejected, enter reason, hidden
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Posts not appearing | Run migration, check RLS policies |
| Can't approve posts | Verify admin role, check console logs |
| Realtime not working | Enable Supabase realtime for posts table |
| Build errors | Run `npm install`, check TypeScript |

---

## 📞 Console Commands

### Check Post Status
```sql
SELECT id, content, status, reviewed_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;
```

### Count by Status
```sql
SELECT status, COUNT(*) 
FROM posts 
GROUP BY status;
```

### View Pending with Authors
```sql
SELECT 
  p.id,
  p.content,
  ap.First_Name || ' ' || ap.Last_name as author
FROM posts p
LEFT JOIN alumni_profiles ap ON p.alumni_id = ap.user_id
WHERE p.status = 'pending';
```

---

## 🎓 Testing Checklist

Quick tests to verify everything works:

- [ ] Alumni creates post → Status is pending
- [ ] Admin creates post → Status is approved
- [ ] Pending posts hidden from non-admins
- [ ] Admin can access /admin/post-approval
- [ ] Pending tab shows pending posts
- [ ] Approve button works
- [ ] Reject modal requires reason
- [ ] Approved posts visible to all
- [ ] Rejected posts hidden from all
- [ ] Search works
- [ ] Real-time updates work

---

## 🔐 Security Checks

- [ ] RLS policies active on posts table
- [ ] Non-admin users cannot update post status
- [ ] Direct API calls validate user role
- [ ] /admin/post-approval blocked for non-admins
- [ ] Status field cannot be manipulated by users

---

## 📊 Metrics to Monitor

- **Pending Queue Size**: Keep under 10 for good UX
- **Average Approval Time**: Target < 24 hours
- **Rejection Rate**: Track for training needs
- **Admin Activity**: Ensure regular reviews

---

## 🚨 Emergency Procedures

### Reset All to Approved (Use with caution!)
```sql
UPDATE posts SET status = 'approved' WHERE status = 'pending';
```

### Disable Approval (Emergency bypass)
```sql
-- Temporarily make all new posts approved
-- Update AuthContext.tsx, change:
const postStatus = 'approved'; // Force approved
```

### Rollback Migration
```sql
ALTER TABLE posts DROP COLUMN status;
ALTER TABLE posts DROP COLUMN rejection_reason;
ALTER TABLE posts DROP COLUMN reviewed_by;
ALTER TABLE posts DROP COLUMN reviewed_at;
```

---

## 📚 Documentation Links

- **Full Guide**: POST_APPROVAL_GUIDE.md
- **Setup Instructions**: SETUP_POST_APPROVAL.md
- **Implementation Details**: IMPLEMENTATION_SUMMARY.md
- **Deployment**: DEPLOYMENT_GUIDE.md

---

## 💡 Tips & Tricks

1. **Bulk Approval**: Select multiple, approve in sequence
2. **Quick Search**: Type author name to find their posts
3. **Empty Queue**: Check "All posts reviewed!" message
4. **Mobile Access**: Fully responsive design
5. **Keyboard Nav**: Tab through posts, Enter to expand

---

## 🎉 Success Indicators

✅ Pending count badge shows on admin dashboard
✅ Posts appear in approval list immediately
✅ Approve action updates status instantly
✅ Approved posts visible in all feeds
✅ Rejected posts stay hidden
✅ Search and filters work smoothly
✅ No console errors
✅ Real-time updates without refresh

---

**Questions?** Check the full documentation or console logs for details!