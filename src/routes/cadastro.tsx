import { createFileRoute } from "@tanstack/react-router";

import { CadastroPage } from "@/modules/account/presentation/cadastro-page";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});
