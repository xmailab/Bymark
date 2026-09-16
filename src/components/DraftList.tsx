import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-vue-next";
import { Transition, TransitionGroup, defineComponent, shallowRef } from "vue";
import type { Draft, DraftDropPlacement } from "../drafts";
import { WORK_TITLE_MAX_LENGTH } from "../bymark";

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

type DropTarget = { id: string; placement: DraftDropPlacement } | null;

/** Renders draft cards and owns card-only interactions, including reordering. */
export const DraftList = defineComponent((props: {
  drafts: Draft[];
  activeDraftId: string | null;
  busy: boolean;
  onUseDraft: (id: string) => void;
  onRenameDraft: (id: string, title: string) => void;
  onDeleteDraft: (id: string) => void;
  onReorderDraft: (sourceId: string, targetId: string, placement: DraftDropPlacement) => void;
}) => {
  const mobileActionDraftId = shallowRef<string | null>(null);
  const editingDraftId = shallowRef<string | null>(null);
  const editingTitle = shallowRef("");
  const draggedDraftId = shallowRef<string | null>(null);
  const dropTarget = shallowRef<DropTarget>(null);

  const beginRename = (draft: Draft) => {
    mobileActionDraftId.value = null;
    editingDraftId.value = draft.id;
    editingTitle.value = draft.state.title;
  };
  const finishRename = (draft: Draft) => {
    if (editingDraftId.value !== draft.id) return;
    const title = editingTitle.value.trim();
    if (title !== draft.state.title.trim()) props.onRenameDraft(draft.id, title);
    editingDraftId.value = null;
  };
  const clearDragState = () => {
    draggedDraftId.value = null;
    dropTarget.value = null;
  };
  const startDrag = (event: DragEvent, draft: Draft) => {
    if (props.busy || editingDraftId.value) {
      event.preventDefault();
      return;
    }
    draggedDraftId.value = draft.id;
    event.dataTransfer?.setData("text/plain", draft.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  };
  const updateDropTarget = (event: DragEvent, draft: Draft) => {
    if (!draggedDraftId.value || draggedDraftId.value === draft.id) return;
    event.preventDefault();
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    dropTarget.value = {
      id: draft.id,
      placement: event.clientY < bounds.top + bounds.height / 2 ? "before" : "after",
    };
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  };
  const dropDraft = (event: DragEvent, target: Draft) => {
    event.preventDefault();
    const sourceId = draggedDraftId.value ?? event.dataTransfer?.getData("text/plain");
    const placement = dropTarget.value?.id === target.id ? dropTarget.value.placement : "before";
    if (sourceId && sourceId !== target.id) props.onReorderDraft(sourceId, target.id, placement);
    clearDragState();
  };
  const moveWithKeyboard = (draft: Draft, direction: "up" | "down") => {
    const index = props.drafts.findIndex((item) => item.id === draft.id);
    const target = props.drafts[index + (direction === "up" ? -1 : 1)];
    if (!target) return;
    props.onReorderDraft(draft.id, target.id, direction === "up" ? "before" : "after");
  };

  return () => (
    <div class="draft-list" aria-label="草稿列表">
      <TransitionGroup name="draft-list-motion">
        {props.drafts.map((draft) => {
          const isActive = props.activeDraftId === draft.id;
          const isEditing = editingDraftId.value === draft.id;
          const targetPlacement = dropTarget.value?.id === draft.id ? dropTarget.value.placement : null;
          return (
            <article
              key={draft.id}
              class={[
                "draft-row",
                isActive && "draft-row-active",
                draggedDraftId.value === draft.id && "draft-row-dragging",
                targetPlacement && `draft-row-drop-${targetPlacement}`,
              ]}
              onDragover={(event: DragEvent) => updateDropTarget(event, draft)}
              onDrop={(event: DragEvent) => dropDraft(event, draft)}
            >
              <div class="draft-main">
                {isEditing ? (
                  <input
                    class="draft-title-input"
                    value={editingTitle.value}
                    maxlength={WORK_TITLE_MAX_LENGTH}
                    placeholder={draft.title}
                    autofocus
                    disabled={props.busy}
                    aria-label="作品标题"
                    onInput={(event) => {
                      editingTitle.value = (event.target as HTMLInputElement).value;
                    }}
                    onBlur={() => finishRename(draft)}
                    onKeydown={(event: KeyboardEvent) => {
                      if (event.key === "Enter") (event.currentTarget as HTMLInputElement).blur();
                      if (event.key === "Escape") editingDraftId.value = null;
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    class="draft-open-button"
                    onClick={() => props.onUseDraft(draft.id)}
                    aria-label={`使用草稿：${draft.title}`}
                    disabled={props.busy}
                  >
                    <span class="draft-title-line">
                      <h3>{draft.title}</h3>
                      {isActive && <i>当前</i>}
                    </span>
                    <span class="draft-summary">{draft.text.replace(/\s+/g, " ").trim() || "空白草稿"}</span>
                    <time datetime={draft.updatedAt}>编辑于 {formatUpdatedAt(draft.updatedAt)}</time>
                  </button>
                )}
                {isEditing && <time datetime={draft.updatedAt}>编辑于 {formatUpdatedAt(draft.updatedAt)}</time>}
              </div>
              <div class="draft-actions" aria-label={`${draft.title}的操作`}>
                <button
                  type="button"
                  draggable={!props.busy && !isEditing}
                  class="draft-icon-button draft-drag-handle icon-tooltip"
                  aria-label={`拖动调整草稿顺序：${draft.title}`}
                  data-tooltip="拖动调整草稿顺序"
                  title="拖动调整顺序"
                  disabled={props.busy || isEditing}
                  onDragstart={(event: DragEvent) => startDrag(event, draft)}
                  onDragend={clearDragState}
                  onKeydown={(event: KeyboardEvent) => {
                    if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
                    event.preventDefault();
                    moveWithKeyboard(draft, event.key === "ArrowUp" ? "up" : "down");
                  }}
                >
                  <GripVertical size={14} />
                </button>
                <button
                  type="button"
                  class="draft-icon-button"
                  onClick={() => beginRename(draft)}
                  aria-label={`重命名草稿：${draft.title}`}
                  title="重命名"
                  disabled={props.busy}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  class="draft-icon-button draft-delete-button"
                  onClick={() => props.onDeleteDraft(draft.id)}
                  aria-label={`删除草稿：${draft.title}`}
                  title="删除"
                  disabled={props.busy}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <button
                type="button"
                class="draft-mobile-more-button"
                aria-label={`${draft.title}的更多操作`}
                aria-expanded={mobileActionDraftId.value === draft.id}
                onClick={() => {
                  mobileActionDraftId.value = mobileActionDraftId.value === draft.id ? null : draft.id;
                }}
                disabled={props.busy}
              >
                <MoreHorizontal size={20} />
              </button>
              <Transition name="draft-mobile-actions">
                {mobileActionDraftId.value === draft.id && (
                  <div class="draft-mobile-action-menu" aria-label={`${draft.title}的更多操作`}>
                    <button type="button" onClick={() => beginRename(draft)} disabled={props.busy}>
                      重命名
                    </button>
                    <button
                      type="button"
                      class="draft-mobile-delete-action"
                      onClick={() => {
                        mobileActionDraftId.value = null;
                        props.onDeleteDraft(draft.id);
                      }}
                      disabled={props.busy}
                    >
                      删除草稿
                    </button>
                  </div>
                )}
              </Transition>
            </article>
          );
        })}
      </TransitionGroup>
    </div>
  );
}, {
  props: ["drafts", "activeDraftId", "busy", "onUseDraft", "onRenameDraft", "onDeleteDraft", "onReorderDraft"],
});
