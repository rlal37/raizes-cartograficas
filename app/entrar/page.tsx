'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Entrar() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [usuario, setUsuario] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUsuario(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUsuario(session?.user?.email ?? null)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  async function criarConta() {
    const { error } = await supabase.auth.signUp({ email, password: senha })
    setMensagem(error ? 'Erro: ' + error.message : 'Conta criada! Você já está logado.')
  }

  async function entrar() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setMensagem(error ? 'Erro: ' + error.message : 'Login feito!')
  }

  async function sair() {
    await supabase.auth.signOut()
    setMensagem('Você saiu.')
  }

  return (
    <main style={{ padding: 40, maxWidth: 420, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Entrar — Raízes Cartográficas</h1>

      {usuario ? (
        <div>
          <p>Você está logado como <strong>{usuario}</strong>.</p>
          <button onClick={sair} style={{ padding: 10 }}>Sair</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="email" placeholder="seu e-mail" value={email}
            onChange={(e) => setEmail(e.target.value)} style={{ padding: 10 }} />
          <input type="password" placeholder="sua senha (mín. 6 caracteres)" value={senha}
            onChange={(e) => setSenha(e.target.value)} style={{ padding: 10 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={criarConta} style={{ padding: 10 }}>Criar conta</button>
            <button onClick={entrar} style={{ padding: 10 }}>Entrar</button>
          </div>
        </div>
      )}

      {mensagem && <p style={{ marginTop: 16 }}>{mensagem}</p>}
    </main>
  )
}