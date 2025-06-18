'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/app/providers/theme-provider';
import { SettingsData } from '../types';

const updateSettingsApi = async (settings: SettingsData) => {
  const response = await fetch('/api/whitelabel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  return response.json();
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  const { setSettings } = useTheme();

  return useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: (data) => {
      toast.success("Settings saved successfully!");
      if (data.settings) {
        setSettings(data.settings);
      }
      queryClient.invalidateQueries({ queryKey: ["whitelabel-settings"] });
    },
    onError: (error) => {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    },
  });
}; 