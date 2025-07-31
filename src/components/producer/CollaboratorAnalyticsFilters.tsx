
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollaboratorAnalyticsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
}

export const CollaboratorAnalyticsFilters = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterStatus,
  setFilterStatus,
}: CollaboratorAnalyticsFiltersProps) => {
  return (
    <Card className="!bg-gray-800 !border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 !text-white">
          <Filter className="h-5 w-5 !text-gray-400" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 !text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 !bg-gray-700 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 !bg-gray-700 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="!bg-gray-800 !border-gray-700">
              <SelectItem value="updated_at" className="!text-white hover:!bg-gray-700">Última atualização</SelectItem>
              <SelectItem value="name" className="!text-white hover:!bg-gray-700">Nome</SelectItem>
              <SelectItem value="lessons_completed" className="!text-white hover:!bg-gray-700">Lições completadas</SelectItem>
              <SelectItem value="total_watch_time_minutes" className="!text-white hover:!bg-gray-700">Tempo de estudo</SelectItem>
              <SelectItem value="last_login_at" className="!text-white hover:!bg-gray-700">Último acesso</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-36 !bg-gray-700 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="!bg-gray-800 !border-gray-700">
              <SelectItem value="all" className="!text-white hover:!bg-gray-700">Todos</SelectItem>
              <SelectItem value="active" className="!text-white hover:!bg-gray-700">Ativos</SelectItem>
              <SelectItem value="inactive" className="!text-white hover:!bg-gray-700">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
