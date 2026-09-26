// Encodes the six owner-supplied craft clips for the CraftSteps section.
// Inputs (git-ignored, supplied by the owner via the video workflow):
//   data/craft-videos/selection-16x9.mp4  (homepage)
//   data/craft-videos/setting-16x9.mp4
//   data/craft-videos/finishing-16x9.mp4
//   data/craft-videos/selection-4x5.mp4   (product pages)
//   data/craft-videos/setting-4x5.mp4
//   data/craft-videos/finishing-4x5.mp4
// Outputs (committed): client/public/assets/craft/<name>.mp4 (H.264 CRF 26,
// no audio, faststart, under 2.5 MB), <name>.webm (VP9) and <name>.jpg
// (poster taken from the last frame).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

const INPUT_DIR = path.resolve("data/craft-videos");
const OUTPUT_DIR = path.resolve("client/public/assets/craft");
const MAX_MP4_BYTES = 2.5 * 1024 * 1024;

const NAMES = ["selection-16x9", "setting-16x9", "finishing-16x9", "selection-4x5", "setting-4x5", "finishing-4x5"];

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
}

const missing = NAMES.filter((name) => !existsSync(path.join(INPUT_DIR, `${name}.mp4`)));
const present = NAMES.filter((name) => !missing.includes(name));
if (!present.length) {
  console.error(`No input clips found in ${INPUT_DIR}. Expected:`);
  for (const name of NAMES) console.error(`  - ${name}.mp4`);
  console.error("Place the six owner-supplied MP4s there and re-run pnpm craft:videos.");
  process.exit(1);
}
if (missing.length) {
  console.warn(`Skipping ${missing.length} clip(s) not yet supplied: ${missing.join(", ")}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const name of present) {
  const input = path.join(INPUT_DIR, `${name}.mp4`);
  const mp4 = path.join(OUTPUT_DIR, `${name}.mp4`);
  const webm = path.join(OUTPUT_DIR, `${name}.webm`);
  const poster = path.join(OUTPUT_DIR, `${name}.jpg`);

  // H.264 MP4: CRF 26, no audio, faststart. Step the CRF up if the result
  // exceeds the 2.5 MB budget rather than shipping an overweight file.
  let crf = 26;
  for (;;) {
    ffmpeg(["-i", input, "-an", "-c:v", "libx264", "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
    const size = statSync(mp4).size;
    if (size <= MAX_MP4_BYTES || crf >= 32) {
      if (size > MAX_MP4_BYTES) console.warn(`warning: ${name}.mp4 is ${(size / 1048576).toFixed(2)} MB even at CRF 32`);
      break;
    }
    crf += 2;
  }

  // WebM (VP9) fallback for browsers that prefer it.
  ffmpeg(["-i", input, "-an", "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", webm]);

  // Poster from the last frame.
  ffmpeg(["-sseof", "-0.1", "-i", input, "-frames:v", "1", "-update", "1", "-q:v", "3", poster]);

  console.log(`${name}: mp4 ${(statSync(mp4).size / 1048576).toFixed(2)} MB, webm ${(statSync(webm).size / 1048576).toFixed(2)} MB, poster ok`);
}

console.log("Craft videos encoded into", OUTPUT_DIR);
