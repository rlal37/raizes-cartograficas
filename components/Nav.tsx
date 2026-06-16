'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()
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
    <header className="nav-bar">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span aria-hidden="true">❋</span> raízes
        </Link>

        <nav className="nav-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            início
          </Link>

          {usuario ? (
            <>
              <Link
                href="/perfil"
                className={pathname === '/perfil' ? 'active' : ''}
              >
                minha caminhada
              </Link>
              <button onClick={sair} className="nav-sair">
                sair
              </button>
            </>
          ) : (
            <Link
              href="/entrar"
              className={pathname === '/entrar' ? 'active' : ''}
            >
              entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}