import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/types/link";
import { Copy, Check, ExternalLink, MousePointerClick, Pencil, X, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LinkCardProps {
  link: Link;
  onUpdate: () => void;
}

export function LinkCard({ link, onUpdate }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(link.original_url);
  const [isSaving, setIsSaving] = useState(false);

  const shortUrl = `${window.location.origin}/s/${link.short_code}`;
  const isExpired = link.max_clicks !== null && link.clicks >= link.max_clicks;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleToggleActive = async () => {
    try {
      const { error } = await supabase
        .from("links")
        .update({ is_active: !link.is_active })
        .eq("id", link.id);
      if (error) throw error;
      onUpdate();
      toast.success(link.is_active ? "Link disabled" : "Link enabled");
    } catch {
      toast.error("Failed to update link status");
    }
  };

  const handleSaveUrl = async () => {
    if (!editUrl.trim()) {
      toast.error("URL cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      let finalUrl = editUrl.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
      const { error } = await supabase
        .from("links")
        .update({ original_url: finalUrl })
        .eq("id", link.id);
      if (error) throw error;
      setIsEditing(false);
      onUpdate();
      toast.success("Destination URL updated");
    } catch {
      toast.error("Failed to update URL");
    } finally {
      setIsSaving(false);
    }
  };

  const truncateUrl = (url: string, maxLength: number = 45) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <Card className={`p-5 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in group ${!link.is_active ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-3">
        {/* Header: Short URL + Toggle */}
        <div className="flex items-center justify-between gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-semibold text-primary hover:underline flex items-center gap-1.5 truncate text-sm"
          >
            {link.short_code}
            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
          <div className="flex items-center gap-2">
            <Switch checked={link.is_active} onCheckedChange={handleToggleActive} />
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex-shrink-0 h-8 w-8 p-0">
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Original URL (editable) */}
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleSaveUrl} disabled={isSaving} className="h-8 w-8 p-0 gradient-primary text-primary-foreground">
              <Save className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditUrl(link.original_url); }} className="h-8 w-8 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground truncate flex-1" title={link.original_url}>
              {truncateUrl(link.original_url)}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {!link.is_active && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Disabled</span>
          )}
          {isExpired && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Click limit reached</span>
          )}
          {link.max_clicks !== null && !isExpired && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
              {link.clicks}/{link.max_clicks} clicks
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span className="font-medium">{link.clicks}</span> click{link.clicks !== 1 ? "s" : ""}
          </div>
          <span>Created {formatDate(link.created_at)}</span>
        </div>

        {link.last_accessed_at && (
          <div className="text-xs text-muted-foreground">
            Last accessed: {formatDate(link.last_accessed_at)}
          </div>
        )}
      </div>
    </Card>
  );
}
