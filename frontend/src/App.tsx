import "./App.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function App() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">
                    Expense Tracker 💰
                </h1>
                <p className="text-zinc-400">Tailwind + shadcn funcionando</p>

                <div className="flex gap-3 justify-center">
                    <Button>Botón shadcn</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destructive</Button>
                </div>

                <div className="flex gap-2 justify-center">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Error</Badge>
                </div>
            </div>
        </div>
    );
}

export default App;
