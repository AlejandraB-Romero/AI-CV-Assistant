# 🤖 AI CV Assistant

> Sistema multi-agente de Inteligencia Artificial ejecutable de forma 100% local con Ollama para la auditoría, optimización, análisis Radar 360º y generación de Cartas de Presentación adaptadas.

![Versión](https://img.shields.io/badge/versión-3.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS3](https://img.shields.io/badge/CSS3-blue)
![Ollama](https://img.shields.io/badge/Ollama-Local-green)
![Estado](https://img.shields.io/badge/estado-En%20desarrollo-success)
![Licencia](https://img.shields.io/badge/licencia-MIT-brightgreen)

---

## 📖 Descripción

**AI CV Assistant** es una plataforma web modular impulsada por un panel de **agentes de IA especializados** que analizan, auditan y refactorizan Currículums Vitae desde múltiples dimensiones profesionales.

A diferencia de las herramientas genéricas que dependen de roles abstractos ("actúa como un experto"), el sistema utiliza **prompts deterministas basados en checklists explícitas de comprobación y salidas en JSON estricto**. Además de la auditoría y comparación de versiones, la versión 3.0 incorpora un **Análisis Visual Radar 360º** de competencias y un módulo dedicado para la **Generación Personalizada de Cartas de Presentación** (*Cover Letter*).

Todo el procesamiento se ejecuta con modelos ligeros de código abierto en local (**Qwen 2.5 Coder**, **DeepSeek-R1**, **Llama 3.3**) sin enviar datos a servidores externos.

---

## ✨ Características Principales

- 🤖 **Orquestación de Agentes Especializados:**
  - 📊 **ATS Agent:** Audit de legibilidad sintáctica, densidad de palabras clave y formato procesable por ATS.
  - 👨‍💼 **Recruiter Agent:** Evaluación del impacto narrativo, verbos de acción y cuantificación de logros (fórmula PAR).
  - ✍️ **Grammar & Style Agent:** Corrección ortográfica, consistencia temporal y eliminación de adjetivos vacíos.
  - 💻 **Technical Reviewer Agent:** Coherencia del stack tecnológico, vigencia de herramientas y nivel de dominio.
  - 🔗 **LinkedIn & SEO Agent:** Conversión de contenido a titular, extracto "Acerca De" y optimización para búsquedas.
  - 📈 **Career Coach Agent:** Evaluación de la progresión de responsabilidades, estabilidad y trayectoria.
  - 🎭 **Orchestrator Agent:** Síntesis ejecutiva y generación de un plan de acción prioritario en 5 pasos.
  - ⚖️ **Comparator Agent:** Auditoría comparativa cuantitativa y cualitativa entre versiones del CV.
- 🎯 **Radar 360º de Competencias:** Visualización gráfica e interactiva de las puntuaciones obtenidas en cada dimensión del análisis.
- ✉️ **Generador de Carta de Presentación:** Módulo específico para redactar cartas adaptadas a la vacante objetivo basadas en el perfil analizado.
- 💾 **Persistencia con Storage Service:** Gestión y guardado local del historial de análisis y estados de la aplicación.
- 📄 **Soporte Multi-formato (Entrada y Salida):**
  - Parsing y lectura directa de documentos **.docx** y texto plano.
  - Exportación de informes optimizados en formato **PDF** y **.docx**.
- 🛠️ **Arquitectura Model-Agnostic (Ollama Local):** Respuestas estructuradas mediante contratos JSON estrictos independientes del modelo.
- 🎨 **Interfaz y Experiencia de Usuario:** Modo claro / modo oscuro persistente, sistema de notificaciones Toast y diseño CSS modular.
- 🔒 **Privacidad Total (Privacy First):** Procesamiento 100% en local sin intermediarios ni consumo de APIs de pago.

---

## 🧠 Arquitectura del Sistema

```text
                      ┌───────────────────────────┐
                      │    Entrada del Usuario    │
                      │  (Texto / .docx / PDF)    │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │      App Controller       │
                      └─────────────┬─────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ Agent Orchestrator│     │   Radar Service   │     │ Cover Letter Agent│
└─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
          │                         │                         │
  ┌───────┴───────┐                 │                         │
  ▼               ▼                 ▼                         ▼
[Agentes]     Orchestrator    Visualización          Carta de Presentación
Especiales    & Comparator     Radar 360º                Personalizada
  │               │                 │                         │
  └───────────────┴─────────┬───────┴─────────────────────────┘
                            │
                            ▼
               ┌───────────────────────────┐
               │      Storage Service      │
               │   (Persistencia Local)    │
               └────────────┬──────────────┘
                            │
                            ▼
               ┌───────────────────────────┐
               │  Interfaz de Usuario / UI │
               │   (Exportación PDF / DOCX)│
               └───────────────────────────┘
```


---

## 📁 Estructura del Proyecto

```text
AI-CV-Assistant/
├── assets/
│   ├── css/
│   │   ├── layout.css                  # Estructura principal y Grid/Flexbox
│   │   └── style.css                   # Estilos globales y tematización
│   │
│   ├── img/
│   │
│   └── js/
│       ├── agents/
│       │   ├── cover-letter/           # Módulo del generador de cartas de presentación
│       │   ├── agent.orchestrator.js   # Coordinador del pipeline de agentes
│       │   ├── agent.prompts.js        # Checklists y esquemas JSON por agente
│       │   ├── ats.agent.js            # Auditoría ATS
│       │   ├── career.agent.js         # Coach de carrera
│       │   ├── comparator.agent.js     # Comparador CV Antiguo vs Nuevo
│       │   ├── grammar.agent.js        # Corrección gramatical y estilística
│       │   ├── linkedin.agent.js       # Optimización SEO LinkedIn
│       │   ├── recruiter.agent.js      # Evaluación de reclutador
│       │   └── technical.agent.js      # Revisión de stack técnico
│       │
│       ├── services/
│       │   ├── docx.service.js         # Parsing y exportación de archivos .docx
│       │   ├── ollama.service.js       # Cliente Fetch API para Ollama (JSON Mode)
│       │   ├── pdf.service.js          # Generación e impresión de informes PDF
│       │   └── storage.service.js      # Servicio de almacenamiento e historial local
│       │
│       ├── ui/
│       │   ├── app.controller.js       # Controlador principal de la aplicación
│       │   ├── cover-letter.controller.js # UI del módulo de carta de presentación
│       │   ├── dom.elements.js         # Mapeo de selectores del DOM
│       │   ├── radar.service.js        # Generación del gráfico Radar 360º
│       │   ├── stats.ui.js             # Renderizado de métricas y puntuaciones
│       │   ├── theme.controller.js     # Control del modo claro/oscuro
│       │   └── toast.ui.js             # Sistema de notificaciones flotantes
│       │
│       └── config.js                   # Configuración global y endpoints
│
├── index.html                          # Interfaz SPA
├── LICENSE                             # Licencia MIT
└── README.md                           # Documentación del proyecto
```
---

## ⚙️ Tecnologías Utilizadas

### Frontend & Visualización
- **HTML5 & CSS3 (Layout modular):** Estructura responsiva con separación limpia de diseño en `layout.css` y `style.css`.
- **JavaScript (ES6+):** Arquitectura totalmente modular orientada a servicios y controladores.
- **Radar 360º Service:** Renderizado visual de competencias multidimensionales.

### Inteligencia Artificial & Persistencia
- **Ollama:** Motor local de ejecución de modelos LLM.
- **Modelos Recomendados:** `qwen2.5-coder:7b`, `deepseek-r1:8b`, `llama3.3`.
- **Storage Service:** Gestión del estado e historial en `LocalStorage`.

### Librerías & Integraciones
- **`html2pdf.js`:** Exportación del informe visual a PDF.
- **`mammoth.js` / `docx`:** Procesamiento y generación de documentos Word.

---

## 🚀 Instalación y Configuración Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/AlejandraB-Romero/AI-CV-Assistant.git](https://github.com/AlejandraB-Romero/AI-CV-Assistant.git)
cd AI-CV-Assistant
2. Configurar e Iniciar Ollama
Bash
# Descargar modelo recomendado
ollama pull qwen2.5-coder:7b

# Iniciar el servicio local
ollama serve
3. Ejecutar la Aplicación
Abre el proyecto mediante un servidor local (ej. Live Server en VS Code o via npx serve):

Bash
npx serve .
Abre tu navegador en http://localhost:3000.

🔒 Privacidad
El proyecto opera bajo la premisa Privacy-First. Ningún dato personal o documento cargado sale de tu equipo local. No se requieren claves API ni conexiones a servicios de pago en la nube.

👩‍💻 Autora
Alejandra Begoña Romero Pérez

Estudiante de Desarrollo de Aplicaciones Web (DAW).

GitHub: AlejandraB-Romero

📝 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más información.