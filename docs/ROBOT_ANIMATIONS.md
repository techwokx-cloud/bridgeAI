# VitalityBridge Robot Animations Guide

## Overview

The VitalityBridge robot companion comes in multiple animated versions, each designed for different contexts and user interactions.

## Robot Versions

### 1. **AnimatedRobot** (Landing Page)
**File**: `components/robot/animated-robot.tsx`
**Size**: Large (full-width hero)
**Used On**: Landing page hero section

#### States:
- **`hover`** — Gentle floating motion (default calm state)
- **`wave`** — Waving hand with heart emoji (greeting/friendly)
- **`fly`** — Flying across screen with motion lines (energetic/playful)
- **`jump`** — Bouncing/jumping motion (joyful/celebratory)

#### Features:
- 4-second state cycle (auto-changes states)
- Glowing effect on antenna
- Pulsing chest light
- Blinking eyes
- Animated mouth expressions
- Status text below robot
- Responds to scroll position (ready for future enhancement)

#### Animations:
```css
robotHover     → Smooth up/down floating
robotFly       → Flying arc motion
robotJump      → Bouncing with squash/stretch
robotWave      → Arm waving motion
glow           → Antenna glow effect
chestLightPulse → Chest light breathing effect
robotEyesBlink  → Automatic blinking
```

#### Usage:
```tsx
import { AnimatedRobot } from "@/components/robot/animated-robot";

export default function Page() {
  return <AnimatedRobot />;
}
```

---

### 2. **MiniRobot** (Conversation & Dashboard)
**File**: `components/robot/mini-robot.tsx`
**Sizes**: `sm` (12x12), `md` (20x20), `lg` (32x32)
**Used On**: Conversation sidebar, dashboard cards, notifications

#### States:
- **`idle`** — Static, neutral expression
- **`listening`** — Tilting side-to-side (attentive)
- **`thinking`** — Slight hover motion (contemplative)
- **`speaking`** — Scaling/pulsing animation (active communication)
- **`happy`** — Curved smile, gentle float (pleased/supportive)

#### Features:
- Adjustable size (3 preset sizes)
- Optional expression indicators
- Pulsing chest light
- Optimized SVG for performance
- Works well in constrained spaces

#### Usage:
```tsx
import { MiniRobot } from "@/components/robot/mini-robot";

// In conversation interface
<MiniRobot state="listening" size="md" />

// On dashboard
<MiniRobot state="idle" size="sm" showExpression={true} />

// During AI response
<MiniRobot state="speaking" size="lg" />
```

---

## Animation Details

### Hover Animation
```css
@keyframes robotHover {
  0%, 100% { transform: translateY(0px) rotateZ(-2deg); }
  50% { transform: translateY(-20px) rotateZ(2deg); }
}
```
**Duration**: 3 seconds
**Effect**: Gentle floating with slight tilt
**Used for**: Calm, welcoming state

### Fly Animation
```css
@keyframes robotFly {
  0% { transform: translateX(-100px) translateY(0) rotateZ(-15deg); opacity: 0; }
  25% { opacity: 1; transform: translateX(0) translateY(-40px) rotateZ(-5deg); }
  50% { transform: translateX(50px) translateY(-80px) rotateZ(5deg); }
  75% { transform: translateX(0) translateY(-40px) rotateZ(-5deg); }
  100% { transform: translateX(-100px) translateY(0) rotateZ(-15deg); opacity: 0; }
}
```
**Duration**: 2 seconds
**Effect**: Arcing flight pattern with motion lines
**Used for**: Playful, energetic moments

### Jump Animation
```css
@keyframes robotJump {
  0% { transform: translateY(0) scaleY(1); }
  25% { transform: translateY(-80px) scaleY(0.9); }
  50% { transform: translateY(-100px) scaleY(0.85); }
  75% { transform: translateY(-40px) scaleY(1.05); }
  100% { transform: translateY(0) scaleY(1); }
}
```
**Duration**: 1.5 seconds (cubic-bezier)
**Effect**: Bouncing with squash/stretch physics
**Used for**: Celebratory, joyful moments

### Wave Animation
```css
@keyframes robotWave {
  0% { transform: rotateZ(0deg); }
  10% { transform: rotateZ(-25deg); }
  20% { transform: rotateZ(0deg); }
  30% { transform: rotateZ(-25deg); }
  40% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(0deg); }
}
```
**Duration**: 1 second
**Effect**: Back-and-forth waving motion
**Used for**: Greeting, friendly acknowledgment

### Listening Animation (MiniRobot)
```css
@keyframes robotListening {
  0%, 100% { transform: rotateZ(0deg); }
  25% { transform: rotateZ(-5deg); }
  75% { transform: rotateZ(5deg); }
}
```
**Duration**: 1 second
**Effect**: Gentle side-to-side tilt
**Used for**: Active listening state

### Chest Light Pulse
```css
@keyframes chestLightPulse {
  0%, 100% {
    r: 8;
    filter: drop-shadow(0 0 12px rgba(40, 184, 196, 0.6));
  }
  50% {
    r: 10;
    filter: drop-shadow(0 0 20px rgba(40, 184, 196, 0.9));
  }
}
```
**Duration**: 2 seconds
**Effect**: Breathing/pulsing light on robot's chest
**Used for**: Continuous indicator that robot is "alive"

### Eye Blink
```css
@keyframes robotEyesBlink {
  0%, 49%, 100% { ry: 6; }
  50%, 51% { ry: 1; }
}
```
**Duration**: 4 seconds (with steps)
**Effect**: Natural blinking at intervals
**Used for**: Always active (makes robot feel alive)

---

## State Transitions

### Landing Page Auto-Cycle
```
hover (4s) → wave (4s) → fly (4s) → jump (4s) → repeat
```

Each state has its own animation that runs for 4 seconds, then transitions smoothly to the next state.

### Conversation Interface States
```
idle ←→ listening (on user speech)
idle ←→ thinking (on API call)
thinking ←→ speaking (on AI response)
speaking → happy (after good interaction)
```

---

## Color & Styling

### Robot Colors
- **Head**: White gradient (#ffffff → #e9e4f1)
- **Antenna**: Purple gradient (#b96fe1 → #7a58cc)
- **Eyes**: Purple (#c99af1)
- **Chest Light**: Cyan (#78d8d5)
- **Body**: Soft white (#f7f4fa)
- **Extremities**: Light lavender (#e2dbea)

### Glow Effects
- **Antenna Glow**: Purple glow (drop-shadow)
- **Eyes Glow**: Purple glow when active
- **Chest Light Glow**: Cyan glow (pulsing)
- **Overall Shadow**: Soft purple shadow (rgba(99, 70, 160, 0.2))

---

## Performance Optimization

### Techniques Used
1. **SVG instead of images** — Scales infinitely, small file size
2. **CSS animations** — GPU-accelerated, smooth 60fps
3. **Minimal redraws** — Using `transform` instead of layout properties
4. **Lazy animation** — Only animate when visible
5. **No JavaScript loops** — Pure CSS @keyframes

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (macOS/iOS)
- Older IE: ❌ Not supported (use fallback)

### Reduced Motion Support
For users with `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .robot-hover,
  .robot-fly,
  .robot-jump,
  .robot-wave {
    animation: none;
    transform: none;
  }
  
  .chest-light-mini {
    animation: none;
  }
}
```

---

## Customization Examples

### Change Robot Colors
Edit `components/robot/animated-robot.tsx`:
```tsx
<stop offset="0%" stopColor="#your-color" />
```

### Change Animation Speed
Modify duration in CSS:
```css
.robot-hover {
  animation: robotHover 5s ease-in-out infinite; /* was 3s */
}
```

### Add New State
1. Add state to type: `type RobotState = "idle" | "hover" | "newState"`
2. Add animation keyframes
3. Add conditional rendering for expression
4. Update state cycle

### Customize Eye Expressions
```tsx
{state === "happy" && (
  <path
    d="M 90 45 Q 95 48 100 45 M 100 45 Q 105 48 110 45"
    stroke="#c99af1"
    strokeWidth="2"
    fill="none"
  />
)}
```

---

## Integration Checklist

### Landing Page
- [x] AnimatedRobot displays
- [x] Auto-cycles through 4 states
- [x] Glowing antenna works
- [x] Chest light pulses
- [x] Eyes blink naturally
- [x] Status text shows current state
- [ ] Responds to scroll (future)
- [ ] Responds to mouse hover (future)

### Conversation Page
- [ ] MiniRobot state changes with conversation
- [ ] Listening animation on user input
- [ ] Thinking animation during API call
- [ ] Speaking animation during AI response
- [ ] Happy animation after positive outcome
- [ ] Smooth transitions between states

### Dashboard
- [ ] MiniRobot displays on cards
- [ ] Shows companion status
- [ ] Animates on new conversation

---

## Future Enhancements

### Potential Additions
1. **Follow mouse cursor** — Eyes track cursor position
2. **Scroll-triggered animations** — Different states at different scroll positions
3. **Interactive mouth** — Sync with audio playback
4. **Gesture system** — Point to UI elements
5. **Emotion expressions** — Happy/sad/confused faces
6. **Voice visualization** — Waveform animation during speech
7. **3D parallax** — Depth effect on landing
8. **Touch reactions** — Robot reacts to clicks
9. **Floating objects** — Particles or objects orbiting robot
10. **Multi-robot scene** — Robot bringing in other robots for different modes

### Sound Sync (Future)
```tsx
// When audio plays, sync robot mouth
const syncMouthToAudio = (audio: HTMLAudioElement) => {
  const analyser = audioContext.createAnalyser();
  // Monitor audio frequency to animate mouth
};
```

---

## Testing Checklist

```bash
# Test landing page
- [ ] npm run dev
- [ ] Visit http://localhost:3000
- [ ] Verify robot states cycle: hover → wave → fly → jump
- [ ] Check animations are smooth
- [ ] Test on mobile (should still animate)
- [ ] Test with reduced-motion enabled

# Test mini robot
- [ ] Use in conversation page
- [ ] Verify states: idle, listening, thinking, speaking, happy
- [ ] Test all sizes: sm, md, lg
- [ ] Verify chest light pulses
- [ ] Check performance with DevTools
```

---

## Troubleshooting

### Robot Not Animating
**Solution**: Check browser console for errors
```bash
# Inspect computed styles
elem.style.animation
```

### Animation Stuttering
**Solution**: Check for expensive operations
- Reduce number of animated elements
- Use CSS transforms only (no layout changes)
- Check browser performance tab

### Eyes Not Blinking
**Solution**: Verify blink keyframe
```css
.robot-eyes {
  animation: robotEyesBlink 4s steps(1, end) infinite;
}
```

### Chest Light Not Glowing
**Solution**: Ensure filter is applied
```tsx
className="chest-light-mini"
/* or */
style={{ filter: "drop-shadow(...)" }}
```

---

## Code Files

### Component Files
- `components/robot/animated-robot.tsx` — Full-size animated robot
- `components/robot/mini-robot.tsx` — Compact robot for conversations

### Usage
```tsx
// Landing page
import { AnimatedRobot } from "@/components/robot/animated-robot";

// Conversation/Dashboard
import { MiniRobot } from "@/components/robot/mini-robot";
```

---

## Summary

The robot companion is the emotional core of VitalityBridge. Its animations make it feel alive, responsive, and trustworthy. The multi-state system allows it to adapt to different conversation contexts while maintaining consistent visual identity.

**Key Principles**:
- ✨ Smooth, natural motion
- 🎭 Expressive through pose & eyes
- ⚡ Performance-first (CSS animations)
- ♿ Accessibility-ready (respects prefers-reduced-motion)
- 🎯 Context-aware (different states for different moments)

---

Happy building! 🤖
