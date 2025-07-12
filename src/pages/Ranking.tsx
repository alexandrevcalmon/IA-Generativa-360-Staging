import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth';

const MEDALS = [
  { color: 'bg-yellow-400', label: '🥇' },
  { color: 'bg-gray-400', label: '🥈' },
  { color: 'bg-orange-500', label: '🥉' },
];

const PAGE_SIZE = 20;

export default function Ranking() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca ranking paginado e filtrado
  useEffect(() => {
    setLoading(true);
    const fetchRanking = async () => {
      let query = supabase
        .from('global_collaborator_ranking')
        .select('*', { count: 'exact' })
        .order('total_points', { ascending: false })
        .order('collaborator_name', { ascending: true })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (search) {
        query = query.ilike('collaborator_name', `%${search}%`).ilike('company_name', `%${search}%`);
      }
      const { data, count, error } = await query;
      if (!error) {
        setRanking(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    };
    fetchRanking();
  }, [page, search]);

  // Busca posição do usuário logado
  useEffect(() => {
    if (!user?.id) return;
    const fetchMyPosition = async () => {
      const { data, error } = await supabase
        .from('global_collaborator_ranking')
        .select('*')
        .eq('collaborator_email', user.email)
        .single();
      if (!error && data) setMyPosition(data);
    };
    fetchMyPosition();
  }, [user]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ranking Geral</h1>
            <p className="text-gray-600">Veja quem são os colaboradores mais engajados da plataforma!</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Ranking de Colaboradores</CardTitle>
            <Input
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mt-2 w-full"
            />
          </CardHeader>
          <CardContent>
            {myPosition && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 flex items-center gap-4 border border-blue-200">
                <span className="font-bold text-lg">Sua posição: {myPosition.position}</span>
                <span className="font-semibold">{myPosition.collaborator_name}</span>
                <span className="text-gray-500">({myPosition.company_name})</span>
                <Badge className="bg-blue-600 text-white ml-2">Você</Badge>
                <span className="ml-auto font-bold text-blue-700">{myPosition.total_points} pts</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Posição</th>
                    <th className="p-2 text-left">Colaborador</th>
                    <th className="p-2 text-left">Empresa</th>
                    <th className="p-2 text-right">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center p-4">Carregando...</td></tr>
                  ) : ranking.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-4">Nenhum resultado encontrado.</td></tr>
                  ) : ranking.map((row, idx) => {
                    const pos = (page - 1) * PAGE_SIZE + idx + 1;
                    const isMe = user?.email && row.collaborator_email === user.email;
                    let medal = null;
                    if (pos <= 3) medal = MEDALS[pos - 1];
                    return (
                      <tr key={row.collaborator_id} className={isMe ? 'bg-blue-100 font-bold' : ''}>
                        <td className="p-2">
                          {medal ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${medal.color}`}>{medal.label}</span>
                          ) : (
                            <span>{pos}</span>
                          )}
                        </td>
                        <td className="p-2">{row.collaborator_name} {isMe && <Badge className="ml-1 bg-blue-600 text-white">Você</Badge>}</td>
                        <td className="p-2">{row.company_name}</td>
                        <td className="p-2 text-right font-semibold">{row.total_points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Paginação */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Anterior</button>
              <span>Página {page} de {Math.ceil(total / PAGE_SIZE) || 1}</span>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setPage(p => p + 1)}
                disabled={page * PAGE_SIZE >= total}
              >Próxima</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 