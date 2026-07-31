# 🤖 AI CV Assistant

> Analiza y mejora tu Currículum Vitae mediante un sistema de múltiples agentes de Inteligencia Artificial ejecutados localmente con Ollama.

![Versión](https://img.shields.io/badge/version-2.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS3](https://img.shields.io/badge/CSS3-blue)
![Ollama](https://img.shields.io/badge/Ollama-Local-green)
![Estado](https://img.shields.io/badge/status-En%20desarrollo-success)

---

## 📖 Descripción

AI CV Assistant es una aplicación web que utiliza un sistema de agentes especializados para analizar un currículum y ofrecer recomendaciones desde distintos puntos de vista.

La aplicación ejecuta modelos de IA de forma completamente local mediante **Ollama**, garantizando privacidad y evitando depender de servicios externos.

En lugar de realizar un único análisis, el sistema orquesta varios agentes especializados que colaboran para generar un informe final más completo.

---

# ✨ Características

Actualmente la versión 2.0 incorpora:

- 🤖 Orquestación de múltiples agentes IA.
- 📄 Análisis automático del Currículum Vitae.
- 🎯 Evaluación ATS (Applicant Tracking System).
- 👨‍💼 Evaluación desde el punto de vista de un reclutador.
- 📋 Resumen inteligente de todos los análisis.
- 🌙 Modo claro / modo oscuro.
- 🔔 Sistema de notificaciones Toast.
- ⚡ Interfaz dinámica sin recargar la página.
- 🧩 Arquitectura modular.
- 🔌 Comunicación con Ollama mediante Fetch API.
- 📥 Exportación del informe en PDF.
- 💻 Funcionamiento completamente local.

---

# 🧠 Arquitectura

El proyecto sigue una arquitectura modular separando responsabilidades.

```
Usuario
    │
    ▼
App Controller
    │
    ▼
Agent Orchestrator
    │
 ┌──┴──────────────┐
 ▼                 ▼
ATS Agent     Recruiter Agent
        │
        ▼
 Summary Agent
        │
        ▼
 Interfaz
```

---

# 📁 Estructura del proyecto

```
AI-CV-Assistant/

│

├── assets/

│   ├── css/

│   │      style.css

│   │

│   ├── img/

│   │

│   └── js/

│        │
│        ├── agents/
│        │
│        ├── services/
│        │     ollama.service.js
│        │     pdf.service.js
│        │
│        ├── ui/
│        │     app.controller.js
│        │     dom.elements.js
│        │     stats.ui.js
│        │     theme.controller.js
│        │     toast.ui.js
│        │
│        └── config.js
│
├── index.html
│
└── README.md
```

---

# ⚙️ Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript (ES6+)

### Inteligencia Artificial

- Ollama
- Llama 3.2

### Librerías

- html2pdf.js

### APIs Web

- Fetch API
- Clipboard API
- LocalStorage API

### Herramientas de desarrollo

- Visual Studio Code
- Git
- GitHub

---

# 🚀 Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/AlejandraB-Romero/AI-CV-Assistant.git
```

---

## 2. Instalar Ollama

Descargar desde

https://ollama.com

---

## 3. Descargar el modelo

```bash
ollama pull llama3.2
```

---

## 4. Ejecutar Ollama

```bash
ollama serve
```

---

## 5. Abrir el proyecto

Abrir el archivo:

```
index.html
```

o utilizar Live Server.

---

# 📌 Flujo de funcionamiento

```
Usuario

↓

Introduce el CV

↓

App Controller

↓

Agent Orchestrator

↓

ATS Agent

↓

Recruiter Agent

↓

Summary Agent

↓

Informe final

↓

Exportación PDF
```

---

# 🔒 Privacidad

Todo el procesamiento se realiza en el ordenador del usuario mediante Ollama.

No se envía ninguna información a servicios externos.

---

# 🚧 Próximas mejoras

- Exportación a DOCX.
- Más agentes especializados.
- Historial de análisis.
- Comparador entre versiones del CV.
- Selector de modelos IA.
- Estadísticas del análisis.
- Pipeline visual de ejecución de agentes.
- Exportación en JSON y TXT.

---

# 👩‍💻 Autora

**Alejandra Begoña Romero Pérez**

Estudiante de Desarrollo de Aplicaciones Web (DAW).

Apasionada por el desarrollo Full Stack, la Inteligencia Artificial, la automatización y la orquestación de agentes IA.

GitHub:

https://github.com/AlejandraB-Romero

---

## ⭐ Estado del proyecto

Versión actual:

**v2.0 (En desarrollo)**

Este proyecto forma parte de mi portfolio personal y evolucionará conforme avance en mis estudios de Desarrollo de Aplicaciones Web e Inteligencia Artificial.