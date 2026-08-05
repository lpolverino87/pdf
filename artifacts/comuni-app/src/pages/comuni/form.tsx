import { useEffect } from "react"
import { useParams, useLocation, Link } from "wouter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreateComune, useUpdateComune, useGetComune, getGetComuneQueryKey, getListComuniQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const comuneSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  provincia: z.string().optional(),
  orariApertura: z.string().optional(),
  necroscopica: z.string().optional(),
  anagrafeStatoCivile: z.string().optional(),
  poliziaMoreuaria: z.string().optional(),
  cimiteri: z.string().optional(),
  necroforo: z.string().optional(),
  impresaIncaricataTumulazione: z.string().optional(),
  tumulazioneCapellaPrivata: z.string().optional(),
  lapide: z.string().optional(),
  affissioni: z.string().optional(),
  luoghiDispersione: z.string().optional(),
  listinoDiTumulazione: z.string().optional(),
  appuntamentoAttoMorte: z.string().optional(),
  moduli: z.string().optional(),
  noteCostiPagamento: z.string().optional(),
})

type ComuneFormData = z.infer<typeof comuneSchema>

export function ComuneForm() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEdit = !!id
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: comune, isLoading: isLoadingData } = useGetComune(id!, {
    query: { enabled: isEdit, queryKey: getGetComuneQueryKey(id!) }
  })

  const createMutation = useCreateComune()
  const updateMutation = useUpdateComune()

  const form = useForm<ComuneFormData>({
    resolver: zodResolver(comuneSchema),
    defaultValues: { nome: "" }
  })

  useEffect(() => {
    if (comune) {
      form.reset({
        nome: comune.nome,
        provincia: comune.provincia || "",
        orariApertura: comune.orariApertura || "",
        necroscopica: comune.necroscopica || "",
        anagrafeStatoCivile: comune.anagrafeStatoCivile || "",
        poliziaMoreuaria: comune.poliziaMoreuaria || "",
        cimiteri: comune.cimiteri || "",
        necroforo: comune.necroforo || "",
        impresaIncaricataTumulazione: comune.impresaIncaricataTumulazione || "",
        tumulazioneCapellaPrivata: comune.tumulazioneCapellaPrivata || "",
        lapide: comune.lapide || "",
        affissioni: comune.affissioni || "",
        luoghiDispersione: comune.luoghiDispersione || "",
        listinoDiTumulazione: comune.listinoDiTumulazione || "",
        appuntamentoAttoMorte: comune.appuntamentoAttoMorte || "",
        moduli: comune.moduli || "",
        noteCostiPagamento: comune.noteCostiPagamento || "",
      })
    }
  }, [comune, form])

  const onSubmit = (data: ComuneFormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: id!, data }, {
        onSuccess: (updated) => {
          toast({ title: "Comune aggiornato" })
          queryClient.invalidateQueries({ queryKey: getListComuniQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetComuneQueryKey(id!) })
          setLocation(`/comuni/${updated.id}`)
        }
      })
    } else {
      createMutation.mutate({ data }, {
        onSuccess: (created) => {
          toast({ title: "Comune creato" })
          queryClient.invalidateQueries({ queryKey: getListComuniQueryKey() })
          setLocation(`/comuni/${created.id}`)
        }
      })
    }
  }

  if (isEdit && isLoadingData) return <div className="py-12 text-center">Caricamento...</div>

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={isEdit ? `/comuni/${id}` : "/comuni"}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEdit ? "Modifica Comune" : "Nuovo Comune"}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome Comune *</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input id="provincia" {...form.register("provincia")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="orariApertura">Orari Apertura</Label>
              <Textarea id="orariApertura" {...form.register("orariApertura")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anagrafeStatoCivile">Anagrafe / Stato Civile</Label>
              <Textarea id="anagrafeStatoCivile" {...form.register("anagrafeStatoCivile")} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poliziaMoreuaria">Polizia Mortuaria</Label>
              <Textarea id="poliziaMoreuaria" {...form.register("poliziaMoreuaria")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="necroscopica">Necroscopica</Label>
              <Textarea id="necroscopica" {...form.register("necroscopica")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="necroforo">Necroforo</Label>
              <Textarea id="necroforo" {...form.register("necroforo")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cimiteri">Cimiteri</Label>
              <Textarea id="cimiteri" {...form.register("cimiteri")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impresaIncaricataTumulazione">Impresa Incaricata Tumulazione</Label>
              <Textarea id="impresaIncaricataTumulazione" {...form.register("impresaIncaricataTumulazione")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tumulazioneCapellaPrivata">Tumulazione Cappella Privata</Label>
              <Textarea id="tumulazioneCapellaPrivata" {...form.register("tumulazioneCapellaPrivata")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="listinoDiTumulazione">Listino di Tumulazione</Label>
              <Textarea id="listinoDiTumulazione" {...form.register("listinoDiTumulazione")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lapide">Lapide</Label>
              <Textarea id="lapide" {...form.register("lapide")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affissioni">Affissioni</Label>
              <Textarea id="affissioni" {...form.register("affissioni")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="luoghiDispersione">Luoghi Dispersione</Label>
              <Textarea id="luoghiDispersione" {...form.register("luoghiDispersione")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appuntamentoAttoMorte">Appuntamento Atto Morte</Label>
              <Textarea id="appuntamentoAttoMorte" {...form.register("appuntamentoAttoMorte")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteCostiPagamento">Note Costi e Pagamento</Label>
              <Textarea id="noteCostiPagamento" {...form.register("noteCostiPagamento")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="moduli">Note Moduli</Label>
              <Textarea id="moduli" {...form.register("moduli")} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Link href={isEdit ? `/comuni/${id}` : "/comuni"}>
                <Button variant="outline" type="button">Annulla</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" /> {isEdit ? "Salva Modifiche" : "Crea Comune"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
