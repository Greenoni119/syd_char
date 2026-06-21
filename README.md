# WeddingShare

A private wedding photo and video sharing application built with Next.js, Supabase, and Tailwind CSS. Guests receive a QR code at the wedding that grants access to a private portal where they can upload, view, and download photos and videos without creating an account.

## Features

- **QR Code Access**: Guests scan a QR code to access the private gallery
- **Photo & Video Uploads**: Support for multiple file types with drag-and-drop
- **Gallery View**: Mobile-friendly gallery with infinite scrolling
- **Download All**: Generate ZIP archives of all wedding media
- **Admin Dashboard**: Manage media, invite tokens, and settings
- **Secure**: Token-based authentication, signed URLs, and search engine protection

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers, Server Actions
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Token-based guest authentication with HttpOnly cookies

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the SQL schema from `supabase/schema.sql` to create the required tables

### 2. Create Storage Bucket

1. In Supabase, go to Storage → Create a new bucket
2. Name it `wedding-media`
3. Make it **private** (not public)
4. Create two folders inside: `photos` and `videos`

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_random_secret_string
```

Get these values from your Supabase project settings:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (from API settings)
- `SESSION_SECRET`: Generate a random string for session encryption

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### For Guests

1. Scan the QR code provided at the wedding
2. You'll be redirected to the gallery
3. Upload photos and videos using the Upload button
4. Browse the gallery and download individual files
5. Use "Download All" to get everything as a ZIP file

### For Admins

1. Access the admin dashboard at `/admin`
2. View upload statistics (photos, videos, storage usage)
3. Manage uploaded media (delete inappropriate content)
4. Generate and manage invite tokens for QR codes
5. Toggle uploads and downloads on/off

## Security Features

- **Search Engine Protection**: `robots.txt` and metadata prevent indexing
- **Token-Based Access**: Only valid invite tokens grant access
- **Secure Sessions**: HttpOnly, Secure, SameSite=Strict cookies
- **Signed URLs**: All file downloads use time-limited signed URLs
- **Private Storage**: Files are never publicly accessible

## File Size Limits

- **Photos**: JPG, PNG, WebP, HEIC (max 100MB)
- **Videos**: MP4, MOV, HEVC (max 250MB)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add all the environment variables from step 3 to your deployment platform.

## Database Schema

The application uses three main tables:

- `invite_tokens`: Stores QR code tokens for guest access
- `guest_sessions`: Tracks active guest sessions
- `media`: Stores uploaded file metadata

See `supabase/schema.sql` for the complete schema.

## License

MIT
