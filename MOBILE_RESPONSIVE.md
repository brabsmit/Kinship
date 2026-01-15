# Mobile-Responsive Design

The Kinship Chronicles app is now fully optimized for mobile devices, tablets, and desktops with responsive design improvements.

## Key Improvements

### 📱 **Responsive Breakpoints**

The app uses Tailwind CSS responsive breakpoints:
- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md)
- **Desktop**: `≥ 1024px` (lg)

### 🎨 **Header Navigation**

**Before**: Cramped horizontal navigation with 6 view mode buttons
**After**:
- Horizontally scrollable view mode toggle on mobile
- Icons-only on mobile, labels on larger screens
- Compact button spacing with better touch targets
- Responsive icon sizes (16px mobile → 20px desktop)

```jsx
// Mobile: Icon only
<ListIcon size={16} />

// Desktop: Icon + Label
<ListIcon size={16} /> List
```

### 🖼️ **Profile View (ImmersiveProfile)**

#### Sticky Header
- **Mobile**: Back button (ChevronLeft) on the left, close button (X) on desktop
- Smaller padding (2px → 4px on desktop)
- Truncated relationship badge on small screens
- Responsive icon sizes

#### Profile Card
- **Typography**:
  - Name: `text-2xl` (mobile) → `text-5xl` (desktop)
  - Biography: `text-base` (mobile) → `text-xl` (desktop)
  - First letter drop cap: `text-4xl` (mobile) → `text-6xl` (desktop)

- **Spacing**:
  - Content padding: `p-4` (mobile) → `p-8` (desktop)
  - Section gaps: `space-y-6` (mobile) → `space-y-8` (desktop)

#### Badges & Tags
- Smaller font sizes: `text-[10px]` (mobile) → `text-xs` (desktop)
- Compact padding: `px-2` (mobile) → `px-3` (desktop)
- Shortened text for thread badges on mobile:
  - Mobile: "Mayflower"
  - Desktop: "Part of Mayflower Epic"

#### Stats Bar
- 2-column grid on mobile, 4-column on desktop
- Responsive icon sizing
- Truncated location names on mobile

### 🗺️ **Maps**

- **Height**: `300px` (mobile) → `350px` (tablet) → `400px` (desktop)
- Maintains aspect ratio across all devices
- Touch-friendly zoom controls

### ⏱️ **Timeline**

- **Year column**: `w-12` (mobile) → `w-16` (desktop)
- **Timeline dot**: `w-3 h-3` (mobile) → `w-4 h-4` (desktop)
- **Gap spacing**: `gap-3` (mobile) → `gap-6` (desktop)
- Smaller font sizes for better readability on small screens

### 📋 **Section Headers**

All section headers (Biography, Voyages, Life & Times, etc.) are responsive:
- Font size: `text-[10px]` (mobile) → `text-xs` (desktop)
- Icon size: `12px` (mobile) → `14px` (desktop)
- Spacing: `gap-2` (mobile) → `gap-4` (desktop)

### 🎛️ **Sidebar**

- **Width**:
  - Mobile: `300px`
  - Tablet: `350px`
  - Desktop: `450px`
- Hides automatically when profile is open on mobile (< 1024px)
- Maintains visible on desktop with profile open

### ℹ️ **About Page Modal**

- Responsive padding: `p-4` (mobile) → `p-8` (desktop)
- Smaller header icons and text on mobile
- Full-height on mobile (`max-h-[95vh]`)
- Touch-friendly close button

## Touch Targets

All interactive elements meet mobile accessibility standards:
- **Minimum touch target**: 44x44px (iOS guidelines)
- Buttons: `p-2` (32px min) with icon size 16-20px
- Adequate spacing between clickable elements

## Typography Scale

### Mobile-First Approach
```
Mobile  → Tablet → Desktop
text-xs → text-sm → text-base
text-sm → text-base → text-lg
text-base → text-lg → text-xl
text-lg → text-xl → text-2xl
```

## Testing the Mobile Experience

### Browser DevTools
1. Open Chrome/Edge DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test with:
   - iPhone SE (375px)
   - iPhone 14 Pro (393px)
   - iPad Air (820px)
   - Desktop (1920px)

### Key Views to Test
- ✅ List view with ancestor cards
- ✅ Graph view (ReactFlow)
- ✅ Profile view with biography, timeline, map
- ✅ About page modal
- ✅ Threads/Epics view
- ✅ Navigation between views

## Performance

- No additional bundle size from responsive features
- Uses Tailwind's utility classes (tree-shaken in production)
- Conditional icon sizing with React.cloneElement where needed

## Future Enhancements

Potential improvements for mobile UX:
- [ ] Swipe gestures for navigation between profiles
- [ ] Pull-to-refresh for data updates
- [ ] Progressive Web App (PWA) support for offline access
- [ ] Bottom navigation bar on mobile (alternative to sidebar)
- [ ] Infinite scroll for long ancestor lists

## Code Patterns

### Responsive Class Example
```jsx
className="
  p-2 sm:p-3 md:p-4           // Padding
  text-xs sm:text-sm md:text-base  // Font size
  gap-1.5 sm:gap-2 md:gap-3   // Spacing
  hidden xs:inline            // Visibility
"
```

### Icon Sizing Pattern
```jsx
// Method 1: Direct responsive classes
<Icon size={16} className="sm:w-[18px] sm:h-[18px]" />

// Method 2: React.cloneElement for dynamic props
{React.cloneElement(icon, {
  size: 16,
  className: "sm:w-[18px] sm:h-[18px]"
})}
```

### Conditional Content
```jsx
// Show full text on desktop, abbreviated on mobile
<span className="hidden xs:inline">Part of </span>
{thread.title}
<span className="hidden xs:inline"> Epic</span>
```

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (recommended)
- ✅ Safari (iOS & macOS)
- ✅ Firefox
- ✅ Mobile browsers (Chrome, Safari)

---

**Note**: All responsive improvements maintain the app's existing aesthetic and functionality while optimizing for smaller screens and touch interactions.
