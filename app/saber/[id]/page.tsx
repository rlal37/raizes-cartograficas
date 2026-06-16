'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Saber = {
  id: string
  nome: string
  territorio: string | null
  cor: string | null
  sobre: string | null
  onde: string | null
  quando: string | null
  com_quem: string | null
  pede: string | null
  credito: string | null
  aberto: boolean | null
  canal: string | null
}

type SaberResumo = { id: string; nome: string; territorio: string | null }
type Intencao = 'aprender' | 'pesquisar' | 'inspirar'

type OfertaComNome = {
  id: number
  palavra: string
  criado_em: string
  autor: { nome: string | null } | null
}

// A "COSTURA" da camada meta: perguntas fixas por enquanto.
// Quando plugarmos a IA real, SÓ esta função muda.
function perguntasPara(intencao: Intencao, nomeDestino: string): string[] {
  if (intencao === 'aprender') {
    return [
      `Para que momento da sua caminhada o saber "${nomeDestino}" serve?`,
      'O que você espera conseguir fazer depois de aprender com essa fonte?',
    ]
  }
  if (intencao === 'pesquisar') {
    return [
      `Qual pergunta da sua pesquisa o saber "${nomeDestino}" pode ajudar a responder?`,
      'Como você pretende citar e creditar essa fonte no seu trabalho?',
    ]
  }
  return [
    `Que projeto seu pode dialogar com o saber "${nomeDestino}"?`,
    'O que te atraiu nesse saber a ponto de querer puxar esse fio?',
  ]
}

// frase de intenção usada no rascunho de proposta
function fraseIntencao(p: Intencao | ''): string {
  if (p === 'aprender') return ' Minha intenção é aprender com esta fonte.'
  if (p === 'pesquisar') return ' Minha intenção é pesquisar este saber.'
  if (p === 'inspirar') return ' Minha intenção é me inspirar neste saber.'
  return ''
}

export default function PortaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [saber, setSaber] = useState<Saber | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [ofertas, setOfertas] = useState<OfertaComNome[]>([])

  // ---- estado do modal ----
  const [modalAberto, setModalAberto] = useState(false)
  const [outros, setOutros] = useState<SaberResumo[]>([])
  const [destinoId, setDestinoId] = useState<string>('')
  const [intencao, setIntencao] = useState<Intencao | ''>('')
  const [palavra, setPalavra] = useState('')
  const [posturaURL, setPosturaURL] = useState<Intencao | ''>('') // postura vinda da home
  const [puxando, setPuxando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [copiado, setCopiado] = useState(false)

  // ---- estado do "propor projeto" ----
  const [propostaAberta, setPropostaAberta] = useState(false)
  const [copiadoProposta, setCopiadoProposta] = useState(false)

  useEffect(() => {
    async function buscar() {
      const { data } = await supabase
        .from('saberes')
        .select('*')
        .eq('id', id)
        .single()
      setSaber(data)

      // Palavras deixadas nesta porta (públicas), com o nome de quem deixou.
      const { data: deixadas } = await supabase
        .from('ofertas')
        .select('id, palavra, criado_em, autor:buscadores ( nome )')
        .eq('saber_id', id)
        .order('criado_em', { ascending: false })

      setOfertas((deixadas as unknown as OfertaComNome[]) ?? [])
      setCarregando(false)
    }
    buscar()
  }, [id])

  // Lê a postura herdada da home (?postura=...), uma vez ao abrir a porta.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('postura')
    if (p === 'aprender' || p === 'pesquisar' || p === 'inspirar') {
      setPosturaURL(p)
    }
  }, [])

  async function copiarCredito() {
    if (!saber?.credito) return
    try {
      await navigator.clipboard.writeText(saber.credito)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // alguns navegadores bloqueiam a cópia automática; ignora sem quebrar
    }
  }

  // texto do rascunho que a plataforma levaria à fonte
  function rascunhoProposta(): string {
    return (
      'Olá. Conheci seu trabalho pelo Raízes Cartográficas e sou designer.' +
      fraseIntencao(posturaURL) +
      ' Gostaria de propor uma colaboração, com crédito e nas suas condições. Podemos conversar?'
    )
  }

  async function copiarProposta() {
    try {
      await navigator.clipboard.writeText(rascunhoProposta())
      setCopiadoProposta(true)
      setTimeout(() => setCopiadoProposta(false), 2000)
    } catch {
      // ignora
    }
  }

  async function abrirModal() {
    setAviso('')
    setDestinoId('')
    setIntencao(posturaURL) // pré-seleciona a postura herdada da home
    setPalavra('')

    const { data } = await supabase
      .from('saberes')
      .select('id, nome, territorio')
      .neq('id', id)
      .order('nome')

    setOutros(data ?? [])
    setModalAberto(true)
  }

  const nomeDestino = outros.find((o) => o.id === destinoId)?.nome ?? ''

  async function confirmarFio() {
    setAviso('')

    if (!destinoId || !intencao) {
      setAviso('Escolha o destino e a intenção do fio.')
      return
    }

    const { data: sessao } = await supabase.auth.getSession()
    if (!sessao.session) {
      router.push('/entrar')
      return
    }

    setPuxando(true)
    const userId = sessao.session.user.id

    const { error: erroRastro } = await supabase.from('rastros').insert({
      buscador_id: userId,
      saber_origem_id: id,
      saber_destino_id: destinoId,
      intencao,
    })

    if (erroRastro) {
      setPuxando(false)
      setAviso('Não foi possível puxar o fio. Tente de novo.')
      return
    }

    if (palavra.trim()) {
      await supabase.from('ofertas').insert({
        buscador_id: userId,
        saber_id: destinoId,
        palavra: palavra.trim(),
      })
    }

    setPuxando(false)
    router.push('/saber/' + destinoId)
  }

  if (carregando) return <p className="p-8">Abrindo a porta...</p>
  if (!saber) return <p className="p-8">Essa porta não foi encontrada.</p>

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <p className="text-sm opacity-60">{saber.territorio}</p>
      <h1 className="text-3xl font-bold mb-6">{saber.nome}</h1>

      {saber.sobre && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold opacity-60 mb-1">O que é</h2>
          <p>{saber.sobre}</p>
        </section>
      )}
      {saber.com_quem && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold opacity-60 mb-1">Quem guarda</h2>
          <p>{saber.com_quem}</p>
        </section>
      )}
      {(saber.onde || saber.quando) && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold opacity-60 mb-1">Como chegar</h2>
          {saber.onde && <p>{saber.onde}</p>}
          {saber.quando && <p className="opacity-80">{saber.quando}</p>}
        </section>
      )}

      {/* Canal da fonte + propor projeto (só fontes abertas têm o botão) */}
      {saber.canal && (
        <section className="mb-5">
          <p className="text-sm opacity-80 border-l-2 pl-3">{saber.canal}</p>

          {saber.aberto && !propostaAberta && (
            <button
              onClick={() => setPropostaAberta(true)}
              className="border px-4 py-2 rounded mt-3"
            >
              Propor um projeto a esta fonte
            </button>
          )}

          {saber.aberto && propostaAberta && (
            <div className="border rounded p-4 mt-3 text-sm">
              <p className="opacity-60 mb-2">
                Rascunho que a plataforma levaria à fonte (você revisa antes):
              </p>
              <p className="italic mb-3">“{rascunhoProposta()}”</p>
              <button
                onClick={copiarProposta}
                className="border px-3 py-1 rounded"
              >
                {copiadoProposta ? 'Copiado ✓' : 'Copiar rascunho'}
              </button>
            </div>
          )}
        </section>
      )}

      {saber.pede && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold opacity-60 mb-1">O que pede</h2>
          <p>{saber.pede}</p>
        </section>
      )}

      {saber.credito && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold opacity-60 mb-1">Crédito</h2>
          <p className="text-sm opacity-80 mb-2">{saber.credito}</p>
          <button
            onClick={copiarCredito}
            className="border px-3 py-1 rounded text-sm"
          >
            {copiado ? 'Copiado ✓' : 'Copiar crédito'}
          </button>
        </section>
      )}

      <button onClick={abrirModal} className="border px-4 py-2 rounded">
        Puxar um fio com licença
      </button>

      {/* Reciprocidade visível: as palavras deixadas nesta porta */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold opacity-60 mb-3">
          Palavras deixadas aqui
        </h2>

        {ofertas.length === 0 ? (
          <p className="text-sm opacity-50">
            Ninguém deixou palavra nesta porta ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {ofertas.map((o) => (
              <li key={o.id} className="border-l-2 pl-3 text-sm">
                <p>{o.palavra}</p>
                <p className="opacity-50 mt-1">
                  — {o.autor?.nome?.trim() || 'alguém que passou por aqui'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- MODAL ---- */}
      {modalAberto && (
        <div
          onClick={() => setModalAberto(false)}
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-md w-full p-6 max-h-[85vh] overflow-auto"
          >
            <h2 className="text-xl font-bold mb-1">Puxar um fio</h2>
            <p className="text-sm opacity-70 mb-4">
              De <strong>{saber.nome}</strong>, para onde você segue — e com que intenção?
            </p>

            <label className="block mb-4">
              <span className="block text-sm mb-1">Para onde o fio vai</span>
              <select
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Escolha um saber...</option>
                {outros.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome} {o.territorio ? '— ' + o.territorio : ''}
                  </option>
                ))}
              </select>
            </label>

            <span className="block text-sm mb-1">Com qual intenção</span>
            <div className="flex gap-2 mb-5">
              {(['aprender', 'pesquisar', 'inspirar'] as Intencao[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setIntencao(op)}
                  className={
                    'border px-3 py-2 rounded capitalize flex-1 ' +
                    (intencao === op ? 'bg-black text-white' : '')
                  }
                >
                  {op}
                </button>
              ))}
            </div>

            {destinoId && intencao && (
              <div className="mb-5 border-t pt-4">
                <p className="text-sm font-semibold mb-2">
                  Antes de bater nesta porta, pense:
                </p>
                <ul className="text-sm opacity-80 list-disc pl-5 mb-3 space-y-1">
                  {perguntasPara(intencao, nomeDestino).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
                <label className="block">
                  <span className="block text-sm mb-1">
                    Sua palavra (fica visível nesta porta — opcional)
                  </span>
                  <textarea
                    value={palavra}
                    onChange={(e) => setPalavra(e.target.value)}
                    placeholder="Escreva, com suas palavras, o que você busca neste fio."
                    rows={3}
                    className="w-full border rounded px-3 py-2"
                  />
                </label>
              </div>
            )}

            {aviso && <p className="text-sm mb-3 opacity-80">{aviso}</p>}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={confirmarFio}
                disabled={puxando}
                className="border px-4 py-2 rounded"
              >
                {puxando ? 'Puxando...' : 'Puxar com licença'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}