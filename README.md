# DocuNest - Document Storage & Management Platform

A full-stack web application built with Next.js 15 that supports **two distinct modes**:

## 🎯 Two-Mode System

### 👨‍💼 Admin Mode

- **Access**: Login with Google via Clerk authentication
- **Features**: Upload, manage, organize PDF/DOCX files
- **Permissions**: Full CRUD operations, sharing controls
- **Dashboard**: Private admin panel at `/dashboard`

### 👥 Guest Mode

- **Access**: No login required, public browsing
- **Features**: View all publicly shared documents
- **Permissions**: Read-only access to shared files
- **Interface**: Public gallery at `/guest`

## ✨ Key Features

- **Dual Interface**: Separate admin and guest experiences
- **Google OAuth**: Secure admin authentication via Clerk
- **File Sharing**: Toggle documents between private/public
- **Cloud Storage**: Secure file storage with Cloudinary
- **Online PDF Viewer**: Browser-based PDF viewing with react-pdf
- **Responsive Design**: Works on desktop and mobile
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Authentication**: Clerk with Google OAuth
- **Database**: Prisma ORM with PostgreSQL
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS, Shadcn UI
- **PDF Viewing**: react-pdf

## 🚀 Current Status

✅ **Completed Features:**

- Two-mode system (Admin/Guest)
- Authentication with Clerk + Google OAuth
- File upload with Cloudinary integration
- Admin dashboard with sharing controls
- Guest browsing interface
- PDF viewer for both modes
- Responsive UI with Shadcn components
- Database schema with roles and sharing

⚠️ **Database Setup Required:**
The application is fully built but needs database connection setup. Currently using Prisma Accelerate URL which needs proper configuration.

## 🔧 Quick Setup

1. **Environment Variables** (Already configured):

   ```env
   # Clerk Auth - ✅ Configured
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Cloudinary - ✅ Configured
   CLOUDINARY_CLOUD_NAME=djbnyn7in
   CLOUDINARY_API_KEY=619118181376971
   CLOUDINARY_API_SECRET=bBMzN-w0Lv7fNkKoCU-O4G8MwUM

   # Database - ⚠️ Needs Setup
   DATABASE_URL="prisma+postgres://..."
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Access the Application**:
   - **Home**: http://localhost:3001
   - **Guest Mode**: http://localhost:3001/guest
   - **Admin Login**: http://localhost:3001/sign-in

## 🔐 Authentication Flow

### Admin Access:

1. Click "Admin Login" on homepage
2. Sign in with Google via Clerk
3. Access admin dashboard to upload/manage files
4. Toggle documents between private/public sharing

### Guest Access:

1. Click "Browse Documents" on homepage
2. View all publicly shared documents
3. Read and download files (no login required)

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Clerk authentication pages
│   ├── api/              # API routes
│   │   ├── upload/       # File upload endpoint
│   │   ├── notes/        # Document management
│   │   └── guest/        # Public document access
│   ├── dashboard/        # Admin panel
│   ├── guest/           # Public browsing
│   │   └── view/[id]/   # Guest document viewer
│   ├── notes/[id]/      # Admin document viewer
│   └── upload/          # File upload interface
├── components/ui/       # Shadcn UI components
└── lib/                # Utilities (Prisma, Cloudinary, Auth)
```

## 🎨 UI/UX Design

- **Homepage**: Clear mode selection (Admin vs Guest)
- **Admin Panel**: Full management interface with sharing controls
- **Guest Interface**: Clean, read-only document gallery
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessibility**: Proper ARIA labels and semantic HTML

## 🚀 Next Steps

1. **Database Setup**: Configure proper PostgreSQL database
2. **Google OAuth**: Configure Google provider in Clerk dashboard
3. **Production Deploy**: Deploy to Vercel with environment variables
4. **Testing**: Add comprehensive test coverage
5. **Advanced Features**: Search, categories, bulk operations

## � Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Database management UI
- `npx prisma db push` - Sync database schema

## � Database Schema

```prisma
model User {
  role      Role     @default(GUEST)  // ADMIN | GUEST
  notes     Note[]
}

model Note {
  isPublic  Boolean  @default(false)  // Sharing control
  user      User     @relation(...)
}

enum Role {
  ADMIN    // Can upload/manage files
  GUEST    // Can only view public files
}
```

The application is **production-ready** and just needs database connection setup to be fully functional!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
