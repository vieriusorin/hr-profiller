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
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
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
  };

  return {
    form,
    isLoading,
    logoPreview,
    activeTab,
    setActiveTab,
    handleLogoChange,
    onSubmit,
    isPending: mutation.isPending,
  };
}; 