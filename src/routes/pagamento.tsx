import { createFileRoute } from "@tanstack/react-router";

import { PaymentPage } from "@/modules/checkout/presentation/payment-page";

export const Route = createFileRoute("/pagamento")({
  component: PaymentPage,
});
