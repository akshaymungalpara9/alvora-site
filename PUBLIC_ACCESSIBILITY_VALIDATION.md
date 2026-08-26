# Public accessibility validation

On 26 August 2026, the rendered Italian public landing page was checked in the browser. The **« Vai al contenuto principale »** skip link received keyboard focus and, when activated, moved focus to the `#main-content` landmark, whose `tabIndex` is `-1` to permit the keyboard hand-off.

The rendered hero, faceting, and laser-station images exposed Italian alternative text. The shared public stylesheet supplies a visible `:focus-visible` outline and a focus-revealed skip link. This verification was performed on public content only and did not access, create, or modify any buyer, inventory, or lead data.

The same flow was then exercised in headless Chromium at an actual `375 × 812` mobile viewport. The Italian skip link received focus, the Enter key moved focus to `#main-content`, the URL hash became `#main-content`, and the target retained `tabIndex=-1` for reliable keyboard hand-off.
