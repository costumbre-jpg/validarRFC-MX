import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://maflipp.com'
  const currentDate = new Date().toISOString()

  // Páginas públicas (no requieren autenticación)
  const publicPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0, // Página principal - máxima prioridad
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9, // Página de precios - alta prioridad
    },
    {
      url: `${baseUrl}/developers`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8, // Documentación API - alta prioridad
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3, // Términos - baja prioridad
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3, // Privacidad - baja prioridad
    },
  ]

  return publicPages
}

