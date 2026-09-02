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
      const nextScale = Math.min(1, viewport.clientWidth / LANDING_CANVAS_WIDTH);
      setScale(nextScale);
      setCanvasHeight(canvas.offsetHeight);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(viewport);
    ro.observe(canvas);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
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
            style={scaledHeight ? { height: scaledHeight } : undefined}
          >
            <div
              ref={canvasRef}
              className="landing-tablet-canvas"
              style={{
                width: LANDING_CANVAS_WIDTH,
                transform: `scale(${scale})`,
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
