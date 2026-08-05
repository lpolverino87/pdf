import { useEffect, useState } from "react"
import { useParams, useLocation, Link } from "wouter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  useCreateModulo, useUpdateModulo, useGetModulo, getGetModuloQueryKey, getListModuliQueryKey,
  ModuloInputEntityType, useListComuni, useListCrematori, useListNazioni
} from "@workspace/api-client-react"
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
  descrizione: z.string().optional(),
  entityType: z.nativeEnum(ModuloInputEntityType),
  entityId: z.number().optional().nullable(),
  url: z.string().url("Inserire un URL valido").optional().or(z.literal("")),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function ModuloForm() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEdit = !!id
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: item, isLoading: isLoadingData } = useGetModulo(id!, {
    query: { enabled: isEdit, queryKey: getGetModuloQueryKey(id!) }
  })

  // Prefetch lists for select dropdowns
  const { data: comuni } = useListComuni()
  const { data: crematori } = useListCrematori()
  const { data: nazioni } = useListNazioni()

  const createMutation = useCreateModulo()
  const updateMutation = useUpdateModulo()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      nome: "",
      entityType: "generale" as any
    }
  })

  const selectedEntityType = form.watch("entityType")

  useEffect(() => {
    if (item) {
      form.reset({
        nome: item.nome,
        descrizione: item.descrizione || "",
        entityType: item.entityType as any,
        entityId: item.entityId,
        url: item.url || "",
        note: item.note || "",
      })
    }
  }, [item, form])

  const onSubmit = (data: FormData) => {
    // Clean up entityId if generale
    if (data.entityType === "generale") {
      data.entityId = null
    }

    if (isEdit) {
      updateMutation.mutate({ id: id!, data }, {
        onSuccess: (updated) => {
          toast({ title: "Modulo aggiornato" })
          queryClient.invalidateQueries({ queryKey: getListModuliQueryKey() })
          queryClient.invalidateQueries({ queryKey: getGetModuloQueryKey(id!) })
          setLocation(`/moduli`)
        }
      })
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Modulo creato" })
          queryClient.invalidateQueries({ queryKey: getListModuliQueryKey() })
          setLocation(`/moduli`)
        }
      })
    }
  }

  if (isEdit && isLoadingData) return <div className="py-12 text-center">Caricamento...</div>

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/moduli">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEdit ? "Modifica Modulo" : "Nuovo Modulo"}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome Modulo / Documento *</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Categoria Appartenenza</Label>
              <select 
                id="entityType" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                {...form.register("entityType")}
              >
                <option value="generale">Generale (nessun collegamento)</option>
                <option value="comune">Comune</option>
                <option value="crematorio">Crematorio</option>
                <option value="nazione">Nazione</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityId">Entità Collegata</Label>
              <select 
                id="entityId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                disabled={selectedEntityType === "generale"}
                {...form.register("entityId", { setValueAs: v => (v === "" ? null : Number(v)) })}
              >
                <option value="">Seleziona...</option>
                {selectedEntityType === "comune" && comuni?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                {selectedEntityType === "crematorio" && crematori?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                {selectedEntityType === "nazione" && nazioni?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="url">URL File / Documento</Label>
              <Input id="url" type="url" placeholder="https://" {...form.register("url")} />
              {form.formState.errors.url && <p className="text-xs text-destructive">{form.formState.errors.url.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descrizione">Descrizione Breve</Label>
              <Input id="descrizione" {...form.register("descrizione")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Note Aggiuntive</Label>
              <Textarea id="note" {...form.register("note")} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Link href="/moduli">
                <Button variant="outline" type="button">Annulla</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" /> {isEdit ? "Salva Modifiche" : "Crea Modulo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
