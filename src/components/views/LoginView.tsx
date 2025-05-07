import { LoginForm } from "../auth/LoginForm";

interface LoginViewProps {
  redirectTo: string;
}

export function LoginView({ redirectTo }: LoginViewProps) {
  return (
    <LoginForm
      redirectTo={redirectTo}
      onSubmit={async (data) => {
        console.log(data);
      }}
    />
  );
}
