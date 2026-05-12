import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ShieldCheck, Calendar, Users, PawPrint, Settings } from "lucide-react"
import Link from "next/link"

const adminLinks = [
  { href: "/admin", label: "Bookings", icon: Calendar },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const isEmailAdmin = adminEmails.includes(user.email || "")
  const isRoleAdmin = profile?.role === 'admin'

  if (!isEmailAdmin && !isRoleAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-primary/5">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="text-lg font-bold">Admin Panel</h2>
          </div>
          <p className="text-xs text-muted-foreground">Managing PawCare System</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-xs font-bold text-primary uppercase">Admin Mode</p>
            <p className="text-[10px] text-muted-foreground mt-1">Logged in as {user.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
        {children}
      </main>
    </div>
  )
}
