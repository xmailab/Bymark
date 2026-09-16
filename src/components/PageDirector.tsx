import { Files, PinOff } from "lucide-vue-next";
import { defineComponent } from "vue";
import type { PaginatedPage } from "../pagination";

export const PageDirector = defineComponent((props: {
  pages: PaginatedPage[];
  width: string;
  activePageIndex: number;
  onPageChange: (index: number) => void;
  onRemoveManualBreak: (index: number) => void;
}) => {
  return () => {
    const activePage = props.pages[props.activePageIndex] ?? props.pages[0];
    const manualBreakCount = props.pages.filter((page) => page.manualBreakBefore).length;
    return (
      <section class="page-director" aria-label="连续图文导演台" style={{ width: props.width }}>
        <div class="page-director-bar">
          <div class="page-director-heading">
            <span class="page-director-heading-icon" aria-hidden="true">
              <Files size={12} />
            </span>
            <strong>分页</strong>
            <span>{props.pages.length} 页 · {manualBreakCount ? `${manualBreakCount} 处手动` : "自动"}</span>
          </div>
          <div class="page-director-rail preview-page-track" role="tablist" aria-label="连续页面总览">
            {props.pages.map((page, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={props.activePageIndex === index}
                aria-label={`查看第 ${index + 1} 页${index === 0 ? "，首页" : page.manualBreakBefore ? "，手动起页" : ""}`}
                title={index === 0 ? "首页" : page.manualBreakBefore ? `第 ${index + 1} 页 · 手动起页` : `第 ${index + 1} 页`}
                class={["page-director-card", page.manualBreakBefore && "page-director-card-manual"]}
                onClick={() => props.onPageChange(index)}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          {activePage?.manualBreakBefore && (
            <button
              type="button"
              class="page-break-button"
              aria-label={`移除第 ${props.activePageIndex + 1} 页的分页点`}
              title="只移除分页点，正文会自动续接"
              onClick={() => props.onRemoveManualBreak(props.activePageIndex)}
            >
              <PinOff size={12} aria-hidden="true" /> 移除分页点
            </button>
          )}
        </div>
      </section>
    );
  };
}, {
  props: ["pages", "width", "activePageIndex", "onPageChange", "onRemoveManualBreak"],
});
