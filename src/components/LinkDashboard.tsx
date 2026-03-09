import { Link } from "@/types/link";
import { LinkCard } from "./LinkCard";
import { Link2Off, Loader2 } from "lucide-react";

interface LinkDashboardProps {
  links: Link[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function LinkDashboard({ links, isLoading, onUpdate }: LinkDashboardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Link2Off className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">No links yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Paste a URL above to create your first shortened link
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
