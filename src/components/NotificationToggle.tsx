import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const NotificationToggle = () => {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setIsProcessing(false);
  };

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  const loading = isLoading || isProcessing;

  return (
    <Button
      variant={isSubscribed ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      {isSubscribed ? "Notifications On" : "Enable Notifications"}
    </Button>
  );
};

export default NotificationToggle;
