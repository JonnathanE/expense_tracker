import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
import { createSchemas, type RegisterFormData } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/register")({
    head: () => ({
        meta: [{ title: `${APP_NAME} - Register` }],
    }),
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) throw redirect({ to: "/" });
    },
    component: RegisterPage,
});

function RegisterPage() {
    const { t } = useTranslation();
    const { registerSchema } = createSchemas(t);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: RegisterFormData) =>
            authApi.register({
                name: data.name,
                email: data.email,
                password: data.password,
            }),
    });

    const onSubmit = (data: RegisterFormData) => mutation.mutate(data);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-6">
                    {/* Logo */}
                    <div className="text-center space-y-2">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-16 h-16 mx-auto rounded-2xl"
                        />
                        <h1 className="text-2xl font-bold text-foreground">
                            {APP_NAME}
                        </h1>
                    </div>

                    {/* Pantalla de confirmación post-registro */}
                    {mutation.isSuccess ? (
                        <Card className="text-center">
                            <CardContent className="pt-6 space-y-4">
                                <div className="text-5xl">📧</div>
                                <p className="text-foreground font-semibold text-lg">
                                    {t("register.successTitle")}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {t("register.successMessage", {
                                        email: getValues("email"),
                                    })}
                                </p>
                                <p className="text-muted-foreground/70 text-xs">
                                    {t("register.successSpam")}
                                </p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <p className="text-muted-foreground text-sm">
                                    {t("register.successActivated")}{" "}
                                    <Link
                                        to="/login"
                                        className="text-primary hover:text-primary/80 font-medium"
                                    >
                                        {t("register.signIn")}
                                    </Link>
                                </p>
                            </CardFooter>
                        </Card>
                    ) : (
                        <>
                            <p className="text-muted-foreground text-sm text-center">
                                {t("register.subtitle")}
                            </p>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("register.title")}</CardTitle>
                                    <CardDescription>
                                        {t("register.description")}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        {/* Error del servidor */}
                                        {mutation.isError && (
                                            <Alert variant="destructive">
                                                <AlertDescription>
                                                    {axios.isAxiosError(
                                                        mutation.error,
                                                    )
                                                        ? (mutation.error
                                                              .response?.data
                                                              ?.error ??
                                                          t("register.error"))
                                                        : t("register.error")}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Nombre */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                {t("register.name")}
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder={t(
                                                    "register.namePlaceholder",
                                                )}
                                                {...register("name")}
                                            />
                                            {errors.name && (
                                                <p className="text-destructive text-xs">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                {t("register.email")}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder={t(
                                                    "register.emailPlaceholder",
                                                )}
                                                {...register("email")}
                                            />
                                            {errors.email && (
                                                <p className="text-destructive text-xs">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                {t("register.password")}
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder={t(
                                                    "register.passwordPlaceholder",
                                                )}
                                                {...register("password")}
                                            />
                                            {errors.password && (
                                                <p className="text-destructive text-xs">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">
                                                {t("register.confirmPassword")}
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder={t(
                                                    "register.confirmPasswordPlaceholder",
                                                )}
                                                {...register("confirmPassword")}
                                            />
                                            {errors.confirmPassword && (
                                                <p className="text-destructive text-xs">
                                                    {
                                                        errors.confirmPassword
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending
                                                ? t("register.submitting")
                                                : t("register.submit")}
                                        </Button>
                                    </form>
                                </CardContent>

                                <CardFooter className="justify-center">
                                    <p className="text-muted-foreground text-sm">
                                        {t("register.hasAccount")}{" "}
                                        <Link
                                            to="/login"
                                            className="text-primary hover:text-primary/80 font-medium"
                                        >
                                            {t("register.signIn")}
                                        </Link>
                                    </p>
                                </CardFooter>
                            </Card>
                        </>
                    )}
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
