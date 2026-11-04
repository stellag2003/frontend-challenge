import { createFileRoute } from "@tanstack/react-router";

import { CartPage } from "@/modules/checkout/presentation/cart-page";

export const Route = createFileRoute("/carrinho")({
  component: CartPage,
});
