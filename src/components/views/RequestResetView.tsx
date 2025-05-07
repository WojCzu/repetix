import { RequestResetForm } from "../auth/RequestResetForm";

export function RequestResetView() {
  return (
    <RequestResetForm
      onSubmit={async (data) => {
        console.log(data);
      }}
    />
  );
}
