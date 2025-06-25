import { HexColorPicker } from 'react-colorful';

export const AnyColorPicker = HexColorPicker as unknown as React.FC<{
	color: string;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChange: (color: string) => void;
}>;