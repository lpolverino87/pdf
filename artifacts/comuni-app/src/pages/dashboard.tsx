import { useGetDashboardStats, useListComuni, useListModuli } from "@workspace/api-client-react"
import { Building2, Flame, Globe2, FileText, ArrowRight, Search } from "lucide-react"
import { Link, useLocation } from "wouter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

function normalizeSearchTerm(value: string) {
  return value
    .toLocaleLowerCase("it-IT")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
}

export function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats()
  const { data: comuni } = useListComuni()
  const { data: moduli } = useListModuli()
  const [search, setSearch] = useState("")
  const [searchSubmitted, setSearchSubmitted] = useState(false)
  const [, setLocation] = useLocation()

  const normalizedSearch = normalizeSearchTerm(search)
  const matchingComuni = useMemo(() => {
    if (!normalizedSearch) return []
    return (comuni ?? []).filter((comune) =>
      normalizeSearchTerm(`${comune.nome} ${comune.provincia ?? ""}`).includes(normalizedSearch),
    )
  }, [comuni, normalizedSearch])

  const matchingModuli = useMemo(() => {
    if (!normalizedSearch) return []
    return (moduli ?? []).filter((modulo) =>
      normalizeSearchTerm(`${modulo.nome} ${modulo.descrizione ?? ""} ${modulo.fileName ?? ""}`).includes(normalizedSearch),
    )
  }, [moduli, normalizedSearch])

  const navigateToSearchResult = (type: "comune" | "modulo", id: number) => {
    setSearchSubmitted(false)
    setSearch("")
    setLocation(type === "comune" ? `/comuni/${id}` : `/moduli/${id}/edit`)
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchSubmitted(true)

    const exactComune = matchingComuni.find((comune) => normalizeSearchTerm(comune.nome) === normalizedSearch)
    if (exactComune) {
      navigateToSearchResult("comune", exactComune.id)
      return
    }

    const exactModulo = matchingModuli.find((modulo) => normalizeSearchTerm(modulo.nome) === normalizedSearch)
    if (exactModulo) {
      navigateToSearchResult("modulo", exactModulo.id)
      return
    }

    const totalMatches = matchingComuni.length + matchingModuli.length
    if (totalMatches === 1) {
      if (matchingComuni.length === 1) {
        navigateToSearchResult("comune", matchingComuni[0].id)
      } else {
        navigateToSearchResult("modulo", matchingModuli[0].id)
      }
    }
  }

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
          <form className="relative flex gap-2" onSubmit={handleSearch}>
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca un comune o un modulo..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setSearchSubmitted(false)
                }}
                className="bg-background pl-9"
                aria-label="Cerca comuni e moduli"
              />
              {normalizedSearch && (matchingComuni.length > 0 || matchingModuli.length > 0) && (
                <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-md border bg-card shadow-lg">
                  {matchingComuni.length > 0 && (
                    <div className="border-b p-2">
                      <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comuni</p>
                      {matchingComuni.slice(0, 5).map((comune) => (
                        <button
                          key={`comune-${comune.id}`}
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-secondary"
                          onClick={() => navigateToSearchResult("comune", comune.id)}
                        >
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>{comune.nome}</span>
                          {comune.provincia && <span className="text-xs text-muted-foreground">({comune.provincia})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {matchingModuli.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Moduli</p>
                      {matchingModuli.slice(0, 5).map((modulo) => (
                        <button
                          key={`modulo-${modulo.id}`}
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-secondary"
                          onClick={() => navigateToSearchResult("modulo", modulo.id)}
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{modulo.nome}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {searchSubmitted && normalizedSearch && matchingComuni.length === 0 && matchingModuli.length === 0 && (
                <p className="absolute left-0 top-12 z-20 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-lg">
                  Nessun comune o modulo trovato.
                </p>
              )}
            </div>
            <Button type="submit" disabled={!normalizedSearch}>
              Cerca <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
