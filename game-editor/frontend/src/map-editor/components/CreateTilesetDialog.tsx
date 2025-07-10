import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Upload, X } from "lucide-react"
import { CreateTilesetData } from "../types"

interface CreateTilesetDialogProps {
  onCreateTileset: (tilesetData: CreateTilesetData) => void
}

const CreateTilesetDialog = ({ onCreateTileset }: CreateTilesetDialogProps) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [tileSize, setTileSize] = useState<number>(16)
  const [description, setDescription] = useState("")
  const [imageData, setImageData] = useState<string>("")
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [uploadError, setUploadError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError("")
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Please select an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Validate dimensions are multiples of tile size
        if (img.width % tileSize !== 0 || img.height % tileSize !== 0) {
          setUploadError(`Image dimensions must be multiples of ${tileSize}x${tileSize} pixels`)
          return
        }
        
        setImageData(e.target?.result as string)
        setImageDimensions({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        setUploadError("Failed to load image")
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      setUploadError("Failed to read file")
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageData("")
    setImageDimensions(null)
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Revalidate image when tile size changes
  useEffect(() => {
    if (imageData && imageDimensions) {
      if (imageDimensions.width % tileSize !== 0 || imageDimensions.height % tileSize !== 0) {
        setUploadError(`Image dimensions must be multiples of ${tileSize}x${tileSize} pixels`)
      } else {
        setUploadError("")
      }
    }
  }, [tileSize, imageData, imageDimensions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onCreateTileset({
      name: name.trim(),
      tileSize,
      description: description.trim() || undefined,
      imageData: imageData || undefined,
      imageWidth: imageDimensions?.width,
      imageHeight: imageDimensions?.height,
    })

    // Reset form
    setName("")
    setTileSize(16)
    setDescription("")
    setImageData("")
    setImageDimensions(null)
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
          Create Tileset
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Tileset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Tileset Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tileset name"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tileSize" className="text-white">Tile Size</Label>
            <Select value={tileSize.toString()} onValueChange={(value) => setTileSize(Number(value))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="8">8x8 pixels</SelectItem>
                <SelectItem value="16">16x16 pixels</SelectItem>
                <SelectItem value="32">32x32 pixels</SelectItem>
                <SelectItem value="64">64x64 pixels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter tileset description"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-400 rounded-md px-3 py-2 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Tileset Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            
            {!imageData ? (
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-colors">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-300 w-full h-full"
                >
                  <Upload className="h-8 w-8" />
                  <span>Click to upload tileset image</span>
                  <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <img
                    src={imageData}
                    alt="Tileset preview"
                    className="w-full max-h-48 object-contain border border-slate-700 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {imageDimensions && (
                  <p className="text-xs text-slate-400">
                    Size: {imageDimensions.width}x{imageDimensions.height} pixels
                  </p>
                )}
              </div>
            )}
            
            {uploadError && (
              <p className="text-sm text-red-400">{uploadError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!name.trim() || !imageData}
            >
              Create Tileset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTilesetDialog 