/**
 * Rebuild the static sharing card with the website's own logo and hero artwork.
 * Run from the project root: node scripts/generate-social-preview.mjs
 * Sharp is supplied by Next.js; no remote assets or image service is needed.
 */
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const project = new URL("../", import.meta.url);
const art = await readFile(
  new URL("components/marketing/hero-floating-art.tsx", project),
  "utf8",
);

function websiteIllustration(name, x, y, size) {
  const start = art.indexOf(`function ${name}()`);
  if (start === -1) throw new Error(`Homepage illustration missing: ${name}`);
  const svgStart = art.indexOf("<svg", start);
  const svgEnd = art.indexOf("</svg>", svgStart);
  if (svgStart === -1 || svgEnd === -1) {
    throw new Error(`Homepage illustration has no static SVG: ${name}`);
  }

  // These illustrations are static JSX. Keep their original geometry and
  // colors, stripping React comments/classes and converting SVG attributes.
  const svg = art
    .slice(svgStart, svgEnd + 6)
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\sclassName="[^"]*"/g, "")
    .replace(/\b([a-z]+[A-Z]\w*)=/g, (attribute) =>
      attribute.startsWith("viewBox")
        ? attribute
        : attribute.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
    )
    .replace("<svg", `<svg x="${x}" y="${y}" width="${size}" height="${size}"`);
  // Prefix IDs so repeated gradient names cannot collide between illustrations.
  return svg
    .replace(/id="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`);
}

const logo = await sharp(await readFile(new URL("public/logo.png", project)))
  .resize(160, 104, { fit: "contain", background: "white" })
  .png()
  .toBuffer();

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sunset" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#e84d61"/><stop offset="0.55" stop-color="#ea580c"/><stop offset="1" stop-color="#d99012"/>
    </linearGradient>
    <radialGradient id="warm"><stop stop-color="#ffdda8" stop-opacity="0.58"/><stop offset="1" stop-color="#fffaf3" stop-opacity="0"/></radialGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#173956"/><stop offset="1" stop-color="#071b30"/></linearGradient>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#bba98d" opacity="0.2"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="#fffaf3"/>
  <rect width="1200" height="530" fill="url(#dots)"/>
  <ellipse cx="1020" cy="230" rx="440" ry="400" fill="url(#warm)"/>
  <rect width="1200" height="6" fill="url(#sunset)"/>

  <rect x="54" y="34" width="176" height="120" rx="18" fill="white" stroke="#eee5d8"/>
  <image x="62" y="42" width="160" height="104" href="data:image/png;base64,${logo.toString("base64")}"/>
  <g font-family="Arial, sans-serif">
    <text x="252" y="84" font-size="15" font-weight="700" letter-spacing="1.4" fill="#0f293f">STUDY ABROAD CONSULTANT</text>
    <text x="252" y="112" font-size="18" fill="#66717e">Bangladesh → Global Campuses</text>

    <text x="58" y="252" font-size="76" font-weight="700" letter-spacing="-3" fill="#102a40">Your future.</text>
    <text x="58" y="336" font-size="76" font-weight="700" letter-spacing="-3" fill="url(#sunset)">Beyond borders.</text>
    <text x="62" y="389" font-size="25" font-weight="700" fill="#233d53">Admissions, scholarships &amp; student visas.</text>
    <text x="62" y="425" font-size="21" fill="#66717e">A clearer route from Bangladesh to your next campus.</text>

    <rect x="62" y="459" width="606" height="41" rx="20.5" fill="#fff" stroke="#e9dfd1"/>
    <circle cx="83" cy="480" r="4" fill="#e84d61"/>
    <text x="98" y="486" font-size="18" fill="#284358">China</text>
    <circle cx="174" cy="480" r="4" fill="#d99012"/>
    <text x="189" y="486" font-size="18" fill="#284358">India</text>
    <circle cx="260" cy="480" r="4" fill="#059669"/>
    <text x="275" y="486" font-size="18" fill="#284358">Malaysia</text>
    <circle cx="385" cy="480" r="4" fill="#0284c7"/>
    <text x="400" y="486" font-size="18" fill="#284358">South Korea</text>
    <path d="M584 480h38m-9-8 9 8-9 8" fill="none" stroke="#d98b2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <rect x="762" y="154" width="376" height="352" rx="30" fill="#ddcab4" opacity="0.3"/>
  <rect x="754" y="144" width="376" height="352" rx="30" fill="url(#navy)"/>
  <rect x="755" y="145" width="374" height="350" rx="29" fill="none" stroke="#7793a4" stroke-opacity="0.28"/>
  <circle cx="942" cy="316" r="133" fill="none" stroke="#bba169" stroke-opacity="0.37"/>
  <circle cx="942" cy="316" r="152" fill="none" stroke="#bba169" stroke-opacity="0.18" stroke-dasharray="3 8"/>
  <ellipse cx="942" cy="316" rx="160" ry="59" transform="rotate(-28 942 316)" fill="none" stroke="#8caabe" stroke-opacity="0.32"/>
  <text x="942" y="179" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#e4c58c">YOUR NEXT CAMPUS</text>
  ${websiteIllustration("UniversityCampusVector", 812, 200, 260)}

  <rect x="716" y="192" width="100" height="100" rx="24" fill="#fff" stroke="#eee2cf"/>
  ${websiteIllustration("GraduationCapVector", 721, 197, 90)}
  <rect x="1052" y="340" width="100" height="100" rx="24" fill="#fff" stroke="#eee2cf"/>
  ${websiteIllustration("VisaPassportVector", 1057, 345, 90)}
  <circle cx="1069" cy="221" r="5" fill="#e6b85c"/>
  <circle cx="819" cy="415" r="4" fill="#67c5db"/>
  <text x="942" y="464" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#d6e1ea">One journey. Expert guidance.</text>

  <path d="M54 530H1146" stroke="#e9dfd1"/>
  <rect x="62" y="550" width="248" height="48" rx="24" fill="url(#sunset)"/>
  <text x="87" y="580" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="white">Free consultation</text>
  <path d="M269 574h15m-6-6 6 6-6 6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="1138" y="580" text-anchor="end" font-family="Arial, sans-serif" font-size="21" fill="#284358">studyabroadconsultantbd.com</text>
</svg>`;

const directory = new URL("public/images/", project);
await mkdir(directory, { recursive: true });
const output = new URL("study-abroad-preview-v1.jpg", directory);
await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(fileURLToPath(output));
console.log(`Created ${output.pathname} (1200 × 630)`);
