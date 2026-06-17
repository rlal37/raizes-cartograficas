'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Divider, Knot, Flower } from '@/components/Organicos'

type RastroComNomes = {
  id: number
  intencao: string
  criado_em: string
  origem: { nome: string } | null
  destino: { nome: string } | null
}

type OfertaComSaber = {
  id: number
  palavra: string
  criado_em: string
  saber: { nome: string } | null
}

// rótulos ricos pra exibir a intenção (chave do banco por baixo)
const ROTULO_INTENCAO: Record<string, string> = {
  aprender: 'aprender uma técnica',
  pesquisar: 'fazer pesquisa',
  inspirar: 'buscar inspiração',
}

export default function PerfilPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState<User | null>(null)

  // campos editáveis do perfil
  const [nome, setNome] = useState('')
  const [caminhada, setCaminhada] = useState('')

  // estado do botão salvar
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [rastros, setRastros] = useState<RastroComNomes[]>([])
  const [ofertas, setOfertas] = useState<OfertaComSaber[]>([])

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.replace('/entrar')
        return
      }

      const user = data.session.user
      setUsuario(user)

      // 1) Garante que existe um buscador pra este usuário (UPSERT).
      //    Se já existe, não sobrescreve nome/caminhada — por isso só mando o id.
      await supabase
        .from('buscadores')
        .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

      // 2) Lê o buscador (já existente ou recém-criado) pra preencher o formulário.
      const { data: buscador } = await supabase
        .from('buscadores')
        .select('nome, caminhada')
        .eq('id', user.id)
        .single()

      if (buscador) {
        setNome(buscador.nome ?? '')
        setCaminhada(buscador.caminhada ?? '')
      }

      // 3) Lê a caminhada: os fios puxados, com os nomes dos saberes.
      const { data: meusRastros } = await supabase
        .from('rastros')
        .select(`
          id,
          intencao,
          criado_em,
          origem:saberes!saber_origem_id (nome),
          destino:saberes!saber_destino_id (nome)
        `)
        .eq('buscador_id', user.id)
        .order('criado_em', { ascending: false })

      setRastros((meusRastros as unknown as RastroComNomes[]) ?? [])

      // 4) Lê as palavras deixadas (ofertas), com o nome do saber onde ficaram.
      const { data: minhasOfertas } = await supabase
        .from('ofertas')
        .select('id, palavra, criado_em, saber:saberes ( nome )')
        .eq('buscador_id', user.id)
        .order('criado_em', { ascending: false })

      setOfertas((minhasOfertas as unknown as OfertaComSaber[]) ?? [])

      setCarregando(false)
    }

    iniciar()
  }, [router])

  async function salvar() {
    if (!usuario) return
    setSalvando(true)
    setAviso('')

    const { error } = await supabase
      .from('buscadores')
      .update({ nome, caminhada })
      .eq('id', usuario.id)

    setSalvando(false)
    setAviso(error ? 'Algo deu errado ao salvar.' : 'Caminhada guardada. 🌿')
  }

  async function sair() {
    await supabase.auth.signOut()
    router.replace('/entrar')
  }

  if (carregando) {
    return <main className="wrap"><p className="empty">Verificando sua entrada…</p></main>
  }

  return (
    <main className="wrap">
      <p className="eyebrow">minha caminhada</p>
      <p className="perfil-quem">quem busca · {usuario?.email}</p>

      <p className="reframe">
        Seu perfil não guarda saberes — guarda suas relações e seus compromissos.
      </p>

      <Divider label="como você quer ser creditado" />
      <div className="perfil-form">
        <label className="field-lbl" htmlFor="nome">nome ou apelido</label>
        <input
          id="nome"
          className="campo"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como você assina o que faz"
        />

        <label className="field-lbl" htmlFor="caminhada" style={{ marginTop: 14 }}>
          o que você anda procurando
        </label>
        <textarea
          id="caminhada"
          className="textarea"
          value={caminhada}
          onChange={(e) => setCaminhada(e.target.value)}
          placeholder="Ex.: referências de cultura popular pernambucana para um projeto de identidade visual"
          rows={3}
        />

        <div className="perfil-acoes">
          <button className="atravessar perfil-salvar" onClick={salvar} disabled={salvando}>
            {salvando ? 'guardando…' : 'guardar caminhada'}
          </button>
          {aviso && <span className="perfil-aviso">{aviso}</span>}
        </div>
      </div>

      <Divider label="portas que você atravessou" />
      <div className="palavras">
        {rastros.length === 0 ? (
          <p className="empty">
            Você ainda não puxou nenhum fio. Visite uma porta e puxe o primeiro.
          </p>
        ) : (
          rastros.map((r) => (
            <div className="palavra-item" key={r.id}>
              <Knot color="var(--indigo)" />
              <span>
                <b>{r.origem?.nome ?? 'entrada direta'}</b> → <b>{r.destino?.nome ?? 'saber removido'}</b>
                {' · '}{ROTULO_INTENCAO[r.intencao] ?? r.intencao}
                <span className="autor">
                  {new Date(r.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      <Divider label="palavras que você deixou" />
      <div className="palavras">
        {ofertas.length === 0 ? (
          <p className="empty">
            Você ainda não deixou nenhuma palavra de retribuição.
          </p>
        ) : (
          ofertas.map((o) => (
            <div className="palavra-item" key={o.id}>
              <Flower color="var(--mata)" />
              <span>
                em <b>{o.saber?.nome ?? 'saber removido'}</b>: {o.palavra}
                <span className="autor">
                  {new Date(o.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="perfil-rodape">
        <button className="btn-soft" onClick={sair}>sair</button>
      </div>
    </main>
  )
}