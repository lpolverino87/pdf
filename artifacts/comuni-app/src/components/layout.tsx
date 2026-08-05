import * as React from "react"
import { Link, useLocation } from "wouter"
import { Building2, Flame, Globe2, FileText, Home } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/comuni", label: "Comuni", icon: Building2 },
  { href: "/crematori", label: "Crematori", icon: Flame },
  { href: "/nazioni", label: "Nazioni", icon: Globe2 },
  { href: "/moduli", label: "Moduli", icon: FileText },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex-shrink-0 flex flex-col">
        <div className="p-6 border-b h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-serif text-lg font-bold">
              M
            </div>
            <h1 className="font-serif font-bold text-lg text-card-foreground">Modulistica</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t text-xs text-muted-foreground text-center">
          Gestione Onoranze Funebri
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
