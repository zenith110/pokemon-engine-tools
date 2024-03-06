import React, { useRef, useEffect } from "react";

const CanvasExport = props => {
    // Set the ref point to null at the beginning
    const canvasRef = useRef(null);
    const draw = canvasContext => {
        canvasContext.filleStyle = "#000000"
        canvasContext.beginPath();
        canvasContext.arc(50, 100, 20, 0, 2*Math.PI)
        canvasContext.fill()
    }
    useEffect(() => {
        // Keeps track of current poisition
        const currentRef = canvasRef.current;
        const canvasContext = currentRef.getContext("2d");
        canvasContext.fillStyle = "#000000";
        canvasContext.fillRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
        draw(canvasContext)
    }, [draw])
    return <canvas ref={canvasRef} {...props}/>
}

export default CanvasExport