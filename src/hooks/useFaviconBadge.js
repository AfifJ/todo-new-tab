import { useEffect } from 'react';

export function useFaviconBadge(count) {
  useEffect(() => {
    // Only show badge if there are uncompleted todos
    if (count <= 0) {
      // Reset to original favicon
      const link = document.querySelector("link[rel='icon']");
      if (link) {
        link.href = "/todo.svg"; // Original favicon path
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
    img.src = "/todo.svg";

    img.onload = () => {
      // Draw original favicon
      ctx.drawImage(img, 0, 0, 32, 32);

      // Draw badge
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw text
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      
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
