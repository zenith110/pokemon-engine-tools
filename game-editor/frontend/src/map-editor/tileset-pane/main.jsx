const RenderTileset = ({ tileset }) => {
    return(
        <div>
            <div className="text-black flex items-center justify-center">
                    <img src={tileset? `data:image/png;base64,${tileset}` : ''} alt="Tileset" />
            </div>
        </div>
    )
}
export default RenderTileset
