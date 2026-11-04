import { Link } from "@tanstack/react-router";

import { CollectorShowcase } from "./collector-showcase";
import { RegisterForm } from "./register-form";

export function CadastroPage() {
  return (
    <main className="flex min-h-screen bg-background">
      <div className="hidden w-[46%] lg:block">
        <CollectorShowcase />
      </div>

      <div className="flex w-full flex-col lg:w-[54%]">
        <header className="flex items-center justify-end px-10 py-8 lg:px-16">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </header>

        <div className="flex flex-1 items-center justify-center px-10 pb-16 lg:px-16">
          <div className="w-full max-w-[440px]">
            <h1 className="font-display text-3xl text-foreground">Crie sua conta de colecionador</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Leva menos de um minuto. Você poderá completar seu perfil depois.
            </p>

            <div className="mt-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
