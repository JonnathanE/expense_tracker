interface CategoryIconProps {
    icon: string | null;
    color: string;
    size?: "sm" | "md";
}

/**
 * Renders a category icon.
 * - If `icon` looks like a file name (no emoji, only ASCII), loads from /icons/
 * - Otherwise renders it as text (legacy emoji support)
 * - If `icon` is null, renders a fallback
 */

export function CategoryIcon({ icon, color, size = "md" }: CategoryIconProps) {
    const isAsset = icon !== null && /^[\w-]+$/.test(icon);
    const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
    const imgDim = size === "sm" ? "w-4 h-4" : "w-5 h-5";

    return (
        <div
            className={`${dim} rounded-lg flex items-center justify-center shrink-0 `}
            style={{
                backgroundColor: `${color}`,
                border: `1px solid ${color}`,
            }}
        >
            {isAsset ? (
                <img
                    src={`/icons/${icon}.svg`}
                    alt={icon}
                    className={`${imgDim} invert`}
                />
            ) : (
                <span className={size === "sm" ? "text-base" : "text-lg"}>
                    {icon}
                </span>
            )}
        </div>
    );
}
