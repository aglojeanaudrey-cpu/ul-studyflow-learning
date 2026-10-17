// Déclaration de type pour Umami Analytics
declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        data?: Record<string, string | number | boolean>,
      ) => void;
    };
  }
}

export {};
