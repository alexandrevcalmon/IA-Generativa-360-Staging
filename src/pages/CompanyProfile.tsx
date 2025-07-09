
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { ProfileHeader } from "@/components/company/profile/ProfileHeader";
import { CompanyInfoTab } from "@/components/company/profile/CompanyInfoTab";
import { CollaboratorsTab } from "@/components/company/profile/CollaboratorsTab";
import { SettingsTab } from "@/components/company/profile/SettingsTab";

const CompanyProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
            <p className="text-gray-600">Gerencie as informações da sua empresa</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardContent className="p-6">
              <ProfileHeader
                userEmail={user?.email}
                userCreatedAt={user?.created_at}
                isEditing={isEditing}
                onToggleEdit={() => setIsEditing(!isEditing)}
              />
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="collaborators">Colaboradores</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <CompanyInfoTab userEmail={user?.email} isEditing={isEditing} />
            </TabsContent>

            <TabsContent value="collaborators" className="space-y-6">
              <CollaboratorsTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
