import { Check, X } from "lucide-vue-next";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import type { Theme } from "../default-settings";

type Timestamp = {
  date: string;
  time: string;
};

type TimestampChoice = "configured" | "current";

function formatTimestamp(timestamp: Timestamp) {
  const [year, month, day] = timestamp.date.split("-");
  if (!year || !month || !day) return `${timestamp.date} · ${timestamp.time}`;
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日 · ${timestamp.time}`;
}

/** A focused confirmation surface for choosing the timestamp used by one image export. */
export const ExportTimeDialog = defineComponent((props: {
  theme: Theme;
  configuredTimestamp: Timestamp;
  currentTimestamp: Timestamp;
  onCancel: () => void;
  onConfirm: (useCurrentTime: boolean) => void;
}) => {
  const choice = shallowRef<TimestampChoice>("configured");
  const confirmButton = ref<HTMLButtonElement | null>(null);
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") props.onCancel();
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
    document.documentElement.classList.add("export-time-dialog-open");
    void nextTick(() => confirmButton.value?.focus());
  });
  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeydown);
    document.documentElement.classList.remove("export-time-dialog-open");
  });

  return () => {
    const usingCurrentTime = choice.value === "current";
    return (
      <div class={["export-time-dialog", `ui-${props.theme}`]} role="dialog" aria-modal="true" aria-labelledby="export-time-dialog-title">
        <button type="button" class="export-time-dialog-backdrop" aria-label="取消导出" onClick={props.onCancel} />
        <section class="export-time-dialog-panel">
          <header class="export-time-dialog-header">
            <h2 id="export-time-dialog-title">选择导出时间</h2>
            <button type="button" class="export-time-dialog-close" onClick={props.onCancel} aria-label="取消导出" title="取消"><X size={18} /></button>
          </header>

          <div class="export-time-dialog-body">
            <div class="export-time-dialog-options" role="radiogroup" aria-label="导出时间">
              <button
                type="button"
                class={["export-time-choice", choice.value === "configured" && "is-selected"]}
                role="radio"
                aria-checked={choice.value === "configured"}
                onClick={() => (choice.value = "configured")}
              >
                <span class="export-time-choice-mark" aria-hidden="true">{choice.value === "configured" ? <Check size={14} /> : null}</span>
                <span class="export-time-choice-copy">
                  <strong>已设置时间</strong>
                  <span>{formatTimestamp(props.configuredTimestamp)}</span>
                </span>
              </button>
              <button
                type="button"
                class={["export-time-choice", choice.value === "current" && "is-selected"]}
                role="radio"
                aria-checked={choice.value === "current"}
                onClick={() => (choice.value = "current")}
              >
                <span class="export-time-choice-mark" aria-hidden="true">{choice.value === "current" ? <Check size={14} /> : null}</span>
                <span class="export-time-choice-copy">
                  <strong>当前时间</strong>
                  <span>{formatTimestamp(props.currentTimestamp)}</span>
                </span>
              </button>
            </div>
          </div>

          <footer class="export-time-dialog-actions">
            <button ref={confirmButton} type="button" class="export-time-dialog-confirm" onClick={() => props.onConfirm(usingCurrentTime)}>
              导出图片
            </button>
          </footer>
        </section>
      </div>
    );
  };
}, { props: ["theme", "configuredTimestamp", "currentTimestamp", "onCancel", "onConfirm"] });
