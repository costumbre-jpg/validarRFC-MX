import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://maflipp.com'
  const currentDate = new Date().toISOString()

  // Solo la página principal
  const publicPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0, // Página principal - máxima prioridad
    },
  ]

  return publicPages
}

