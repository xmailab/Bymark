export function Toggle(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      onClick={() => props.onChange(!props.checked)}
      class={["toggle", props.checked && "toggle-on"]}
    >
      <span class="toggle-knob" />
    </button>
  );
}
