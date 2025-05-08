import { useAuth } from "../../lib/contexts/AuthContext";
import { Logo } from "./Logo";
import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";

interface NavigationProps {
  isLoggedIn?: boolean;
}

export function Navigation({ isLoggedIn: initialLoggedIn }: NavigationProps) {
  // Use initialLoggedIn from props and useAuth for client-side updates
  const { user } = useAuth();
  const isLoggedIn = !!user || initialLoggedIn;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Logo />
        {isLoggedIn ? <AuthenticatedMenu /> : <UnauthenticatedMenu />}
      </div>
    </nav>
  );
}
