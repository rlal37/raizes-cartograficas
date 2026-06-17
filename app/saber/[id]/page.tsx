'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Flower, Knot, Arrow, Divider, Ribbon } from '@/components/Organicos'

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

// ícones de intenção (vindos do protótipo)
function IconAprender() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21 V 11" stroke="var(--terra)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 13 C 6 13 4 8 5 4 C 10 5 12 9 12 13Z" fill="var(--mata)" />
      <path d="M12 14 C 17 14 19 10 18 7 C 14 8 12 11 12 14Z" fill="var(--mata)" opacity="0.8" />
    </svg>
  )
}
function IconPesquisar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12 a7 7 0 1 1 -4 -6.3" stroke="var(--terra)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" fill="var(--ocre)" />
    </svg>
  )
}
function IconInspirar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" fill="var(--ocre)" />
      <g fill="var(--terra)">
        <ellipse cx="12" cy="5" rx="2.4" ry="3.4" />
        <ellipse cx="12" cy="19" rx="2.4" ry="3.4" />
        <ellipse cx="5" cy="12" rx="3.4" ry="2.4" />
        <ellipse cx="19" cy="12" rx="3.4" ry="2.4" />
      </g>
    </svg>
  )
}

// rótulos ricos na superfície; chaves do banco por baixo
const INTENCOES: { key: Intencao; label: string; icon: React.ReactNode }[] = [
  { key: 'aprender', label: 'Aprender uma técnica', icon: <IconAprender /> },
  { key: 'pesquisar', label: 'Fazer pesquisa', icon: <IconPesquisar /> },
  { key: 'inspirar', label: 'Buscar inspiração', icon: <IconInspirar /> },
]

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
  const [chegou, setChegou] = useState(false)

  // ---- estado do "propor projeto" ----
  const [propostaAberta, setPropostaAberta] = useState(false)
  const [copiadoProposta, setCopiadoProposta] = useState(false)

  // ---- estado do "deixar palavra nesta porta" ----
  const [palavraAberta, setPalavraAberta] = useState(false)
  const [palavraAqui, setPalavraAqui] = useState('')
  const [deixando, setDeixando] = useState(false)
  const [avisoPalavra, setAvisoPalavra] = useState('')

  // função que recarrega as palavras desta porta (reusada após deixar uma)
  async function carregarOfertas() {
    const { data: deixadas } = await supabase
      .from('ofertas')
      .select('id, palavra, criado_em, autor:buscadores ( nome )')
      .eq('saber_id', id)
      .order('criado_em', { ascending: false })
    setOfertas((deixadas as unknown as OfertaComNome[]) ?? [])
  }

  useEffect(() => {
    async function buscar() {
      const { data } = await supabase
        .from('saberes')
        .select('*')
        .eq('id', id)
        .single()
      setSaber(data)

      await carregarOfertas()
      setCarregando(false)
    }
    buscar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Lê a postura herdada da home (?postura=...) e o marcador de chegada (?chegou=1).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const p = sp.get('postura')
    if (p === 'aprender' || p === 'pesquisar' || p === 'inspirar') {
      setPosturaURL(p)
    }
    if (sp.get('chegou') === '1') {
      setChegou(true)
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

  // deixar uma palavra NESTA porta (sem atravessar fio)
  async function deixarPalavra() {
    setAvisoPalavra('')
    if (!palavraAqui.trim()) {
      setAvisoPalavra('Escreva sua palavra antes de deixá-la.')
      return
    }

    const { data: sessao } = await supabase.auth.getSession()
    if (!sessao.session) {
      router.push('/entrar')
      return
    }

    setDeixando(true)
    const { error } = await supabase.from('ofertas').insert({
      buscador_id: sessao.session.user.id,
      saber_id: id,
      palavra: palavraAqui.trim(),
    })
    setDeixando(false)

    if (error) {
      setAvisoPalavra('Não foi possível deixar sua palavra. Tente de novo.')
      return
    }

    setPalavraAqui('')
    setPalavraAberta(false)
    await carregarOfertas() // a palavra nova aparece na lista na hora
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
    router.push('/saber/' + destinoId + '?chegou=1' + (intencao ? '&postura=' + intencao : ''))
  }

  if (carregando) return <main className="wrap"><p className="empty">Abrindo a porta…</p></main>
  if (!saber) return <main className="wrap"><p className="empty">Essa porta não foi encontrada.</p></main>

  return (
    <main className="wrap">
      {chegou && <Ribbon>a porta se abriu — você atravessou com licença</Ribbon>}

      <div
        className="card porta"
        style={{ '--accent': saber.cor || 'var(--ink)' } as React.CSSProperties}
      >
        <p className="porta-tag">◖ porta aberta · curada pela fonte</p>
        <h1>{saber.nome}</h1>
        {saber.territorio && <p className="terr">{saber.territorio}</p>}
        <span className="consent">
          <Flower color="#fff" /> mantida pela fonte · com licença
        </span>

        {saber.sobre && (
          <>
            <Divider label="sobre este saber" />
            <p className="sobre">{saber.sobre}</p>
          </>
        )}
        <p className="face-note">
          A técnica não cabe nesta tela — ela vive nas mãos de quem faz. Aqui você
          conhece o saber e quem o guarda, para chegar sabendo o que pedir.
        </p>

        <Divider label="como chegar" />
        <div className="chegar">
          {saber.onde && (
            <div className="row"><span className="k">onde</span><span className="v">{saber.onde}</span></div>
          )}
          {saber.quando && (
            <div className="row"><span className="k">quando</span><span className="v">{saber.quando}</span></div>
          )}
          {saber.com_quem && (
            <div className="row"><span className="k">com quem</span><span className="v">{saber.com_quem}</span></div>
          )}
        </div>

        {/* Canal da fonte + propor projeto (só fontes abertas têm o botão) */}
        {saber.canal && (
          <div className="contato">
            {saber.aberto ? (
              propostaAberta ? (
                <div className="proposta">
                  <p className="pt">◖ rascunho que a plataforma levaria à fonte (você revisa antes)</p>
                  <p className="draft">“{rascunhoProposta()}”</p>
                  <button className="btn-copy" onClick={copiarProposta}>
                    {copiadoProposta ? 'copiado ✓' : 'copiar rascunho'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="presenca" style={{ background: 'rgba(75,107,58,0.08)', marginBottom: 12 }}>
                    <Flower color="var(--mata)" /><span>{saber.canal}</span>
                  </div>
                  <button className="btn-contato" onClick={() => setPropostaAberta(true)}>
                    <Arrow color="#fff" /> propor um projeto a esta fonte
                  </button>
                </>
              )
            ) : (
              <div className="presenca">
                <Knot color="var(--indigo)" /><span>{saber.canal}</span>
              </div>
            )}
          </div>
        )}

        {saber.pede && (
          <>
            <Divider label="o que esta fonte pede" />
            <p className="sobre">{saber.pede}</p>
          </>
        )}

        {saber.credito && (
          <>
            <Divider label="como creditar" />
            <div className="credito-box">
              <p className="line">{saber.credito}</p>
              <button className="btn-copy" onClick={copiarCredito}>
                {copiado ? 'copiado ✓' : 'copiar crédito'}
              </button>
            </div>
          </>
        )}

        {/* Deixar uma palavra NESTA porta (reciprocidade, sem precisar atravessar) */}
        <Divider label="sua palavra" />
        {palavraAberta ? (
          <div>
            <span className="field-lbl">o que você devolve a esta fonte</span>
            <textarea
              className="textarea"
              value={palavraAqui}
              onChange={(e) => setPalavraAqui(e.target.value)}
              placeholder="Firme aqui o que você se compromete a devolver: citar, buscar presencialmente, apoiar e remunerar quem faz…"
              rows={3}
            />
            {avisoPalavra && <p className="aviso">{avisoPalavra}</p>}
            <div className="palavra-acoes">
              <button className="atravessar palavra-confirma" onClick={deixarPalavra} disabled={deixando}>
                <Flower color="#fff" /> {deixando ? 'deixando…' : 'deixar minha palavra'}
              </button>
              <button
                className="btn-soft"
                onClick={() => { setPalavraAberta(false); setAvisoPalavra('') }}
              >
                cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="palavra-prompt">
              Atravessar deixa um rastro. Firme aqui o que você devolve em troca do que recebe.
            </p>
            <button className="btn-soft" onClick={() => setPalavraAberta(true)}>
              <Flower color="var(--mata)" /> deixar minha palavra de retribuição
            </button>
          </>
        )}

        <button className="atravessar" onClick={abrirModal}>
          <Arrow color="#fff" /> puxar um fio com licença
        </button>
      </div>

      {/* Reciprocidade visível: as palavras deixadas nesta porta */}
      <Divider label="palavras deixadas aqui" />
      <div className="palavras">
        {ofertas.length === 0 ? (
          <p className="empty">Ninguém deixou palavra nesta porta ainda.</p>
        ) : (
          ofertas.map((o) => (
            <div className="palavra-item" key={o.id}>
              <Flower color="var(--mata)" />
              <span>
                {o.palavra}
                <span className="autor">— {o.autor?.nome?.trim() || 'alguém que passou por aqui'}</span>
              </span>
            </div>
          ))
        )}
      </div>

      {/* ---- MODAL ---- */}
      {modalAberto && (
        <div className="overlay" onClick={() => setModalAberto(false)}>
          <div className="lic" onClick={(e) => e.stopPropagation()}>
            <button className="back" onClick={() => setModalAberto(false)}>← fechar</button>
            <p className="kicker">você quer puxar um fio a partir de</p>
            <h2>{saber.nome}</h2>
            <p className="intro">
              Escolha o destino e declare sua intenção. Esse é o seu pedir licença.
            </p>

            <span className="field-lbl">para onde o fio vai</span>
            <select
              className="select"
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
            >
              <option value="">Escolha um saber…</option>
              {outros.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome} {o.territorio ? '— ' + o.territorio : ''}
                </option>
              ))}
            </select>

            <span className="field-lbl">com qual intenção</span>
            {INTENCOES.map((op) => (
              <button
                key={op.key}
                className="int"
                aria-pressed={intencao === op.key}
                onClick={() => setIntencao(op.key)}
              >
                <span className="ico">{op.icon}</span> {op.label}
              </button>
            ))}

            {destinoId && intencao && (
              <div className="sug">
                <p className="sug-tag">◖ camada meta · ajuda a formular o pedido (não narra o saber)</p>
                <ul>
                  {perguntasPara(intencao, nomeDestino).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
                <span className="field-lbl">sua palavra (fica visível na porta de destino — opcional)</span>
                <textarea
                  className="textarea"
                  value={palavra}
                  onChange={(e) => setPalavra(e.target.value)}
                  placeholder="Escreva, com suas palavras, o que você busca neste fio."
                  rows={3}
                />
              </div>
            )}

            {aviso && <p className="aviso">{aviso}</p>}

            <button className="atravessar" onClick={confirmarFio} disabled={puxando}>
              <Arrow color="#fff" /> {puxando ? 'puxando…' : 'puxar com licença'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}