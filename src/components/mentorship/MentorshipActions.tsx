
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateMentorshipDialog } from "./CreateMentorshipDialog";

export const MentorshipActions = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setShowCreateDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Solicitar Mentoria
      </Button>

      <CreateMentorshipDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};
