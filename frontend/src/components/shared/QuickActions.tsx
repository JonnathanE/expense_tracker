import { ArrowLeftRight, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { TransactionForm } from "@/components/shared/TransactionForm";
import { TransferForm } from "@/components/shared/TransferForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCreateTransfer } from "@/hooks/useTransfers";
import type { TransactionFormData, TransferFormData } from "@/lib/schemas";

export function QuickActions() {
    const { t } = useTranslation();
    const [txOpen, setTxOpen] = useState(false);
    const [tfOpen, setTfOpen] = useState(false);

    const { data: accounts = [] } = useAccounts();
    const createTxMutation = useCreateTransaction();
    const createTfMutation = useCreateTransfer();

    const handleCreateTransaction = (data: TransactionFormData) => {
        createTxMutation.mutate(data, {
            onSuccess: () => {
                toast.success(t("transactions.created"));
                setTxOpen(false);
            },
        });
    };

    const handleCreateTransfer = (data: TransferFormData) => {
        createTfMutation.mutate(data, {
            onSuccess: () => {
                toast.success(t("transfers.created"));
                setTfOpen(false);
            },
        });
    };

    return (
        <>
            <Button
                size="sm"
                className="gap-1.5 h-8"
                onClick={() => setTxOpen(true)}
            >
                <Plus className="h-3.5 w-3.5" />
                {t("nav.newTransaction")}
            </Button>

            <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
                onClick={() => setTfOpen(true)}
            >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {t("nav.newTransfer")}
            </Button>

            {/* Modal nueva transacción */}
            <Dialog open={txOpen} onOpenChange={setTxOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("transactions.newTitle")}</DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        onSubmit={handleCreateTransaction}
                        onCancel={() => setTxOpen(false)}
                        isPending={createTxMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal nueva transferencia */}
            <Dialog open={tfOpen} onOpenChange={setTfOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("transfers.newTitle")}</DialogTitle>
                    </DialogHeader>
                    <TransferForm
                        onSubmit={handleCreateTransfer}
                        onCancel={() => setTfOpen(false)}
                        isPending={createTfMutation.isPending}
                        accounts={accounts}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
