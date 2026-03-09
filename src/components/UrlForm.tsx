import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateShortCode } from "@/lib/generateShortCode";
import { toast } from "sonner";

interface UrlFormProps {
  onLinkCreated: () => void;
  userId: string;
}

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

export function UrlForm({ onLinkCreated, userId }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) { toast.error("Please enter a URL"); return; }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    if (!URL_REGEX.test(finalUrl)) { toast.error("Please enter a valid URL"); return; }

    const parsedMax = maxClicks.trim() ? parseInt(maxClicks.trim(), 10) : null;
    if (parsedMax !== null && (isNaN(parsedMax) || parsedMax < 1)) {
      toast.error("Click limit must be a positive number");
      return;
    }

    setIsLoading(true);
    try {
      let shortCode = generateShortCode();
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from("links").select("id").eq("short_code", shortCode).single();
        if (!existing) break;
        shortCode = generateShortCode();
        attempts++;
      }

      const { error: insertError } = await supabase
        .from("links")
        .insert({
          original_url: finalUrl,
          short_code: shortCode,
          user_id: userId,
          max_clicks: parsedMax,
        });

      if (insertError) throw insertError;
      toast.success("Link shortened successfully!");
      setUrl("");
      setMaxClicks("");
      onLinkCreated();
    } catch (err) {
      console.error("Error creating link:", err);
      toast.error("Failed to create short link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-3">
      <div className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-12 h-14 text-base bg-card border-border shadow-card focus:shadow-card-hover focus:border-primary transition-all duration-200"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-14 px-8 gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-card-hover transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Shorten
            </>
          )}
        </Button>
      </div>
      <div className="flex items-center gap-3 max-w-xs">
        <Label htmlFor="maxClicks" className="text-sm text-muted-foreground whitespace-nowrap">
          Click limit (optional)
        </Label>
        <Input
          id="maxClicks"
          type="number"
          min="1"
          placeholder="∞"
          value={maxClicks}
          onChange={(e) => setMaxClicks(e.target.value)}
          className="h-9 w-24 text-sm bg-card border-border"
        />
      </div>
    </form>
  );
}
