'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<User | null>(null)

  useEffect(() => {
    // 1) Checa a sessão atual assim que o menu monta
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null)
    })

    // 2) Fica de ouvido: toda vez que alguém entra/sai, atualiza o menu
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        setUsuario(sessao?.user ?? null)
      }
    )

    // 3) Quando o menu sai da tela, desliga o ouvido (evita vazamento)
    return () => listener.subscription.unsubscribe()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    router.replace('/entrar')
  }

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold">
        Raízes Cartográficas
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {usuario ? (
          <>
            <Link href="/perfil" className="underline">
              Minha caminhada
            </Link>
            <button onClick={sair} className="border px-3 py-1 rounded">
              Sair
            </button>
          </>
        ) : (
          <Link href="/entrar" className="underline">
            Entrar
          </Link>
        )}
      </nav>
    </header>
  )
}