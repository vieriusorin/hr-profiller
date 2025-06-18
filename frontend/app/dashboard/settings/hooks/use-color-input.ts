import { useTheme } from "@/app/providers/theme-provider";
import { useMemo } from "react";
import { Control, ControllerRenderProps } from "react-hook-form";
import { formatHex, oklch } from "culori";
import { SettingsFormValues } from "../schema";

export const useColorInput = (name: keyof SettingsFormValues, control: Control<SettingsFormValues>) => {
  const { setSettings, settings } = useTheme();

  const handleColorChange = (
    hexColor: string,
    field: ControllerRenderProps<SettingsFormValues, typeof name>
  ) => {
    try {
      const oklchColor = oklch(hexColor);
      if (!oklchColor) return;
      const oklchString = `oklch(${oklchColor.l} ${oklchColor.c} ${oklchColor.h})`;
      field.onChange(oklchString);
      setSettings({ ...settings, [name]: oklchString });
    } catch (e) {
      console.error(`Error converting color for ${name}:`, e);
    }
  };

  const hexColor = useMemo(() => {
    const oklchValue = control._getWatch(name) as string | undefined;
    if (!oklchValue) return "#000000";
    try {
      return formatHex(oklchValue);
    } catch {
      return "#000000";
    }
  }, [control, name]);

  return {
    handleColorChange,
    hexColor,
  }
}