import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_ID = "cloudflare-turnstile-script";

export const TurnstileCaptcha: React.FC<{ siteKey: string; resetKey: number; onToken: (token: string) => void }> = ({ siteKey, resetKey, onToken }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryTimer: number | undefined;
    const render = () => {
      if (!mounted || !container.current || widgetId.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
      if (widgetId.current && retryTimer) window.clearInterval(retryTimer);
    };
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      render();
      retryTimer = window.setInterval(render, 100);
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    return () => {
      mounted = false;
      if (retryTimer) window.clearInterval(retryTimer);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, [siteKey, onToken]);

  // Keep a single mounted widget across tabs. Recreating its iframe on each
  // tab switch is unreliable in some browsers; reset instead to obtain a new
  // single-use token for the selected authentication action.
  useEffect(() => {
    if (resetKey > 0 && widgetId.current) {
      window.turnstile?.reset(widgetId.current);
      onToken("");
    }
  }, [resetKey, onToken]);

  return <div ref={container} className="min-h-[65px] flex justify-center" aria-label="Verificación de seguridad" />;
};
