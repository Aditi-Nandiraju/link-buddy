import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Redirect = () => {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<"loading" | "not_found" | "inactive" | "expired">("loading");

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) { setStatus("not_found"); return; }

      try {
        const { data: link, error } = await supabase
          .from("links")
          .select("original_url, clicks, is_active, max_clicks")
          .eq("short_code", code)
          .single();

        if (error || !link) { setStatus("not_found"); return; }
        if (!link.is_active) { setStatus("inactive"); return; }
        if (link.max_clicks !== null && link.clicks >= link.max_clicks) { setStatus("expired"); return; }

        // Increment clicks and set last_accessed_at
        await supabase
          .from("links")
          .update({ clicks: link.clicks + 1, last_accessed_at: new Date().toISOString() })
          .eq("short_code", code);

        window.location.href = link.original_url;
      } catch (err) {
        console.error("Redirect error:", err);
        setStatus("not_found");
      }
    };

    handleRedirect();
  }, [code]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (status === "inactive") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Link Inactive</h1>
          <p className="text-muted-foreground">This shortened link has been disabled by its owner.</p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Link Expired</h1>
          <p className="text-muted-foreground">This shortened link has reached its maximum click limit and is no longer available.</p>
        </div>
      </div>
    );
  }

  return <Navigate to="/" replace />;
};

export default Redirect;
