import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrency } from "@/lib/currencies";
import type { Account } from "@/types";

interface AccountCardProps {
    account: Account;
    onEditRequest: (account: Account) => void;
    onDeleteRequest: (id: string) => void;
    isDeleting: boolean;
}

export function AccountCard({
    account,
    onEditRequest,
    onDeleteRequest,
    isDeleting,
}: AccountCardProps) {
    const { t } = useTranslation();
    const currency = getCurrency(account.currency);

    const formattedBalance = new Intl.NumberFormat(
        currency?.locale ?? "en-US",
        {
            style: "currency",
            currency: account.currency,
        },
    ).format(account.balance);

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border group">
            <div className="flex items-center gap-3">
                <CategoryIcon icon={account.icon} color={account.color} />
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {account.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                            {formattedBalance}
                        </span>
                        <Badge variant="secondary" className="text-xs px-1.5">
                            {account.currency}
                        </Badge>
                        {account.exclude_from_stats && (
                            <Badge
                                variant="secondary"
                                className="text-xs px-1.5 text-muted-foreground"
                            >
                                {t("accountCard.excluded")}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-all">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEditRequest(account)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={() => onDeleteRequest(account.id)}
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
