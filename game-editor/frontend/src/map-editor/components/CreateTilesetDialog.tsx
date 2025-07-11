import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Upload, X } from "lucide-react"
import { CreateTileset, CreateTilesetImage, GetTilesetImageData } from "../../../wailsjs/go/mapeditor/MapEditorApp"

const CreateTilesetDialog = () => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [tileSize, setTileSize] = useState<number>(16)
  const [description, setDescription] = useState("")
  const [imageData, setImageData] = useState<string>("")
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [uploadError, setUploadError] = useState<string>("")
  const [typeOfTileset, setTypeOfTileset] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileSize, setFileSize] = useState<number>(0);

  const handleFileUpload = async() => {
    try {
      setUploadError(""); // Clear previous errors
      
      // Check if name is provided
      if (!name.trim()) {
        setUploadError("Please enter a tileset name before uploading an image");
        return;
      }
      
      const result = await CreateTilesetImage(name);
      
      if(result.success === true){
        setFileName(result.fileName);
        setFilePath(result.filePath);
        setFileSize(result.fileSize || 0);
        
        // Get the image data from the backend
        const imageResult = await GetTilesetImageData(result.filePath);
        if (imageResult.success) {
          setImageData(imageResult.imageData);
          
          // Get image dimensions
          const img = new Image();
          img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
          };
          img.src = imageResult.imageData;
        } else {
          setUploadError(imageResult.errorMessage || "Failed to load image data");
        }
      } else {
        setUploadError(result.errorMessage || "Failed to upload file");
      }
    } catch (error) {
      setUploadError(`Error uploading file: ${error}`);
    }
  }

  const removeImage = () => {
    setImageData("")
    setImageDimensions(null)
    setUploadError("")
    setFileName("")
    setFilePath("")
    setFileSize(0)
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

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const tilesetData = {
      "tilesetHeight": tileSize,
      "tilesetWidth": tileSize,
      "nameOfTileset": name,
      "tilesetDescription": description,
      "typeOfTileset": typeOfTileset,
      "fileName": fileName
    }
    
    try {
      const createTilesetData = await CreateTileset(tilesetData);
      if(createTilesetData.success === true){
        // Reset form
        setName("")
        setTileSize(16)
        setDescription("")
        setImageData("")
        setImageDimensions(null)
        setUploadError("")
        setFileName("")
        setFilePath("")
        setFileSize(0)
        setOpen(false)
      } else {
        setUploadError(createTilesetData.errorMessage || "Failed to create tileset");
      }
    } catch (error) {
      setUploadError(`Error creating tileset: ${error}`);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <Label htmlFor="typeOfTileset" className="text-white">Type of Tileset</Label>
            <Select value={typeOfTileset.toString()} onValueChange={(value) => setTypeOfTileset(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Overworld">Overworld</SelectItem>
                <SelectItem value="Cave">Cave</SelectItem>
                <SelectItem value="Indoors">Indoors</SelectItem>
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
            
            {!imageData ? (
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-colors">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleFileUpload()}
                  disabled={!name.trim()}
                  className="flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-300 w-full h-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-8 w-8" />
                  <span>Click to upload tileset image</span>
                  <span className="text-xs">PNG, JPG, GIF up to 50MB</span>
                  {!name.trim() && (
                    <span className="text-xs text-red-400">Enter a tileset name first</span>
                  )}
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
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Size: {imageDimensions.width}x{imageDimensions.height} pixels</p>
                    {fileSize > 0 && <p>File size: {formatFileSize(fileSize)}</p>}
                    {fileName && <p>File: {fileName}</p>}
                  </div>
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
              onClick={handleSubmit}
            >
              Create Tileset
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTilesetDialog 