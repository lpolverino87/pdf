import { useState } from "react"
import { Link, useLocation } from "wouter"
import { useListComuni, useDeleteComune, getListComuniQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Eye, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export function ComuniList() {
  const [search, setSearch] = useState("")
  const { data: comuni, isLoading } = useListComuni({ search: search || undefined })
  const deleteComune = useDeleteComune()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo comune?")) return
    deleteComune.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Comune eliminato" })
        queryClient.invalidateQueries({ queryKey: getListComuniQueryKey() })
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Comuni</h1>
          <p className="text-muted-foreground mt-1">Gestisci le informazioni dei comuni.</p>
        </div>
        <Link href="/comuni/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi Comune
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o provincia..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento in corso...</div>
      ) : comuni?.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg text-muted-foreground">
          Nessun comune trovato.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>Cimiteri</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comuni?.map((comune) => (
              <TableRow key={comune.id}>
                <TableCell className="font-medium text-foreground">{comune.nome}</TableCell>
                <TableCell>{comune.provincia || "-"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{comune.cimiteri || "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/comuni/${comune.id}`}>
                    <Button variant="ghost" size="icon" title="Vedi dettagli">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/comuni/${comune.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Modifica">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(comune.id)}>
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
