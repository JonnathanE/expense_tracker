import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
import { type RegisterFormData, registerSchema } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/register")({
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) throw redirect({ to: "/" });
    },
    component: RegisterPage,
});

function RegisterPage() {
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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="text-5xl">💰</div>
                    <h1 className="text-2xl font-bold text-white">
                        Expense Tracker
                    </h1>
                </div>

                {/* Pantalla de confirmación post-registro */}
                {mutation.isSuccess ? (
                    <Card className="bg-zinc-900 border-zinc-800 text-center">
                        <CardContent className="pt-6 space-y-4">
                            <div className="text-5xl">📧</div>
                            <p className="text-white font-semibold text-lg">
                                Revisa tu correo
                            </p>
                            <p className="text-zinc-400 text-sm">
                                Enviamos un enlace de activación a{" "}
                                <span className="text-white font-medium">
                                    {getValues("email")}
                                </span>
                                . Haz clic en él para activar tu cuenta.
                            </p>
                            <p className="text-zinc-500 text-xs">
                                ¿No lo ves? Revisa tu carpeta de spam.
                            </p>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <p className="text-zinc-400 text-sm">
                                ¿Ya activaste tu cuenta?{" "}
                                <Link
                                    to="/login"
                                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                    Inicia sesión
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                ) : (
                    <>
                        <p className="text-zinc-400 text-sm text-center">
                            Crea tu cuenta
                        </p>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Crear cuenta
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Completa los datos para registrarte
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
                                                {(mutation.error as any)
                                                    ?.response?.data?.error ??
                                                    "Error al registrarse"}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Nombre */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-zinc-300"
                                        >
                                            Nombre
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="Tu nombre"
                                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-red-400 text-xs">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

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
                                            placeholder="Mínimo 6 caracteres"
                                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                            {...register("password")}
                                        />
                                        {errors.password && (
                                            <p className="text-red-400 text-xs">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="confirmPassword"
                                            className="text-zinc-300"
                                        >
                                            Confirmar contraseña
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Repite tu contraseña"
                                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                            {...register("confirmPassword")}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-red-400 text-xs">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending
                                            ? "Creando cuenta..."
                                            : "Crear cuenta"}
                                    </Button>
                                </form>
                            </CardContent>

                            <CardFooter className="justify-center">
                                <p className="text-zinc-400 text-sm">
                                    ¿Ya tienes cuenta?{" "}
                                    <Link
                                        to="/login"
                                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                                    >
                                        Inicia sesión
                                    </Link>
                                </p>
                            </CardFooter>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
