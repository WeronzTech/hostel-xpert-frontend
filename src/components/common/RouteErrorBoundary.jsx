import { useRouteError } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Card, Collapse } from "antd";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

const isChunkLoadError = (err) => {
  if (!err) return false;
  const msg = err.message || String(err);
  return (
    /dynamically imported module/i.test(msg) ||
    /failed to load module script/i.test(msg) ||
    /loading chunk/i.test(msg) ||
    (err.name === "TypeError" && /dynamically imported/i.test(msg))
  );
};

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const [isChunk, setIsChunk] = useState(false);
  const [hasAttemptedReload, setHasAttemptedReload] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    console.error("RouteErrorBoundary caught rendering/routing error:", error);

    if (error) {
      const chunkError = isChunkLoadError(error);
      setIsChunk(chunkError);

      if (chunkError) {
        const reloadFlag = sessionStorage.getItem("chunk-failed-reload");
        if (!reloadFlag) {
          sessionStorage.setItem("chunk-failed-reload", "true");
          setIsReloading(true);
          // Wait 1.5 seconds so the user can see the updating screen, then reload
          const timer = setTimeout(() => {
            window.location.reload();
          }, 1500);
          return () => clearTimeout(timer);
        } else {
          setHasAttemptedReload(true);
        }
      }
    }
  }, [error]);

  const handleManualReload = () => {
    sessionStorage.removeItem("chunk-failed-reload");
    window.location.reload();
  };

  const handleGoHome = () => {
    sessionStorage.removeItem("chunk-failed-reload");
    window.location.href = "/";
  };

  // 1. Sleek full-screen auto-updating UI (for the first chunk error occurrence)
  if (isChunk && isReloading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white px-6 text-center select-none font-sans">
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-4 border-emerald-500/40 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full border-4 border-emerald-500 flex items-center justify-center">
            <FiRefreshCw className="w-8 h-8 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-emerald-400 mb-2">
          Updating System Resources
        </h2>
        <p className="text-slate-300 max-w-md leading-relaxed text-sm">
          A new version of Hostel Xpert is available. We are reloading the application resources to ensure you have the latest updates. This will only take a moment...
        </p>
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
          <span className="ml-1">Syncing files...</span>
        </div>
      </div>
    );
  }

  // 2. High-end recovery UI for persistent chunk load issues or general errors
  const isPersistentChunkError = isChunk && hasAttemptedReload;
  const errorTitle = isPersistentChunkError 
    ? "Application Update Required" 
    : "Unexpected Application Error";

  const errorDesc = isPersistentChunkError
    ? "We had trouble dynamically loading the new page resources. This usually happens during an app update or due to a slow internet connection. Please click the button below to force a full update."
    : "Hostel Xpert encountered an unexpected runtime error. We apologize for the inconvenience. You can try refreshing the page or returning to the dashboard.";

  const errorMessage = error?.message || error?.statusText || String(error);
  const errorStack = error?.stack;

  const collapseItems = [
    {
      key: "details",
      label: <span className="text-slate-400 text-xs font-medium font-mono">View Diagnostic Logs</span>,
      children: (
        <div className="bg-slate-950 p-4 rounded border border-slate-800 max-h-60 overflow-y-auto text-left font-mono text-xs text-rose-400 selection:bg-rose-500/20">
          <div className="font-bold mb-1 text-slate-200">{errorMessage}</div>
          {errorStack && <pre className="whitespace-pre-wrap mt-2 text-slate-400 leading-normal">{errorStack}</pre>}
        </div>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-emerald-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      
      <Card className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl relative overflow-hidden p-6 sm:p-8 rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
            <FiAlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-3">
            {errorTitle}
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md">
            {errorDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-8">
            <Button 
              type="primary" 
              size="large"
              icon={<FiRefreshCw className="mr-1.5" />}
              onClick={handleManualReload}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 border-none hover:from-emerald-400 hover:to-teal-500 font-semibold shadow-lg shadow-emerald-500/20 rounded-xl"
            >
              {isPersistentChunkError ? "Force Update & Reload" : "Reload Page"}
            </Button>
            
            <Button 
              size="large"
              icon={<FiHome className="mr-1.5" />}
              onClick={handleGoHome}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-slate-600 font-semibold rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>

          <div className="w-full text-left">
            <Collapse 
              ghost
              items={collapseItems}
              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40"
            />
          </div>
        </div>
      </Card>
      
      <p className="text-slate-600 text-xs mt-6 relative z-10">
        Hostel Xpert © {new Date().getFullYear()} • Dynamic Chunk Recovery Engine
      </p>
    </div>
  );
}
