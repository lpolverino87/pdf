import { useGetDashboardStats } from "@workspace/api-client-react"
import { Building2, Flame, Globe2, FileText, ArrowRight } from "lucide-react"
import { Link } from "wouter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats()
  const [search, setSearch] = useState("")

  const statCards = [
    { label: "Comuni", value: stats?.totalComuni, icon: Building2, href: "/comuni", color: "bg-blue-50 text-blue-700" },
    { label: "Crematori", value: stats?.totalCrematori, icon: Flame, href: "/crematori", color: "bg-orange-50 text-orange-700" },
    { label: "Nazioni", value: stats?.totalNazioni, icon: Globe2, href: "/nazioni", color: "bg-emerald-50 text-emerald-700" },
    { label: "Moduli", value: stats?.totalModuli, icon: FileText, href: "/moduli", color: "bg-purple-50 text-purple-700" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Panoramica del sistema di modulistica e contatti.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Link key={idx} href={stat.href} className="block group">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "-" : stat.value || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-serif">Ricerca Rapida</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); /* Could redirect to a global search, but we just link to comuni search for now */ }}>
            <Input 
              placeholder="Cerca un comune, crematorio o nazione..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md bg-background"
            />
            <Link href={`/comuni?search=${encodeURIComponent(search)}`}>
              <Button type="button">
                Cerca in Comuni <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
