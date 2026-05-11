import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
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
            setAuth(data.token, data.user);
            navigate({ to: "/" });
        },
    });

    const onSubmit = (data: LoginFormData) => mutation.mutate(data);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="text-5xl">💰</div>
                    <h1 className="text-2xl font-bold text-white">
                        Expense Tracker
                    </h1>
                    <p className="text-zinc-400 text-sm">Ingresa a tu cuenta</p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">
                            Iniciar sesión
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
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
                                        {(mutation.error as any)?.response?.data
                                            ?.error ??
                                            "Error al iniciar sesión"}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-zinc-300"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-xs">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-zinc-300"
                                >
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-red-400 text-xs">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending
                                    ? "Ingresando..."
                                    : "Ingresar"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-zinc-400 text-sm">
                            ¿No tienes cuenta?{" "}
                            <Link
                                to="/register"
                                className="text-indigo-400 hover:text-indigo-300 font-medium"
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
