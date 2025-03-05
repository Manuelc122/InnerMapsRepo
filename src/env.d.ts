/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_WOMPI_PUBLIC_KEY: string
  readonly VITE_WOMPI_PRIVATE_KEY: string
  readonly VITE_PAYU_MERCHANT_ID: string
  readonly VITE_PAYU_ACCOUNT_ID: string
  readonly VITE_PAYU_API_KEY: string
  readonly VITE_PAYU_API_LOGIN: string
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 