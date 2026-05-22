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
import {
    ALL_CATEGORY_COLORS,
    CATEGORY_COLOR_GROUPS,
} from "@/lib/category-colors";

// Un color destacado por grupo (el del medio)
const FEATURED_COLORS = [
    "#ef4444", // rojo
    "#f97316", // naranja
    "#eab308", // amarillo
    "#22c55e", // verde
    "#06b6d4", // cyan
    "#3b82f6", // azul
    "#8b5cf6", // violeta
    "#ec4899", // rosa
];

interface CategoryColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

function ColorSwatch({
    color,
    label,
    selected,
    onClick,
}: {
    color: string;
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={label}
            onClick={onClick}
            className={`
                w-10 h-10 rounded-lg border-2 transition-all shrink-0
                ${selected ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground/50"}
            `}
            style={{ backgroundColor: color }}
        />
    );
}

export function CategoryColorPicker({
    value,
    onChange,
}: CategoryColorPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { t } = useTranslation();

    const selectedColor = ALL_CATEGORY_COLORS.find((c) => c.value === value);

    const filteredGroups = search.trim()
        ? [
              {
                  group: t("categoryColorPicker.results"),
                  colors: ALL_CATEGORY_COLORS.filter(
                      (c) =>
                          c.label
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                          c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.value.toLowerCase().includes(search.toLowerCase()),
                  ),
              },
          ]
        : CATEGORY_COLOR_GROUPS;

    return (
        <>
            {/* Fila de destacados + color seleccionado fuera de ellos + botón "..." */}
            <div className="flex flex-wrap gap-2 items-center">
                {FEATURED_COLORS.map((color) => (
                    <ColorSwatch
                        key={color}
                        color={color}
                        label={
                            ALL_CATEGORY_COLORS.find((c) => c.value === color)
                                ?.label ?? color
                        }
                        selected={value === color}
                        onClick={() => onChange(color)}
                    />
                ))}

                {/* Color seleccionado que no está en los destacados */}
                {value && !FEATURED_COLORS.includes(value) && (
                    <ColorSwatch
                        color={value}
                        label={selectedColor?.label ?? value}
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

            {/* Dialog con todos los colores */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {t("categoryColorPicker.title")}
                        </DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder={t("categoryColorPicker.search")}
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
                                    {group.colors.map(
                                        ({ value: hex, label }) => (
                                            <ColorSwatch
                                                key={hex}
                                                color={hex}
                                                label={label}
                                                selected={value === hex}
                                                onClick={() => {
                                                    onChange(hex);
                                                    setOpen(false);
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredGroups[0]?.colors.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-8">
                                {t("categoryColorPicker.noResults", { search })}
                            </p>
                        )}
                    </div>

                    <div className="shrink-0 flex justify-end pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {t("categoryColorPicker.close")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
