"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/app/providers/theme-provider";
import { useUpdateSettingsMutation } from "./use-settings";
import { settingsSchema, SettingsFormValues } from "../schema";

type TabType = 'general' | 'theme' | 'gantt' | 'roles';

export const useSettingsPage = () => {
  const { settings, isLoading } = useTheme();
  const mutation = useUpdateSettingsMutation();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isPending, setIsPending] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    setIsPending(true);
    let newLogoUrl = values.logoUrl;

    if (logoFile) {
      const formData = new FormData();
      formData.append("file", logoFile);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          newLogoUrl = result.url;
        } else {
          console.error("Logo upload failed:", result.message);
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }

    mutation.mutate({
      ...values,
      logoUrl: newLogoUrl,
    });
    setIsPending(false);
  };

  return {
    form,
    isLoading,
    logoPreview,
    activeTab,
    setActiveTab,
    handleLogoChange,
    onSubmit,
    isPending,
  };
}; 