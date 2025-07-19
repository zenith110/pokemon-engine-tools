import { Loader2 } from "lucide-react";

interface SaveNotificationsProps {
  isSaving: boolean;
  showSavedMessage: boolean;
  hasUnsavedChanges: boolean;
}

const SaveNotifications = ({ 
  isSaving, 
  showSavedMessage, 
  hasUnsavedChanges 
}: SaveNotificationsProps) => {
  return (
    <>
      {/* Save Alert */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Saving map...</span>
        </div>
      )}

      {/* Save Notification */}
      {showSavedMessage && !isSaving && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="text-sm font-medium">Map saved successfully</span>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && !isSaving && !showSavedMessage && (
        <div className="fixed bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-sm font-medium">Unsaved changes</span>
        </div>
      )}
    </>
  );
};

export default SaveNotifications; 