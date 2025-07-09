
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Informações da Empresa
        </CardTitle>
        <CardDescription>
          Dados da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={userEmail || ''}
              disabled={!isEditing}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Conta</Label>
            <Input 
              id="role" 
              value="Empresa"
              disabled
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
