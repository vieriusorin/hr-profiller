"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/app/providers/theme-provider";
import { useUpdateSettingsMutation } from "./use-settings";
import { settingsSchema, SettingsFormValues } from "../schema";

export const useSettingsPage = () => {
  const { settings, isLoading } = useTheme();
  const mutation = useUpdateSettingsMutation();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const defaultFormValues: SettingsFormValues = {
    primaryColor: "oklch(0.88 0.18 95.1)",
    logoUrl: "",
    logoWidth: 100,
    logoHeight: 40,
    logoAlt: "Company Logo",
    background: "oklch(0.9911 0 0)",
    foreground: "oklch(0.2046 0 0)",
    card: "oklch(0.9911 0 0)",
    cardForeground: "oklch(0.2046 0 0)",
    secondary: "oklch(0.9940 0 0)",
    accent: "oklch(0.9461 0 0)",
    destructive: "oklch(0.5523 0.1927 32.7272)",
    border: "oklch(0.9037 0 0)",
    input: "oklch(0.9731 0 0)",
    radius: "0.5rem",
    primaryForeground: "oklch(0.2626 0.0147 166.4589)",
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: settings ? { ...defaultFormValues, ...settings } : defaultFormValues,
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  // Cleanup blob URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Revoke previous blob URL
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    let newLogoUrl = values.logoUrl;

    if (logoFile) {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", logoFile);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          newLogoUrl = result.url;
        } else {
          throw new Error(result.message || "Logo upload failed");
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        setIsUploadingLogo(false);
        // You might want to show a toast notification or set an error state here
        return; // Don't proceed with form submission if upload fails
      } finally {
        setIsUploadingLogo(false);
      }
    }

    mutation.mutate({
      ...values,
      logoUrl: newLogoUrl,
    });
  };

  return {
    form,
    isLoading,
    logoPreview,
    activeTab,
    setActiveTab,
    handleLogoChange,
    onSubmit,
    isPending: mutation.isPending || isUploadingLogo,
    isUploadingLogo,
  };
};