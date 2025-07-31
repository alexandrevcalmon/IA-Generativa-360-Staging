
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Eye, 
  Clock, 
  BookOpen, 
  Trophy, 
  TrendingUp,
  Filter
} from "lucide-react";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

interface CompanyCollaboratorsListProps {
  collaborators: CollaboratorStats[];
  onViewDetails?: (collaboratorId: string) => void;
}

export const CompanyCollaboratorsList = ({ 
  collaborators, 
  onViewDetails 
}: CompanyCollaboratorsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filteredCollaborators = collaborators
    .filter(c => 
      c.collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.collaborator.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.collaborator.name.localeCompare(b.collaborator.name);
        case "lessons":
          return b.lessons_completed - a.lessons_completed;
        case "time":
          return b.total_watch_time_minutes - a.total_watch_time_minutes;
        case "level":
          return b.current_level - a.current_level;
        default:
          return 0;
      }
    });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getProgressColor = (level: number) => {
    if (level >= 8) return "bg-purple-500";
    if (level >= 6) return "bg-blue-500";
    if (level >= 4) return "bg-green-500";
    if (level >= 2) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle>Lista de Colaboradores ({filteredCollaborators.length})</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="lessons">Ordenar por Lições</option>
              <option value="time">Ordenar por Tempo</option>
              <option value="level">Ordenar por Nível</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredCollaborators.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Colaborador Info */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(stat.collaborator.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {stat.collaborator.name}
                    </h3>
                    <Badge 
                      variant={stat.collaborator.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {stat.collaborator.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {stat.collaborator.email}
                  </p>
                  
                  {stat.collaborator.position && (
                    <p className="text-xs text-gray-400 truncate">
                      {stat.collaborator.position}
                    </p>
                  )}
                </div>
              </div>

              {/* Métricas */}
              <div className="hidden lg:flex items-center space-x-8 text-sm">
                <div className="text-center">
                  <div className="flex items-center text-blue-600 mb-1">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span className="font-medium">{stat.lessons_completed}</span>
                  </div>
                  <span className="text-xs text-gray-500">Lições</span>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center text-green-600 mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-medium">{formatTime(stat.total_watch_time_minutes)}</span>
                  </div>
                  <span className="text-xs text-gray-500">Tempo</span>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center text-purple-600 mb-1">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="font-medium">Nível {stat.current_level}</span>
                  </div>
                  <span className="text-xs text-gray-500">{stat.total_points} pts</span>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center text-orange-600 mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{stat.courses_enrolled}</span>
                  </div>
                  <span className="text-xs text-gray-500">Cursos</span>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center space-x-4 ml-4">
                <div className="hidden md:block w-24">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progresso</span>
                    <span>{Math.round((stat.lessons_completed / Math.max(stat.lessons_started || 1, 1)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(stat.lessons_completed / Math.max(stat.lessons_started || 1, 1)) * 100} 
                    className="h-2"
                  />
                </div>
                
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(stat.collaborator_id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {filteredCollaborators.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Nenhum colaborador encontrado</p>
              <p>Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
