# 🛡️ Reporte de Cobertura de Pruebas (Frontend)

Este documento detalla la estrategia de pruebas automatizadas implementada en el Frontend de la aplicación **Sanos y Salvos**, garantizando una interfaz de usuario estable y libre de regresiones.

## 1. Stack Tecnológico de Testing

El proyecto utiliza un conjunto moderno y rápido de herramientas para asegurar la calidad del código React:
- **Vitest:** Framework principal de pruebas, elegido por su velocidad y compatibilidad nativa con Vite.
- **React Testing Library (RTL):** Utilizado para renderizar componentes en un DOM virtual y simular interacciones tal como lo haría un usuario real, evitando acoplarse a los detalles internos de implementación.
- **JSDOM:** Entorno simulado de navegador en Node.js.
- **V8 Coverage:** Motor nativo de V8 utilizado para perfilar la ejecución del código y generar métricas exactas de líneas y ramas ejecutadas.

## 2. Alcance y Estrategia de Cobertura

El objetivo principal es mantener una cobertura superior al **75%** enfocándose estrictamente en el código que aporta valor al usuario o posee lógica compleja, evitando métricas infladas por código autogenerado.

### ¿Qué se está probando?
1. **Componentes Core de UI (Cobertura >90%):** 
   - Elementos reusables como `Button`, `Modal`, `Toast` y `Table`.
   - **Cómo se prueban:** Se renderizan de forma aislada. Se verifica que muestren las propiedades (`props`) correctas, y se inyectan funciones espía (`vi.fn()`) para asegurar que emitan los eventos correctos (e.g., al hacer clic).
2. **Formularios Complejos:**
   - Componentes como `UsuarioForm` y `ReporteForm`.
   - **Cómo se prueban:** Se simula la escritura del usuario (`fireEvent.change`) en los distintos inputs. Se verifica el comportamiento del formulario al intentar hacer *submit*, asegurando que la data enviada al padre sea exactamente la esperada y que las validaciones HTML5 sean respetadas.
3. **Manejo de Errores Globales:**
   - `GlobalErrorView`.
   - **Cómo se prueban:** Se disparan eventos sintéticos (`window.dispatchEvent`) simulando caídas de red y se verifica que la UI cambie de renderizar los "children" a mostrar la pantalla de error. Se mockea el objeto `window.location` para asegurar que el botón "Reintentar" refresque la página correctamente.
4. **Servicios y Llamadas de Red:**
   - Pruebas sobre llamadas a Axios (`api.js`, `catalogoService.js`).
   - **Cómo se prueban:** Se interceptan las llamadas HTTP reales y se devuelven objetos JSON simulados para evaluar la correcta serialización de datos.

### ¿Qué se excluye intencionalmente?
Se excluyen del reporte de cobertura los puntos de montaje básicos (`main.jsx`, `App.jsx`), archivos de configuración pura (`vite.config.js`) y directorios de imágenes/assets, ya que testearlos no aporta valor real a la estabilidad de las reglas de negocio.

## 3. Métricas Actuales

Gracias a la estricta configuración `coverage.all = true`, las métricas representan el porcentaje del proyecto real:
- **Líneas de Código (Statement Coverage):** **82.81%**
- **Caminos Lógicos (Branch Coverage):** **78.57%**

## 4. Cómo ejecutar las pruebas
Para correr la suite de pruebas localmente y generar el reporte:
```bash
npm run test -- --coverage
```
