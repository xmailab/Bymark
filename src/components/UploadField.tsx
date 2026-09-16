import { ImagePlus, Trash2, Upload } from "lucide-vue-next";
import { defineComponent, ref } from "vue";

export const UploadField = defineComponent((props: {
  value: string | null;
  kind: "avatar" | "image" | "scene";
  onFile: (file: File) => void;
  onRemove: () => void;
}) => {
  const inputRef = ref<HTMLInputElement | null>(null);
  const id = `bymark-upload-${props.kind}`;
  const isAvatar = props.kind === "avatar";
  const isScene = props.kind === "scene";
  const label = isAvatar ? "头像" : isScene ? "场景背景" : "配图";
  const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const isDragging = ref(false);
  const chooseFile = () => inputRef.value?.click();
  const useFile = (file: File | undefined) => {
    if (file && supportedImageTypes.includes(file.type)) props.onFile(file);
  };
  const receiveFile = (event: Event) => {
    const input = event.target as HTMLInputElement;
    useFile(input.files?.[0]);
    input.value = "";
  };
  const startDrag = (event: DragEvent) => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    isDragging.value = true;
  };
  const endDrag = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
  };
  const receiveDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
    useFile(Array.from(event.dataTransfer?.files ?? []).find((file) => supportedImageTypes.includes(file.type)));
  };

  return () => (
    <div class="upload-row">
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        aria-label={isAvatar ? "选择头像图片" : isScene ? "选择场景背景图片" : "选择内容配图"}
        onChange={receiveFile}
      />
      <button
        type="button"
        class={["upload-preview", isAvatar && "avatar-preview", isDragging.value && "upload-preview-drop-active"]}
        onClick={chooseFile}
        onDragenter={startDrag}
        onDragover={startDrag}
        onDragleave={endDrag}
        onDrop={receiveDrop}
        aria-label={props.value ? `替换当前${label}` : `上传${label}`}
        title={`拖入${label}或点击上传`}
      >
        {props.value ? (
          <img src={props.value} alt={`当前${label}`} />
        ) : (
          <span class="upload-empty">
            {isAvatar ? <Upload size={16} /> : <ImagePlus size={18} />}
          </span>
        )}
      </button>
      {props.value && (
        <div class="upload-actions">
          <button
            type="button"
            class="icon-button"
            onClick={props.onRemove}
            aria-label={isAvatar ? "恢复默认头像" : `删除${label}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}, {
  props: ["value", "kind", "onFile", "onRemove"],
});
