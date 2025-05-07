import { ResetPasswordForm } from "../auth/ResetPasswordForm";

interface ResetPasswordViewProps {
  token: string;
}

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
  return (
    <ResetPasswordForm
      token={token}
      onSubmit={async (data) => {
        console.log(data);
      }}
    />
  );
}
