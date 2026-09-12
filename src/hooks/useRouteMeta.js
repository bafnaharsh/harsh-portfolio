import { useEffect } from "react";
import { routeMeta, profilePageJsonLd } from "../lib/seo";

// Route-level <head> manager. The static tags in index.html are the crawler
// baseline; this hook updates them in place per route (no duplicates), so
// every route gets a unique title, description and canonical.
const setMeta = (selector, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, name] = selector.match(/^meta\[(\w+)="([^"]+)"\]$/) || [];
    if (key) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setRobots = (index) => {
  const el = document.head.querySelector('meta[name="robots"]');
  if (index) el?.remove();
  else setMeta('meta[name="robots"]', "content", "noindex, follow");
};

const setProfilePageJsonLd = (enabled) => {
  const id = "ld-profilepage";
  let el = document.getElementById(id);
  if (!enabled) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(profilePageJsonLd());
};

export function useRouteMeta(pathname) {
  useEffect(() => {
    const m = routeMeta(pathname);
    document.title = m.title;
    setMeta('meta[name="description"]', "content", m.description);
    setMeta('meta[property="og:title"]', "content", m.title);
    setMeta('meta[property="og:description"]', "content", m.description);
    setMeta('meta[name="twitter:title"]', "content", m.title);
    setMeta('meta[name="twitter:description"]', "content", m.description);
    if (m.canonical) setMeta('meta[property="og:url"]', "content", m.canonical);
    setLink("canonical", m.canonical);
    setRobots(m.index);
    setProfilePageJsonLd(pathname.replace(/\/+$/, "") === "" || pathname === "/");
  }, [pathname]);
}
