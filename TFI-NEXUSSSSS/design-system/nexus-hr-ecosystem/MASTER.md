# Design System Master File — NEXUS HR Ecosystem

> **LOGIC:** When building or modifying a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** NEXUS HR Ecosystem (v3.2 Enterprise)  
**Standard:** UI/UX Pro Max Design Intelligence (`nextlevelbuilder/ui-ux-pro-max-skill`)  
**Design Dials:** Variance 5/10 (Balanced / Modern) | Density 8/10 (Dense / Dashboard)  
**Category:** Enterprise HR & Talent Management Analytics Dashboard  
**Status:** ✅ 100% Operativo y Validado  

---

## 🎨 1. Gama Cromática Oficial y Tokens de Color

> [!IMPORTANT]
> Toda la paleta original del sistema NEXUS se respeta al 100%, garantizando coherencia corporativa y un contraste accesible según las pautas WCAG 2.1 AA (mínimo 4.5:1 para texto normal y 3:1 para elementos de control).

| Rol Semántico | Hex Oficial | Variable CSS | Uso en la Interfaz |
|:---|:---|:---|:---|
| **Primary** | `#4F46E5` | `--color-primary` | Botones de acción principal, estado activo en navegación, KPIs clave |
| **Primary Container** | `#4338CA` | `--color-primary-container` | Estado hover de acciones primarias |
| **Primary Fixed** | `#E0E7FF` | `--color-primary-fixed` | Fondos de badges activos, chips de selección |
| **Primary Fixed Dim** | `#C7D2FE` | `--color-primary-fixed-dim` | Bordes sutiles de acento primario |
| **On Primary** | `#FFFFFF` | `--color-on-primary` | Texto e iconos sobre fondos primarios |
| **Secondary** | `#0F766E` | `--color-secondary` | Talent Matching, indicadores de éxito, roles cubiertos |
| **Secondary Container**| `#CCFBF1` | `--color-secondary-container`| Fondos de píldoras de éxito y progreso de selección |
| **Secondary Fixed** | `#D1FAE5` | `--color-secondary-fixed` | Fondos de terna finalista y métricas óptimas |
| **Tertiary** | `#0284C7` | `--color-tertiary` | Calibración, evaluaciones 360°, enlaces y filtros |
| **Tertiary Container** | `#E0F2FE` | `--color-tertiary-container` | Fondos de cards analíticas y badges de evaluación |
| **Surface** | `#F8FAFC` | `--color-surface` | Fondo principal de la aplicación (Slate-50) |
| **Surface Dim** | `#F1F5F9` | `--color-surface-dim` | Fondos de inputs, chips inactivos y wells |
| **Surface Bright** | `#FFFFFF` | `--color-surface-bright` | Tarjetas Bento, modales, menú lateral y cabecera |
| **Surface High** | `#E2E8F0` | `--color-surface-container-high`| Divisores activos y bordes de componentes |
| **Surface Highest** | `#CBD5E1` | `--color-surface-container-highest`| Thumbs de scrollbar y divisores secundarios |
| **On Surface** | `#0F172A` | `--color-on-surface` | Títulos, métricas y texto principal (Slate-900) |
| **On Surface Variant** | `#475569` | `--color-on-surface-variant`| Texto secundario, subtítulos y etiquetas descriptivas |
| **Outline** | `#64748B` | `--color-outline` | Iconos inactivos, placeholders y badges neutrales |
| **Outline Variant** | `#E2E8F0` | `--color-outline-variant` | Bordes limpios de tarjetas, tablas y modales |
| **Destructive / Error** | `#DC2626` | `--color-error` | Alertas de riesgo SPOF, errores de formulario, acciones de peligro |
| **Error Container** | `#FEE2E2` | `--color-error-container` | Fondos de avisos de error y brechas críticas |

---

## 🔤 2. Tipografía y Jerarquía Visual

- **Familia Tipográfica Principal:** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
- **Familia Monospace para Datos:** `font-mono, tabular-nums` (para códigos de puesto `PUE-2026-ARCH-03`, métricas de scoring, sueldos y porcentajes)
- **Escala de Jerarquía:**
  - `H1 / Display`: `24px - 28px` | `font-extrabold` | `tracking-tight`
  - `H2 / Sección`: `18px - 20px` | `font-bold` | `tracking-tight`
  - `H3 / Card Header`: `14px - 16px` | `font-bold`
  - `Body / Texto Principal`: `13px - 14px` | `font-normal` o `font-medium` | `leading-relaxed`
  - `Caption / Metadata`: `11px - 12px` | `font-medium` o `font-semibold` | `text-outline`

---

## 📐 3. Espaciado y Arquitectura Visual (Density 8/10)

El sistema utiliza una escala de espaciado adaptada a tableros corporativos de alta densidad informativa (8-32px):

| Token | Valor | Uso Específico |
|:---|:---|:---|
| `--space-2xs` | `2px` / `0.125rem` | Micro espaciados internos en badges |
| `--space-xs` | `4px` / `0.25rem` | Espaciado entre icono y texto en botones |
| `--space-sm` | `8px` / `0.5rem` | Gaps entre inputs, chips y píldoras |
| `--space-md` | `12px` / `0.75rem` | Relleno estándar de celdas y tarjetas compactas |
| `--space-lg` | `16px` / `1rem` | Padding de tarjetas Bento y formularios |
| `--space-xl` | `24px` / `1.5rem` | Separación entre secciones y cuadrículas |
| `--space-2xl` | `32px` / `2rem` | Margen superior de pantallas y paneles |

---

## 🛡️ 4. Patrones UX/UI Implementados (UI/UX Pro Max)

### 4.1. Accesibilidad (Prioridad 1 — Crítica)
- **Contraste mínimo 4.5:1:** Todos los textos normales cumplen o superan 4.5:1 frente al fondo.
- **Anillos de enfoque visibles:** `:focus-visible` configurado universalmente con `outline: 2px solid #4F46E5; outline-offset: 2px`.
- **Navegación por teclado completa:** Modales con `useFocusTrap`, cierre con tecla `Escape`, navegación en paleta de comandos con flechas (`↑` / `↓`) y confirmación con `Enter`.
- **Información multimétodo:** El color nunca es el único indicador; se acompaña de iconos vectoriales, etiquetas de texto y formas.
- **Soporte de movimiento reducido:** `@media (prefers-reduced-motion: reduce)` desactiva animaciones y transiciones extensas.

### 4.2. Microinteracciones y Toques (Prioridad 2 — Crítica)
- **Áreas mínimas de toque:** Controles táctiles >= 44×44px en entornos móviles.
- **Retroalimentación táctil:** Efecto `active:scale-[0.98]` en botones principales y tarjetas interactivas.
- **Estados de carga:** Botones con bloqueo de doble envío y spinners durante llamadas asíncronas.
- **Transición suave:** `transition-smooth` de 180ms a 200ms sin sacudidas de layout (*zero layout shift*).

### 4.3. Arquitectura de Navegación (Prioridad 9 — Alta)
- **Menú Lateral Enterprise (`Sidebar.tsx`):** Soporta modo colapsado con tooltips explicativos y modo expandido con agrupación clara de rutas.
- **Paleta de Comandos Omnibox (`Ctrl+K`):** Búsqueda en tiempo real unificada por módulos, puestos y colaboradores con categorías ordenadas.
- **Migas de Pan (`Breadcrumbs.tsx`):** Jerarquía visual con icono de inicio, botón de retorno inmediato y etiqueta `aria-current="page"`.
- **Notificaciones Centralizadas (`Header.tsx`):** Panel emergente con conteo en tiempo real, filtro de no leídas y redirección directa.

### 4.4. Componentes y Retroalimentación
- **Sistema de Notificaciones Toast (`ToastProvider.tsx`):** Pila de alertas flotantes accesibles con `aria-live="polite"`, auto-dismiss con temporizador y botón de cierre manual.
- **Estados Vacíos (`EmptyState.tsx`):** Ilustración contextual, título claro, texto de ayuda y botón de llamada a la acción (CTA) para recuperar el flujo.
- **Modales Seguros (`ConfirmationModal.tsx`):** Backdrop con blur, confirmaciones diferenciadas por color semántico (primario, advertencia, peligro) y trampa de foco.

---

## 📋 5. Lista de Verificación Pre-Entrega (Pre-Delivery Checklist)

- [x] Sin emojis como iconos estructurales (uso exclusivo de Material Symbols / SVGs vectoriales)
- [x] Contraste de texto >= 4.5:1 en todos los componentes
- [x] Anillos de foco visibles en elementos interactivos
- [x] Cumplimiento de `prefers-reduced-motion`
- [x] Trampas de foco y cierre accesible con `Escape` en modales
- [x] Totalmente responsivo en breakpoints 375px, 768px, 1024px y 1440px
- [x] Sin saltos acumulativos de layout (CLS < 0.1) mediante esqueletos estructurados
- [x] Integración de la paleta de colores corporativa original al 100%
