import { useEffect } from "react";

interface StructuredDataProps {
  type: "Organization" | "WebSite" | "WebPage" | "FAQPage" | "Article";
  data: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = `structured-data-${type.toLowerCase()}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": type,
      ...data
    };

    script.textContent = JSON.stringify(structuredData);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [type, data]);

  return null;
}

export function OrganizationSchema() {
  const baseUrl = window.location.origin;
  
  return (
    <StructuredData
      type="Organization"
      data={{
        name: "DapsiGames",
        url: baseUrl,
        logo: `${baseUrl}/pwa-icon-512.png`,
        description: "Transform studying into a gamified experience with DapsiGames. The ultimate study and productivity platform for students.",
        sameAs: [
          // Add social media links here when available
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          email: "support@dapsigames.com"
        }
      }}
    />
  );
}

export function WebSiteSchema() {
  const baseUrl = window.location.origin;
  
  return (
    <StructuredData
      type="WebSite"
      data={{
        name: "DapsiGames",
        url: baseUrl,
        description: "Gamified study and productivity platform for students",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }}
    />
  );
}
