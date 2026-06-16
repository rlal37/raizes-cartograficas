'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Intencao = 'aprender' | 'pesquisar' | 'inspirar'
type SaberHome = { id: string; nome: string; territorio: string | null; sobre: string | null }

// rótulos ricos (do protótipo); o valor por baixo é a chave que o banco entende
const POSTURAS: { chave: Intencao; rotulo: string }[] = [
  { chave: 'aprender', rotulo: 'Aprender uma técnica' },
  { chave: 'pesquisar', rotulo: 'Fazer pesquisa' },
  { chave: 'inspirar', rotulo: 'Buscar inspiração' },
]

export default function Home() {
  const [saberes, setSaberes] = useState<SaberHome[]>([])
  const [carregando, setCarregando] = useState(true)
  const [postura, setPostura] = useState<Intencao | ''>('')   // a "como você chega hoje"

  useEffect(() => {
    async function buscar() {
      const { data } = await supabase
        .from('saberes')
        .select('id, nome, territorio, sobre')
        .order('nome')
      setSaberes(data ?? [])
      setCarregando(false)
    }
    buscar()
  }, [])

  const destravado = postura !== ''   // portão: só abre quando há postura

  if (carregando) return <p className="p-8">Carregando os saberes...</p>

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Raízes Cartográficas</h1>
      <p className="mb-8 opacity-80">
        Um rizoma de saberes populares — não um acervo. Cada porta é mantida por
        quem guarda o saber. Você entra pedindo licença.
      </p>

      {/* Postura — o primeiro pedir licença */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold opacity-60 mb-1">Como você chega hoje?</h2>
        <p className="text-sm opacity-60 mb-3">
          Sua postura é o seu primeiro pedir licença — ela acompanha você ao
          atravessar a primeira porta.
        </p>
        <div className="flex gap-2 flex-wrap">
          {POSTURAS.map((p) => (
            <button
              key={p.chave}
              onClick={() => setPostura(p.chave)}
              className={
                'border px-3 py-2 rounded ' +
                (postura === p.chave ? 'bg-black text-white' : '')
              }
            >
              {p.rotulo}
            </button>
          ))}
        </div>
      </section>

      {/* Portas — travadas até a postura ser escolhida */}
      <section>
        <h2 className="text-sm font-semibold opacity-60 mb-1">Por onde começar</h2>
        {!destravado && (
          <p className="text-sm opacity-60 mb-3">
            Escolha acima como você chega para abrir as portas.
          </p>
        )}

        <ul className={'space-y-3 ' + (destravado ? '' : 'opacity-40 pointer-events-none')}>
          {saberes.map((s) => (
            <li key={s.id} className="border rounded px-4 py-3">
              <Link href={'/saber/' + s.id + '?postura=' + postura}>
                <strong>{s.nome}</strong>
                {s.territorio ? ' — ' + s.territorio : ''}
                <br />
                <span className="text-sm opacity-60">{s.sobre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}