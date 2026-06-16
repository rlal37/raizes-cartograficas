import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: saberes, error } = await supabase
    .from('saberes')
    .select('id, nome, territorio, sobre')   // 👈 incluí o "id"

  if (error) {
    return <main style={{ padding: 40 }}>Erro ao ler o banco: {error.message}</main>
  }

  return (
    <main style={{ padding: 40, maxWidth: 700, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Raízes Cartográficas</h1>
      <p>Saberes lidos do banco de dados:</p>
      <ul>
        {saberes?.map((s) => (
          <li key={s.id} style={{ marginBottom: 16 }}>          {/* 👈 key vira id */}
            <Link href={'/saber/' + s.id}>                       {/* 👈 envolve o conteúdo num link */}
              <strong>{s.nome}</strong> — {s.territorio}
              <br />
              <span style={{ color: '#555' }}>{s.sobre}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}