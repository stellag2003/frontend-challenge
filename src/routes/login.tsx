import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPlaceholder,
});

function LoginPlaceholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="font-display text-2xl text-foreground">Login ainda não faz parte desta entrega</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Esta tela está fora do escopo atual. Volte ao cadastro para criar sua conta.
      </p>
      <Link
        to="/cadastro"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Voltar ao cadastro
      </Link>
    </main>
  );
}
