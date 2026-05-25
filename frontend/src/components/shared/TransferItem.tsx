import { ArrowRight, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Transfer } from "@/types";

interface TransferItemProps {
    transfer: Transfer;
    onDeleteRequest: (id: string) => void;
    isDeleting: boolean;
}

export function TransferItem({
    transfer,
    onDeleteRequest,
    isDeleting,
}: TransferItemProps) {
    const { t } = useTranslation();

    /** Parsea YYYY-MM-DD (o ISO con hora) como fecha local, evitando el offset UTC. */
    const parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const date = parseLocalDate(transfer.date).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border group">
            <div className="flex items-center gap-3">
                {/* Arrow icon */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500/15">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                </div>

                <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <span>{transfer.from_account_name ?? "?"}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>{transfer.to_account_name ?? "?"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                            {date}
                        </span>
                        {transfer.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-40">
                                · {transfer.description}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                        {new Intl.NumberFormat(undefined, {
                            style: "decimal",
                            minimumFractionDigits: 2,
                        }).format(transfer.amount)}
                    </p>
                    {transfer.fee > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {t("transferItem.fee")}{" "}
                            {new Intl.NumberFormat(undefined, {
                                style: "decimal",
                                minimumFractionDigits: 2,
                            }).format(transfer.fee)}
                        </p>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all lg:opacity-0 group-hover:opacity-100"
                    onClick={() => onDeleteRequest(transfer.id)}
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
