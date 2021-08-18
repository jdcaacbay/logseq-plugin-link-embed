import React, { useState } from "react";
import { useMountedState, useDebounce } from "react-use";

export const useAppVisible = () => {
  const [visible, setVisible] = useState(logseq.isMainUIVisible);
  const isMounted = useMountedState();
  React.useEffect(() => {
    const eventName = "ui:visible:changed";
    const handler = async ({ visible }: any) => {
      if (isMounted()) {
        setVisible(visible);
      }
    };
    logseq.on(eventName, handler);
    return () => {
      logseq.off(eventName, handler);
    };
  }, []);
  return visible;
};

export const useSidebarVisible = () => {
  const [visible, setVisible] = useState(false);
  const isMounted = useMountedState();
  React.useEffect(() => {
    logseq.App.onSidebarVisibleChanged(({ visible }) => {
      if (isMounted()) {
        setVisible(visible);
      }
    });
  }, []);
  return visible;
};

export function useDebounceValue<T>(v: T, timeout: number = 50) {
  const [state, setState] = React.useState(v);
  useDebounce(
    () => {
      setState(v);
    },
    timeout,
    [v]
  );
  return state;
}

export const useHoveringExternalLink = () => {
  const [anchor, setAnchor] = React.useState<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    const enterListener = (e: MouseEvent) => {
      const target = e.composedPath()[0] as HTMLAnchorElement;
      if (
        target.tagName === "A" &&
        target.href &&
        target.className.includes("external-link")
      ) {
        setAnchor(target);
        target.addEventListener(
          "mouseleave",
          () => {
            setAnchor(null);
          },
          { once: true }
        );
      }
    };

    top.document.addEventListener("mouseenter", enterListener, true);
    return () => {
      top.document.removeEventListener("mouseenter", enterListener, true);
    };
  }, []);
  return anchor;
};