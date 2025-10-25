import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

export function SEO({
  title,
  description,
  keywords,
  ogImage = "/pwa-icon-512.png",
  ogType = "website",
  canonical,
  noindex = false
}: SEOProps) {
  const [location] = useLocation();
  const baseUrl = window.location.origin;
  const fullUrl = canonical || `${baseUrl}${location}`;
  const fullTitle = title.includes("DapsiGames") ? title : `${title} | DapsiGames`;

  useEffect(() => {
    document.title = fullTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      
      element.href = href;
    };

    updateMetaTag("description", description);
    
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:url", fullUrl, true);
    updateMetaTag("og:image", `${baseUrl}${ogImage}`, true);
    updateMetaTag("og:site_name", "DapsiGames", true);

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", `${baseUrl}${ogImage}`);

    updateLinkTag("canonical", fullUrl);
  }, [fullTitle, description, keywords, ogImage, ogType, fullUrl, noindex, baseUrl]);

  return null;
}
