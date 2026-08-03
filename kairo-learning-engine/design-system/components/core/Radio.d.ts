export interface RadioProps {
  checked: boolean;
  onChange?: () => void;
  label?: string;
}
export function Radio(props: RadioProps): JSX.Element;
