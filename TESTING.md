# Guía de Testing

## Configuración

El proyecto usa Jest y React Testing Library para testing.

### Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## Ejecutar Tests

### Todos los tests

```bash
npm run test
```

### Modo watch (desarrollo)

```bash
npm run test:watch
```

### Con coverage

```bash
npm run test:coverage
```

## Estructura de Tests

```
tests/
├── api/
│   └── validate.test.ts    # Tests de API de validación
├── auth.test.ts            # Tests de autenticación
└── stripe.test.ts          # Tests de webhooks Stripe
```

## Escribir Tests

### Ejemplo de test de API

```typescript
import { POST } from '@/app/api/validate/route'
import { NextRequest } from 'next/server'

describe('API /api/validate', () => {
  it('should validate RFC', async () => {
    const request = new NextRequest('http://localhost:3000/api/validate', {
      method: 'POST',
      body: JSON.stringify({ rfc: 'ABC123456XYZ' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

### Ejemplo de test de componente

```typescript
import { render, screen } from '@testing-library/react'
import Button from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Mocks

Los mocks están configurados en `jest.setup.js`:

- Next.js router
- Environment variables
- Supabase client
- Stripe client

## Coverage

Para ver el reporte de coverage:

```bash
npm run test:coverage
```

El reporte se genera en `coverage/` (excluido de git).

## CI/CD

Los tests se ejecutan automáticamente en GitHub Actions en cada push y pull request.

## Mejores Prácticas

1. **Nombres descriptivos**: Usa nombres claros para tus tests
2. **Arrange-Act-Assert**: Estructura tus tests en estas 3 fases
3. **Un test, una cosa**: Cada test debe verificar una sola funcionalidad
4. **Mocks apropiados**: Mockea dependencias externas
5. **Cleanup**: Limpia mocks entre tests con `beforeEach`

## Troubleshooting

### Error: "Cannot find module"

Asegúrate de que los paths en `jest.config.js` coincidan con `tsconfig.json`.

### Error: "Module not found: @/..."

Verifica que el alias `@` esté configurado en `jest.config.js`.

### Tests muy lentos

- Usa `jest.setup.js` para mocks globales
- Evita tests que hagan llamadas reales a APIs
- Usa `jest.fn()` para mocks simples

