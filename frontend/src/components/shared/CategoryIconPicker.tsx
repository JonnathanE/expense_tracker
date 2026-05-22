import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ALL_CATEGORY_ICONS, CATEGORY_ICON_GROUPS } from "@/lib/category-icons";

// Los primeros 8 iconos de la lista plana como destacados
const FEATURED_ICONS = ALL_CATEGORY_ICONS.slice(0, 8).map((i) => i.name);

interface CategoryIconPickerProps {
    value: string;
    onChange: (icon: string) => void;
}

function IconImg({ name, className }: { name: string; className?: string }) {
    return (
        <img
            src={`/src/assets/icons/${name}.svg`}
            alt={name}
            className={className ?? "w-5 h-5"}
            style={{ filter: "var(--icon-filter, none)" }}
        />
    );
}

function IconButton({
    name,
    selected,
    onClick,
}: {
    name: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all
                ${
                    selected
                        ? "border-primary bg-primary/10 dark:bg-primary/50"
                        : "border-border bg-muted dark:bg-gray-200 hover:border-muted-foreground/50"
                }
            `}
        >
            <IconImg name={name} className="w-5 h-5 invert dark:invert" />
        </button>
    );
}

export function CategoryIconPicker({
    value,
    onChange,
}: CategoryIconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { t } = useTranslation();

    const filteredGroups = search.trim()
        ? [
              {
                  group: t("categoryIconPicker.results"),
                  icons: ALL_CATEGORY_ICONS.filter(
                      (i) =>
                          i.label
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                          i.name.toLowerCase().includes(search.toLowerCase()),
                  ),
              },
          ]
        : CATEGORY_ICON_GROUPS;

    return (
        <>
            {/* Fila de destacados + botón "..." */}
            <div className="flex flex-wrap gap-2 items-center">
                {FEATURED_ICONS.map((name) => (
                    <IconButton
                        key={name}
                        name={name}
                        selected={value === name}
                        onClick={() => onChange(name)}
                    />
                ))}

                {/* Ícono seleccionado fuera de los destacados */}
                {value && !FEATURED_ICONS.includes(value) && (
                    <IconButton
                        name={value}
                        selected
                        onClick={() => setOpen(true)}
                    />
                )}

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-10 h-10 rounded-lg border-2 border-border bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* Dialog con todos los iconos */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {t("categoryIconPicker.title")}
                        </DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder={t("categoryIconPicker.search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="shrink-0"
                    />

                    <div className="overflow-y-auto flex-1 space-y-5 pr-1">
                        {filteredGroups.map((group) => (
                            <div key={group.group} className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {group.group}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {group.icons.map(({ name, label }) => (
                                        <button
                                            key={name}
                                            type="button"
                                            title={label}
                                            onClick={() => {
                                                onChange(name);
                                                setOpen(false);
                                            }}
                                            className={`
                                                flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all
                                                ${
                                                    value === name
                                                        ? "border-primary bg-primary/10 dark:bg-primary/50"
                                                        : "border-border bg-muted dark:bg-gray-200 hover:border-muted-foreground/50"
                                                }
                                            `}
                                        >
                                            <IconImg
                                                name={name}
                                                className="w-5 h-5 invert dark:invert"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredGroups[0]?.icons.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-8">
                                {t("categoryIconPicker.noResults", { search })}
                            </p>
                        )}
                    </div>

                    <div className="shrink-0 flex justify-end pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {t("categoryIconPicker.close")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
