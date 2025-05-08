import { Link } from "../ui/link";

export function UnauthenticatedMenu() {
  return (
    <ul className="flex flex-1 items-center justify-end space-x-4">
      <li>
        <Link href="/login" className="text-sm font-medium">
          Login
        </Link>
      </li>
      <li>
        <Link href="/register" variant="default" className="text-sm">
          Register
        </Link>
      </li>
    </ul>
  );
}
