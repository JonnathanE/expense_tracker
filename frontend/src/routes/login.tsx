import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { getApiErrorMessage, handleApiError } from "@/lib/apiError";
import { APP_NAME } from "@/lib/constants";
import { createSchemas, type LoginFormData } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/login")({
    head: () => ({
        meta: [{ title: `${APP_NAME} - Login` }],
    }),
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) throw redirect({ to: "/" });
    },
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const { t } = useTranslation();
    const { loginSchema } = createSchemas(t);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const mutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setAuth(data.access_token, data.refresh_token, data.user);
            toast.success(t("login.welcome", { name: data.user.name }));
            navigate({ to: "/" });
        },
        onError: (err) => handleApiError(err, "auth"),
    });

    const onSubmit = (data: LoginFormData) => mutation.mutate(data);

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
                        <p className="text-muted-foreground text-sm">
                            {t("login.subtitle")}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("login.title")}</CardTitle>
                            <CardDescription>
                                {t("login.description")}
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
                                            {getApiErrorMessage(
                                                mutation.error,
                                                "auth",
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        {t("login.email")}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t(
                                            "login.emailPlaceholder",
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
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">
                                            {t("login.password")}
                                        </Label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            {t("login.forgotPassword")}
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t(
                                            "login.passwordPlaceholder",
                                        )}
                                        {...register("password")}
                                    />
                                    {errors.password && (
                                        <p className="text-destructive text-xs">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending
                                        ? t("login.submitting")
                                        : t("login.submit")}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <p className="text-muted-foreground text-sm">
                                {t("login.noAccount")}{" "}
                                <Link
                                    to="/register"
                                    className="text-primary hover:text-primary/80 font-medium"
                                >
                                    {t("login.register")}
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
