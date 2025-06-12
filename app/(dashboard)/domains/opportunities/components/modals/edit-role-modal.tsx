'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role, EditRoleForm } from '@/shared/types';
import { useOpportunitiesQuery } from '../../hooks/use-opportunities-query';
import { createRoleSchema } from '../forms/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GRADE_OPTIONS } from '@/app/shared/lib/constants/grades';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  role: Role;
}

export const EditRoleModal = ({ isOpen, onClose, opportunityId, role }: EditRoleModalProps) => {
  const { updateRole } = useOpportunitiesQuery();
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm<EditRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: role.roleName,
      requiredGrade: role.requiredGrade,
      allocation: role.allocation,
      comments: role.comments
    }
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        roleName: role.roleName,
        requiredGrade: role.requiredGrade,
        allocation: role.allocation,
        comments: role.comments
      });
      setIsDirty(false);
    }
  }, [isOpen, role, form]);

  const onSubmit = async (data: EditRoleForm) => {
    try {
      await updateRole(opportunityId, role.id, data);
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleFormChange = () => {
    const currentValues = form.getValues();
    const isFormDirty =
      currentValues.roleName !== role.roleName ||
      currentValues.requiredGrade !== role.requiredGrade ||
      currentValues.allocation !== role.allocation ||
      currentValues.comments !== role.comments;

    setIsDirty(isFormDirty);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={handleFormChange} className='space-y-4'>
            <FormField
              control={form.control}
              name='roleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='requiredGrade'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Grade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select grade' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADE_OPTIONS.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='allocation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      max={100}
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='comments'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={!isDirty}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 