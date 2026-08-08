import { useState } from "react"
import { Link } from "wouter"
import { 
  useListModuli, useDeleteModulo, getListModuliQueryKey, 
  useListComuni, useListCrematori, useListNazioni 
} from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ModuloFileLink } from "@/components/modulo-file-link"

export function ModuliList() {
  const [filterType, setFilterType] = useState<string>("")
  const { data: moduli, isLoading } = useListModuli({ 
    entityType: filterType && filterType !== 'generale' ? (filterType as any) : undefined 
  })
  
  // Fetch entities to map IDs to names
  const { data: comuni } = useListComuni()
  const { data: crematori } = useListCrematori()
  const { data: nazioni } = useListNazioni()

  const deleteModulo = useDeleteModulo()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDelete = (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo modulo?")) return
    deleteModulo.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Modulo eliminato" })
        queryClient.invalidateQueries({ queryKey: getListModuliQueryKey() })
      }
    })
  }

  const badgeColor = (type: string) => {
    switch(type) {
      case 'comune': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'crematorio': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'nazione': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEntityName = (type: string, id?: number | null) => {
    if (!id) return null
    if (type === 'comune') return comuni?.find(c => c.id === id)?.nome
    if (type === 'crematorio') return crematori?.find(c => c.id === id)?.nome
    if (type === 'nazione') return nazioni?.find(n => n.id === id)?.nome
    return null
  }

  // If filter is 'generale', we filter locally since the API enum might not support it
  const displayModuli = filterType === 'generale' 
    ? moduli?.filter(m => m.entityType === 'generale') 
    : moduli

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Moduli e Documenti</h1>
          <p className="text-muted-foreground mt-1">L'archivio generale di tutti i moduli.</p>
        </div>
        <Link href="/moduli/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi Modulo
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Tutti i tipi</option>
          <option value="comune">Comuni</option>
          <option value="crematorio">Crematori</option>
          <option value="nazione">Nazioni</option>
          <option value="generale">Generali</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento in corso...</div>
      ) : displayModuli?.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg text-muted-foreground">
          Nessun modulo trovato.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome e URL</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Descrizione</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayModuli?.map((item) => {
              const entityName = getEntityName(item.entityType, item.entityId)
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">
                    {item.nome}
                    {item.url && !item.fileKey && (
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        Collegamento esterno
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="outline" className={badgeColor(item.entityType)}>
                        {item.entityType.toUpperCase()}
                      </Badge>
                      {entityName && <span className="text-xs text-muted-foreground">{entityName}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.descrizione || "-"}
                  </TableCell>
                  <TableCell>
                    <ModuloFileLink
                      moduloId={item.id}
                      fileKey={item.fileKey}
                      fileName={item.fileName}
                      legacyUrl={item.url}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/moduli/${item.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Modifica">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
