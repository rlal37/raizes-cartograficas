'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
type RastroComNomes = {
  id: number
  intencao: string
  criado_em: string
  origem: { nome: string } | null
  destino: { nome: string } | null
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
    // Lê a caminhada: os fios puxados, com os nomes dos saberes.
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
    return <p className="p-8">Verificando sua entrada...</p>
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Minha caminhada</h1>
      <p className="text-sm opacity-70 mb-6">Quem busca: {usuario?.email}</p>

      <label className="block mb-4">
        <span className="block text-sm mb-1">Como você quer ser creditado</span>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome ou apelido"
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-4">
        <span className="block text-sm mb-1">O que você anda procurando</span>
        <textarea
          value={caminhada}
          onChange={(e) => setCaminhada(e.target.value)}
          placeholder="Ex.: referências de cultura popular pernambucana para um projeto de identidade visual"
          rows={3}
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={salvando}
          className="border px-4 py-2 rounded"
        >
          {salvando ? 'Guardando...' : 'Guardar caminhada'}
        </button>

        <button onClick={sair} className="border px-4 py-2 rounded">
          Sair
        </button>

        {aviso && <span className="text-sm opacity-70">{aviso}</span>}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Os fios que você puxou</h2>

        {rastros.length === 0 ? (
          <p className="text-sm opacity-60">
            Você ainda não puxou nenhum fio. Visite uma porta e puxe o primeiro.
          </p>
        ) : (
          <ul className="space-y-3">
            {rastros.map((r) => (
              <li key={r.id} className="border rounded px-4 py-3 text-sm">
                <span className="opacity-60">{r.origem?.nome ?? 'entrada direta'}</span>
                {' → '}
                <strong>{r.destino?.nome ?? 'saber removido'}</strong>
                <span className="ml-2 opacity-70">· {r.intencao}</span>
                <br />
                <span className="opacity-50">
                  {new Date(r.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}