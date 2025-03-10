import { useEffect } from "react";

const imageLink = "/todo.svg";

export function useFaviconBadge(count) {
  useEffect(() => {
    // Only show badge if there are uncompleted todos
    if (count <= 0) {
      // Reset to original favicon
      const link = document.querySelector("link[rel='icon']");
      if (link) {
        link.href = imageLink; // Original favicon path
      }
      document.title = "Todo New Tab"; // Reset title
      return;
    }

    // Update document title for additional notification
    document.title = `(${count}) Todo New Tab`;

    // Create canvas for the badge
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    // Load original favicon
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageLink;

    img.onload = () => {
      // Draw original favicon
      ctx.drawImage(img, 0, 0, 32, 32);

      // If the count is too high, show "99+"
      const displayCount = count > 99 ? "99+" : count.toString();
      ctx.fillText(displayCount, 24, 8);

      // Update favicon
      const link = document.querySelector("link[rel='icon']");
      if (link) {
        link.href = canvas.toDataURL("image/png");
      } else {
        // If there's no favicon, create one
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = canvas.toDataURL("image/png");
        document.head.appendChild(newLink);
      }
    };
  }, [count]);
}
