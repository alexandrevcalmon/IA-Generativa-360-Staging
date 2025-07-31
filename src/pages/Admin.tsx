
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";

const Admin = () => {
  return (
    <PageLayout
      title="Admin Dashboard"
      subtitle="Gerencie usuários, configurações e analytics do sistema"
      background="gradient"
      maxWidth="2xl"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage all users in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configure system-wide settings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">View system analytics and reports</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Admin;
