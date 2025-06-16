import { HexColorPicker } from "react-colorful";

// This is a workaround for a type issue with the color picker library
export const AnyColorPicker = HexColorPicker as unknown as React.FC<{
	color: string;
	onChange: (color: string) => void;
}>;