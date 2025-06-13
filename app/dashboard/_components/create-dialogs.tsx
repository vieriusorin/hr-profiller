import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateOpportunityForm } from '@/components/opportunities/components/forms/create-opportunity-form';
import { RoleForm } from '@/components/opportunities/components/forms/create-role-form';
import { CreateDialogsProps } from '../_types';

export const CreateDialogs = ({
  showNewOpportunityDialog,
  showNewRoleDialog,
  handleCreateOpportunity,
  handleCreateRole,
  closeNewOpportunityDialog,
  closeNewRoleDialogAndReset,
  children
}: CreateDialogsProps) => {
  return (
    <>
      <Dialog open={showNewOpportunityDialog} onOpenChange={(open: boolean) => open ? null : closeNewOpportunityDialog()}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
            <DialogDescription>
              Add a new client opportunity to the pipeline
            </DialogDescription>
          </DialogHeader>
          <CreateOpportunityForm
            onSubmit={handleCreateOpportunity}
            onCancel={closeNewOpportunityDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showNewRoleDialog} onOpenChange={closeNewRoleDialogAndReset}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Add a role to the selected opportunity
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            mode='create'
            onSubmit={handleCreateRole}
            onCancel={closeNewRoleDialogAndReset}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}; 