import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { attachCloudUser } from "@/lib/progress-store";

/**
 * Binds the signed-in user to the progress store so every lesson/quiz
 * completion is persisted to the cloud in real time.
 */
export function CloudSync() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    void attachCloudUser(user?.id ?? null);
  }, [loading, user?.id]);

  return null;
}
