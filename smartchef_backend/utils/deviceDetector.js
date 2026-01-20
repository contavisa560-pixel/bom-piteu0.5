const UAParser = require("ua-parser-js");

exports.detectDevice = (req) => {
  const parser = new UAParser();
  const ua = req.headers["user-agent"] || "";
  const result = parser.setUA(ua).getResult();
  
  return {
    device: result.device.model || result.device.type || "Desktop",
    browser: result.browser.name || "Navegador desconhecido",
    os: result.os.name || "Sistema desconhecido",
    fullUserAgent: ua.substring(0, 100)
  };
};

exports.getBrowserName = (userAgent) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera")) return "Opera";
  if (ua.includes("brave")) return "Brave";
  return "Outro";
};

exports.getOSName = (userAgent) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios") || ua.includes("iphone")) return "iOS";
  return "Desconhecido";
};