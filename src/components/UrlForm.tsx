import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateShortCode } from "@/lib/generateShortCode";
import { toast } from "sonner";

interface UrlFormProps {
  onLinkCreated: () => void;
}

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

export function UrlForm({ onLinkCreated }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUrl = (input: string): string | null => {
    if (!input.trim()) {
      return "Please enter a URL";
    }
    
    let urlToValidate = input.trim();
    if (!urlToValidate.startsWith("http://") && !urlToValidate.startsWith("https://")) {
      urlToValidate = "https://" + urlToValidate;
    }
    
    if (!URL_REGEX.test(urlToValidate)) {
      return "Please enter a valid URL";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUrl(url);
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);

    try {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }

      // Generate unique short code
      let shortCode = generateShortCode();
      let attempts = 0;
      
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from("links")
          .select("id")
          .eq("short_code", shortCode)
          .single();
        
        if (!existing) break;
        shortCode = generateShortCode();
        attempts++;
      }

      const { error: insertError } = await supabase
        .from("links")
        .insert({ original_url: finalUrl, short_code: shortCode });

      if (insertError) throw insertError;

      toast.success("Link shortened successfully!");
      setUrl("");
      onLinkCreated();
    } catch (err) {
      console.error("Error creating link:", err);
      toast.error("Failed to create short link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
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
    </form>
  );
}
