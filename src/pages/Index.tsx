import { useEffect, useState, useCallback } from "react";
import { UrlForm } from "@/components/UrlForm";
import { LinkDashboard } from "@/components/LinkDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/types/link";
import { Link2 } from "lucide-react";

const Index = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
              <Link2 className="h-4 w-4" />
              Simple & Fast URL Shortener
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-in">
              Shorten URLs,{" "}
              <span className="text-gradient">Track Clicks</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in">
              Transform long, messy links into clean, shareable URLs. 
              Monitor clicks and engagement in real-time.
            </p>
          </div>

          <div className="animate-scale-in">
            <UrlForm onLinkCreated={fetchLinks} />
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Your Links
          </h2>
          {links.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {links.length} link{links.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <LinkDashboard links={links} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Index;
