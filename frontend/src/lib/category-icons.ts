export interface IconOption {
    name: string;
    label: string;
}

export interface IconGroup {
    group: string;
    icons: IconOption[];
}

export const CATEGORY_ICON_GROUPS: IconGroup[] = [
    {
        group: "Finanzas",
        icons: [
            { name: "wallet", label: "Billetera" },
            { name: "credit-card", label: "Tarjeta" },
            { name: "piggy-bank", label: "Ahorros" },
            { name: "trending-up", label: "Inversión" },
            { name: "banknote", label: "Billete" },
            { name: "coins", label: "Monedas" },
            { name: "dollar-sign", label: "Dólar" },
            { name: "receipt", label: "Recibo" },
        ],
    },
    {
        group: "Transporte",
        icons: [
            { name: "car", label: "Auto" },
            { name: "bus", label: "Bus" },
            { name: "plane", label: "Avión" },
            { name: "train", label: "Tren" },
            { name: "bike", label: "Bicicleta" },
            { name: "fuel", label: "Gasolina" },
            { name: "ship", label: "Barco" },
            { name: "uber", label: "Uber" },
        ],
    },
    {
        group: "Compras",
        icons: [
            { name: "shopping-cart", label: "Carrito" },
            { name: "shopping-bag", label: "Bolsa" },
            { name: "shirt", label: "Ropa" },
            { name: "watch", label: "Reloj" },
            { name: "gem", label: "Joyería" },
            { name: "package", label: "Paquete" },
            { name: "tag", label: "Etiqueta" },
            { name: "amazon", label: "Amazon" },
        ],
    },
    {
        group: "Comida y bebidas",
        icons: [
            { name: "utensils", label: "Restaurante" },
            { name: "coffee", label: "Café" },
            { name: "pizza", label: "Pizza" },
            { name: "beer", label: "Cerveza" },
            { name: "wine", label: "Vino" },
            { name: "sandwich", label: "Comida" },
            { name: "ice-cream", label: "Helado" },
            { name: "salad", label: "Saludable" },
        ],
    },
    {
        group: "Casa",
        icons: [
            { name: "house", label: "Casa" },
            { name: "sofa", label: "Muebles" },
            { name: "lightbulb", label: "Electricidad" },
            { name: "droplets", label: "Agua" },
            { name: "wrench", label: "Reparaciones" },
            { name: "key", label: "Alquiler" },
            { name: "trash", label: "Limpieza" },
            { name: "flower-2", label: "Jardín" },
        ],
    },
    {
        group: "Salud",
        icons: [
            { name: "pill", label: "Medicamentos" },
            { name: "heart-pulse", label: "Médico" },
            { name: "stethoscope", label: "Consulta" },
            { name: "thermometer", label: "Farmacia" },
            { name: "dumbbell", label: "Gym" },
            { name: "apple", label: "Nutrición" },
            { name: "brain", label: "Psicología" },
            { name: "eye", label: "Óptica" },
        ],
    },
    {
        group: "Belleza",
        icons: [
            { name: "scissors", label: "Peluquería" },
            { name: "sparkles", label: "Estética" },
            { name: "bath", label: "Spa" },
            { name: "nail-polish", label: "Manicura" },
            { name: "dental", label: "Dental" },
            { name: "glasses", label: "Gafas" },
            { name: "laundry", label: "Lavandería" },
            { name: "perfume", label: "Perfume" },
        ],
    },
    {
        group: "Entretenimiento",
        icons: [
            { name: "gamepad-2", label: "Videojuegos" },
            { name: "tv", label: "TV" },
            { name: "music", label: "Música" },
            { name: "clapperboard", label: "Cine" },
            { name: "ticket", label: "Eventos" },
            { name: "netflix", label: "Netflix" },
            { name: "spotify", label: "Spotify" },
            { name: "youtube", label: "YouTube" },
        ],
    },
    {
        group: "Cuentas",
        icons: [
            { name: "zap", label: "Electricidad" },
            { name: "wifi", label: "Internet" },
            { name: "smartphone", label: "Celular" },
            { name: "phone", label: "Teléfono" },
            { name: "tv-2", label: "Cable" },
            { name: "shield", label: "Seguro" },
            { name: "landmark", label: "Banco" },
            { name: "file-text", label: "Factura" },
        ],
    },
    {
        group: "Rutina",
        icons: [
            { name: "alarm-clock", label: "Rutina" },
            { name: "sun", label: "Mañana" },
            { name: "moon", label: "Noche" },
            { name: "briefcase", label: "Trabajo" },
            { name: "car-front", label: "Commute" },
            { name: "newspaper", label: "Noticias" },
            { name: "bike-2", label: "Ejercicio" },
            { name: "soup", label: "Merienda" },
        ],
    },
    {
        group: "Relax",
        icons: [
            { name: "umbrella", label: "Vacaciones" },
            { name: "book", label: "Lectura" },
            { name: "headphones", label: "Podcast" },
            { name: "tent", label: "Camping" },
            { name: "palmtree", label: "Playa" },
            { name: "mountain", label: "Montaña" },
            { name: "dice-5", label: "Juegos" },
            { name: "camera", label: "Fotografía" },
        ],
    },
    {
        group: "Educación",
        icons: [
            { name: "book-open", label: "Libros" },
            { name: "graduation-cap", label: "Universidad" },
            { name: "pencil", label: "Útiles" },
            { name: "monitor", label: "Cursos" },
            { name: "languages", label: "Idiomas" },
            { name: "flask-conical", label: "Ciencia" },
            { name: "pen-tool", label: "Diseño" },
            { name: "code", label: "Programación" },
        ],
    },
    {
        group: "Familia / Hijos",
        icons: [
            { name: "baby", label: "Bebé" },
            { name: "family", label: "Familia" },
            { name: "gift", label: "Regalos" },
            { name: "school", label: "Colegio" },
            { name: "toy-brick", label: "Juguetes" },
            { name: "milk", label: "Bebé/Leche" },
            { name: "heart", label: "Amor" },
            { name: "cake", label: "Cumpleaños" },
        ],
    },
    {
        group: "Granja",
        icons: [
            { name: "leaf", label: "Plantas" },
            { name: "tree-pine", label: "Árboles" },
            { name: "tractor", label: "Tractor" },
            { name: "egg", label: "Huevos" },
            { name: "beef", label: "Carne" },
            { name: "carrot", label: "Verduras" },
            { name: "paw-print", label: "Animales" },
            { name: "bug", label: "Insectos" },
        ],
    },
    {
        group: "Developer",
        icons: [
            { name: "chatgpt", label: "ChatGPT" },
            { name: "claude", label: "Claude" },
            { name: "claude-clawd", label: "Claude Clawd" },
            { name: "copilot", label: "Copilot" },
            { name: "google-gemini", label: "Google Gemini" },
            { name: "antigravity", label: "Antigravity" },
            { name: "github", label: "GitHub" },
            { name: "vercel", label: "Vercel" },
            { name: "cloudflare-2", label: "Cloudflare" },
            { name: "aws", label: "AWS" },
            { name: "ai", label: "AI" },
            { name: "server", label: "Servidor" },
            { name: "db", label: "Base de Datos" },
            { name: "wordpress", label: "WordPress" },
            { name: "supabase", label: "Supabase" },
            { name: "adobe", label: "Adobe" },
            { name: "cloud-iot", label: "Cloud IoT" },
            { name: "dns", label: "DNS" },
        ],
    },
    {
        group: "Otros",
        icons: [
            { name: "star", label: "Favorito" },
            { name: "flag", label: "Meta" },
            { name: "box", label: "General" },
            { name: "archive", label: "Archivo" },
            { name: "help-circle", label: "Otro" },
            { name: "more-horizontal", label: "Misc" },
            { name: "paperclip", label: "Adjunto" },
            { name: "bookmark", label: "Guardado" },
        ],
    },
];

// Lista plana — útil para buscar por nombre
export const ALL_CATEGORY_ICONS: IconOption[] = CATEGORY_ICON_GROUPS.flatMap(
    (g) => g.icons,
);
