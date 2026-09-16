import { Check, LogIn, Square } from "lucide-vue-next";
import { computed, defineComponent } from "vue";

export type ExportButtonStatus = "idle" | "preparing" | "exporting" | "complete";

/** Renders the export command's idle, real-time progress, and completion states. */
export const ExportButton = defineComponent((props: {
  status: ExportButtonStatus;
  progress: number;
  pageCount: number;
  disabled: boolean;
  onExport: () => void;
}) => {
  const clampedProgress = computed(() => Math.min(100, Math.max(0, Math.round(props.progress))));
  const isPreparing = computed(() => props.status === "preparing");
  const isExporting = computed(() => props.status === "exporting");
  const isComplete = computed(() => props.status === "complete");
  const label = computed(() => {
    if (isPreparing.value) return "准备导出…";
    if (isExporting.value) return `正在导出 ${clampedProgress.value}%`;
    if (isComplete.value) return "已完成";
    return props.pageCount > 1 ? `导出 ${props.pageCount} 页` : "导出";
  });

  return () => (
    <button
      type="button"
      class={[
        "export-button",
        `export-button--${props.status}`,
      ]}
      style={{ "--export-progress": String(clampedProgress.value / 100) } as Record<string, string>}
      aria-label={label.value}
      aria-live={isPreparing.value || isExporting.value ? "polite" : undefined}
      aria-busy={isPreparing.value || isExporting.value}
      onClick={props.onExport}
      disabled={props.disabled || isPreparing.value || isComplete.value}
    >
      <span class="export-button-circle" aria-hidden="true">
        <span class="export-button-progress-fill" />
        <LogIn class="export-button-download-icon" size={18} strokeWidth={2.35} />
        <Square class="export-button-stop-icon" size={13} fill="currentColor" strokeWidth={0} />
        <Check class="export-button-complete-icon" size={18} strokeWidth={2.5} />
      </span>
      <span class="export-button-label">{label.value}</span>
    </button>
  );
}, {
  props: ["status", "progress", "pageCount", "disabled", "onExport"],
});
