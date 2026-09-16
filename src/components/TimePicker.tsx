import { Check, Clock3 } from "lucide-vue-next";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
} from "vue";

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

function normalizeTime(value: string) {
  const [rawHour = "00", rawMinute = "00"] = value.split(":");
  const hour = Math.min(23, Math.max(0, Number(rawHour) || 0));
  const minute = Math.min(59, Math.max(0, Number(rawMinute) || 0));
  return {
    hour: String(hour).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
  };
}

export const TimePicker = defineComponent((props: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const open = shallowRef(false);
  const rootRef = ref<HTMLDivElement | null>(null);
  const triggerRef = ref<HTMLButtonElement | null>(null);
  const hourListRef = ref<HTMLDivElement | null>(null);
  const minuteListRef = ref<HTMLDivElement | null>(null);
  const normalized = computed(() => normalizeTime(props.value));

  const scrollSelectedIntoView = () => {
    for (const list of [hourListRef.value, minuteListRef.value]) {
      list?.querySelector<HTMLElement>("[aria-selected='true']")?.scrollIntoView({ block: "center" });
    }
  };

  const setOpen = (nextOpen: boolean, restoreFocus = false) => {
    open.value = nextOpen;
    if (nextOpen) nextTick(scrollSelectedIntoView);
    else if (restoreFocus) nextTick(() => triggerRef.value?.focus());
  };

  const updatePart = (part: "hour" | "minute", value: string) => {
    const next = { ...normalized.value, [part]: value };
    props.onChange(`${next.hour}:${next.minute}`);
  };

  const focusOption = (part: "hour" | "minute", value: string) => {
    const list = part === "hour" ? hourListRef.value : minuteListRef.value;
    nextTick(() => list?.querySelector<HTMLElement>(`[data-value='${value}']`)?.focus());
  };

  const moveOption = (part: "hour" | "minute", current: string, direction: number) => {
    const values = part === "hour" ? HOURS : MINUTES;
    const nextIndex = (values.indexOf(current) + direction + values.length) % values.length;
    const nextValue = values[nextIndex];
    updatePart(part, nextValue);
    focusOption(part, nextValue);
  };

  const handleOptionKeydown = (
    event: KeyboardEvent,
    part: "hour" | "minute",
    value: string,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveOption(part, value, 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveOption(part, value, -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const values = part === "hour" ? HOURS : MINUTES;
      const nextValue = event.key === "Home" ? values[0] : values.at(-1)!;
      updatePart(part, nextValue);
      focusOption(part, nextValue);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
    }
  };

  const handleDocumentPointerDown = (event: PointerEvent) => {
    if (!rootRef.value?.contains(event.target as Node)) setOpen(false);
  };

  onMounted(() => document.addEventListener("pointerdown", handleDocumentPointerDown));
  onBeforeUnmount(() => document.removeEventListener("pointerdown", handleDocumentPointerDown));

  const renderOptions = (part: "hour" | "minute", values: string[]) => {
    const selected = part === "hour" ? normalized.value.hour : normalized.value.minute;
    return values.map((value) => (
      <button
        type="button"
        role="option"
        aria-selected={value === selected}
        aria-label={`${Number(value)} ${part === "hour" ? "时" : "分"}`}
        data-value={value}
        tabindex={value === selected ? 0 : -1}
        class={value === selected ? "is-selected" : ""}
        onClick={() => updatePart(part, value)}
        onKeydown={(event) => handleOptionKeydown(event, part, value)}
      >
        <span>{value}</span>
        {value === selected && <Check size={13} aria-hidden="true" />}
      </button>
    ));
  };

  return () => (
    <div ref={rootRef} class="time-picker">
      <button
        ref={triggerRef}
        id="bymark-time"
        type="button"
        class="control time-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={open.value}
        aria-controls="bymark-time-picker-panel"
        onClick={() => setOpen(!open.value)}
      >
        <span class="time-picker-value">{normalized.value.hour}:{normalized.value.minute}</span>
        <Clock3 size={15} aria-hidden="true" />
      </button>
      {open.value && (
        <div
          id="bymark-time-picker-panel"
          class="time-picker-panel"
          role="dialog"
          aria-label="选择时间"
        >
          <div class="time-picker-column-labels" aria-hidden="true">
            <span>小时</span>
            <span>分钟</span>
          </div>
          <div class="time-picker-columns">
            <div ref={hourListRef} class="time-picker-list" role="listbox" aria-label="小时">
              {renderOptions("hour", HOURS)}
            </div>
            <span class="time-picker-separator" aria-hidden="true">:</span>
            <div ref={minuteListRef} class="time-picker-list" role="listbox" aria-label="分钟">
              {renderOptions("minute", MINUTES)}
            </div>
          </div>
          <button type="button" class="time-picker-done" onClick={() => setOpen(false, true)}>完成</button>
        </div>
      )}
    </div>
  );
}, { props: ["value", "onChange"] });
