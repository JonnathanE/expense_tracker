import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
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
import { type LoginFormData, loginSchema } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/login")({
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) throw redirect({ to: "/" });
    },
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

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
            toast.success(`Bienvenido, ${data.user.name}`);
            navigate({ to: "/" });
        },
    });

    const onSubmit = (data: LoginFormData) => mutation.mutate(data);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="text-5xl">💰</div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Expense Tracker
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Ingresa a tu cuenta
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Iniciar sesión</CardTitle>
                        <CardDescription>
                            Ingresa tu email y contraseña
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
                                        {axios.isAxiosError(mutation.error)
                                            ? (mutation.error.response?.data
                                                  ?.error ??
                                              "Error al iniciar sesión")
                                            : "Error al iniciar sesión"}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
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
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
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
                                    ? "Ingresando..."
                                    : "Ingresar"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-muted-foreground text-sm">
                            ¿No tienes cuenta?{" "}
                            <Link
                                to="/register"
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Regístrate
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
