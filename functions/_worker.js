// 隐藏图片的 Cloudflare Worker 脚本
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 目标网站 URL
  const targetUrl = "http://hcc.junjue.cc/";

  try {
    // 获取目标网站内容
    const response = await fetch(targetUrl, {
      headers: request.headers,
    });

    // 确保响应是 HTML
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      return response;
    }

    // 获取 HTML 内容
    let html = await response.text();

    // 注入隐藏图片的 CSS
    const hideImagesCSS = `
      <style id="auto-hide-images">
        img, svg, canvas, picture {
          visibility: hidden !important;
          opacity: 0 !important;
          position: absolute !important;
          max-width: 0 !important;
          max-height: 0 !important;
        }
        * {
          background-image: none !important;
        }
      </style>
    `;

    // 在 <head> 标签后注入 CSS
    html = html.replace(/<head(.*?)>/i, `<head$1>${hideImagesCSS}`);

    // 修复相对路径为绝对路径
    html = html.replace(/(href|src)="\/([^"]*)"/gi, `$1="${targetUrl}/$2"`);

    // 返回修改后的响应
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    // 错误处理
    return new Response(`Error: ${err.message}`, {
      status: 500,
    });
  }
}
