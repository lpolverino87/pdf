import { useState } from "react"
import { Link } from "wouter"
import { useListNazioni, useDeleteNazione, getListNazioniQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Eye, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export function NazioniList() {
  const [search, setSearch] = useState("")
  const { data: nazioni, isLoading } = useListNazioni({ search: search || undefined })
  const deleteNazione = useDeleteNazione()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questa nazione?")) return
    deleteNazione.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Nazione eliminata" })
        queryClient.invalidateQueries({ queryKey: getListNazioniQueryKey() })
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Nazioni Estere</h1>
          <p className="text-muted-foreground mt-1">Gestisci consolati, ambasciate e procedure di rimpatrio.</p>
        </div>
        <Link href="/nazioni/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi Nazione
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca nazione..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento in corso...</div>
      ) : nazioni?.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg text-muted-foreground">
          Nessuna nazione trovata.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazione</TableHead>
              <TableHead>Consolato / Ambasciata</TableHead>
              <TableHead>Contatti</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nazioni?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-foreground">{item.nome}</TableCell>
                <TableCell>
                  {item.consolato ? <div>Consolato: {item.consolato}</div> : null}
                  {item.ambasciata ? <div>Ambasciata: {item.ambasciata}</div> : null}
                  {!item.consolato && !item.ambasciata && "-"}
                </TableCell>
                <TableCell>
                  {item.telefono ? <div className="text-primary">{item.telefono}</div> : null}
                  {item.email ? <div className="text-primary">{item.email}</div> : null}
                  {!item.telefono && !item.email && "-"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/nazioni/${item.id}`}>
                    <Button variant="ghost" size="icon" title="Vedi dettagli">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/nazioni/${item.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Modifica">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
