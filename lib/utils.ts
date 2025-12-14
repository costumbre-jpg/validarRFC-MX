/**
 * Formatea un RFC a formato estándar (sin guiones, mayúsculas)
 * @param rfc - RFC a formatear
 * @returns RFC formateado
 */
export function formatRFC(rfc: string): string {
  return rfc.trim().toUpperCase().replace(/[-\s]/g, '');
}

/**
 * Valida el formato básico de un RFC
 * @param rfc - RFC a validar
 * @returns true si el formato es válido
 */
export function isValidRFCFormat(rfc: string): boolean {
  const formatted = formatRFC(rfc);
  // RFC persona física: 13 caracteres (AAAA######AAA)
  // RFC persona moral: 12 caracteres (AAA######AAA)
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(formatted);
}

/**
 * Formatea un RFC para mostrar (con guiones opcionales)
 * @param rfc - RFC a formatear
 * @param withDashes - Si se deben incluir guiones
 * @returns RFC formateado para mostrar
 */
export function formatRFCForDisplay(rfc: string, withDashes: boolean = false): string {
  const formatted = formatRFC(rfc);
  if (!withDashes || formatted.length < 10) {
    return formatted;
  }
  
  // Formato: AAAA######-AAA o AAA######-AAA
  if (formatted.length === 13) {
    return `${formatted.slice(0, 10)}-${formatted.slice(10)}`;
  } else if (formatted.length === 12) {
    return `${formatted.slice(0, 9)}-${formatted.slice(9)}`;
  }
  
  return formatted;
}

/**
 * Formatea una fecha a formato legible en español
 * @param date - Fecha a formatear (Date, string o timestamp)
 * @param options - Opciones de formato
 * @returns Fecha formateada
 */
export function formatDate(
  date: Date | string | number,
  options: {
    includeTime?: boolean;
    locale?: string;
  } = {}
): string {
  const { includeTime = false, locale = 'es-MX' } = options;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  
  return dateObj.toLocaleDateString(locale, formatOptions);
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param date - Fecha a formatear
 * @returns Fecha relativa en español
 */
export function formatRelativeDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
}

/**
 * Formatea un número con separadores de miles
 * @param num - Número a formatear
 * @returns Número formateado
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

/**
 * Formatea un tiempo de respuesta en milisegundos
 * @param ms - Tiempo en milisegundos
 * @returns Tiempo formateado
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Obtiene el nombre del plan de suscripción en español
 * @param plan - Plan de suscripción
 * @returns Nombre del plan en español
 */
export function getSubscriptionPlanName(plan: string): string {
  const planNames: Record<string, string> = {
    free: 'Gratis',
    pro: 'Pro',
    business: 'Business',
    basic: 'Basic',
    enterprise: 'Enterprise',
    api_premium: 'API Premium',
  };
  return planNames[plan] || plan;
}

/**
 * Obtiene el estado de suscripción en español
 * @param status - Estado de suscripción
 * @returns Estado en español
 */
export function getSubscriptionStatusName(status: 'active' | 'canceled'): string {
  const statusNames = {
    active: 'Activa',
    canceled: 'Cancelada',
  };
  return statusNames[status];
}

/**
 * Clase de utilidad para combinar clases de Tailwind CSS
 * @param classes - Clases CSS a combinar
 * @returns Clases combinadas
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

