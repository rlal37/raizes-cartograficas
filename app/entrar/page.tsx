'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Divider, Flower } from '@/components/Organicos'

export default function Entrar() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [usuario, setUsuario] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUsuario(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUsuario(session?.user?.email ?? null)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  async function criarConta() {
    const { error } = await supabase.auth.signUp({ email, password: senha })
    setErro(!!error)
    setMensagem(error ? 'Erro: ' + error.message : 'Conta criada! Você já está logado.')
  }

  async function entrar() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setErro(!!error)
    setMensagem(error ? 'Erro: ' + error.message : 'Login feito!')
  }

  async function sair() {
    await supabase.auth.signOut()
    setErro(false)
    setMensagem('Você saiu.')
  }

  return (
    <main className="wrap">
      <p className="eyebrow">raízes cartográficas</p>
      <h1 className="entrar-titulo">Entrar</h1>
      <p className="entrar-intro">
        Quem busca tem um perfil — a sua caminhada. Entre para puxar fios, deixar
        sua palavra e guardar as portas por onde passou.
      </p>

      <Divider label={usuario ? 'sua sessão' : 'acesse sua caminhada'} />

      {usuario ? (
        <div className="entrar-card">
          <p className="entrar-logado">
            Você está logado como <strong>{usuario}</strong>.
          </p>
          <div className="entrar-acoes">
            <Link className="atravessar entrar-link" href="/perfil">
              <Flower color="#fff" /> ir para minha caminhada
            </Link>
            <button className="btn-soft" onClick={sair}>sair</button>
          </div>
        </div>
      ) : (
        <div className="entrar-card">
          <label className="field-lbl" htmlFor="email">e-mail</label>
          <input
            id="email"
            className="campo"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="field-lbl" htmlFor="senha" style={{ marginTop: 14 }}>
            senha
          </label>
          <input
            id="senha"
            className="campo"
            type="password"
            placeholder="mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button className="atravessar" onClick={entrar} style={{ marginTop: 20 }}>
            entrar
          </button>
          <button className="btn-soft entrar-secundario" onClick={criarConta}>
            ainda não tenho conta — criar conta
          </button>
        </div>
      )}

      {mensagem && (
        <p className={'entrar-msg ' + (erro ? 'is-erro' : 'is-ok')}>{mensagem}</p>
      )}
    </main>
  )
}