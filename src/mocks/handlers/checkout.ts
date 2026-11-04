import { HttpResponse, delay, http } from "msw";

import { checkoutDb } from "../checkout/db";
import { realtimeHandlers } from "../checkout/realtime";

export const checkoutHandlers = [
  http.get("/api/cart", async () => {
    await delay(50);
    return HttpResponse.json(checkoutDb.getCart());
  }),

  http.delete("/api/cart/items/:editionId", async ({ params }) => {
    await delay(50);
    return HttpResponse.json(checkoutDb.removeCartItem(String(params.editionId)));
  }),

  http.post("/api/checkout/quotes", async () => {
    await delay(80);
    return HttpResponse.json(checkoutDb.createQuote(), { status: 201 });
  }),

  http.post("/api/orders", async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as { quoteId?: string };
    const result = checkoutDb.placeOrder(String(body.quoteId ?? ""));

    if (!result.ok) {
      const status = result.code === "QUOTE_NOT_FOUND" ? 404 : 409;
      return HttpResponse.json({ code: result.code, message: "A cotação não corresponde ao estado atual." }, { status });
    }

    return HttpResponse.json(result.order, { status: 201 });
  }),

  ...realtimeHandlers,
];
