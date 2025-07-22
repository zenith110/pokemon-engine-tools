const LoadingScreen = () => {
    return (
        <div className="flex flex-col grow h-[91.5vh] w-screen bg-slate-800 p-4 gap-4 relative">
            <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-tealBlue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-lg font-medium">Loading Pokemon Data...</p>
                    <p className="text-gray-400 text-sm">Please wait while we fetch the latest data from your pokemon.toml</p>
                </div>
            </div>
            {/* Keep the layout structure to prevent layout shift */}
            <div className="flex flex-row h-5/6 gap-4">
                <div className="flex flex-col w-5/12 gap-4 bg-slate-700 rounded-xl p-4">
                    <div className="rounded-xl grid grid-rows-2 grid-cols-2 grow bg-slate-600 items-stretch">
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                    </div>
                    <div className="flex flex-row justify-around gap-4 py-2">
                        <div className="grow h-10 bg-slate-600 rounded-xl"></div>
                        <div className="w-32 h-10 bg-slate-600 rounded-xl"></div>
                    </div>
                </div>
                <div className="flex flex-col w-7/12 gap-4">
                    <div className="bg-slate-700 rounded-xl p-6 h-full"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen; 