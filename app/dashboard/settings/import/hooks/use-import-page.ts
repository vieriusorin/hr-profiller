"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async ({
      file,
      dataType,
    }: {
      file: File;
      dataType: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dataType", dataType);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setFile(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !dataType) {
      toast.error("Please select a file and a data type.");
      return;
    }
    mutation.mutate({ file, dataType });
  };

  return {
    file,
    dataType,
    setDataType,
    handleFileChange,
    handleSubmit,
    isPending: mutation.isPending,
  };
}; 