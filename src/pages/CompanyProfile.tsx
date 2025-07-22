import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { ProfileHeader } from "@/components/company/profile/ProfileHeader";
import { CompanyInfoTab } from "@/components/company/profile/CompanyInfoTab";
import { CollaboratorsTab } from "@/components/company/profile/CollaboratorsTab";
import { SettingsTab } from "@/components/company/profile/SettingsTab";

const CompanyProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Header content com botão de editar/salvar
  const headerContent = (
    <Button 
      onClick={() => setIsEditing(!isEditing)}
      variant={isEditing ? "default" : "outline"}
    >
      {isEditing ? (
        <>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </>
      ) : (
        <>
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </>
      )}
    </Button>
  );

  return (
    <PageLayout
      title="Perfil da Empresa"
      subtitle="Gerencie as informações da sua empresa"
      headerContent={headerContent}
    >
      <div className="space-y-6">
        {/* Profile Overview */}
        <PageSection>
          <ProfileHeader
            userEmail={user?.email}
            userCreatedAt={user?.created_at}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />
        </PageSection>

        {/* Profile Tabs */}
        <PageSection transparent>
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
        </PageSection>
      </div>
    </PageLayout>
  );
};

export default CompanyProfile;