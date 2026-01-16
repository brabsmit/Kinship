# Customizing the About Page

The About page is a beautiful overlay that honors the original genealogy researcher and tells the story of your family history project.

## Location

The About page component is located at:
```
/kinship-app/src/components/AboutPage.jsx
```

## What to Customize

### 1. Researcher Name and Dedication

**Find this section** (around line 27):

```jsx
<h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
    Dedicated to [Researcher Name]
</h2>
<p className="text-gray-700 leading-relaxed">
    This project is built upon the tireless work of <strong>[Researcher Name]</strong>,
    who spent [X years] meticulously researching, documenting, and preserving our family's
    history.
```

**Replace:**
- `[Researcher Name]` with the actual name (e.g., "Dorothy Smith Dodge")
- `[X years]` with the number of years they've been researching (e.g., "over 30 years")

**Example:**
```jsx
<h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
    Dedicated to Dorothy Smith Dodge
</h2>
<p className="text-gray-700 leading-relaxed">
    This project is built upon the tireless work of <strong>Dorothy Smith Dodge</strong>,
    who spent over 30 years meticulously researching, documenting, and preserving our family's
    history.
```

### 2. Optional Personal Quote

**Find this section** (around line 38):

```jsx
<p className="text-gray-600 text-sm italic">
    "Every name represents a life lived, a story told, and a legacy passed down.
    This work ensures that none of them are forgotten."
</p>
```

You can replace this with:
- A personal quote from the researcher
- A meaningful family saying
- Or keep the default text

### 3. Credits Section

**Find this section** (around line 117):

```jsx
<p>
    <strong>Research:</strong> [Researcher Name] — Original genealogy research and documentation
</p>
```

**Replace:**
- `[Researcher Name]` with the actual name

You can also add additional credits if others contributed:
```jsx
<p>
    <strong>Research:</strong> Dorothy Smith Dodge — Original genealogy research and documentation
</p>
<p>
    <strong>Additional Research:</strong> John Smith — Military records and ship manifests
</p>
<p>
    <strong>Photo Collection:</strong> Mary Johnson — Historical family photographs
</p>
```

### 4. Project Story (Optional)

**Find "The Story" section** (around line 46):

You can personalize this section to tell your specific story:
- How the research started
- What inspired the project
- Unique challenges overcome
- Special discoveries made

**Example addition:**
```jsx
<p>
    This research began in 1985 when Dorothy discovered a box of letters in her grandmother's
    attic. What started as curiosity about a few names became a three-decade journey across
    archives, libraries, and genealogical societies.
</p>
```

### 5. Vision Section (Optional)

**Find "The Vision" section** (around line 72):

You can customize the vision to reflect your family's specific goals:
- Preserving stories for future generations
- Connecting with distant relatives
- Documenting a specific heritage or culture

## Quick Customization Checklist

Use this checklist to ensure you've personalized all key areas:

- [ ] Replace `[Researcher Name]` in dedication (line ~27)
- [ ] Replace `[X years]` with actual duration (line ~30)
- [ ] Customize or keep default quote (line ~38)
- [ ] Replace `[Researcher Name]` in credits (line ~117)
- [ ] (Optional) Add personal story details
- [ ] (Optional) Add additional contributors
- [ ] (Optional) Customize vision section

## Testing Your Changes

After editing:

1. **Save the file**
2. **Run the dev server**:
   ```bash
   cd kinship-app
   npm run dev
   ```
3. **Open the app** in your browser
4. **Click the Info icon** (ⓘ) in the top-right header
5. **Verify** all customizations appear correctly

## Tips

- Keep the researcher's name prominent and respectful
- Use specific details (years, locations, discoveries) to make it personal
- Consider adding a photo of the researcher if you have permission
- The page is responsive and works on mobile devices
- All text can be edited without breaking the layout

## Need Help?

The About page uses:
- **React** components for interactivity
- **Tailwind CSS** for styling
- Lucide React icons for visual elements

If you need to make layout changes beyond text, refer to the [Tailwind CSS documentation](https://tailwindcss.com/docs).
