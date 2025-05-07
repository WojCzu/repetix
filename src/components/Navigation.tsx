import { Link } from "./ui/link";
import { Button } from "./ui/button";

export function Navigation() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Repetix</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center space-x-4">
          <Link href="/generate" className="text-sm font-medium">
            Generate
          </Link>
          <Link href="/flashcards" className="text-sm font-medium">
            Flashcards
          </Link>
          <Link href="/review" className="text-sm font-medium">
            Review
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/settings/change-password" className="text-sm font-medium">
            Settings
          </Link>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
