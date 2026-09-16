import { Archive, ArrowLeft, Download, Search, Trash2, X } from "lucide-vue-next";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, Transition } from "vue";
import type { Archive as ArchiveRecord } from "../archives";
import { markdownToPlainText } from "../markdown";
import type { Theme } from "../default-settings";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export const ArchiveLibrary = defineComponent((props: {
  archives: ArchiveRecord[];
  theme: Theme;
  loading: boolean;
  busy: boolean;
  onClose: () => void;
  onExportAll: () => void;
  onDeleteArchive: (id: string) => void;
}) => {
  const query = ref("");
  const selectedArchive = ref<ArchiveRecord | null>(null);
  const contentTransition = ref("archive-content-forward");
  const searchRef = ref<HTMLInputElement | null>(null);
  const filtered = computed(() => {
    const keyword = query.value.trim().toLocaleLowerCase();
    if (!keyword) return props.archives;
    return props.archives.filter((archive) => `${archive.title}\n${archive.markdown}`.toLocaleLowerCase().includes(keyword));
  });
  const returnToList = () => {
    contentTransition.value = "archive-content-back";
    selectedArchive.value = null;
    void nextTick(() => searchRef.value?.focus());
  };
  const openArchive = (archive: ArchiveRecord) => {
    contentTransition.value = "archive-content-forward";
    selectedArchive.value = archive;
  };
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (selectedArchive.value) returnToList();
    else props.onClose();
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
    document.documentElement.classList.add("archive-dialog-open");
    void nextTick(() => searchRef.value?.focus());
  });
  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeydown);
    document.documentElement.classList.remove("archive-dialog-open");
  });

  return () => {
    const archive = selectedArchive.value;
    return (
      <div class={['archive-dialog', `ui-${props.theme}`]} role="dialog" aria-modal="true" aria-labelledby="archive-dialog-title">
        <button type="button" class="archive-dialog-backdrop" aria-label="关闭归档" onClick={props.onClose} />
        <section class="archive-dialog-panel">
          <header class="archive-dialog-header">
            <div>
              {archive ? (
                <button type="button" class="archive-dialog-return" onClick={returnToList}><ArrowLeft size={15} /> 返回已归档</button>
              ) : (
                <h2 id="archive-dialog-title">已归档 <span>{props.archives.length}</span></h2>
              )}
              {archive && <h2 id="archive-dialog-title" class="archive-dialog-reading-title">{archive.title}</h2>}
            </div>
            <div class="archive-dialog-header-actions">
              {!archive && <button type="button" class="archive-export-all" onClick={props.onExportAll} disabled={props.loading || props.archives.length === 0}><Download size={15} /> 导出全部为MD</button>}
              <button type="button" class="archive-dialog-close" onClick={props.onClose} aria-label="关闭归档" title="关闭"><X size={18} /></button>
            </div>
          </header>

          <div class="archive-dialog-view-port">
            <Transition name={contentTransition.value}>
              {archive ? (
                <article key={archive.id} class="archive-dialog-reading">
                  <div class="archive-dialog-reading-meta"><time datetime={archive.archivedAt}>归档于 {formatDate(archive.archivedAt)}</time><span>{archive.state.name || "未署名"}</span></div>
                  <div class="archive-dialog-reading-body">{markdownToPlainText(archive.markdown) || "（无正文）"}</div>
                </article>
              ) : (
                <div key="archive-list" class="archive-dialog-content">
                  <div class="archive-dialog-toolbar">
                    <label class="archive-search">
                      <Search size={15} aria-hidden="true" />
                      <input ref={searchRef} value={query.value} onInput={(event) => (query.value = (event.target as HTMLInputElement).value)} placeholder="搜索归档" aria-label="搜索标题或正文" />
                    </label>
                    <span>{props.loading ? "读取中…" : `${filtered.value.length} 篇`}</span>
                  </div>
                  <div class="archive-dialog-list" aria-label="归档列表">
                    {props.loading ? (
                      <div class="archive-dialog-empty"><Archive size={22} /><p>正在读取归档…</p></div>
                    ) : filtered.value.length === 0 ? (
                      <div class="archive-dialog-empty">
                        <Archive size={24} />
                        <strong>{props.archives.length ? "没有找到相关文字" : "还没有归档作品"}</strong>
                        <p>{props.archives.length ? "换个关键词试试。" : "完成一篇文字后，选择“归档”。"}</p>
                      </div>
                    ) : filtered.value.map((item) => (
                      <article key={item.id} class="archive-dialog-item">
                        <div class="archive-dialog-item-copy">
                          <div class="archive-dialog-item-meta"><time datetime={item.archivedAt}>{formatDate(item.archivedAt)}</time><span>{item.state.name || "未署名"}</span></div>
                          <h3>{item.title}</h3>
                          <p>{markdownToPlainText(item.markdown) || "（无正文）"}</p>
                        </div>
                        <div class="archive-dialog-item-actions" aria-label={`${item.title}的操作`}>
                          <button
                            type="button"
                            class="archive-dialog-delete"
                            onClick={() => props.onDeleteArchive(item.id)}
                            aria-label={`删除归档：${item.title}`}
                            title="删除"
                            disabled={props.busy}
                          >
                            <Trash2 size={14} /> 删除
                          </button>
                          <button type="button" class="archive-dialog-view" onClick={() => openArchive(item)} disabled={props.busy}>查看</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </Transition>
          </div>
        </section>
      </div>
    );
  };
}, { props: ["archives", "theme", "loading", "busy", "onClose", "onExportAll", "onDeleteArchive"] });
