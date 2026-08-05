import { useParams, Link } from "wouter"
import { useGetComune, getGetComuneQueryKey, useListModuli } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit2, ExternalLink } from "lucide-react"

export function ComuneDetail() {
  const params = useParams()
  const id = Number(params.id)
  
  const { data: comune, isLoading } = useGetComune(id, { query: { enabled: !!id, queryKey: getGetComuneQueryKey(id) } })
  const { data: moduli } = useListModuli({ entityType: 'comune', entityId: id })

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Caricamento in corso...</div>
  if (!comune) return <div className="py-12 text-center text-muted-foreground">Comune non trovato.</div>

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
          <Link href="/comuni">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{comune.nome}</h1>
            {comune.provincia && <p className="text-muted-foreground font-medium">{comune.provincia}</p>}
          </div>
        </div>
        <Link href={`/comuni/${id}/edit`}>
          <Button>
            <Edit2 className="mr-2 h-4 w-4" /> Modifica
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Informazioni Generali</CardTitle>
          </CardHeader>
          <CardContent>
            <Section title="Orari Apertura" content={comune.orariApertura} />
            <Section title="Cimiteri" content={comune.cimiteri} />
            <Section title="Luoghi Dispersione" content={comune.luoghiDispersione} />
            <Section title="Affissioni" content={comune.affissioni} />
            <Section title="Lapide" content={comune.lapide} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Uffici e Contatti</CardTitle>
          </CardHeader>
          <CardContent>
            <Section title="Anagrafe Stato Civile" content={comune.anagrafeStatoCivile} />
            <Section title="Polizia Mortuaria" content={comune.poliziaMoreuaria} />
            <Section title="Necroscopica" content={comune.necroscopica} />
            <Section title="Necroforo" content={comune.necroforo} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Procedure e Costi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Section title="Impresa Incaricata Tumulazione" content={comune.impresaIncaricataTumulazione} />
              <Section title="Tumulazione Capella Privata" content={comune.tumulazioneCapellaPrivata} />
              <Section title="Listino di Tumulazione" content={comune.listinoDiTumulazione} />
            </div>
            <div>
              <Section title="Appuntamento Atto Morte" content={comune.appuntamentoAttoMorte} />
              <Section title="Moduli (Note)" content={comune.moduli} />
              <Section title="Note Costi / Pagamento" content={comune.noteCostiPagamento} />
            </div>
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
                    {mod.url && (
                      <a href={mod.url} target="_blank" rel="noreferrer" className="text-primary p-2 hover:bg-primary/10 rounded-md">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
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
