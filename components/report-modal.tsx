"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES, type ReportCategory } from "@/types/report"
import { useReports } from "@/contexts/reports-context"
import { MapPin } from "lucide-react"
import { createReport } from "@/utils/reportsFromApi"

const reportSchema = z.object({
  title: z.string().min(5, "Titulo deve ter pelo menos 5 caracteres").max(80, "Titulo deve ter no maximo 80 caracteres"),
  description: z.string().min(10, "Descricao deve ter pelo menos 10 caracteres").max(300, "Descricao deve ter no maximo 300 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coordinates: { lat: number; lng: number } | null
  onSuccess: () => void
  onError: (message: string) => void
}

export function ReportModal({ open, onOpenChange, coordinates, onSuccess, onError }: ReportModalProps) {
  const { addReport } = useReports()

  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  })

  const titleValue = watch("title")
  const descValue = watch("description")

  const onSubmit = async (data: ReportFormData) => {
    if (!coordinates) return

    const { lat, lng } = coordinates 

    try {
        await createReport({
          tipo: data.category,
          descricao: data.description,
          latitude: lat,
          longitude: lng,
          imagem: [],
          status: "novo",
      }) 
      alert('Denúncia enviada!')
      handleClose(false)
      reset()
    } catch (err) {
      alert('Erro ao enviar denúncia') 
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-480px bg-card text-card-foreground border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Nova Denuncia</DialogTitle>
          <DialogDescription>
            Preencha as informacoes sobre o problema encontrado.
          </DialogDescription>
        </DialogHeader>

        {coordinates && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
            <MapPin className="size-3.5" />
            <span>
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              onValueChange={(val) => setValue("category", val, { shouldValidate: true })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Titulo</Label>
              <span className="text-xs text-muted-foreground">
                {titleValue?.length || 0}/80
              </span>
            </div>
            <Input
              id="title"
              maxLength={80}
              placeholder="Ex: Buraco na calcada"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descricao</Label>
              <span className="text-xs text-muted-foreground">
                {descValue?.length || 0}/300
              </span>
            </div>
            <Textarea
              id="description"
              maxLength={300}
              rows={3}
              placeholder="Descreva o problema com detalhes..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Enviar Denuncia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
