import { BookmarkPlus, Check, Import, Trash2, X } from "lucide-vue-next";
import { TransitionGroup, defineComponent, ref } from "vue";
import type { BrandTemplate } from "../brandTemplates";
import { themeLabel } from "../default-settings";

export const BrandTemplateLibrary = defineComponent((props: {
  templates: BrandTemplate[];
  loading: boolean;
  busy: boolean;
  onSave: (title: string) => void;
  onUse: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const expanded = ref(false);
  const naming = ref(false);
  const nameDraft = ref("");
  const visibleTemplates = () => expanded.value ? props.templates : props.templates.slice(0, 2);
  const startNaming = () => {
    nameDraft.value = "";
    naming.value = true;
  };
  const cancelNaming = () => {
    nameDraft.value = "";
    naming.value = false;
  };
  const submitNaming = () => {
    const title = nameDraft.value.trim();
    if (!title || props.loading || props.busy) return;
    props.onSave(title);
    cancelNaming();
  };

  return () => (
    <section class="brand-template-library" aria-label="设置预设">
      <div class="brand-template-header">
        <div>
          <h3>预设</h3>
        </div>
        {naming.value ? (
          <div class="preset-name-form">
            <input
              class="preset-name-input"
              aria-label="预设名称"
              placeholder="输入预设名称"
              maxlength={32}
              value={nameDraft.value}
              autofocus
              onInput={(event) => (nameDraft.value = (event.target as HTMLInputElement).value)}
              onKeydown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitNaming();
                }
                if (event.key === "Escape") cancelNaming();
              }}
            />
            <button type="button" class="preset-name-confirm" aria-label="保存预设" title="保存预设" disabled={!nameDraft.value.trim() || props.loading || props.busy} onClick={submitNaming}>
              <Check size={14} />
            </button>
            <button type="button" class="preset-name-cancel" aria-label="取消保存预设" title="取消" onClick={cancelNaming}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            class="brand-save-button icon-tooltip"
            aria-label="保存为预设：保存作者信息、画幅、排版、背景与社交卡设置"
            data-tooltip="保存作者信息、画幅、排版、背景与社交卡设置，方便用于其他作品。"
            disabled={props.loading || props.busy}
            onClick={startNaming}
          >
            <BookmarkPlus size={14} /> 保存为预设
          </button>
        )}
      </div>
      {props.loading ? (
        <p class="brand-template-empty">正在读取本地模板…</p>
      ) : props.templates.length === 0 ? (
        <p class="brand-template-empty">还没有预设。</p>
      ) : (
        <div class="brand-template-list">
          <TransitionGroup name="motion-list">
            {visibleTemplates().map((template) => (
            <article class="brand-template-row" key={template.id}>
              <div class="brand-template-avatar">
                {template.avatar ? <img src={template.avatar} alt="" /> : <span>{Array.from(template.profile.name.trim())[0] || "留"}</span>}
              </div>
              <div class="brand-template-copy">
                <strong>{template.title}</strong>
                <span>{template.profile.exportMode === "douyin-cover" ? "抖音兼容" : template.profile.ratio} · {themeLabel(template.profile.theme)} · 字号 {template.profile.fontScale}% · 行高 {template.profile.lineHeightScale}%</span>
              </div>
              <div class="brand-template-actions">
                <button
                  type="button"
                  class="brand-template-apply icon-tooltip"
                  aria-label={`应用设置预设：${template.title}`}
                  data-tooltip="应用这组设置到当前作品"
                  title="应用预设"
                  disabled={props.busy}
                  onClick={() => props.onUse(template.id)}
                >
                  <Import size={14} />
                </button>
                <button type="button" class="brand-template-delete" aria-label={`删除设置预设：${template.title}`} title="删除预设" disabled={props.busy} onClick={() => props.onDelete(template.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
            ))}
            {props.templates.length > 2 && (
              <button key="template-list-toggle" type="button" class="brand-template-more" onClick={() => (expanded.value = !expanded.value)}>
                {expanded.value ? "收起预设" : `查看另外 ${props.templates.length - 2} 个预设`}
              </button>
            )}
          </TransitionGroup>
        </div>
      )}
    </section>
  );
}, {
  props: ["templates", "loading", "busy", "onSave", "onUse", "onDelete"],
});
