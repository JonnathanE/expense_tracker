interface SidebarLayoutProps {
    children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            {/* Sidebar — lo construimos en el próximo paso */}
            <aside className="w-56 border-r border-zinc-800 p-4">
                <p className="text-zinc-400 text-sm">Sidebar próximamente</p>
            </aside>

            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}
