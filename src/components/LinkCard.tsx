import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/types/link";
import { Copy, Check, ExternalLink, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  
  const shortUrl = `${window.location.origin}/s/${link.short_code}`;

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

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <Card className="p-5 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in group">
      <div className="flex flex-col gap-4">
        {/* Short URL */}
        <div className="flex items-center justify-between gap-3">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-semibold text-primary hover:underline flex items-center gap-2 truncate"
          >
            {shortUrl}
            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-shrink-0 border-primary/30 hover:bg-accent"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Original URL */}
        <p className="text-sm text-muted-foreground truncate" title={link.original_url}>
          {truncateUrl(link.original_url)}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointerClick className="h-4 w-4" />
            <span className="font-medium">{link.clicks}</span>
            <span>click{link.clicks !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(link.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
