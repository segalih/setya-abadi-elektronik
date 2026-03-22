import * as React from "react"
import { UploadCloud, File, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FileUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function FileUpload({
  value,
  onChange,
  accept = ".zip,.rar,.pdf,.png,.jpg,.jpeg",
  maxSizeMB = 5,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateAndSetFile = (file: File) => {
    setError(null)
    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > maxSizeMB) {
      setError(`Ukuran file melebihi maksimal ${maxSizeMB}MB`)
      return
    }
    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md transition-none cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 shadow-sm"
            : value
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400",
          error && "border-red-300 bg-red-50/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {value ? (
          <div className="flex items-center gap-4 w-full bg-white p-4 rounded-xl border shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <File className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 truncate">{value.name}</h4>
              <p className="text-xs text-muted-foreground font-medium">
                {(value.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110  ">
              <UploadCloud className={cn("w-8 h-8", error ? "text-red-500" : "text-primary")} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Tarik & Lepas File di Sini</h4>
            <p className="text-xs text-slate-500 font-medium">Atau klik untuk memilih file dari komputer Anda</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>MAKS {maxSizeMB}MB</span>
              <span>•</span>
              <span>{accept.replace(/\./g, "").toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
