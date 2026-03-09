import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Redirect = () => {
  const { code } = useParams<{ code: string }>();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) {
        setNotFound(true);
        return;
      }

      try {
        // Fetch the link
        const { data: link, error } = await supabase
          .from("links")
          .select("original_url, clicks")
          .eq("short_code", code)
          .single();

        if (error || !link) {
          setNotFound(true);
          return;
        }

        // Increment click count
        await supabase
          .from("links")
          .update({ clicks: link.clicks + 1 })
          .eq("short_code", code);

        // Redirect to original URL
        window.location.href = link.original_url;
      } catch (err) {
        console.error("Redirect error:", err);
        setNotFound(true);
      }
    };

    handleRedirect();
  }, [code]);

  if (notFound) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Redirect;
