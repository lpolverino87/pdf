import { useEffect } from "react"
import { useParams, useLocation, Link } from "wouter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreateCrematorio, useUpdateCrematorio, useGetCrematorio, getGetCrematorioQueryKey, getListCrematoriQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  citta: z.string().optional(),
  provincia: z.string().optional(),
  indirizzo: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  orariApertura: z.string().optional(),
  referente: z.string().optional(),
  costiCremazione: z.string().optional(),
  modalitaPrenotazione: z.string().optional(),
  documentiRichiesti: z.string().optional(),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CrematorioForm() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEdit = !!id
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: item, isLoading: isLoadingData } = useGetCrematorio(id!, {
    query: { enabled: isEdit, queryKey: getGetCrematorioQueryKey(id!) }
  })

  const createMutation = useCreateCrematorio()
  const updateMutation = useUpdateCrematorio()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" }
  })

  useEffect(() => {
    if (item) {
      form.reset({
        nome: item.nome,
        citta: item.citta || "",
        provincia: item.provincia || "",
        indirizzo: item.indirizzo || "",
        telefono: item.telefono || "",
        email: item.email || "",
        orariApertura: item.orariApertura || "",
        referente: item.referente || "",
        costiCremazione: item.costiCremazione || "",
        modalitaPrenotazione: item.modalitaPrenotazione || "",
        documentiRichiesti: item.documentiRichiesti || "",
        note: item.note || "",
      })
    }
  }, [item, form])

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: id!, data }, {
        onSuccess: (updated) => {
          toast({ title: "Crematorio aggiornato" })
          queryClient.invalidateQueries({ queryKey: getListCrematoriQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetCrematorioQueryKey(id!) })
          setLocation(`/crematori/${updated.id}`)
        }
      })
    } else {
      createMutation.mutate({ data }, {
        onSuccess: (created) => {
          toast({ title: "Crematorio creato" })
          queryClient.invalidateQueries({ queryKey: getListCrematoriQueryKey() })
          setLocation(`/crematori/${created.id}`)
        }
      })
    }
  }

  if (isEdit && isLoadingData) return <div className="py-12 text-center">Caricamento...</div>

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={isEdit ? `/crematori/${id}` : "/crematori"}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEdit ? "Modifica Crematorio" : "Nuovo Crematorio"}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome Crematorio *</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="citta">Città</Label>
              <Input id="citta" {...form.register("citta")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input id="provincia" {...form.register("provincia")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="indirizzo">Indirizzo</Label>
              <Input id="indirizzo" {...form.register("indirizzo")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" {...form.register("telefono")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referente">Referente</Label>
              <Input id="referente" {...form.register("referente")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="orariApertura">Orari Apertura</Label>
              <Textarea id="orariApertura" {...form.register("orariApertura")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costiCremazione">Costi Cremazione</Label>
              <Textarea id="costiCremazione" {...form.register("costiCremazione")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalitaPrenotazione">Modalità Prenotazione</Label>
              <Textarea id="modalitaPrenotazione" {...form.register("modalitaPrenotazione")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="documentiRichiesti">Documenti Richiesti</Label>
              <Textarea id="documentiRichiesti" {...form.register("documentiRichiesti")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Note Generali</Label>
              <Textarea id="note" {...form.register("note")} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Link href={isEdit ? `/crematori/${id}` : "/crematori"}>
                <Button variant="outline" type="button">Annulla</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" /> {isEdit ? "Salva Modifiche" : "Crea Crematorio"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
