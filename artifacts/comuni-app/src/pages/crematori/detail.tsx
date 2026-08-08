import { useParams, Link } from "wouter"
import { useGetCrematorio, getGetCrematorioQueryKey, useListModuli } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit2 } from "lucide-react"
import { ModuloFileLink } from "@/components/modulo-file-link"

export function CrematorioDetail() {
  const params = useParams()
  const id = Number(params.id)
  
  const { data: crematorio, isLoading } = useGetCrematorio(id, { query: { enabled: !!id, queryKey: getGetCrematorioQueryKey(id) } })
  const { data: moduli } = useListModuli({ entityType: 'crematorio', entityId: id })

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Caricamento in corso...</div>
  if (!crematorio) return <div className="py-12 text-center text-muted-foreground">Crematorio non trovato.</div>

  const Section = ({ title, content }: { title: string, content?: string | null }) => {
    if (!content) return null
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{title}</h4>
        <div className="text-foreground whitespace-pre-wrap leading-relaxed text-sm bg-secondary/20 p-4 rounded-md border border-secondary/30">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crematori">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{crematorio.nome}</h1>
            {(crematorio.citta || crematorio.provincia) && (
              <p className="text-muted-foreground font-medium">
                {crematorio.citta} {crematorio.provincia ? `(${crematorio.provincia})` : ''}
              </p>
            )}
          </div>
        </div>
        <Link href={`/crematori/${id}/edit`}>
          <Button>
            <Edit2 className="mr-2 h-4 w-4" /> Modifica
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Contatti & Sede</CardTitle>
          </CardHeader>
          <CardContent>
            {crematorio.indirizzo && (
              <div className="mb-4">
                <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Indirizzo</span>
                <span className="text-foreground">{crematorio.indirizzo}</span>
              </div>
            )}
            {crematorio.telefono && (
              <div className="mb-4">
                <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Telefono</span>
                <a href={`tel:${crematorio.telefono}`} className="text-primary hover:underline">{crematorio.telefono}</a>
              </div>
            )}
            {crematorio.email && (
              <div className="mb-4">
                <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Email</span>
                <a href={`mailto:${crematorio.email}`} className="text-primary hover:underline">{crematorio.email}</a>
              </div>
            )}
            {crematorio.referente && (
              <div className="mb-4">
                <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Referente</span>
                <span className="text-foreground">{crematorio.referente}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Procedure e Info</CardTitle>
          </CardHeader>
          <CardContent>
            <Section title="Orari Apertura" content={crematorio.orariApertura} />
            <Section title="Costi Cremazione" content={crematorio.costiCremazione} />
            <Section title="Modalità Prenotazione" content={crematorio.modalitaPrenotazione} />
            <Section title="Documenti Richiesti" content={crematorio.documentiRichiesti} />
            <Section title="Note Extra" content={crematorio.note} />
          </CardContent>
        </Card>

        {moduli && moduli.length > 0 && (
          <Card className="md:col-span-2 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Moduli e Documenti Collegati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduli.map(mod => (
                  <div key={mod.id} className="p-4 border rounded-lg bg-secondary/10 flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-foreground">{mod.nome}</h5>
                      {mod.descrizione && <p className="text-xs text-muted-foreground mt-1">{mod.descrizione}</p>}
                    </div>
                    <ModuloFileLink
                      moduloId={mod.id}
                      fileKey={mod.fileKey}
                      fileName={mod.fileName}
                      legacyUrl={mod.url}
                      compact
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
