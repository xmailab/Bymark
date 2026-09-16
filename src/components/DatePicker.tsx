import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-vue-next";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
} from "vue";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

type MonthCursor = { year: number; month: number };

function dateFromValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(year, month - 1, day);
  return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}

function dateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function moveDate(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function moveMonth(cursor: MonthCursor, amount: number): MonthCursor {
  const date = new Date(cursor.year, cursor.month + amount, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function cursorFor(date: Date): MonthCursor {
  return { year: date.getFullYear(), month: date.getMonth() };
}

function formatMonth(cursor: MonthCursor) {
  return `${cursor.year}年${cursor.month + 1}月`;
}

export const DatePicker = defineComponent((props: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const open = shallowRef(false);
  const rootRef = ref<HTMLDivElement | null>(null);
  const triggerRef = ref<HTMLButtonElement | null>(null);
  const selectedDate = computed(() => dateFromValue(props.value));
  const visibleMonth = shallowRef<MonthCursor>(cursorFor(selectedDate.value));
  const selectedValue = computed(() => dateValue(selectedDate.value));
  const todayValue = dateValue(new Date());
  const days = computed(() => {
    const { year, month } = visibleMonth.value;
    const firstDay = new Date(year, month, 1);
    const gridStart = moveDate(firstDay, -firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = moveDate(gridStart, index);
      const value = dateValue(date);
      return {
        date,
        value,
        isCurrentMonth: date.getMonth() === month,
        isSelected: value === selectedValue.value,
        isToday: value === todayValue,
      };
    });
  });

  const focusDate = (value: string) => {
    nextTick(() => rootRef.value?.querySelector<HTMLButtonElement>(`[data-date='${value}']`)?.focus());
  };

  const setOpen = (nextOpen: boolean, restoreFocus = false) => {
    open.value = nextOpen;
    if (nextOpen) visibleMonth.value = cursorFor(selectedDate.value);
    else if (restoreFocus) nextTick(() => triggerRef.value?.focus());
  };

  const selectDate = (date: Date, close = true) => {
    const value = dateValue(date);
    props.onChange(value);
    visibleMonth.value = cursorFor(date);
    if (close) setOpen(false, true);
  };

  const navigateDate = (current: Date, amount: number) => {
    const next = moveDate(current, amount);
    props.onChange(dateValue(next));
    visibleMonth.value = cursorFor(next);
    focusDate(dateValue(next));
  };

  const handleDayKeydown = (event: KeyboardEvent, date: Date) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateDate(date, -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateDate(date, 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      navigateDate(date, -7);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      navigateDate(date, 7);
    } else if (event.key === "Home") {
      event.preventDefault();
      navigateDate(date, -date.getDay());
    } else if (event.key === "End") {
      event.preventDefault();
      navigateDate(date, 6 - date.getDay());
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const next = new Date(date.getFullYear(), date.getMonth() + (event.key === "PageUp" ? -1 : 1), date.getDate());
      props.onChange(dateValue(next));
      visibleMonth.value = cursorFor(next);
      focusDate(dateValue(next));
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

  return () => (
    <div ref={rootRef} class="date-picker">
      <button
        ref={triggerRef}
        id="bymark-date"
        type="button"
        class="control date-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={open.value}
        aria-controls="bymark-date-picker-panel"
        onClick={() => setOpen(!open.value)}
      >
        <span>{selectedValue.value.replaceAll("-", "/")}</span>
        <CalendarDays size={15} aria-hidden="true" />
      </button>
      {open.value && (
        <div id="bymark-date-picker-panel" class="date-picker-panel" role="dialog" aria-label="选择日期">
          <div class="date-picker-header">
            <button type="button" aria-label="上个月" onClick={() => (visibleMonth.value = moveMonth(visibleMonth.value, -1))}><ChevronLeft size={17} /></button>
            <strong>{formatMonth(visibleMonth.value)}</strong>
            <button type="button" aria-label="下个月" onClick={() => (visibleMonth.value = moveMonth(visibleMonth.value, 1))}><ChevronRight size={17} /></button>
          </div>
          <div class="date-picker-weekdays" aria-hidden="true">
            {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div class="date-picker-grid" role="grid" aria-label={formatMonth(visibleMonth.value)}>
            {days.value.map((day) => (
              <button
                key={day.value}
                type="button"
                role="gridcell"
                data-date={day.value}
                class={[
                  "date-picker-day",
                  !day.isCurrentMonth && "is-outside-month",
                  day.isSelected && "is-selected",
                  day.isToday && "is-today",
                ]}
                aria-label={`${day.date.getFullYear()}年${day.date.getMonth() + 1}月${day.date.getDate()}日`}
                aria-selected={day.isSelected}
                aria-current={day.isToday ? "date" : undefined}
                tabindex={day.isSelected ? 0 : -1}
                onClick={() => selectDate(day.date)}
                onKeydown={(event) => handleDayKeydown(event, day.date)}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
          <div class="date-picker-footer">
            <button type="button" class="date-picker-today" onClick={() => selectDate(new Date())}>今天</button>
            <button type="button" class="date-picker-done" onClick={() => setOpen(false, true)}>完成</button>
          </div>
        </div>
      )}
    </div>
  );
}, { props: ["value", "onChange"] });
