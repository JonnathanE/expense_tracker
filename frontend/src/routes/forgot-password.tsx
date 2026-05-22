import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import logo from "@/assets/logo.png";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { createSchemas, type ForgotPasswordFormData } from "@/lib/schemas";

export const Route = createFileRoute("/forgot-password")({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    const { t } = useTranslation();
    const { forgotPasswordSchema } = createSchemas(t);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordFormData) =>
            authApi.forgotPassword(data.email),
    });

    const onSubmit = (data: ForgotPasswordFormData) => mutation.mutate(data);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-center space-y-2">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-16 h-16 mx-auto rounded-2xl"
                        />
                        <h1 className="text-2xl font-bold text-foreground">
                            {APP_NAME}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {t("forgotPassword.subtitle")}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("forgotPassword.title")}</CardTitle>
                            <CardDescription>
                                {t("forgotPassword.description")}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {/* Éxito — ocultamos el form */}
                            {mutation.isSuccess ? (
                                <div className="text-center space-y-4 py-2">
                                    <div className="text-5xl">📧</div>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">
                                            {t("forgotPassword.successTitle")}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {mutation.data.message}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    {mutation.isError && (
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                {axios.isAxiosError(
                                                    mutation.error,
                                                )
                                                    ? (mutation.error.response
                                                          ?.data?.error ??
                                                      t("forgotPassword.error"))
                                                    : t("forgotPassword.error")}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            {t("forgotPassword.email")}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t(
                                                "forgotPassword.emailPlaceholder",
                                            )}
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-destructive text-xs">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending
                                            ? t("forgotPassword.submitting")
                                            : t("forgotPassword.submit")}
                                    </Button>
                                </form>
                            )}
                        </CardContent>

                        <CardFooter className="justify-center">
                            <Link
                                to="/login"
                                className="text-muted-foreground text-sm hover:text-foreground"
                            >
                                {t("forgotPassword.backToLogin")}
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
