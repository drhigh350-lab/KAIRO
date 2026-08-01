export interface CheckboxProps {
  checked: boolean;
  onChange?: () => void;
  label?: string;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
