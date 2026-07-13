# SCORM 1.2 Structure, Wrapper & Manifest

Standard output: **multi-file SCORM 1.2 package** reporting **progress + completion + score**. SCORM 1.2 is accepted by all major LMSs — Blossom, Cornerstone, Moodle, Canvas, and others. Confirm the target LMS at intake (it's client-dependent) and test on it before delivery.

## File layout
```
course-name/
├── imsmanifest.xml          # SCORM manifest (required, zip root)
├── index.html               # entry point: opening screen + nav map
├── css/
│   └── style.css            # concept-driven design system
├── js/
│   ├── scorm-api.js         # SCORM 1.2 wrapper (below)
│   ├── course.js            # navigation, progress, state
│   └── interactions.js      # interaction components
├── modules/                 # one file (or section) per module
├── assets/                  # images, audio (narration), icons
└── lang/                    # bilingual strings if client requires
    ├── he.json
    └── en.json
```
Zip from **inside** the folder so `imsmanifest.xml` sits at the zip root — the #1 cause of "SCORM import failed".

## SCORM 1.2 API wrapper (js/scorm-api.js)
Finds the LMS API (searches parent/opener frames), initializes, and exposes set/get/commit. Report:
- `cmi.core.lesson_status` → `incomplete` → `completed` (or `passed`/`failed` if scored).
- `cmi.core.score.raw` (+ `score.min` / `score.max`) for assessment score.
- `cmi.core.session_time` on exit.
- `cmi.suspend_data` for progress/resume (which modules done, current position).

```javascript
var SCORM = (function () {
  var api = null, initialized = false;

  function findAPI(win) {
    var tries = 0;
    while (win.API == null && win.parent != null && win.parent != win && tries < 10) {
      tries++; win = win.parent;
    }
    return win.API || (win.opener && win.opener.API) || null;
  }
  function init() {
    api = findAPI(window);
    if (!api) { console.warn("SCORM API not found — running standalone"); return false; }
    initialized = api.LMSInitialize("") === "true";
    if (initialized && get("cmi.core.lesson_status") === "not attempted")
      set("cmi.core.lesson_status", "incomplete");
    return initialized;
  }
  function get(k) { return initialized ? api.LMSGetValue(k) : ""; }
  function set(k, v) { if (initialized) { api.LMSSetValue(k, String(v)); } }
  function commit() { if (initialized) api.LMSCommit(""); }
  function setProgress(json) { set("cmi.suspend_data", JSON.stringify(json)); commit(); }
  function getProgress() { try { return JSON.parse(get("cmi.suspend_data") || "{}"); } catch (e) { return {}; } }
  function setScore(raw, min, max) {
    set("cmi.core.score.raw", raw); set("cmi.core.score.min", min); set("cmi.core.score.max", max);
  }
  function complete(passed) {
    set("cmi.core.lesson_status", passed === undefined ? "completed" : (passed ? "passed" : "failed"));
    commit();
  }
  function finish() { if (initialized) { commit(); api.LMSFinish(""); } }

  window.addEventListener("load", init);
  window.addEventListener("beforeunload", finish);
  return { init, get, set, commit, setProgress, getProgress, setScore, complete, finish };
})();
```

## imsmanifest.xml (template)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="COURSE_ID" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema><schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG">
    <organization identifier="ORG">
      <title>COURSE TITLE</title>
      <item identifier="ITEM1" identifierref="RES1">
        <title>COURSE TITLE</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <!-- list every css/js/asset/module file here -->
    </resource>
  </resources>
</manifest>
```
Every file in the package must be listed under `<resource>`. A common failure is a missing asset reference.

## Mandatory in every lomda
- **Mobile responsive** — flex/grid, % and rem, test at 360px width.
- **Opening screen + navigation map** — title, concept intro, module map showing progress and allowing jump (respecting any locked sequence).

## Bilingual pattern (client-dependent)
- All UI + content strings in `lang/he.json` and `lang/en.json`, keyed identically.
- Language toggle in header; persist choice in suspend_data.
- Switch `dir="rtl"`/`dir="ltr"` and `lang` on `<html>` when toggling; mirror layout.
- Never hardcode user-facing text — always pull from the string table.

## Media extraction (חילוץ תמונות — required when source is PDF/PPTX)
When the source is a PDF or presentation, the images are embedded inside it — they are NOT automatically available. Placeholders alone are not enough.
- **Extract the real images** from the source file into `assets/images/` as an explicit build step (e.g. with `pdfimages`/`pdftoppm` for PDF, or unzip the `.pptx` and read `ppt/media/`).
- Name them meaningfully and wire them into the interactions (hotspots, illustrations) with correct `assets/` paths.
- If extraction isn't possible (low-res, embedded oddly), tell the user which images are missing and what they need to provide, rather than shipping empty hotspots.
- Every extracted file must be listed in `imsmanifest.xml`.

## Single-file preview (גרסת preview — always produce alongside the package)
A multi-file package is correct for the LMS but **cannot be checked by opening index.html alone** — the browser won't load the separate JS/CSS, so the learner sees only an empty shell. This confuses review and looks like a bug.
- Always also output a **single-file `*-PREVIEW.html`** with CSS and JS inlined, so the user can open it directly (in a browser or chat preview) and verify the build visually before uploading.
- Make clear: the PREVIEW file is for visual checking only; the **zip** is what gets uploaded to the LMS. Never upload the inlined preview as the SCORM package.

## Packaging
1. Verify imsmanifest.xml at root and all files referenced (including every extracted image).
2. Run the QA checklist.
3. Zip from inside the folder.
4. Produce the single-file PREVIEW.html.
5. Test on the client's LMS (or SCORM Cloud) before delivery — confirm status, score, and resume actually post.
