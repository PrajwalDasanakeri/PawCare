# PawCare 🐾

PawCare is a premium Pet Care Booking & Management System designed for pet grooming centers, vet clinics, and boarding businesses. Built with Next.js 15, Tailwind CSS, and Supabase.

## ✨ Features

- **Premium Landing Page**: Modern design with animations, hero section, and testimonials.
- **Customer Dashboard**: Manage pet profiles, track bookings, and book new services.
- **Admin Dashboard**: Manage all bookings, accept/reject requests, and view business stats.
- **Pet Profiles**: Comprehensive pet management including medical notes.
- **Booking System**: Multi-step booking flow with date/time selection.
- **Auth**: Secure email/password authentication via Supabase.
- **Dark Mode**: Full support for dark mode via `next-themes`.
- **Responsive**: Fully optimized for mobile and desktop.
- **WhatsApp Integration**: Floating contact button for quick support.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + RLS)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Form Handling**: React Hook Form + Zod

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd pawcare
```

### 2. Install dependencies
```bash
npm install
```

### 3. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Copy the contents of `supabase/schema.sql` and run it in the **SQL Editor** of your Supabase dashboard.
3. Enable **Email Auth** in Authentication > Providers.
4. Add your site URL to Authentication > URL Configuration (e.g., `http://localhost:3000`).

### 4. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ADMIN_EMAILS=admin@pawcare.com
NEXT_PUBLIC_WHATSAPP_NUMBER=15551234567
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Promote an Admin (Optional)
To give a user admin access via SQL:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 6. Run the app
```bash
npm run dev
```

## 📱 Screenshots
*(Place screenshots here)*

## 📄 License
MIT
