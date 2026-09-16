import { Transition, defineComponent } from "vue";

const transitionStyle =
  "height var(--motion-layout, 200ms) var(--motion-ease, cubic-bezier(0.2, 0.8, 0.2, 1)), opacity var(--motion-fade, 150ms) ease, transform var(--motion-fade, 150ms) var(--motion-ease, cubic-bezier(0.2, 0.8, 0.2, 1))";
const overlayTransitionStyle =
  "opacity var(--motion-fade, 150ms) ease, transform var(--motion-fade, 150ms) var(--motion-ease, cubic-bezier(0.2, 0.8, 0.2, 1))";

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function finish(element: HTMLElement) {
  element.style.height = "";
  element.style.opacity = "";
  element.style.transform = "";
  element.style.overflow = "";
  element.style.transition = "";
  element.style.willChange = "";
}

function waitForTransition(element: HTMLElement, property: string, done: () => void) {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    element.removeEventListener("transitionend", onTransitionEnd);
    window.clearTimeout(timeout);
    done();
  };
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target === element && event.propertyName === property) settle();
  };
  const timeout = window.setTimeout(settle, 300);
  element.addEventListener("transitionend", onTransitionEnd);
}

/**
 * Reveals conditional form sections without making nearby controls jump.
 * The wrapper is removed after leave so hidden inputs are never focusable.
 */
export const LayoutReveal = defineComponent(
  (props: { show: boolean; class?: string; overlay?: boolean }, { slots }) => {
    const beforeEnter = (node: Element) => {
      const element = node as HTMLElement;
      if (props.overlay) {
        element.style.opacity = "0";
        element.style.transform = "translateY(-4px)";
        element.style.willChange = "opacity, transform";
        return;
      }
      element.style.height = "0px";
      element.style.opacity = "0";
      element.style.transform = "translateY(-4px)";
      element.style.overflow = "hidden";
      element.style.willChange = "height, opacity, transform";
    };
    const enter = (node: Element, done: () => void) => {
      const element = node as HTMLElement;
      if (reducedMotion()) {
        finish(element);
        done();
        return;
      }
      const targetHeight = props.overlay ? "" : `${element.scrollHeight}px`;
      requestAnimationFrame(() => {
        element.style.transition = props.overlay ? overlayTransitionStyle : transitionStyle;
        if (!props.overlay) element.style.height = targetHeight;
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
        waitForTransition(element, props.overlay ? "opacity" : "height", () => {
          finish(element);
          done();
        });
      });
    };
    const beforeLeave = (node: Element) => {
      const element = node as HTMLElement;
      if (props.overlay) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
        element.style.willChange = "opacity, transform";
        return;
      }
      element.style.height = `${element.offsetHeight}px`;
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
      element.style.overflow = "hidden";
      element.style.willChange = "height, opacity, transform";
    };
    const leave = (node: Element, done: () => void) => {
      const element = node as HTMLElement;
      if (reducedMotion()) {
        finish(element);
        done();
        return;
      }
      if (!props.overlay) void element.offsetHeight;
      requestAnimationFrame(() => {
        element.style.transition = props.overlay ? overlayTransitionStyle : transitionStyle;
        if (!props.overlay) element.style.height = "0px";
        element.style.opacity = "0";
        element.style.transform = "translateY(-4px)";
        waitForTransition(element, props.overlay ? "opacity" : "height", done);
      });
    };

    return () => (
      <Transition
        css={false}
        onBeforeEnter={beforeEnter}
        onEnter={enter}
        onBeforeLeave={beforeLeave}
        onLeave={leave}
      >
        {props.show ? (
          <div class={["layout-reveal", props.class]}>{slots.default?.()}</div>
        ) : null}
      </Transition>
    );
  },
  { props: ["show", "class", "overlay"] },
);
