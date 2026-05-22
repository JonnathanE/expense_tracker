import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import logo from "@/assets/logo.png";
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
import { type ResetPasswordFormData, resetPasswordSchema } from "@/lib/schemas";

export const Route = createFileRoute("/reset-password")({
    validateSearch: (search: Record<string, unknown>) => ({
        token: (search.token as string) ?? "",
    }),
    component: ResetPasswordPage,
});

function ResetPasswordPage() {
    const { token } = Route.useSearch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: ResetPasswordFormData) =>
            authApi.resetPassword({ token, new_password: data.password }),
        onSuccess: () => {
            toast.success("Contraseña actualizada. Ya puedes iniciar sesión.");
            navigate({ to: "/login" });
        },
    });

    const onSubmit = (data: ResetPasswordFormData) => mutation.mutate(data);

    // Sin token en la URL
    if (!token) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="text-5xl">⚠️</div>
                        <p className="font-semibold text-foreground">
                            Link inválido
                        </p>
                        <p className="text-muted-foreground text-sm">
                            El link de recuperación no es válido.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/forgot-password">
                                Solicitar nuevo link
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
                        Restablece tu contraseña
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nueva contraseña</CardTitle>
                        <CardDescription>
                            Ingresa tu nueva contraseña.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {mutation.isError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {axios.isAxiosError(mutation.error)
                                            ? (mutation.error.response?.data
                                                  ?.error ??
                                              "Error al restablecer")
                                            : "Error al restablecer"}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Nueva contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-destructive text-xs">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-destructive text-xs">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending
                                    ? "Actualizando..."
                                    : "Actualizar contraseña"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <Link
                            to="/login"
                            className="text-muted-foreground text-sm hover:text-foreground"
                        >
                            ← Volver al login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
