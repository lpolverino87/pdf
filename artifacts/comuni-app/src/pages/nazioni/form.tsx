import { useEffect } from "react"
import { useParams, useLocation, Link } from "wouter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreateNazione, useUpdateNazione, useGetNazione, getGetNazioneQueryKey, getListNazioniQueryKey } from "@workspace/api-client-react"
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
  consolato: z.string().optional(),
  ambasciata: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  documentiRichiesti: z.string().optional(),
  procedureRimpatrio: z.string().optional(),
  costiOrienttativi: z.string().optional(),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NazioneForm() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEdit = !!id
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: item, isLoading: isLoadingData } = useGetNazione(id!, {
    query: { enabled: isEdit, queryKey: getGetNazioneQueryKey(id!) }
  })

  const createMutation = useCreateNazione()
  const updateMutation = useUpdateNazione()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" }
  })

  useEffect(() => {
    if (item) {
      form.reset({
        nome: item.nome,
        consolato: item.consolato || "",
        ambasciata: item.ambasciata || "",
        telefono: item.telefono || "",
        email: item.email || "",
        documentiRichiesti: item.documentiRichiesti || "",
        procedureRimpatrio: item.procedureRimpatrio || "",
        costiOrienttativi: item.costiOrienttativi || "",
        note: item.note || "",
      })
    }
  }, [item, form])

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: id!, data }, {
        onSuccess: (updated) => {
          toast({ title: "Nazione aggiornata" })
          queryClient.invalidateQueries({ queryKey: getListNazioniQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetNazioneQueryKey(id!) })
          setLocation(`/nazioni/${updated.id}`)
        }
      })
    } else {
      createMutation.mutate({ data }, {
        onSuccess: (created) => {
          toast({ title: "Nazione creata" })
          queryClient.invalidateQueries({ queryKey: getListNazioniQueryKey() })
          setLocation(`/nazioni/${created.id}`)
        }
      })
    }
  }

  if (isEdit && isLoadingData) return <div className="py-12 text-center">Caricamento...</div>

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={isEdit ? `/nazioni/${id}` : "/nazioni"}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEdit ? "Modifica Nazione" : "Nuova Nazione"}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome Nazione *</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consolato">Consolato</Label>
              <Input id="consolato" {...form.register("consolato")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ambasciata">Ambasciata</Label>
              <Input id="ambasciata" {...form.register("ambasciata")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" {...form.register("telefono")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="documentiRichiesti">Documenti Richiesti</Label>
              <Textarea id="documentiRichiesti" {...form.register("documentiRichiesti")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="procedureRimpatrio">Procedure Rimpatrio</Label>
              <Textarea id="procedureRimpatrio" {...form.register("procedureRimpatrio")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costiOrienttativi">Costi Orientativi</Label>
              <Input id="costiOrienttativi" {...form.register("costiOrienttativi")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Note Generali</Label>
              <Textarea id="note" {...form.register("note")} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Link href={isEdit ? `/nazioni/${id}` : "/nazioni"}>
                <Button variant="outline" type="button">Annulla</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" /> {isEdit ? "Salva Modifiche" : "Crea Nazione"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
