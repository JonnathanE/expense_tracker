import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";

// Leer el query param ?token= de la URL de forma type-safe
export const Route = createFileRoute("/activate")({
    validateSearch: (search: Record<string, unknown>) => ({
        token: (search.token as string) ?? "",
    }),
    component: ActivatePage,
});

function ActivatePage() {
    const { token } = Route.useSearch();

    const { isPending, isSuccess, isError, error } = useQuery({
        queryKey: ["activate", token],
        queryFn: () => authApi.activate(token),
        enabled: !!token,
        retry: false,
        staleTime: Infinity,
    });

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="text-5xl">💰</div>

                {/* Cargando */}
                {isPending && token && (
                    <div className="space-y-3">
                        <div className="text-4xl animate-spin">⚙️</div>
                        <p className="text-muted-foreground">
                            Activando tu cuenta...
                        </p>
                    </div>
                )}

                {/* Token faltante */}
                {!token && (
                    <div className="space-y-4">
                        <div className="text-4xl">⚠️</div>
                        <p className="text-foreground font-semibold">
                            Link inválido
                        </p>
                        <p className="text-muted-foreground text-sm">
                            El link de activación no es válido. Revisa tu email.
                        </p>
                    </div>
                )}

                {/* Éxito */}
                {isSuccess && (
                    <div className="space-y-4">
                        <div className="text-5xl">✅</div>
                        <p className="text-foreground font-semibold text-xl">
                            ¡Cuenta activada!
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Tu cuenta está lista. Ya puedes iniciar sesión.
                        </p>
                        <Button asChild>
                            <Link to="/login">Ir al login</Link>
                        </Button>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="space-y-4">
                        <div className="text-5xl">❌</div>
                        <p className="text-foreground font-semibold">
                            Error al activar
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {axios.isAxiosError(error)
                                ? (error.response?.data?.error ??
                                  "El link es inválido o ya expiró.")
                                : "El link es inválido o ya expiró."}
                        </p>
                        <Button asChild variant="outline">
                            <Link to="/register">Crear nueva cuenta</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
