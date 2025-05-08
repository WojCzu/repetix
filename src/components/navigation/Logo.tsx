import { Link } from "../ui/link";

export function Logo() {
  return (
    <div className="mr-4 flex">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl font-bold">Repetix</span>
      </Link>
    </div>
  );
}
