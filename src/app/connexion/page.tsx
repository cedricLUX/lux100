import { Suspense } from "react";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Connexion · Lëtzebuergesch en 100 jours" };

export default function Page() {
  return (
    <div className="wrap">
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
