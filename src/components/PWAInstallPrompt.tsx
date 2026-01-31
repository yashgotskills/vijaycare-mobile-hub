import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if dismissed recently (within 3 days)
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      if (parseInt(dismissedAt) > threeDaysAgo) {
        return; // Don't show if dismissed within 3 days
      }
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, show manual instructions after delay
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-[360px]"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 backdrop-blur-md">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Install VijayCare App
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isIOS
                    ? "Tap the share button, then 'Add to Home Screen'"
                    : "Install our app for faster access and offline support"}
                </p>
              </div>
            </div>

            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstall}
                className="w-full mt-3 gap-2"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Install Now
              </Button>
            )}

            {isIOS && (
              <div className="mt-3 p-2.5 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Tap{" "}
                  <span className="inline-flex items-center mx-1">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14L4 20L20 20L20 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>{" "}
                  then <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
