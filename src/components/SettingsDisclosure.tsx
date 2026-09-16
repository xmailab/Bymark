import { ChevronDown } from "lucide-vue-next";
import { defineComponent, shallowRef } from "vue";
import { LayoutReveal } from "./LayoutReveal";

export const SettingsDisclosure = defineComponent(
  (props: {
    id: string;
    label: string;
    summary?: string;
    defaultOpen?: boolean;
    class?: string;
  }, { slots }) => {
    const open = shallowRef(Boolean(props.defaultOpen));

    return () => (
      <section class={["settings-disclosure", props.class, open.value && "settings-disclosure-open"]}>
        <div class="settings-disclosure-header">
          <button
            type="button"
            class="settings-disclosure-trigger"
            aria-expanded={open.value}
            aria-controls={props.id}
            onClick={() => (open.value = !open.value)}
          >
            <span>{props.label}</span>
            {props.summary && <small>{props.summary}</small>}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {slots.action?.()}
        </div>
        <LayoutReveal show={open.value}>
          <div id={props.id} class="settings-disclosure-content">
            {slots.default?.()}
          </div>
        </LayoutReveal>
      </section>
    );
  },
  { props: ["id", "label", "summary", "defaultOpen", "class"] },
);
