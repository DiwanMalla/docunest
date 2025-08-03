# 🚀 DocuNest

**Modern Document Storage, Sharing & Management Platform**

---

DocuNest is a full-stack, production-ready web application for secure document storage, sharing, and management. Built with the latest Next.js 15 App Router, it features a dual-mode system for both Admins and Guests, advanced sharing controls, and a beautiful, mobile-first UI.

---

## � Features at a Glance

- **Dual Mode:**
  - **Admin:** Upload, manage, and share documents with full CRUD, password protection, and public/private toggles.
  - **Guest:** Instantly browse and download all public documents, no login required.
- **Google OAuth:** Secure authentication via Clerk.
- **Cloud Storage:** Files stored and delivered via Cloudinary.
- **PDF & DOCX Viewer:** In-browser preview with react-pdf and Office Online.
- **Mobile-First UI:** Fully responsive, beautiful design with Tailwind CSS & shadcn/ui.
- **Clipboard Sharing:** One-click guest link copy for easy sharing.
- **Role-Based Access:** Prisma schema enforces Admin/Guest separation.
- **Production-Ready:** TypeScript, ESLint, and best practices throughout.

---

## �️ Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| **Frontend**   | Next.js 15 (App Router), React 18, TypeScript |
| **Styling**    | Tailwind CSS, shadcn/ui, CSS Modules          |
| **Auth**       | Clerk (Google OAuth)                          |
| **Database**   | PostgreSQL (via Prisma ORM)                   |
| **Storage**    | Cloudinary                                    |
| **PDF Viewer** | react-pdf, Office Online Embed                |
| **API**        | Next.js Route Handlers (RESTful)              |
| **CI/CD**      | Vercel (recommended), GitHub Actions          |
| **Other**      | ESLint, Prettier, Husky, dotenv               |

---

## 🎯 What You'll Learn

- Modern Next.js 15 App Router structure
- Secure authentication and role-based access
- File upload, cloud storage, and sharing logic
- Responsive UI/UX with Tailwind and shadcn/ui
- API route design and database schema with Prisma
- Real-world deployment and environment management

---

## 🖥️ Screenshots

<p align="center">
  <img src="https://user-images.githubusercontent.com/your-screenshot-dashboard.png" width="600" alt="Dashboard" />
  <br />
  <img src="https://user-images.githubusercontent.com/your-screenshot-guest.png" width="600" alt="Guest Gallery" />
</p>

---

## 📦 Project Structure

```text
src/
├── app/
│   ├── api/              # API routes (RESTful)
│   ├── dashboard/        # Admin dashboard
│   ├── guest/            # Guest browsing
│   ├── notes/[id]/       # Document viewers
│   ├── upload/           # File upload interface
│   └── ...
├── components/           # UI and logic components
├── lib/                  # Utilities (Prisma, Cloudinary, Auth)
├── styles/               # Global and component styles
└── prisma/               # Database schema & migrations
```

---

## ⚡ Quick Start

1. **Clone & Install:**
   ```bash
   git clone https://github.com/DiwanMalla/docunest.git
   cd docunest
   npm install
   ```
2. **Configure Environment:**

   - Copy `.env.example` to `.env.local` and fill in your own values:

     ```env
     # Clerk Auth
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
     CLERK_SECRET_KEY=your-clerk-secret-key

     # Cloudinary
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret

     # Database
     DATABASE_URL=your-database-url
     ```

3. **Run Locally:**
   ```bash
   npm run dev
   ```
4. **Visit:**
   - Home: http://localhost:3001
   - Guest: http://localhost:3001/guest
   - Admin: http://localhost:3001/sign-in

---

## 🔐 Authentication Flow

**Admin:**

1. Login with Google via Clerk
2. Access dashboard, upload/manage/share files
3. Toggle public/private, set download password

**Guest:**

1. Browse all public documents
2. View/download without login

---

## 🧩 Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  role      Role     @default(GUEST)
  notes     Note[]
}

model Note {
  id                String   @id @default(uuid())
  title             String
  description       String?
  fileUrl           String
  fileType          String
  fileName          String
  fileSize          Int?
  isPublic          Boolean  @default(false)
  passwordEnabled   Boolean  @default(false)
  downloadPassword  String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  userId            String
  user              User     @relation(fields: [userId], references: [id])
}

enum Role {
  ADMIN
  GUEST
}
```

---

## 📝 Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npx prisma studio` — Database management UI
- `npx prisma db push` — Sync database schema

---

## 🌐 Deployment

- **Vercel:** One-click deploy (recommended)
- **Custom:** Any Node.js hosting with PostgreSQL & Cloudinary

---

## 💡 What Makes DocuNest Unique?

- **Dual-Mode UX:** True separation of admin and guest flows
- **Modern UI:** shadcn/ui + Tailwind for a beautiful, accessible experience
- **Production-Ready:** Type safety, linting, and best practices
- **Learning-Focused:** Great for learning modern full-stack patterns

---

## 🙌 Author & Credits

- **Author:** [Diwan Malla](https://github.com/DiwanMalla)
- **Inspiration:** Modern SaaS platforms, shadcn/ui, Next.js best practices

---

## 🏆 What I Learned

- Next.js 15 App Router, API routes, and server components
- Clerk authentication and Google OAuth integration
- Cloudinary file storage and secure uploads
- Prisma ORM, schema design, and migrations
- Responsive, accessible UI with Tailwind and shadcn/ui
- Real-world deployment and environment management

---

## License

MIT
