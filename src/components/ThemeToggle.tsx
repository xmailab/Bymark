import { Circle, Moon, Sun } from "lucide-vue-next";
import { defineComponent } from "vue";
import { nextTheme, themeLabel, type Theme } from "../default-settings";

/** Cycles the three workspace themes while keeping the source of truth in the parent. */
export const ThemeToggle = defineComponent((props: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) => {
  return () => {
    const next = nextTheme(props.theme);
    const Icon = props.theme === "dark" ? Moon : props.theme === "white" ? Circle : Sun;
    const actionLabel = `当前：${themeLabel(props.theme)}；切换到${themeLabel(next)}模式`;
    return (
      <button
        type="button"
        class={["quick-theme", `quick-theme-${props.theme}`]}
        aria-label={actionLabel}
        title={actionLabel}
        onClick={() => props.onChange(next)}
      >
        <Icon size={18} aria-hidden="true" />
      </button>
    );
  };
}, { props: ["theme", "onChange"] });
