'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { HeroVine, Divider, Knot } from '@/components/Organicos'

type Intencao = 'aprender' | 'pesquisar' | 'inspirar'
type SaberHome = {
  id: string
  nome: string
  territorio: string | null
  sobre: string | null
  cor: string | null
}

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

// rótulos ricos + descrição curta; a chave por baixo é o que o banco entende
const POSTURAS: {
  chave: Intencao
  rotulo: string
  desc: string
  icon: React.ReactNode
}[] = [
  { chave: 'aprender', rotulo: 'Aprender uma técnica', desc: 'Aprender com as mãos, no convívio — sem pressa.', icon: <IconAprender /> },
  { chave: 'pesquisar', rotulo: 'Fazer pesquisa', desc: 'Pesquisar e combinar como citar e retribuir.', icon: <IconPesquisar /> },
  { chave: 'inspirar', rotulo: 'Buscar inspiração', desc: 'Buscar referências nomeando de onde vêm.', icon: <IconInspirar /> },
]

const CONFIRMA: Record<Intencao, string> = {
  aprender: 'Você chega para aprender. As portas estão abertas.',
  pesquisar: 'Você chega para pesquisar. As portas estão abertas.',
  inspirar: 'Você chega em busca de inspiração. As portas estão abertas.',
}

export default function Home() {
  const [saberes, setSaberes] = useState<SaberHome[]>([])
  const [carregando, setCarregando] = useState(true)
  const [postura, setPostura] = useState<Intencao | ''>('')

  useEffect(() => {
    async function buscar() {
      const { data } = await supabase
        .from('saberes')
        .select('id, nome, territorio, sobre, cor')
        .order('nome')
      setSaberes((data as SaberHome[]) ?? [])
      setCarregando(false)
    }
    buscar()
  }, [])

  const destravado = postura !== ''

  return (
    <main className="wrap">
      <HeroVine />

      <p className="eyebrow">raízes cartográficas</p>
      <p className="manifesto">
        Um rizoma de saberes populares — <b>não um acervo</b>. Aqui o saber não é
        conteúdo para consumir: é relação. Cada porta é mantida por quem guarda o
        saber. Você entra <b>pedindo licença</b>, credita quem ensina e retribui o
        que recebe.
      </p>

      <Divider label="como você chega hoje?" />
      <p className="hint">
        Sua postura é o seu primeiro pedir licença — ela acompanha você ao
        atravessar a primeira porta.
      </p>
      <div className="posturas">
        {POSTURAS.map((p) => (
          <button
            key={p.chave}
            className="postura-card"
            aria-pressed={postura === p.chave}
            onClick={() => setPostura(p.chave)}
          >
            <span className="pc-ico">{p.icon}</span>
            <span className="pc-text">
              <span className="pc-label">{p.rotulo}</span>
              <span className="pc-desc">{p.desc}</span>
            </span>
            <span className="pc-check" aria-hidden="true">✓</span>
          </button>
        ))}
      </div>

      <Divider label="por onde começar" />
      {destravado ? (
        <p className="confirma">
          <Knot color="var(--mata)" /> {CONFIRMA[postura as Intencao]}
        </p>
      ) : (
        <p className="hint">Escolha acima como você chega para abrir as portas.</p>
      )}

      {carregando ? (
        <p className="empty">Semeando as portas…</p>
      ) : (
        <div className={'entry' + (destravado ? '' : ' locked')}>
          {saberes.map((s) => (
            <Link
              key={s.id}
              className="door"
              href={'/saber/' + s.id + (postura ? '?postura=' + postura : '')}
              style={{ '--accent': s.cor || 'var(--ink)' } as React.CSSProperties}
            >
              <Knot color={s.cor || 'var(--indigo)'} />
              <span>
                <span className="dn">{s.nome}</span>
                <span className="dt">{s.territorio}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <Divider label="você guarda um saber?" />
      <div className="guarda">
        <p>
          As portas são criadas e mantidas por quem detém o saber — mestres,
          mestras, comunidades e associações.
        </p>
        <p className="sub">
          Abrir uma porta exige um processo de reconhecimento e consentimento,
          conduzido junto às próprias comunidades. No MVP as portas são semeadas;
          esta área de autoria pela fonte é o próximo passo do projeto.
        </p>
      </div>
    </main>
  )
}