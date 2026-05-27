# Desktop Shell, UI, Accessibility & Applications — 46 Skills

Electron compositor, design system, accessibility, desktop apps, JIT compiler.

## Electron Process Isolation (5 skills)

### SK-239: contextBridge Whitelist-Only IPC
`contextBridge.exposeInMainWorld("genosShell", {...})` typed API. nodeIntegration disabled. Secondary bridge with ALLOWED_ROTATION_CHANNELS Set.
- **File:** `devices/desktop/compositor/genos-shell/electron/preload.ts:82`

### SK-240: inotify Directory-Level State Watcher
Watch parent directory, not file. Survives atomic rename. JSON.stringify de-duplication.
- **File:** `devices/desktop/compositor/genos-shell/electron/main.ts:320`

### SK-241: Prototype Pollution–Safe Dot-Path Settings
BANNED_SEGS = {"__proto__", "constructor", "prototype"}. Atomic .tmp → rename. Per-panel dot-path isolation.
- **File:** `devices/desktop/compositor/genos-shell/electron/main.ts:21`

### SK-242: JWT Expiry Guard with 5-Second Grace
base64url decode without signature verification. exp vs Date.now()/1000 - 5. Clear on expiry before returning null.
- **File:** `devices/desktop/compositor/genos-shell/electron/main.ts:204`

### SK-243: iio-sensor-proxy Orientation Bridge
`spawn("monitor-sensor")` + regex parsing. ENOENT → simulated rotation IPC. 4 rotation angles.
- **File:** `devices/desktop/compositor/genos-shell/electron/main.ts:162`

## Design Token System (6 skills)

### SK-244: Dual-Layer Color Architecture (Brand vs Native)
`colors` (brand, #ff7518 orange) and `nativeColors` (system, #3A8FE8 blue). Intentionally different — like macOS app tint vs system accent.
- **File:** `devices/desktop/design-system/src/tokens.ts:25-100`

### SK-245: 8pt Spacing Grid
x1=4, x2=8, x4=16, x6=24, x8=32, x12=48, x16=64. All spacing on-grid. 44px minimum touch targets.
- **File:** `devices/desktop/design-system/src/tokens.ts:147`

### SK-246: Motion Token System
fast=120ms, normal=220ms, slow=340ms. All share cubic-bezier(0.2,0,0.2,1). reducedMotion overrides all to 0ms.
- **File:** `devices/desktop/design-system/src/tokens.ts:196`

### SK-247: Z-Order Compositor Contract
wallpaper=-100, desktop=0, window=100, panel=200, modal=500, dropdown=600, toast=800, tooltip=900, cursor=32767.
- **File:** `devices/desktop/design-system/src/tokens.ts:207`

### SK-248: High Contrast Theme (WCAG AAA)
All pairs ≥7:1 contrast. primary=#00FF00 (15.3:1), danger=#FF6060 (7.09:1), focusRing=#FFFF00 (19.56:1 — visible to all CVD types).
- **File:** `devices/desktop/design-system/src/themes/high-contrast.ts`

### SK-249: Dark Theme as Default
darkTokens re-exports base tokens with semantic aliases. Shell ships dark-first.
- **File:** `devices/desktop/design-system/src/themes/dark.ts`

## Accessibility (11 skills)

### SK-250: Color Vision Deficiency Filters (Machado 2009)
7 CVD modes. 3×3 matrices from IEEE TVCG paper. SVG feColorMatrix. CSS :root filter (no stacking context break).
- **File:** `devices/desktop/design-system/src/accessibility/color-filters.ts`

### SK-251: Reduced Motion Hook
`useReducedMotion()` live-subscribes to prefers-reduced-motion. `motionSafe(css)` wrapper. Safari <14 fallback.
- **File:** `devices/desktop/design-system/src/accessibility/reduced-motion.ts`

### SK-252: Button — 6 States + 44px Touch Target
default/hover/active/focus/disabled/loading. hover via direct DOM write (zero re-render). aria-disabled, aria-busy.
- **File:** `devices/desktop/design-system/src/components/Button.tsx`

### SK-253: Sticky Keys FSM (SK_IDLE → SK_LATCHED → SK_LOCKED)
Per-modifier state machine. Two simultaneous modifiers = clear all (escape hatch). Topbar indicator. Sound callbacks.
- **File:** `devices/desktop/shell/xshell/src/sticky_keys.c`

### SK-254: Filter Keys (Bounce + Slow + Repeat Pipeline)
512-slot hash table. Three independent filters. Modifier keys bypass all filters. Per-key state tracking.
- **File:** `devices/desktop/shell/xshell/src/filter_keys.c`

### SK-255: Caret Browse (F7 + XFRAME Tree Walk)
Arrow nav within text nodes. Ctrl+Arrow = word boundary. xa11y_walk_tree() for inter-node. xa11y_announce() for screen reader.
- **File:** `devices/desktop/shell/xshell/src/caret_browse.c`

### SK-256: Screen Reader (Web Speech API + MutationObserver)
aria-label → aria-describedby → accessible name helper. Assertive cancels speech; polite appends. Ctrl+Alt+S toggle.
- **File:** `compositor/genos-shell/src/renderer/components/Accessibility/ScreenReader.tsx`

### SK-257: Large Cursor (Zero-Rerender SVG Overlay)
Native cursor hidden. useRef + transform:translate on mousemove. 3 color schemes. 64×64 or 96×96px. Ctrl+Alt+L.
- **File:** `compositor/genos-shell/src/renderer/components/Accessibility/LargeCursor.tsx`

### SK-258: Dwell Click (SVG Ring Countdown)
<6px movement threshold. stroke-dashoffset animation. elementFromPoint().click(). Reduced motion: immediate fire. 0.5-3.0s configurable.
- **File:** `compositor/genos-shell/src/renderer/components/Accessibility/DwellClick.tsx`

### SK-259: Switch Control (Scanning Mode)
Single-switch (Space advances+selects) or two-switch (Space/Enter). 4px orange highlight. 0.5-5.0s scan speed. Ctrl+Alt+W.
- **File:** `compositor/genos-shell/src/renderer/components/Accessibility/SwitchControl.tsx`

### SK-260: Activation Lock (inert + Focus Trap)
`inert` on background. useFocusTrap hook. Esc cannot dismiss. Screen readers only announce lock content.
- **File:** `compositor/genos-shell/src/renderer/components/SecurityPrivacy/ActivationLock.tsx`

## Desktop Application Patterns (6 skills)

### SK-261: Emergency SOS (5x Power Press + 3s Countdown)
2000ms rapid-press window. Full-screen #CC0000. 320×64px CANCEL button. Weak extern hooks for XNET. Zero heap allocation.
- **File:** `devices/desktop/shell/xshell/src/emergency_sos.c`

### SK-262: WiFi QR Code (GF(256), Reed-Solomon, 8-Mask Eval)
QR v2-v4, EC level M. Polynomial 0x11D. All 8 mask patterns evaluated, lowest penalty wins. WIFI: URI format.
- **File:** `devices/desktop/shell/xshell/src/wifi_qr.c`

### SK-263: Factory Reset (Two-Step Typed Confirmation)
Step 1: warning dialog. Step 2: type "RESET" exactly. Button color changes on match. PAL IPC byte 'R' to GENSD.
- **File:** `devices/desktop/shell/xshell/src/factory_reset.c`

### SK-264: Night Shift (Kelvin → CSS Filter)
kelvinToFilterCSS: 2700K-6500K → sepia+hue-rotate+saturate. aria-hidden + pointer-events:none overlay.
- **File:** `compositor/genos-shell/src/renderer/components/DisplayFeatures/NightShift.tsx`

### SK-265: Permission Dialog (Contextual per Type)
5 permission types with per-type metadata (label, description, icon, accent color). role=dialog, aria-modal, focus trap.
- **File:** `compositor/genos-shell/src/renderer/components/SystemDialogs/PermissionDialog.tsx`

### SK-266: Privacy Dashboard (XSEC Audit Visualization)
7-day rolling window. Per-permission filter. Revoke button via kernel IPC. Duration display. All data local.
- **File:** `compositor/genos-shell/src/renderer/components/SecurityPrivacy/PrivacyDashboard.tsx`

## JIT Compiler (4 skills)

### SK-267: XJIT IR Opcode Set (24 Scalar + 7 Vector)
NOP, MOV, ADD, SUB, IMUL, CMP, JMP/Jcc, CALL, RET, LOAD, STORE + VEC_LOAD_256, VEC_FMA_231, VEC_BCAST, etc.
- **File:** `devices/desktop/jit/xjit/src/ir.c`

### SK-268: Linear-Scan Register Allocator (14 Regs)
Live range scan. Caller-saved first (9 regs) then callee-saved (5). Spill to [rbp - slot*8].
- **File:** `devices/desktop/jit/xjit/src/regalloc.c`

### SK-269: x86-64 REX Prefix Code Generator
HW_ENC[14] maps to hardware encodings. REX.W+R+B for 64-bit ops. ModRM for register pairs. Prologue/epilogue.
- **File:** `devices/desktop/jit/xjit/src/codegen.c`

### SK-270: AVX2+FMA3 Inference Acceleration
8-wide VFMADD231PS + horizontal reduction. Q4_0 nibble unpack → float → AVX2 dot. ~8x throughput vs scalar.
- **File:** `devices/desktop/jit/xjit/src/avx2_dot.c`, `avx2_matmul.c`

## Cross-Cutting (8 skills)

### SK-271: Tablet Mode Manager (IPC + OSK)
TabletModeContext. CSS transform:rotate. On-screen keyboard on focusin. 1.5x scale for touch targets.
- **File:** `compositor/genos-shell/src/renderer/components/tablet-mode.tsx`

### SK-272: Secure Boot Chain Visualizer
PCR values + pass/fail/warn per stage. UEFI → AetherBoot → kernel PCR[9] → XPKG → TLS → x509 CN.
- **File:** `compositor/genos-shell/src/renderer/components/SecurityPrivacy/SecureBoot.tsx`

### SK-273: Quick Settings (role="switch" Tiles)
WiFi/BT/brightness/volume/rotation-lock/flashlight/hotspot/airplane/DND/battery-saver. Slides from topbar.
- **File:** `compositor/genos-shell/src/renderer/components/DisplayFeatures/QuickSettings.tsx`

### SK-274: Split View (Draggable Divider, Snap Ratios)
25/33/50/67/75% snap ratios. setPointerCapture on divider. useRef for zero state-per-frame.
- **File:** `compositor/genos-shell/src/renderer/components/DisplayFeatures/SplitView.tsx`

### SK-275: Bitmap Digit Glyph Renderer (5×7, scalable)
k_digit_glyphs[10][7] with 5-bit row encoding. Scale factor. Zero dependencies. Usable in panic state.
- **File:** Used in emergency_sos.c countdown

### SK-276: App Launch Map (Typed Enum-Safe)
9 apps enumerated. shell:launch-app IPC validates against map. No arbitrary process spawning.
- **File:** `compositor/genos-shell/electron/main.ts`

## Architecture Patterns (7 meta-skills)

### SK-277: Monolithic-First, Microkernel-Later
Link everything into one ELF. Factor out to user-space ELFs when stability is proven.

### SK-278: Sprint-Gated CI (Never Delete Workflows)
Each sprint gets its own workflow. Regression isolation. CI history tells the complete story.

### SK-279: ADR Discipline with Honest Errata
Negative consequences and known bugs documented alongside decisions. 52+ ADRs.

### SK-280: Sequential Gate Principle
Boot, packages, council — all sequential. Sequential is always debuggable. Parallelize only after correctness.

### SK-281: CI as Architecture Enforcer
Any invariant that code review alone cannot verify needs a CI gate. Use two independent gates.

### SK-282: Append-Only Protocols with Zero-Value Defaults
Every handoff struct, IPC message is append-only. Zero = "not provided, use fallback." Forward compatibility.

### SK-283: 100% Original Constraint as Discipline
No Linux kernel, no third-party OS components. Forces understanding every algorithm. The constraint IS the point.
