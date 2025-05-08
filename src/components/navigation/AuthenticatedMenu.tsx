import { Link } from "../ui/link";

export function AuthenticatedMenu() {
  return (
    <>
      <ul className="flex flex-1 items-center space-x-4">
        <li>
          <Link href="/generate" className="text-sm font-medium">
            Generate
          </Link>
        </li>
        <li>
          <Link href="/flashcards" className="text-sm font-medium">
            Flashcards
          </Link>
        </li>
        <li>
          <Link href="/review" className="text-sm font-medium">
            Review
          </Link>
        </li>
      </ul>
      <ul className="flex items-center space-x-4">
        <li>
          <Link href="/settings/change-password" className="text-sm font-medium">
            Settings
          </Link>
        </li>
        <li>
          <form action="/api/auth/logout" method="POST">
            <Link
              href="#"
              variant="outline"
              className="text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.currentTarget.closest("form")?.requestSubmit();
              }}
            >
              Logout
            </Link>
          </form>
        </li>
      </ul>
    </>
  );
}
