import { useState } from "react"
import {
  getGetModuloFileUrlQueryKey,
  useGetModuloFileUrl,
} from "@workspace/api-client-react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type ModuloFileLinkProps = {
  moduloId: number
  fileKey?: string | null
  fileName?: string | null
  legacyUrl?: string | null
  compact?: boolean
}

export function ModuloFileLink({
  moduloId,
  fileKey,
  fileName,
  legacyUrl,
  compact = false,
}: ModuloFileLinkProps) {
  const [isOpening, setIsOpening] = useState(false)
  const { toast } = useToast()
  const fileQuery = useGetModuloFileUrl(moduloId, {
    query: {
      enabled: false,
      queryKey: getGetModuloFileUrlQueryKey(moduloId),
    },
  })

  const openPdf = async () => {
    if (legacyUrl && !fileKey) {
      window.open(legacyUrl, "_blank", "noopener,noreferrer")
      return
    }

    setIsOpening(true)
    try {
      const result = await fileQuery.refetch()
      if (!result.data?.downloadUrl) {
        throw new Error("PDF non trovato")
      }
      window.open(result.data.downloadUrl, "_blank", "noopener,noreferrer")
    } catch (error) {
      toast({
        title: "Impossibile aprire il PDF",
        description: error instanceof Error ? error.message : "Riprova tra poco.",
        variant: "destructive",
      })
    } finally {
      setIsOpening(false)
    }
  }

  if (!fileKey && !legacyUrl) {
    return (
      <span className="text-xs text-muted-foreground">
        Nessun PDF caricato
      </span>
    )
  }

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon" : "sm"}
      className={compact ? "text-primary hover:text-primary" : "gap-2"}
      title={fileName || "Apri PDF"}
      onClick={openPdf}
      disabled={isOpening}
    >
      {isOpening ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {!compact && (fileName || "Apri PDF")}
      {compact && <span className="sr-only">{fileName || "Apri PDF"}</span>}
    </Button>
  )
}