import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RoleStatusConfirmationDialogProps } from './types';
import { statusConfig } from './utils';

export const RoleStatusConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  status,
  roleName
}: RoleStatusConfirmationDialogProps) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconComponent className={`h-5 w-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
            {roleName && (
              <div className='mt-2 font-medium text-foreground'>
                Role: {roleName}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={config.buttonColor}
            onClick={handleConfirm}
          >
            Confirm {status}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 