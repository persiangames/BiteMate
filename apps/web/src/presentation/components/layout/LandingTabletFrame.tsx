import { useEffect, useRef, useState, type ReactNode } from 'react';

const LANDING_CANVAS_WIDTH = 1180;

type LandingTabletFrameProps = {
  children: ReactNode;
};

/** Tablet-style bezel around landing; inner canvas scales uniformly on all viewports. */
export function LandingTabletFrame({ children }: LandingTabletFrameProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [canvasHeight, setCanvasHeight] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const update = () => {
      const widthScale = viewport.clientWidth / LANDING_CANVAS_WIDTH;
      const nextScale = Number.isFinite(widthScale) ? Math.min(1, Math.max(widthScale, 0.01)) : 1;
      setScale(nextScale);
      setCanvasHeight(canvas.scrollHeight || canvas.offsetHeight);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(viewport);
    ro.observe(canvas);
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    void document.fonts?.ready.then(update);
    const frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('load', update);
    };
  }, []);

  const scaledHeight = canvasHeight > 0 ? canvasHeight * scale : undefined;

  return (
    <div className="landing-tablet-stage">
      <div className="landing-tablet-frame">
        <div className="landing-tablet-frame__camera" aria-hidden />
        <div className="landing-tablet-screen">
          <div
            ref={viewportRef}
            className="landing-tablet-viewport"
            style={scaledHeight ? { height: `${scaledHeight}px` } : undefined}
          >
            <div
              ref={canvasRef}
              className="landing-tablet-canvas"
              style={{
                width: LANDING_CANVAS_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
