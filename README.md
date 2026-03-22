# 🚀# PriceNode - Monitoreo de Precios Pro

Sistema avanzado de rastreo de precios en tiempo real con IA.

## 🚀 Preparación para Producción

Este proyecto sigue los estándares del **Sistema de 18 Agentes IA (Antigravity)**.

### ⚙️ Configuración Requerida
1.  **Firebase**: Configurar un proyecto en [Firebase Console](https://console.firebase.google.com/).
2.  **Variables de Entorno**: Copiar `.env.example` (o configurar en Vercel) con las llaves de Firebase y el Webhook de n8n.
3.  **n8n**: Importar los workflows ubicados en la carpeta `/n8n`.

### 🛡️ Cumplimiento de Reglas
- **Agente 19 (Errores)**: Sistema de logs centralizado en `src/lib/errorManager.ts`.
- **Agente 10 (Legal)**: Política de privacidad habilitada en `/privacy-policy`.
- **Operatividad (W.O.W)**: Cero botones muertos y flujos 100% operativos.

![Dashbord Preview](https://images.unsplash.com/photo-1611974717482-9825d480ee0e?auto=format&fit=crop&q=80&w=2070)

## ✨ Características Principales

- **🔍 Búsqueda Real**: Integración con la API pública de MercadoLibre para obtener productos reales al instante.
- **🔥 Backend Firebase**: Migración completa de Supabase a Firestore para una base de datos NoSQL escalable y reactiva.
- **🔐 Autenticación Universal**: Sistema de Auth integrado con Firebase (Email/Password & Social Login).
- **📊 Admin Dashboard**: Panel de control avanzado para monitorear estadísticas globales, salud del sistema y analítica de búsquedas.
- **🎯 Mis Rastreos**: Sección personalizada para que los usuarios gestionen sus productos vigilados y objetivos de precio.
- **🤖 Automatización n8n**: Workflows listos para scraping y alertas inteligentes.

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15+ (App Router, Turbopack)
- **Styling**: Tailwind CSS 4.0
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Automation**: n8n (External Webhooks)
- **Icons**: Lucide React

## 🚀 Instalación Rápida

### 1. Clonar y Configurar Frontend

```bash
cd frontend
npm install
```

Configura tu `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
N8N_SEARCH_WEBHOOK_URL=tu_webhook_url
```

### 2. Importar Workflow n8n

Importa el archivo localizado en `/n8n/workflow_1_buscador.json` en tu instancia de n8n para habilitar el scraping avanzado.

## 📂 Estructura del Proyecto

```text
/
├── frontend/           # App principal en Next.js
├── n8n/                # Workflows de automatización
├── AGENTES-IA-PLUS/    # Configuración de agentes expertos
└── skills/             # Habilidades dinámicas del sistema
```

## 📜 Licencia

MIT
