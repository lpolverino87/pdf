import { useState } from "react"
import { Link } from "wouter"
import { useListCrematori, useDeleteCrematorio, getListCrematoriQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Eye, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export function CrematoriList() {
  const [search, setSearch] = useState("")
  const { data: crematori, isLoading } = useListCrematori({ search: search || undefined })
  const deleteCrematorio = useDeleteCrematorio()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo crematorio?")) return
    deleteCrematorio.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Crematorio eliminato" })
        queryClient.invalidateQueries({ queryKey: getListCrematoriQueryKey() })
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Crematori</h1>
          <p className="text-muted-foreground mt-1">Gestisci i contatti e le info dei crematori.</p>
        </div>
        <Link href="/crematori/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi Crematorio
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, città o provincia..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento in corso...</div>
      ) : crematori?.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg text-muted-foreground">
          Nessun crematorio trovato.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Città</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crematori?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-foreground">{item.nome}</TableCell>
                <TableCell>
                  {item.citta || "-"} {item.provincia ? `(${item.provincia})` : ""}
                </TableCell>
                <TableCell>
                  {item.telefono ? (
                    <a href={`tel:${item.telefono}`} className="text-primary hover:underline">{item.telefono}</a>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {item.email ? (
                    <a href={`mailto:${item.email}`} className="text-primary hover:underline">{item.email}</a>
                  ) : "-"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/crematori/${item.id}`}>
                    <Button variant="ghost" size="icon" title="Vedi dettagli">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/crematori/${item.id}/edit`}>
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
