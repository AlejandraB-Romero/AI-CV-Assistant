# 🤖 AI CV Assistant

> Sistema multi-agente de Inteligencia Artificial ejecutable de forma 100% local con Ollama para la auditoría, optimización y refactorización determinista de Currículums Vitae.

![Versión](https://img.shields.io/badge/versión-2.5-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS3](https://img.shields.io/badge/CSS3-blue)
![Ollama](https://img.shields.io/badge/Ollama-Local-green)
![Estado](https://img.shields.io/badge/estado-En%20desarrollo-success)
![Licencia](https://img.shields.io/badge/licencia-MIT-brightgreen)

---

## 📖 Descripción

**AI CV Assistant** es una plataforma web modular impulsada por un panel de **8 agentes de IA especializados** que analizan, auditan y refactorizan Currículums Vitae desde múltiples dimensiones profesionales.

A diferencia de las herramientas genéricas que dependen de roles abstractos ("actúa como un experto"), el sistema utiliza **prompts deterministas basados en checklists explícitas de comprobación y salidas en JSON estricto**. Esto garantiza resultados coherentes, precisos y sin alucinaciones, permitiendo ejecutar la aplicación con modelos ligeros de código abierto en local (**Qwen 2.5 Coder**, **DeepSeek-R1**, **Llama 3.3**) sin enviar datos a servidores externos.

---

## ✨ Características Principales

- 🤖 **Orquestación de 8 Agentes Especializados:**
  - 📊 **ATS Agent:** Audit de legibilidad sintáctica, densidad de palabras clave y formato procesable por ATS.
  - 👨‍💼 **Recruiter Agent:** Evaluación del impacto narrativo, verbos de acción y cuantificación de logros (fórmula PAR).
  - ✍️ **Grammar & Style Agent:** Corrección ortográfica, consistencia temporal y eliminación de adjetivos vacíos.
  - 💻 **Technical Reviewer Agent:** Coherencia del stack tecnológico, vigencia de herramientas y nivel de dominio.
  - 🔗 **LinkedIn & SEO Agent:** Conversión de contenido a titular, extracto "Acerca De" y optimización para búsquedas.
  - 📈 **Career Coach Agent:** Evaluación de la progresión de responsabilidades, estabilidad y trayectoria.
  - 🎭 **Orchestrator Agent:** Síntesis ejecutiva y generación de un plan de acción prioritario en 5 pasos.
  - ⚖️ **Comparator Agent:** Auditoría comparativa cuantitativa y cualitativa entre el "CV Antiguo" y el "CV Optimizado".
- 📄 **Soporte Multi-formato (Entrada y Salida):**
  - Parsing y lectura directa de documentos **.docx** y texto plano.
  - Exportación de informes optimizados en formato **PDF** y **.docx**.
- 🛠️ **Arquitectura Model-Agnostic (Ollama Local):**
  - Diseñado para funcionar de manera óptima en modelos locales como `qwen2.5-coder:7b`, `deepseek-r1:8b` o `llama3.3`.
  - Respuestas estructuradas mediante contratos JSON estrictos y checklists deterministas.
- 🎨 **Interfaz y Experiencia de Usuario:**
  - 🌙 Modo claro / modo oscuro persistente.
  - 🔔 Sistema dinámico de notificaciones Toast y feedback de estado.
  - 📊 Métricas de coincidencia (*improvement score*) y desglose por tarjetas visuales.
- 🔒 **Privacidad Total (Privacy First):** Todo el procesamiento se ejecuta en el hardware del usuario mediante Ollama. Ningún dato sale de la máquina.

---

## 🧠 Arquitectura del Sistema
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
                                ▼
                  ┌───────────────────────────┐
                  │    Agent Orchestrator     │
                  └─────────────┬─────────────┘
                                │
 ┌──────────┬───────────┼───────────┼───────────┬──────────┐
 ▼          ▼           ▼           ▼           ▼          ▼
📊 ATS    👨‍💼 Recruiter  ✍️ Grammar  💻 Technical 🔗 LinkedIn 📈 Career
│          │           │           │           │          │
└──────────┴───────────┼───────────┴───────────┴──────────┘
│
▼
┌───────────────────────────┐
│    🎭 Orchestrator Agent  │
│   (Plan de Acción 5 Pasos)│
└────────────┬──────────────┘
│
▼
┌───────────────────────────┐
│  ⚖️ Comparator Agent     │
│ (Auditoría CV Antiguo/Nuevo)
└────────────┬──────────────┘
│
▼
┌───────────────────────────┐
│  Interfaz de Usuario / UI │
│   (Exportación PDF / DOCX)│
└───────────────────────────┘


---

## 📁 Estructura del Proyecto

AI-CV-Assistant/
│
├── assets/
│   ├── css/
│   │   └── style.css
│   │
│   ├── img/
│   │
│   └── js/
│       ├── agents/
│       │   ├── agent.prompts.js      # Definición de checklists y esquemas JSON por agente
│       │   ├── ats.agent.js          # Agente ATS Audit
│       │   ├── recruiter.agent.js    # Agente Recruiter
│       │   ├── grammar.agent.js      # Agente Corrección Gramatical
│       │   ├── technical.agent.js    # Agente Arquitecto Técnico
│       │   ├── linkedin.agent.js     # Agente Personal Branding & SEO
│       │   ├── career.agent.js       # Agente Career Coach
│       │   ├── orchestrator.agent.js # Agente Orquestador y Síntesis
│       │   └── comparator.agent.js   # Agente Comparador CV Antiguo vs Nuevo
│       │
│       ├── services/
│       │   ├── ollama.service.js     # Cliente Fetch API para Ollama (JSON Mode)
│       │   ├── pdf.service.js        # Generación e impresión de informes PDF
│       │   └── docx.service.js       # Parsing y exportación de archivos .docx
│       │
│       ├── ui/
│       │   ├── app.controller.js     # Controlador principal de la app
│       │   ├── dom.elements.js       # Mapeo de selectores del DOM
│       │   ├── stats.ui.js           # Renderizado de puntuaciones y métricas
│       │   ├── theme.controller.js   # Gestión del modo claro/oscuro
│       │   └── toast.ui.js           # Sistema de notificaciones flotantes
│       │
│       └── config.js                 # Configuración general y endpoints de Ollama
│
├── index.html                        # Interfaz principal SPA
└── README.md                         # Documentación del repositorio


---

## ⚙️ Tecnologías Utilizadas

### Frontend & Lógica
- **HTML5 & CSS3:** Diseño adaptativo con variables CSS para tematización (*dark/light mode*).
- **JavaScript (ES6+):** Arquitectura modular nativa mediante ES Modules.

### Inteligencia Artificial & Modelos Local
- **Ollama:** Motor de ejecución de modelos LLM en local.
- **Modelos Recomendados:**
  - `qwen2.5-coder:7b` / `qwen2.5-coder:14b` *(Excelente en estructuración y lógica)*
  - `deepseek-r1:8b` *(Razonamiento de fondo)*
  - `llama3.3` / `llama3.2`

### Librerías Integradas
- **`html2pdf.js`:** Conversión e impresión limpia del informe a PDF.
- **`mammoth.js` / `docx`:** Extracción de texto y generación de archivos `.docx`.

### APIs Nativas del Navegador
- **Fetch API:** Comunicación asíncrona en modo JSON con la REST API de Ollama (`http://localhost:11434`).
- **Clipboard API:** Copiado rápido de análisis y planes de acción.
- **LocalStorage API:** Persistencia de preferencias de usuario y tema.

---

## 🚀 Instalación y Configuración Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/AlejandraB-Romero/AI-CV-Assistant.git](https://github.com/AlejandraB-Romero/AI-CV-Assistant.git)
cd AI-CV-Assistant
2. Instalar y configurar Ollama
Descarga e instala Ollama desde ollama.com.

Descarga tu modelo de preferencia mediante la terminal (se recomienda Qwen 2.5 Coder o Llama 3.2):

Bash
ollama pull qwen2.5-coder:7b
# o bien:
ollama pull llama3.2
Inicia el servicio local de Ollama:

Bash
ollama serve
3. Ejecutar la aplicación
Al ser una aplicación basada en ES Modules nativos, se recomienda abrirla a través de un servidor local de desarrollo (como Live Server en VS Code) o usando npx serve:

Bash
npx serve .
Abre tu navegador en http://localhost:3000 (o la dirección que indique tu servidor local).

📌 Flujo de Funcionamiento
1. Carga del CV (.docx o texto plano)
   ↓
2. Normalización y Extracción del Contenido
   ↓
3. Ejecución Paralela / Secuencial de Agentes (ATS, Recruiter, Grammar, Technical, LinkedIn, Career)
   ↓
4. Orquestación y Síntesis (Orchestrator Agent -> Plan de Acción 5 Pasos)
   ↓
5. Comparativa de Versiones (Comparator Agent -> Score de Mejora)
   ↓
6. Visualización de Resultados en UI + Exportación (PDF / DOCX)
🔒 Privacidad y Seguridad
El proyecto está diseñado bajo el principio Privacy-First. Al ejecutarse 100% sobre Ollama en entorno local:

Ningún dato personal, experiencia o información contenida en el CV abandona tu ordenador.

No requiere API Keys ni suscripciones a servicios en la nube.

Funciona completamente offline tras descargar los modelos.

🚧 Próximas Mejoras (Roadmap)
[x] Parser y exportador de archivos .docx.

[x] Agente comparador entre versiones del CV.

[x] Prompts deterministas basados en checklists explícitas.

[ ] Selector dinámico de modelos de Ollama desde la propia interfaz de usuario.

[ ] Visualización en tiempo real del pipeline de ejecución de los agentes.

[ ] Historial de análisis guardado en LocalStorage / IndexedDB.

[ ] Modulo de "Match de Oferta" (CV vs Job Description).

👩‍💻 Autora
Alejandra Begoña Romero Pérez

Estudiante de Desarrollo de Aplicaciones Web (DAW).

Apasionada por el desarrollo Full Stack, la Inteligencia Artificial, el software de código abierto y la arquitectura de agentes autónomos.

GitHub: AlejandraB-Romero

📝 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más información.