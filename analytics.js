const GA_MEASUREMENT_ID = "G-JE05HKKXCH";

window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};

const googleTag = document.createElement("script");
googleTag.async = true;
googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(googleTag);

window.gtag("js", new Date());
window.gtag("config", GA_MEASUREMENT_ID);

window.trackPortfolioEvent = function trackPortfolioEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, {
    page_path: window.location?.pathname || "",
    ...params,
  });
};
