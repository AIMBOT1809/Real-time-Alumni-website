# Alumni Highlights Feature - Setup Guide

## Overview
The Alumni Highlights feature allows admins to create and manage highlight posts with multiple images that are displayed in a carousel on the landing page.

## Features Implemented

### 1. Admin Dashboard Integration
- **Location**: Admin Dashboard → Home → Highlights tab
- **Features**:
  - Create new highlights with title, description, category, date, location
  - Upload multiple images per highlight
  - Image preview before publishing
  - List all highlights with status (Published/Draft)
  - Edit existing highlights
  - Delete highlights
  - Toggle publish/unpublish status

### 2. Landing Page Carousel
- **Location**: Main Dashboard (Landing Page)
- **Features**:
  - Full-width carousel displaying published highlights
  - Navigation arrows (previous/next)
  - Dot indicators for slide position
  - Thumbnail strip for quick navigation
  - Smooth transitions between slides
  - Displays category, title, description, date, location
  - Shows photo count for multi-image highlights

### 3. Database Schema
- **Table**: `alumni_highlights`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `title` (TEXT, Required)
  - `description` (TEXT, Required)
  - `category` (TEXT, Required) - Enum: Alumni Meet, Discussion, Guidance Session, Webinar, Guest Lecture, Event Memories, Other
  - `date` (DATE, Required)
  - `location` (TEXT, Optional)
  - `images` (TEXT[], Array of image URLs)
  - `published` (BOOLEAN, Default: false)
  - `created_at` (TIMESTAMP, Auto-generated)
  - `created_by` (UUID, Foreign key to auth.users)

### 4. Supabase Storage
- **Bucket**: `alumni-highlights`
- **Path**: `highlights/` for uploaded images
- **Public URLs**: Automatically generated for display

## Setup Instructions

### Step 1: Create Database Table

Run the SQL script in your Supabase SQL Editor:

```bash
# File location: backend/sql/create_alumni_highlights_table.sql
```

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `backend/sql/create_alumni_highlights_table.sql`
4. Click "Run" to execute the script

This will:
- Create the `alumni_highlights` table
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Create policies for admin management and public viewing
- Grant necessary permissions

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `alumni-highlights`
4. Set as "Public" bucket
5. Click "Create bucket"

### Step 3: Configure Storage Policies

In the Storage section, select the `alumni-highlights` bucket and add these policies:

**Policy 1: Allow public to view images**
```sql
CREATE POLICY "Public can view highlight images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'alumni-highlights');
```

**Policy 2: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload highlight images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'alumni-highlights');
```

**Policy 3: Allow authenticated users to update**
```sql
CREATE POLICY "Authenticated users can update highlight images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'alumni-highlights');
```

**Policy 4: Allow authenticated users to delete**
```sql
CREATE POLICY "Authenticated users can delete highlight images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'alumni-highlights');
```

### Step 4: Update AuthContext (Optional)

If you want to integrate highlights into the AuthContext for state management, add these methods:

```typescript
// In AuthContext.tsx

const [highlights, setHighlights] = useState<AlumniHighlight[]>([]);

const fetchHighlights = async () => {
  const data = await alumniHighlightsService.getPublishedHighlights();
  setHighlights(data);
};

const createHighlight = async (input: CreateHighlightInput) => {
  if (!user) return;
  const highlight = await alumniHighlightsService.createHighlight(input, user.id);
  setHighlights(prev => [highlight, ...prev]);
};

// Add other CRUD methods as needed
```

## File Structure

```
frontend/src/app/
├── components/
│   ├── AlumniHighlightsCarousel.tsx    # Carousel for landing page
│   └── ...
├── pages/
│   ├── AlumniHighlights.tsx            # Admin page for managing highlights
│   ├── AdminDashboard.tsx              # Updated with Highlights tab
│   └── MainDashboard.tsx               # Updated with carousel
├── services/
│   └── alumniHighlightsService.ts      # Supabase service functions
└── ALUMNI_HIGHLIGHTS_SETUP.md         # This file

backend/sql/
└── create_alumni_highlights_table.sql  # Database schema
```

## Usage

### For Admins

1. **Navigate to Admin Dashboard**
   - Go to `/admin`
   - Click on "Home" tab if not already selected

2. **Access Highlights Section**
   - Click "Highlights" button in the sub-navigation
   - Or click the "Alumni Highlights" card on the overview

3. **Create a Highlight**
   - Click "Create Highlight" button
   - Fill in the form:
     - Title (required)
     - Description (required)
     - Category (required)
     - Date (required)
     - Location (optional)
     - Images (multiple, required)
   - Click "Publish Highlight"

4. **Manage Highlights**
   - View all highlights in the list below
   - Click "Edit" to modify existing highlights
   - Click "Delete" to remove highlights
   - Click "Publish/Unpublish" to control visibility

### For Users (Landing Page)

1. **View Highlights**
   - Navigate to the main dashboard
   - The carousel appears at the top of the page
   - Only published highlights are displayed

2. **Navigate Carousel**
   - Use left/right arrows to navigate
   - Click dots to jump to specific slides
   - Click thumbnails at the bottom to preview

## Image Upload Flow

1. User selects multiple images via file input
2. Images are previewed locally using `URL.createObjectURL()`
3. On form submission:
   - Images are uploaded to Supabase Storage (`alumni-highlights` bucket)
   - Public URLs are returned
   - URLs are saved to the `images` array in the database
4. Carousel displays images using the stored URLs

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on the table
2. **Admin-Only Management**: Only users with `role = 'admin'` can create/edit/delete highlights
3. **Public Read Access**: Only published highlights are visible to non-authenticated users
4. **Storage Policies**: Proper policies restrict upload/delete to authenticated users

## Testing Checklist

- [ ] Database table created successfully
- [ ] Storage bucket created and configured
- [ ] Admin can create highlights with multiple images
- [ ] Images upload correctly to storage
- [ ] Image previews work in the form
- [ ] Highlights appear in admin list
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Publish/unpublish toggle works
- [ ] Carousel displays on landing page
- [ ] Only published highlights show in carousel
- [ ] Carousel navigation works (arrows, dots, thumbnails)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Real-time updates work (if using subscriptions)

## Troubleshooting

### Images not uploading
- Check Supabase Storage bucket exists
- Verify storage policies are configured
- Check browser console for errors
- Ensure file size is within limits (typically 50MB)

### Carousel not showing
- Verify highlights are published (`published = true`)
- Check browser console for errors
- Ensure at least one highlight exists with images
- Verify Supabase connection is working

### Permission errors
- Verify user has admin role in metadata
- Check RLS policies are correctly configured
- Ensure user is authenticated

## Next Steps

1. **Image Optimization**: Add image compression before upload
2. **Video Support**: Extend to support video highlights
3. **Scheduling**: Add scheduled publish dates
4. **Analytics**: Track carousel engagement
5. **Bulk Operations**: Import/export highlights
6. **Categories Management**: Allow custom categories

## Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- Project README: `frontend/README.md`
- Database Schema: `backend/sql/create_alumni_highlights_table.sql`