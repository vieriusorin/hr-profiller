import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Trash, Edit2, Shield, Briefcase, Check, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ROLE_DISPLAY_INFO, Permission, ROLE_PERMISSIONS, UserRole } from '@/lib/rbac';
import { Grade } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

type OpportunityRole = {
  id: string;
  name: string;
  requiredGrade: Grade;
  allocation: number;
  needsHire: boolean;
  comments?: string;
};

type EditingRole = {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: Permission[];
};

const RolesSettings = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'opportunity'>('system');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [opportunityRoles, setOpportunityRoles] = useState<OpportunityRole[]>([]);
  const [editingRole, setEditingRole] = useState<EditingRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState(Object.entries(ROLE_DISPLAY_INFO).map(([key, info]) => ({
    id: key,
    name: info.name,
    description: info.description,
    color: info.color,
    permissions: ROLE_PERMISSIONS[key as UserRole]
  })));
  const [allocation, setAllocation] = useState<number>(100);
  const [allocationError, setAllocationError] = useState<string | null>(null);

  const allPermissions = Array.from(
    new Set(Object.values(ROLE_PERMISSIONS).flat())
  ).sort();

  useEffect(() => {
    if (allocation > 100) {
      setAllocationError('Allocation cannot exceed 100%');
    } else if (allocation < 0) {
      setAllocationError('Allocation cannot be negative');
    } else {
      setAllocationError(null);
    }
  }, [allocation]);

  const handleAddOpportunityRole = () => {
    if (newRoleName.trim()) {
      const newRole: OpportunityRole = {
        id: crypto.randomUUID(),
        name: newRoleName.trim(),
        requiredGrade: 'SE',
        allocation: 100,
        needsHire: false,
      };
      setOpportunityRoles([...opportunityRoles, newRole]);
      setNewRoleName('');
      setIsAddingRole(false);
    }
  };

  const handleDeleteOpportunityRole = (roleId: string) => {
    setOpportunityRoles(opportunityRoles.filter(role => role.id !== roleId));
  };

  const handleEditRole = (role: typeof roles[0]) => {
    setEditingRole({
      id: role.id,
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: role.permissions,
    });
  };

  const handlePermissionToggle = (permission: Permission) => {
    if (!editingRole) return;

    setEditingRole(prev => {
      if (!prev) return prev;

      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/system-roles/${editingRole.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRole),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const updatedRole = await response.json();
      
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === editingRole.id 
            ? {
                ...role,
                name: updatedRole.name,
                description: updatedRole.description,
                color: updatedRole.color,
                permissions: updatedRole.permissions.map((p: { name: string }) => p.name)
              }
            : role
        )
      );

      toast.success('Role updated successfully');
      setEditingRole(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocationChange = (value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setAllocation(numValue);
  };

  const isSubmitDisabled = isLoading || !!allocationError || allocation > 100 || allocation < 0;

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'system' | 'opportunity')}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='system' className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            System Roles
          </TabsTrigger>
          <TabsTrigger value='opportunity' className='flex items-center gap-2'>
            <Briefcase className='w-4 h-4' />
            Opportunity Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value='system' className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-xl font-semibold'>System Roles</h2>
              <p className='text-sm text-muted-foreground'>
                Manage user access levels and permissions across the application
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      {role.name}
                      <Badge variant='outline' style={{ backgroundColor: `var(--${role.color}-500)`, color: 'white' }}>
                        {role.id}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant='secondary'>
                          {permission.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant='secondary'>+{role.permissions.length - 3} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit2 className='w-4 h-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value='opportunity' className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-xl font-semibold'>Opportunity Roles</h2>
              <p className='text-sm text-muted-foreground'>
                Define roles that can be assigned to projects and opportunities
              </p>
            </div>
            <Button
              onClick={() => setIsAddingRole(true)}
              className='flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Add Role
            </Button>
          </div>

          {isAddingRole && (
            <div className='flex items-center gap-2'>
              <Input
                placeholder='Enter role name'
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <Button onClick={handleAddOpportunityRole}>Save</Button>
              <Button
                variant='ghost'
                onClick={() => {
                  setIsAddingRole(false);
                  setNewRoleName('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Required Grade</TableHead>
                <TableHead>Default Allocation</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunityRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.requiredGrade}</TableCell>
                  <TableCell>{role.allocation}%</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button variant='ghost' size='icon'>
                        <Edit2 className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDeleteOpportunityRole(role.id)}
                      >
                        <Trash className='w-4 h-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Role Permissions</DialogTitle>
            <DialogDescription>
              Select the permissions for this role. Changes will affect all users with this role.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex flex-col gap-2'>
              <h4 className='font-medium'>Role Information</h4>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>{editingRole?.name}</span>
                <Badge variant='outline' style={{ backgroundColor: `var(--${editingRole?.color}-500)`, color: 'white' }}>
                  {editingRole?.id}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>{editingRole?.description}</p>
            </div>

            <div className='space-y-2'>
              <h4 className='font-medium'>Allocation (%)</h4>
              <div className='flex flex-col gap-2'>
                <Input
                  type='number'
                  value={allocation}
                  onChange={(e) => handleAllocationChange(e.target.value)}
                  min={0}
                  max={100}
                  className={allocationError ? 'border-red-500' : ''}
                />
                {allocationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{allocationError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <h4 className='font-medium'>Permissions</h4>
              <ScrollArea className='h-[300px] rounded-md border p-4'>
                <div className='space-y-4'>
                  {allPermissions.map((permission) => (
                    <div key={permission} className='flex items-center space-x-2'>
                      <Checkbox
                        id={permission}
                        checked={editingRole?.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionToggle(permission)}
                      />
                      <label
                        htmlFor={permission}
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        {permission.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRole} 
                disabled={isSubmitDisabled}
                className={isSubmitDisabled ? 'cursor-not-allowed opacity-50' : ''}
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className='w-4 h-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesSettings; 