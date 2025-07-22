
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProducerCompaniesSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ProducerCompaniesSearch({ searchTerm, onSearchChange }: ProducerCompaniesSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Buscar empresas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
      />
    </div>
  );
}
