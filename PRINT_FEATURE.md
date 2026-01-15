# Print-Friendly Biography Pages

The Kinship Chronicles app now includes beautiful, print-optimized biography pages that can be saved as PDFs or printed for physical keepsakes.

## Features

✅ **One-Click Printing** - Print button in every ancestor profile
✅ **Print-Optimized Layout** - Clean, professional formatting designed for paper
✅ **PDF Generation** - Save as PDF from browser print dialog
✅ **Complete Information** - Includes all vital stats, family, biography, and tags
✅ **Professional Typography** - Serif fonts and proper spacing for readability
✅ **Page Break Control** - Intelligent page breaks for multi-page biographies

## How to Use

### For Family Members:

1. **Open any ancestor profile** (click on their name in the list or graph view)
2. **Click the printer icon** (🖨️) in the top-right header
3. **The print dialog will appear** automatically
4. **Choose your options:**
   - **Print** → Send to physical printer
   - **Save as PDF** → Create a digital keepsake
   - **Cancel** → Close without printing

### Browser Print Dialog Options:

**Save as PDF:**
- Destination: "Save as PDF" (or "Microsoft Print to PDF" on Windows)
- Click "Save" and choose where to save the file

**Print to Paper:**
- Destination: Select your printer
- Adjust settings as needed (color, orientation, pages)
- Click "Print"

## What's Included in the Print Version

Each printed biography includes:

### Header Section
- **Full name** (large, prominent)
- **Relationship** (e.g., "3rd Great-Grandfather")
- **Life dates** (born - died)

### Vital Statistics
- Born: Date and place
- Died: Date and place
- Married: Date (if available)

### Family
- Father's name
- Mother's name
- Spouse(s) names
- Children names (all listed)

### Notable Attributes
- Tags displayed as badges (Immigrant, War Veteran, Mayflower, etc.)

### Biography
- Full narrative from research notes
- Properly formatted with paragraphs
- Markdown support for formatting

### Immigration (if applicable)
- Ship name
- Ports of departure and arrival
- Year of voyage

### Footer
- Generated timestamp
- Source reference ("Kinship Chronicles")

## Print Layout Details

### Page Size
- Optimized for standard **8.5" x 11"** (US Letter) paper
- Also works well with A4 paper

### Margins
- **0.5 inch margins** on all sides
- Automatically set by the print stylesheet

### Typography
- **Serif font** (Georgia) for professional appearance
- **11pt body text** for comfortable reading
- **Larger headings** for clear hierarchy

### Page Breaks
- Sections stay together when possible (no awkward breaks)
- Biography text flows naturally across pages
- Long biographies may span multiple pages

## Tips for Best Results

### PDF Generation:
1. **Use Chrome or Edge** for best PDF output
2. **Set margins to "Default"** in print dialog
3. **Enable "Background graphics"** for borders
4. **Save to a clear filename** like "John_Smith_Biography.pdf"

### Physical Printing:
1. **Use good quality paper** (24lb or heavier recommended)
2. **Print in color** if tags/icons are included
3. **Consider archival-quality paper** for long-term preservation
4. **Print single-sided** for easier reading

### Sharing:
- **Email PDFs** to family members
- **Print for family reunions** or gatherings
- **Create a physical family album** with printed biographies
- **Include in scrapbooks** or genealogy binders

## Use Cases

**Family Reunion Gift:**
Print biographies of all ancestors and create a bound booklet for each family member.

**Genealogy Research:**
Share printed pages with relatives who may have additional information or corrections.

**Memorial Service:**
Print biography as program insert or handout at funerals/memorial services.

**Physical Archive:**
Create a three-ring binder with printed biographies, organized by branch or generation.

**School Projects:**
Students researching family history can print professional-looking reports.

## Troubleshooting

**Print dialog doesn't open:**
- Check browser popup/print permissions
- Try clicking the print button again
- Manually use Ctrl+P (Cmd+P on Mac) while viewing profile

**Layout looks wrong:**
- Ensure browser zoom is set to 100%
- Check print preview before printing
- Try a different browser

**PDF is blank:**
- Enable "Background graphics" in print settings
- Disable any browser ad-blockers or print blockers
- Try Chrome or Edge instead

**Text is cut off:**
- Check margin settings (should be 0.5in or "Default")
- Try landscape orientation for very wide content
- Reduce browser zoom if necessary

## Technical Details

### Files Involved:
- `kinship-app/src/components/PrintBiography.jsx` - Print-optimized component
- `kinship-app/src/App.jsx` - Print button and integration
- `kinship-app/src/index.css` - Print media queries

### How It Works:
1. Click print button → Shows hidden PrintBiography component
2. Triggers `window.print()` → Opens browser print dialog
3. CSS `@media print` rules → Hide main UI, show only print content
4. After printing → Hides PrintBiography component

### Browser Compatibility:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (limited print support)

---

This feature brings your digital genealogy research into the physical world, creating tangible connections to family history that can be shared, gifted, and preserved for generations.
