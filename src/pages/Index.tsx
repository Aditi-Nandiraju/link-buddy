import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UrlForm } from "@/components/UrlForm";
import { LinkDashboard } from "@/components/LinkDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/types/link";
import { Link2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLinks(data || []);
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchLinks();
  }, [user, fetchLinks]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/auth");
  };

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">LinkTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Shorten URLs, <span className="text-gradient">Track Clicks</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Create short links with click limits, toggle them on/off, and track engagement.
            </p>
          </div>
          <UrlForm onLinkCreated={fetchLinks} userId={user.id} />
        </div>
      </div>

      {/* Dashboard */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Your Links</h2>
          {links.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {links.length} link{links.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <LinkDashboard links={links} isLoading={isLoading} onUpdate={fetchLinks} />
      </div>
    </div>
  );
};

export default Index;
