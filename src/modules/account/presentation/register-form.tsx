import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldMessage } from "@/components/ui/field-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmailAlreadyInUseError } from "../domain/account-errors";
import {
  accountRegistrationSpec,
  type AccountRegistrationInput,
} from "../domain/account-registration.spec-contract";
import { registerAccountUseCase } from "../di";

export function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountRegistrationInput>({
    resolver: zodResolver(accountRegistrationSpec),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptsTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: AccountRegistrationInput) => registerAccountUseCase.execute(values),
    onSuccess: (account) => {
      toast.success("Conta criada.", {
        description: `Bem-vinda à coleção, ${account.fullName.split(" ")[0]}.`,
      });
      navigate({ to: "/login" });
    },
    onError: (error) => {
      if (error instanceof EmailAlreadyInUseError) {
        setError("email", { message: "Este e-mail já está cadastrado." });
        return;
      }
      toast.error("Não foi possível criar sua conta.", {
        description: "Tente novamente em instantes.",
      });
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Como você assina suas peças"
          invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          {...register("fullName")}
        />
        {errors.fullName && <FieldMessage id="fullName-error">{errors.fullName.message}</FieldMessage>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && <FieldMessage id="email-error">{errors.email.message}</FieldMessage>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : "password-hint"}
            {...register("password")}
          />
          {errors.password ? (
            <FieldMessage id="password-error">{errors.password.message}</FieldMessage>
          ) : (
            <FieldMessage id="password-hint" tone="muted">
              Mín. 8 caracteres, 1 maiúscula e 1 número.
            </FieldMessage>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldMessage id="confirmPassword-error">{errors.confirmPassword.message}</FieldMessage>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 pt-1">
        <Controller
          control={control}
          name="acceptsTerms"
          render={({ field }) => (
            <Checkbox
              id="acceptsTerms"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              invalid={Boolean(errors.acceptsTerms)}
              aria-describedby={errors.acceptsTerms ? "acceptsTerms-error" : undefined}
            />
          )}
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="acceptsTerms" className="font-normal text-foreground/80">
            Li e aceito os termos de uso e a política de privacidade.
          </Label>
          {errors.acceptsTerms && (
            <FieldMessage id="acceptsTerms-error">{errors.acceptsTerms.message}</FieldMessage>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>
    </form>
  );
}
