import { Loader2 } from "lucide-react";
import { LoadingProgress, RenderProgress } from "../hooks/useLoadingState";

interface LoadingOverlayProps {
  isLoading: boolean;
  loadingProgress: LoadingProgress;
  renderProgress: RenderProgress;
  isRendering: boolean;
}

const LoadingOverlay = ({ 
  isLoading, 
  loadingProgress, 
  renderProgress, 
  isRendering 
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Loading Map</h3>
        <p className="text-slate-400 mb-4">{loadingProgress.message}</p>
        <p className="text-xs text-slate-500">Debug: isLoading={isLoading.toString()}</p>
        
        {/* Tile preloading progress */}
        {loadingProgress.total > 0 && (
          <div className="w-64 mx-auto mb-4">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>Preloading tiles...</span>
              <span>{loadingProgress.current}/{loadingProgress.total}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${loadingProgress.total > 0 ? (loadingProgress.current / loadingProgress.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Map rendering progress */}
        {isRendering && renderProgress.total > 0 && (
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>Rendering map...</span>
              <span>{renderProgress.current}/{renderProgress.total}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${renderProgress.total > 0 ? (renderProgress.current / renderProgress.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{renderProgress.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay; 