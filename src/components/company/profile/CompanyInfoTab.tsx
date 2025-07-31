
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";

interface CompanyInfoTabProps {
  userEmail?: string;
  isEditing: boolean;
}

export const CompanyInfoTab = ({ userEmail, isEditing }: CompanyInfoTabProps) => {
  return (
    <Card className="!bg-gray-800 !border-gray-700" style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}>
      <CardHeader>
        <CardTitle className="flex items-center !text-white" style={{ color: '#ffffff' }}>
          <Building className="h-5 w-5 mr-2" />
          Informações da Empresa
        </CardTitle>
        <CardDescription className="!text-gray-300" style={{ color: '#d1d5db' }}>
          Dados da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="!text-gray-300" style={{ color: '#d1d5db' }}>Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={userEmail || ''}
              disabled={!isEditing}
              readOnly
              className="!bg-gray-700 !border-gray-600 !text-gray-300"
              style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#d1d5db' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="!text-gray-300" style={{ color: '#d1d5db' }}>Tipo de Conta</Label>
            <Input 
              id="role" 
              value="Empresa"
              disabled
              readOnly
              className="!bg-gray-700 !border-gray-600 !text-gray-300"
              style={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#d1d5db' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
