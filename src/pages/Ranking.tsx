import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth/useAuth';

const MEDALS = [
  { color: 'bg-yellow-400', label: '🥇' },
  { color: 'bg-gray-400', label: '🥈' },
  { color: 'bg-orange-500', label: '🥉' },
];

const PERIODS = [
  { label: 'Hoje', value: 'today', field: 'points_today' },
  { label: 'Semana', value: 'week', field: 'points_week' },
  { label: 'Mês', value: 'month', field: 'points_month' },
  { label: '6 meses', value: '6months', field: 'points_semester' },
  { label: 'Ano', value: 'year', field: 'points_year' },
  { label: 'Geral', value: 'all', field: 'total_points' },
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
  const [period, setPeriod] = useState('all');

  // Busca ranking paginado e filtrado
  useEffect(() => {
    setLoading(true);
    const fetchRanking = async () => {
      const periodField = PERIODS.find(p => p.value === period)?.field || 'total_points';
      // Usar a nova função pública
      const { data, error } = await supabase.rpc('get_public_collaborator_ranking');
      if (!error) {
        // Filtrar e ordenar os dados
        let filteredData = data || [];
        if (search) {
          filteredData = filteredData.filter(item => 
            item.collaborator_name?.toLowerCase().includes(search.toLowerCase()) ||
            item.company_name?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Ordenar por período
        const periodField = PERIODS.find(p => p.value === period)?.field || 'total_points';
        filteredData.sort((a, b) => (b[periodField] || 0) - (a[periodField] || 0));
        
        // Paginação
        const startIndex = (page - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setRanking(paginatedData);
        setTotal(filteredData.length);
      } else {
        console.error('Erro ao buscar ranking:', error);
      }
      setLoading(false);
    };
    fetchRanking();
  }, [page, search, period]);

  // Busca posição do usuário logado
  useEffect(() => {
    if (!user?.email) return;
    const fetchMyPosition = async () => {
      try {
        // Buscar posição usando a nova função RPC
        const { data, error } = await supabase.rpc('get_public_collaborator_ranking');
        
        if (!error && data) {
          // Encontrar a posição do usuário atual pelo email
          const userPosition = data.find(item => item.collaborator_email === user.email);
          
          if (userPosition) {
            // Calcular a posição baseada no total_points
            const position = data.filter(item => item.total_points > userPosition.total_points).length + 1;
            setMyPosition({
              ...userPosition,
              position: position
            });
          }
        } else if (error) {
          console.error('Erro ao buscar posição do usuário:', error);
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar posição:', err);
      }
    };
    fetchMyPosition();
  }, [user]);

  return (
    <div className="flex flex-col h-full dark-theme-override">
      <div className="bg-slate-900/20 border-b border-slate-700/50 p-6" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ranking Geral</h1>
            <p className="text-slate-300">Veja quem são os colaboradores mais engajados da plataforma!</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-slate-900/10" style={{ backgroundColor: 'rgba(15, 23, 42, 0.1)' }}>
        <Card className="max-w-4xl mx-auto border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
          <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
            <CardTitle className="flex items-center gap-2 text-white">Ranking de Colaboradores</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  className={`px-3 py-1 rounded-full border transition ${
                    period === p.value 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-slate-800/50 text-slate-300 border-slate-600 hover:bg-slate-700/50'
                  }`}
                  style={{
                    backgroundColor: period === p.value ? '#059669' : 'rgba(30, 41, 59, 0.5)',
                    borderColor: period === p.value ? '#059669' : '#475569',
                    color: period === p.value ? 'white' : '#cbd5e1'
                  }}
                  onClick={() => { setPage(1); setPeriod(p.value); }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Input
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mt-2 w-full bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                borderColor: 'rgba(71, 85, 105, 0.5)',
                color: 'white'
              }}
            />
          </CardHeader>
          <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
            {myPosition && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 flex items-center gap-4 border border-emerald-500/20" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <span className="font-bold text-lg text-white">Sua posição: {myPosition.position}</span>
                <span className="font-semibold text-white">{myPosition.collaborator_name}</span>
                <span className="text-slate-300">({myPosition.company_name})</span>
                <Badge className="bg-emerald-600 text-white ml-2" style={{ backgroundColor: '#059669' }}>Você</Badge>
                <span className="ml-auto font-bold text-emerald-400">{myPosition.total_points} pts</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
                    <th className="p-2 text-left text-white">Posição</th>
                    <th className="p-2 text-left text-white">Colaborador</th>
                    <th className="p-2 text-left text-white">Empresa</th>
                    <th className="p-2 text-right text-white">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center p-4 text-slate-300">Carregando...</td></tr>
                  ) : ranking.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-4 text-slate-300">Nenhum resultado encontrado.</td></tr>
                  ) : ranking.map((row, idx) => {
                    const pos = (page - 1) * PAGE_SIZE + idx + 1;
                    const isMe = user?.email && row.collaborator_email === user.email;
                    let medal = null;
                    if (pos <= 3) medal = MEDALS[pos - 1];
                    return (
                      <tr key={row.collaborator_id} className={`${isMe ? 'bg-emerald-500/10 font-bold' : ''} border-b border-slate-700/30`} style={isMe ? { backgroundColor: 'rgba(16, 185, 129, 0.1)' } : {}}>
                        <td className="p-2 text-white">
                          {medal ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${medal.color}`}>{medal.label}</span>
                          ) : (
                            <span>{pos}</span>
                          )}
                        </td>
                        <td className="p-2 text-white">{row.collaborator_name} {isMe && <Badge className="ml-1 bg-emerald-600 text-white" style={{ backgroundColor: '#059669' }}>Você</Badge>}</td>
                        <td className="p-2 text-slate-300">{row.company_name}</td>
                        <td className="p-2 text-right font-semibold text-emerald-400">{row.total_points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Paginação */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-3 py-1 rounded bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-600"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: '#475569' }}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Anterior</button>
              <span className="text-slate-300">Página {page} de {Math.ceil(total / PAGE_SIZE) || 1}</span>
              <button
                className="px-3 py-1 rounded bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-600"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: '#475569' }}
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
