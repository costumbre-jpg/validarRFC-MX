
export type BlacklistStatus = 'CLEAN' | 'EFO' | 'EDO' | 'NO_LOCALIZADO';

export interface BlacklistCheckResult {
    rfc: string;
    status: BlacklistStatus;
    description?: string;
    listedDate?: string;
}

// Mock database of known bad RFCs (EFOS - Empresas Facturadoras de Operaciones Simuladas)
// In a real production app, this would query a dedicated database or external API.
const MOCK_BLACKLIST: Record<string, { status: BlacklistStatus; description: string; date: string }> = {
    // Ejemplos de RFCs "malos" para pruebas
    "AAA010101AAA": {
        status: 'EFO',
        description: 'Contribuyente que factura operaciones simuladas (Definitivo)',
        date: '2023-01-15'
    },
    "XAXX010101000": {
        status: 'CLEAN',
        description: 'RFC Genérico (Limpio)',
        date: ''
    },
    "XEXX010101000": {
        status: 'CLEAN',
        description: 'RFC Extranjero (Limpio)',
        date: ''
    },
    "EDO980101KW8": {
        status: 'EDO',
        description: 'Empresa Deductora de Operaciones Simuladas',
        date: '2023-05-20'
    },
    "NOL901010AB1": {
        status: 'NO_LOCALIZADO',
        description: 'Contribuyente No Localizado en domicilio fiscal',
        date: '2022-11-10'
    }
};

/**
 * Checks if an RFC is in the SAT blacklist (EFOS/EDOS).
 * Currently uses a mock list for demonstration purposes.
 */
export async function checkBlacklist(rfc: string): Promise<BlacklistCheckResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));

    const normalizedRFC = rfc.toUpperCase().trim();
    const entry = MOCK_BLACKLIST[normalizedRFC];

    if (entry) {
        return {
            rfc: normalizedRFC,
            status: entry.status,
            description: entry.description,
            listedDate: entry.date
        };
    }

    return {
        rfc: normalizedRFC,
        status: 'CLEAN'
    };
}
