import { HexColorPicker } from 'react-colorful';

export const AnyColorPicker = HexColorPicker as unknown as React.FC<{
	color: string;
	onChange: (color: string) => void;
}>;