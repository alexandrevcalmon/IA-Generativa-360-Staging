
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

export const SettingsTab = () => {
  return (
    <Card className="!bg-gray-800 !border-gray-700" style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}>
      <CardHeader>
        <CardTitle className="flex items-center !text-white" style={{ color: '#ffffff' }}>
          <Settings className="h-5 w-5 mr-2" />
          Configurações
        </CardTitle>
        <CardDescription className="!text-gray-300" style={{ color: '#d1d5db' }}>
          Configure as preferências da empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium !text-white" style={{ color: '#ffffff' }}>Notificações por email</p>
            <p className="text-sm !text-gray-300" style={{ color: '#d1d5db' }}>Receber atualizações sobre colaboradores</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium !text-white" style={{ color: '#ffffff' }}>Relatórios mensais</p>
            <p className="text-sm !text-gray-300" style={{ color: '#d1d5db' }}>Relatórios de progresso dos colaboradores</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
};
