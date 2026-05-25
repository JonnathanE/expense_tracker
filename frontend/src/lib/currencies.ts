export interface Currency {
    code: string; // "USD" → se guarda en la DB
    name: string;
    symbol: string;
    locale: string; // para Intl.NumberFormat
}

export const CURRENCIES: Currency[] = [
    { code: "USD", name: "Dólar estadounidense", symbol: "$", locale: "en-US" },
    { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
    { code: "GBP", name: "Libra esterlina", symbol: "£", locale: "en-GB" },
    { code: "COP", name: "Peso colombiano", symbol: "$", locale: "es-CO" },
    { code: "MXN", name: "Peso mexicano", symbol: "$", locale: "es-MX" },
    { code: "ARS", name: "Peso argentino", symbol: "$", locale: "es-AR" },
    { code: "CLP", name: "Peso chileno", symbol: "$", locale: "es-CL" },
    { code: "PEN", name: "Sol peruano", symbol: "S/", locale: "es-PE" },
    { code: "BRL", name: "Real brasileño", symbol: "R$", locale: "pt-BR" },
    { code: "BOB", name: "Boliviano", symbol: "Bs", locale: "es-BO" },
    { code: "PYG", name: "Guaraní paraguayo", symbol: "₲", locale: "es-PY" },
    { code: "UYU", name: "Peso uruguayo", symbol: "$", locale: "es-UY" },
    { code: "DOP", name: "Peso dominicano", symbol: "RD$", locale: "es-DO" },
    { code: "GTQ", name: "Quetzal guatemalteco", symbol: "Q", locale: "es-GT" },
    { code: "HNL", name: "Lempira hondureño", symbol: "L", locale: "es-HN" },
    {
        code: "NIO",
        name: "Córdoba nicaragüense",
        symbol: "C$",
        locale: "es-NI",
    },
    { code: "CRC", name: "Colón costarricense", symbol: "₡", locale: "es-CR" },
    { code: "PAB", name: "Balboa panameño", symbol: "B/", locale: "es-PA" },
];

export function getCurrency(code: string): Currency {
    return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
