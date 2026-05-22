import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import logo from "@/assets/logo.png";
import { PublicFooter } from "@/components/shared/PublicFooter";
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
    const { t } = useTranslation();

    const { isPending, isSuccess, isError, error } = useQuery({
        queryKey: ["activate", token],
        queryFn: () => authApi.activate(token),
        enabled: !!token,
        retry: false,
        staleTime: Infinity,
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm text-center space-y-6">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-16 h-16 mx-auto rounded-2xl"
                    />

                    {/* Cargando */}
                    {isPending && token && (
                        <div className="space-y-3">
                            <div className="text-4xl animate-spin">⚙️</div>
                            <p className="text-muted-foreground">
                                {t("activate.loading")}
                            </p>
                        </div>
                    )}

                    {/* Token faltante */}
                    {!token && (
                        <div className="space-y-4">
                            <div className="text-4xl">⚠️</div>
                            <p className="text-foreground font-semibold">
                                {t("activate.invalidLink")}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {t("activate.invalidMessage")}
                            </p>
                        </div>
                    )}

                    {/* Éxito */}
                    {isSuccess && (
                        <div className="space-y-4">
                            <div className="text-5xl">✅</div>
                            <p className="text-foreground font-semibold text-xl">
                                {t("activate.success")}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {t("activate.successMessage")}
                            </p>
                            <Button asChild>
                                <Link to="/login">
                                    {t("activate.goToLogin")}
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Error */}
                    {isError && (
                        <div className="space-y-4">
                            <div className="text-5xl">❌</div>
                            <p className="text-foreground font-semibold">
                                {t("activate.error")}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {axios.isAxiosError(error)
                                    ? (error.response?.data?.error ??
                                      t("activate.errorMessage"))
                                    : t("activate.errorMessage")}
                            </p>
                            <Button asChild variant="outline">
                                <Link to="/register">
                                    {t("activate.createAccount")}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}
