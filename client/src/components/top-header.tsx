import { useTheme } from "@/lib/theme";
import { Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import zorishLogoUrl from "../assets/zorish-z.svg";

export function TopHeader({ title }: { title?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl" data-testid="header-top">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-1 px-4">
        <div className="flex items-center gap-2">
          <img
            src={zorishLogoUrl}
            alt="Zorish"
            className="h-7 w-7 shrink-0"
          />
          <h1 className="text-lg font-bold tracking-tight gold-text">
            {title || "Zorish"}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
