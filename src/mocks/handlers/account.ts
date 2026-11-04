import { HttpResponse, http } from "msw";

const registeredEmails = new Set(["ana.ravache@example.com"]);

export const accountHandlers = [
  http.post("/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as { fullName: string; email: string };

    if (registeredEmails.has(body.email.toLowerCase())) {
      return HttpResponse.json(
        { code: "EMAIL_ALREADY_IN_USE", message: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }

    registeredEmails.add(body.email.toLowerCase());

    return HttpResponse.json(
      { id: crypto.randomUUID(), fullName: body.fullName, email: body.email },
      { status: 201 },
    );
  }),
];
