import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Button } from "../../components/ui/button"
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react"
import { ResizableBox } from "react-resizable"
import "react-resizable/css/styles.css"
import { GetTilesetImageData } from "../../../bindings/github.com/zenith110/pokemon-engine-tools/tools/map-editor/MapEditorApp"

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
    tilesetPath?: string;
    tileSize?: number;
}

const MIN_SCALE = 1
const MAX_SCALE = 6

const TilePalette = ({ selectedTile, setSelectedTile, tilesetPath, tileSize }: TilePaletteProps) => {
    const [tilesetImage, setTilesetImage] = useState<string>("")
    const [tilesetDims, setTilesetDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
    const [error, setError] = useState<string>("")
    const [selectedRegion, setSelectedRegion] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
    const [scale, setScale] = useState<number>(2)
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [dragging, setDragging] = useState<boolean>(false)
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Load tileset image when tilesetPath changes
    useEffect(() => {
        const loadTilesetImage = async () => {
            if (!tilesetPath) {
                setTilesetImage("")
                setTilesetDims({ width: 0, height: 0 })
                setError("")
                return
            }

            try {
                setError("")
                const result = await GetTilesetImageData(tilesetPath)
                
                if (result.success) {
                    setTilesetImage(result.imageData)
                    
                    // Get image dimensions
                    const img = new Image()
                    img.onload = () => {
                        setTilesetDims({ width: img.width, height: img.height })
                    }
                    img.src = result.imageData
                } else {
                    console.error("Failed to load tileset image:", result.errorMessage)
                    setError(result.errorMessage || "Failed to load tileset image")
                }
            } catch (error) {
                console.error("Error loading tileset:", error)
                setError(`Error loading tileset: ${error}`)
            }
        }

        loadTilesetImage()
    }, [tilesetPath])



    const getTileCoords = (clientX: number, clientY: number, rect: DOMRect) => {
        const x = clientX - rect.left
        const y = clientY - rect.top
        const tileX = Math.floor(x / (tileSize * scale)) * tileSize
        const tileY = Math.floor(y / (tileSize * scale)) * tileSize
        return { x: tileX, y: tileY }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!tilesetImage) {
            return
        }
        const rect = e.currentTarget.getBoundingClientRect()
        const { x, y } = getTileCoords(e.clientX, e.clientY, rect)
        setDragStart({ x, y })
        setSelectedRegion({ x, y, w: tileSize, h: tileSize })
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
        const w = (Math.floor((right - left) / tileSize) + 1) * tileSize
        const h = (Math.floor((bottom - top) / tileSize) + 1) * tileSize
        setSelectedRegion({
            x: left,
            y: top,
            w,
            h
        })
    }

    const handleMouseUp = () => {
        if (!tilesetImage || !selectedRegion) {
            return
        }
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
            for (let dx = 0; dx < selectedRegion.w / tileSize; dx++) {
                subTiles[dx] = [];
                for (let dy = 0; dy < selectedRegion.h / tileSize; dy++) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = tileSize;
                    tempCanvas.height = tileSize;
                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCtx.clearRect(0, 0, tileSize, tileSize);
                        tempCtx.drawImage(
                            canvasRef.current!,
                            dx * tileSize, dy * tileSize, tileSize, tileSize,
                            0, 0, tileSize, tileSize
                        );
                        subTiles[dx][dy] = tempCanvas.toDataURL('image/png');
                    }
                }
            }
            const newSelectedTile = {
                id: `tile_${selectedRegion.x}_${selectedRegion.y}_${selectedRegion.w}_${selectedRegion.h}`,
                name: `Tiles (${selectedRegion.x},${selectedRegion.y}) size ${selectedRegion.w}x${selectedRegion.h}`,
                image: canvasRef.current!.toDataURL('image/png'),
                width: selectedRegion.w / tileSize,
                height: selectedRegion.h / tileSize,
                subTiles
            }
            setSelectedTile(newSelectedTile)
        }
        img.src = tilesetImage
    }

    const handleZoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + 1))
    const handleZoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - 1))
    const handleToggleExpand = () => setIsExpanded(!isExpanded)

    const handleScrollKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const scrollStep = tileSize * scale // scroll by one tile at a time
        if (!scrollAreaRef.current) return
        if (selectedRegion) {
            let { x, y, w, h } = selectedRegion
            let moved = false
            if (e.shiftKey) {
                // Shift+arrow: resize selection
                if (e.key === 'ArrowDown') {
                    if (y + h < tilesetDims.height) {
                        h += tileSize
                        moved = true
                    }
                } else if (e.key === 'ArrowUp') {
                    if (h > tileSize) {
                        h -= tileSize
                        moved = true
                    }
                } else if (e.key === 'ArrowRight') {
                    if (x + w < tilesetDims.width) {
                        w += tileSize
                        moved = true
                    }
                } else if (e.key === 'ArrowLeft') {
                    if (w > tileSize) {
                        w -= tileSize
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
    for (let x = 0; x <= tilesetDims.width; x += tileSize) {
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
    for (let y = 0; y <= tilesetDims.height; y += tileSize) {
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

    const renderTilePaletteContent = () => (
        <div className="flex flex-col h-full bg-slate-950" style={{ height: '100vh', boxSizing: 'border-box', border: '2px solid #334155', borderRadius: 8 }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">Tile Palette</h3>
                    <p className="text-xs text-gray-400">Select tiles from the loaded tileset</p>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToggleExpand} 
                    title={isExpanded ? "Minimize" : "Maximize"}
                >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
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
                    style={{ overflowY: 'auto', overflowX: 'auto', width: '100%' }}
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
                                maxWidth: 'none',
                                maxHeight: 'none',
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
                                    maxWidth: 'none',
                                    maxHeight: 'none',
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
    )

    return (
        <>
            {isExpanded ? (
                <div className="fixed inset-0 z-50 bg-slate-950">
                    {renderTilePaletteContent()}
                </div>
            ) : (
                <ResizableBox
                    width={350}
                    height={Infinity}
                    minConstraints={[200, 100]}
                    maxConstraints={[800, Infinity]}
                    axis="x"
                    resizeHandles={["e"]}
                    handle={<span className="custom-resize-handle" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, cursor: 'ew-resize', background: 'rgba(51,65,85,0.2)', zIndex: 10 }} />}
                >
                    {renderTilePaletteContent()}
                </ResizableBox>
            )}
        </>
    )
}

export default TilePalette 