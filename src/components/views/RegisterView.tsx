import { RegistrationForm } from "../auth/RegistrationForm";

export function RegisterView() {
  return (
    <RegistrationForm
      onSubmit={async (data) => {
        console.log(data);
      }}
    />
  );
}
