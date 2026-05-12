import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LayoutDashboard, PawPrint, Calendar } from "lucide-react"
import Link from "next/link"

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/pets", label: "My Pets", icon: PawPrint },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-secondary/10">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r">
        <div className="p-6">
          <h2 className="text-lg font-bold text-primary">Customer Area</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {sidebarLinks.map((link) => (
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
        {children}
      </main>
    </div>
  )
}
