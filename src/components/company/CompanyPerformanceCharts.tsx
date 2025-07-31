
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

interface CompanyPerformanceChartsProps {
  collaborators: CollaboratorStats[];
}

export const CompanyPerformanceCharts = ({ collaborators }: CompanyPerformanceChartsProps) => {
  // Dados para gráfico de barras - Top performers
  const topPerformers = collaborators
    .sort((a, b) => b.lessons_completed - a.lessons_completed)
    .slice(0, 10)
    .map(c => ({
      name: c.collaborator.name.split(' ')[0],
      lessons: c.lessons_completed,
      watchTime: Math.round(c.total_watch_time_minutes / 60)
    }));

  // Dados para gráfico de pizza - Status dos colaboradores
  const statusData = [
    {
      name: "Ativos",
      value: collaborators.filter(c => c.collaborator.is_active).length,
      color: "#22c55e"
    },
    {
      name: "Inativos", 
      value: collaborators.filter(c => !c.collaborator.is_active).length,
      color: "#ef4444"
    }
  ];

  // Dados para gráfico de linha - Progresso por nível
  const levelData = Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const count = collaborators.filter(c => c.current_level === level).length;
    return {
      level: `Nível ${level}`,
      collaborators: count
    };
  }).filter(d => d.collaborators > 0);

  const chartConfig = {
    lessons: {
      label: "Lições",
      color: "#3b82f6",
    },
    watchTime: {
      label: "Horas",
      color: "#10b981",
    },
    collaborators: {
      label: "Colaboradores",
      color: "#8b5cf6",
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 Performers - Lições Completadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="lessons" fill="var(--color-lessons)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={levelData}>
                <XAxis dataKey="level" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="collaborators" 
                  stroke="var(--color-collaborators)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
