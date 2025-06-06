import { useState, useRef } from "react"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Button } from "../../components/ui/button"
import { Upload, ZoomIn, ZoomOut } from "lucide-react"
import { ResizableBox } from "react-resizable"
import "react-resizable/css/styles.css"

export interface SelectedTile {
    id: string;
    name: string;
    image: string;
    width: number;
    height: number;
    subTiles?: string[][];
}

interface TilePaletteProps {
    selectedTile: SelectedTile | null;
    setSelectedTile: (tile: SelectedTile | null) => void;
}

const TILE_SIZE = 16
const MIN_SCALE = 1
const MAX_SCALE = 6

const TilePalette = ({ selectedTile, setSelectedTile }: TilePaletteProps) => {
    const [tilesetImage, setTilesetImage] = useState<string>("")
    const [tilesetDims, setTilesetDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
    const [error, setError] = useState<string>("")
    const [selectedRegion, setSelectedRegion] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
    const [scale, setScale] = useState<number>(2)
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [dragging, setDragging] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const handleTilesetImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        setError("")
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                if (img.width % TILE_SIZE !== 0 || img.height % TILE_SIZE !== 0) {
                    setError("Tileset must have dimensions that are multiples of 32 pixels")
                    return
                }
                setTilesetDims({ width: img.width, height: img.height })
                // Store as data URL
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.drawImage(img, 0, 0)
                    setTilesetImage(canvas.toDataURL('image/png'))
                }
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }

    const getTileCoords = (clientX: number, clientY: number, rect: DOMRect) => {
        const x = clientX - rect.left
        const y = clientY - rect.top
        const tileX = Math.floor(x / (TILE_SIZE * scale)) * TILE_SIZE
        const tileY = Math.floor(y / (TILE_SIZE * scale)) * TILE_SIZE
        return { x: tileX, y: tileY }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!tilesetImage) return
        const rect = e.currentTarget.getBoundingClientRect()
        const { x, y } = getTileCoords(e.clientX, e.clientY, rect)
        setDragStart({ x, y })
        setSelectedRegion({ x, y, w: TILE_SIZE, h: TILE_SIZE })
        setDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging || !dragStart) return
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
        const { x, y } = getTileCoords(e.clientX, e.clientY, rect)
        const startX = dragStart.x
        const startY = dragStart.y
        const endX = x
        const endY = y
        const left = Math.min(startX, endX)
        const top = Math.min(startY, endY)
        const right = Math.max(startX, endX)
        const bottom = Math.max(startY, endY)
        const w = (Math.floor((right - left) / TILE_SIZE) + 1) * TILE_SIZE
        const h = (Math.floor((bottom - top) / TILE_SIZE) + 1) * TILE_SIZE
        setSelectedRegion({
            x: left,
            y: top,
            w,
            h
        })
    }

    const handleMouseUp = () => {
        if (!tilesetImage || !selectedRegion) return
        setDragging(false)
        // Extract the selected region using a canvas
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas')
        }
        canvasRef.current.width = selectedRegion.w
        canvasRef.current.height = selectedRegion.h
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        const img = new Image()
        img.onload = () => {
            ctx.clearRect(0, 0, selectedRegion.w, selectedRegion.h)
            ctx.drawImage(
                img,
                selectedRegion.x, selectedRegion.y, selectedRegion.w, selectedRegion.h,
                0, 0, selectedRegion.w, selectedRegion.h
            )
            // Pre-crop sub-tiles for fast fill
            const subTiles: string[][] = [];
            for (let dx = 0; dx < selectedRegion.w / TILE_SIZE; dx++) {
                subTiles[dx] = [];
                for (let dy = 0; dy < selectedRegion.h / TILE_SIZE; dy++) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = TILE_SIZE;
                    tempCanvas.height = TILE_SIZE;
                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
                        tempCtx.drawImage(
                            canvasRef.current!,
                            dx * TILE_SIZE, dy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                            0, 0, TILE_SIZE, TILE_SIZE
                        );
                        subTiles[dx][dy] = tempCanvas.toDataURL('image/png');
                    }
                }
            }
            setSelectedTile({
                id: `tile_${selectedRegion.x}_${selectedRegion.y}_${selectedRegion.w}_${selectedRegion.h}`,
                name: `Tiles (${selectedRegion.x},${selectedRegion.y}) size ${selectedRegion.w}x${selectedRegion.h}`,
                image: canvasRef.current!.toDataURL('image/png'),
                width: selectedRegion.w / TILE_SIZE,
                height: selectedRegion.h / TILE_SIZE,
                subTiles
            })
        }
        img.src = tilesetImage
    }

    const handleZoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + 1))
    const handleZoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - 1))

    const handleScrollKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const scrollStep = TILE_SIZE * scale // scroll by one tile at a time
        if (!scrollAreaRef.current) return
        if (selectedRegion) {
            let { x, y, w, h } = selectedRegion
            let moved = false
            if (e.shiftKey) {
                // Shift+arrow: resize selection
                if (e.key === 'ArrowDown') {
                    if (y + h < tilesetDims.height) {
                        h += TILE_SIZE
                        moved = true
                    }
                } else if (e.key === 'ArrowUp') {
                    if (h > TILE_SIZE) {
                        h -= TILE_SIZE
                        moved = true
                    }
                } else if (e.key === 'ArrowRight') {
                    if (x + w < tilesetDims.width) {
                        w += TILE_SIZE
                        moved = true
                    }
                } else if (e.key === 'ArrowLeft') {
                    if (w > TILE_SIZE) {
                        w -= TILE_SIZE
                        moved = true
                    }
                }
            } else {
                // Arrow: move selection by its own size
                if (e.key === 'ArrowDown') {
                    if (y + h < tilesetDims.height) {
                        const maxY = tilesetDims.height - h
                        y = Math.min(y + h, maxY)
                        moved = true
                    }
                } else if (e.key === 'ArrowUp') {
                    if (y - h >= 0) {
                        y = Math.max(y - h, 0)
                        moved = true
                    }
                } else if (e.key === 'ArrowRight') {
                    if (x + w < tilesetDims.width) {
                        const maxX = tilesetDims.width - w
                        x = Math.min(x + w, maxX)
                        moved = true
                    }
                } else if (e.key === 'ArrowLeft') {
                    if (x - w >= 0) {
                        x = Math.max(x - w, 0)
                        moved = true
                    }
                }
            }
            if (moved) {
                setSelectedRegion({ x, y, w, h })
                // Auto-scroll to keep selection in view
                setTimeout(() => {
                    if (!scrollAreaRef.current) return
                    const selLeft = x * scale
                    const selTop = y * scale
                    const selRight = (x + w) * scale
                    const selBottom = (y + h) * scale
                    const viewLeft = scrollAreaRef.current.scrollLeft
                    const viewTop = scrollAreaRef.current.scrollTop
                    const viewRight = viewLeft + scrollAreaRef.current.clientWidth
                    const viewBottom = viewTop + scrollAreaRef.current.clientHeight
                    if (selLeft < viewLeft) scrollAreaRef.current.scrollLeft = selLeft
                    if (selRight > viewRight) scrollAreaRef.current.scrollLeft = selRight - scrollAreaRef.current.clientWidth
                    if (selTop < viewTop) scrollAreaRef.current.scrollTop = selTop
                    if (selBottom > viewBottom) scrollAreaRef.current.scrollTop = selBottom - scrollAreaRef.current.clientHeight
                }, 0)
                e.preventDefault()
                return
            }
        }
        // If no selection or not moved, scroll as before
        if (e.key === 'ArrowDown') {
            scrollAreaRef.current.scrollTop += scrollStep
            e.preventDefault()
        } else if (e.key === 'ArrowUp') {
            scrollAreaRef.current.scrollTop -= scrollStep
            e.preventDefault()
        } else if (e.key === 'ArrowRight') {
            scrollAreaRef.current.scrollLeft += scrollStep
            e.preventDefault()
        } else if (e.key === 'ArrowLeft') {
            scrollAreaRef.current.scrollLeft -= scrollStep
            e.preventDefault()
        }
    }

    // Calculate grid lines
    const gridLines = []
    for (let x = 0; x <= tilesetDims.width; x += TILE_SIZE) {
        gridLines.push(
            <div
                key={`v-${x}`}
                style={{
                    position: 'absolute',
                    left: x * scale,
                    top: 0,
                    width: 1,
                    height: tilesetDims.height * scale,
                    background: 'rgba(255,255,255,0.2)',
                    pointerEvents: 'none',
                }}
            />
        )
    }
    for (let y = 0; y <= tilesetDims.height; y += TILE_SIZE) {
        gridLines.push(
            <div
                key={`h-${y}`}
                style={{
                    position: 'absolute',
                    top: y * scale,
                    left: 0,
                    height: 1,
                    width: tilesetDims.width * scale,
                    background: 'rgba(255,255,255,0.2)',
                    pointerEvents: 'none',
                }}
            />
        )
    }

    return (
        <ResizableBox
            width={350}
            height={Infinity}
            minConstraints={[200, 100]}
            maxConstraints={[600, Infinity]}
            axis="x"
            resizeHandles={["e"]}
            handle={<span className="custom-resize-handle" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, cursor: 'ew-resize', background: 'rgba(51,65,85,0.2)', zIndex: 10 }} />}
        >
            <div className="flex flex-col h-full bg-slate-950" style={{ height: '100vh', boxSizing: 'border-box', border: '2px solid #334155', borderRadius: 8 }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold">Tile Palette</h3>
                        <p className="text-xs text-gray-400">Tilesets must be multiples of 32x32 pixels</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".png"
                            onChange={handleTilesetImport}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 w-8"
                            title="Import Tileset (32x32 pixels)"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale === MIN_SCALE} title="Zoom Out"><ZoomOut className="h-4 w-4" /></Button>
                    <span className="text-xs text-gray-400">Zoom: {scale}x</span>
                    <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale === MAX_SCALE} title="Zoom In"><ZoomIn className="h-4 w-4" /></Button>
                </div>
                {error && (
                    <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm">
                        {error}
                    </div>
                )}
                <ScrollArea
                    className="h-[calc(100vh-10rem)] rounded-md border border-slate-800"
                    style={{ overflowY: 'auto', overflowX: 'auto' }}
                    tabIndex={0}
                    ref={scrollAreaRef}
                    onKeyDown={handleScrollKey}
                >
                    {tilesetImage ? (
                        <div
                            className="relative cursor-pointer"
                            style={{
                                width: tilesetDims.width * scale,
                                height: tilesetDims.height * scale,
                                userSelect: 'none',
                                minWidth: tilesetDims.width * scale,
                                minHeight: tilesetDims.height * scale,
                                maxWidth: 'unset',
                                maxHeight: 'unset',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                            <img
                                src={tilesetImage}
                                alt="Tileset"
                                style={{
                                    imageRendering: 'pixelated',
                                    width: tilesetDims.width * scale,
                                    height: tilesetDims.height * scale,
                                    display: 'block',
                                    pointerEvents: 'none',
                                    maxWidth: 'unset',
                                    maxHeight: 'unset',
                                }}
                            />
                            {/* Grid overlay */}
                            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
                                {gridLines}
                            </div>
                            {/* Selection highlight */}
                            {selectedRegion && (
                                <div
                                    className="absolute border-2 border-tealBlue pointer-events-none"
                                    style={{
                                        left: selectedRegion.x * scale,
                                        top: selectedRegion.y * scale,
                                        width: selectedRegion.w * scale,
                                        height: selectedRegion.h * scale,
                                        boxSizing: 'border-box',
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Import a tileset to begin
                        </div>
                    )}
                </ScrollArea>
            </div>
        </ResizableBox>
    )
}

export default TilePalette 