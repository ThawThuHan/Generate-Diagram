import React, { useRef, useEffect } from "react";

export function ResizablePanel({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
  const mergedClassName = className ? `resizable-panel ${className}` : "resizable-panel";
  return <div className={mergedClassName} style={{ height: '100%' }}>{children}</div>;
}

export function ResizableHandle() {
  const handleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    let startX = 0;
    let startWidthLeft = 0;
    let startWidthRight = 0;
    const leftPanel = handle.previousElementSibling as HTMLElement;
    const rightPanel = handle.nextElementSibling as HTMLElement;
    if (!leftPanel || !rightPanel) return;
    function onMouseDown(e: MouseEvent) {
      startX = e.clientX;
      startWidthLeft = leftPanel.offsetWidth;
      startWidthRight = rightPanel.offsetWidth;
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - startX;
      leftPanel.style.flexBasis = `${startWidthLeft + dx}px`;
      rightPanel.style.flexBasis = `${startWidthRight - dx}px`;
    }
    function onMouseUp() {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    handle.addEventListener("mousedown", onMouseDown);
    return () => {
      handle.removeEventListener("mousedown", onMouseDown);
    };
  }, []);
  return (
    <div
      ref={handleRef}
      className="resizable-handle"
      style={{ width: 8, cursor: "col-resize", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
    >
      <span style={{ fontSize: 18, color: "#888" }}>⫶</span>
    </div>
  );
}