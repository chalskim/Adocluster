# TOC (Table of Contents) Feature Addition to EditorPage

## Overview
Added a Table of Contents (TOC) feature to the right panel of the EditorPage component. This enhancement provides users with a navigable list of document headings for easier document navigation.

## Changes Made

### 1. Updated RightSidebar Component
- Added a new "TOC" tab button with a list icon
- Implemented TOC content display area
- Created a placeholder TOC generation function
- Added navigation links for each heading

### 2. Added CSS Styles
- Created styles for the TOC list and items
- Implemented hierarchical styling for different heading levels
- Added hover effects for better user experience

## Implementation Details

### New Tab Button
```jsx
<button className={`right-tab ${activeTab === 'toc' ? 'active' : ''}`} onClick={() => setActiveTab('toc')}>
  <i className="fas fa-list"></i><br />목차
</button>
```

### TOC Content Area
```jsx
{activeTab === 'toc' && (
  <div id="toc-content" className="right-tab-content">
    <div className="section-title">목차</div>
    <div className="toc-list">
      {tocItems.map((item) => (
        <div 
          key={item.id} 
          className={`toc-item level-${item.level}`}
          style={{ paddingLeft: `${(item.level - 1) * 20}px` }}
        >
          <a href={`#${item.id}`} className="toc-link">
            {item.text}
          </a>
        </div>
      ))}
    </div>
  </div>
)}
```

### CSS Styles
- `.toc-list`: Container for the table of contents
- `.toc-item`: Individual items with level-based styling
- `.toc-link`: Navigation links with hover effects

## Future Enhancements
1. **Dynamic TOC Generation**: Connect the TOC feature to the actual editor content to automatically extract headings
2. **Real-time Updates**: Update the TOC as the user modifies document headings
3. **Smooth Scrolling**: Implement smooth scrolling when clicking on TOC links
4. **Heading Numbering**: Add automatic heading numbering based on document structure

## Testing
The TOC feature has been tested and is working correctly:
- The new tab button appears in the right panel navigation
- Clicking the TOC tab displays the table of contents
- Placeholder content is displayed with proper hierarchical styling
- Navigation links are functional (though they point to placeholder anchors)

## Files Modified
1. `/src/components/RightSidebar.tsx` - Added TOC tab and content
2. `/src/index.css` - Added TOC styling

## Verification
- TypeScript compilation passes with no errors
- Component renders correctly without breaking existing functionality
- New feature is accessible through the right panel navigation