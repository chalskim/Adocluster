# EditorPage User Guide

This guide explains how to use the EditorPage component and its features.

## Accessing the Editor

To access the editor, navigate to the `/editor` route in the application.

## Interface Overview

The editor interface consists of three main panels:

1. **Left Panel**: File and project navigation
2. **Center Panel**: Main editing area with toolbar and content
3. **Right Panel**: Project information and references

## Features and Usage

### File Navigation (Left Panel)

The left panel contains tabs for different types of content:

- **Projects**: Browse and select project files and notes
- **Library**: Access to document libraries (coming soon)
- **References**: Manage references (coming soon)
- **Tasks**: View and manage tasks (coming soon)

To open a document, simply click on a note in the file tree.

### Formatting Tools (Top Menu Bar)

The top menu bar has three sections:

#### Format Tab
- **Bold/Italic/Underline**: Apply text formatting
- **Text Alignment**: Align text left, center, or right
- **Indent/Outdent**: Increase or decrease paragraph indentation
- **Lists**: Create bulleted or numbered lists

#### Insert Tab
- **Equation**: Insert a LaTeX equation
- **File Attachment**: Add a file attachment
- **Data Tag**: Insert a metadata tag
- **Image**: Insert an image from a URL
- **Table**: Insert a table

#### AI Support Tab
- **Summary**: Generate a summary of the content
- **Translate**: Translate content to another language
- **Continue**: Continue writing based on current content
- **Review**: Check content for errors and suggestions

### Main Editing Area

The main editing area is divided into three sections:

1. **Header**: Document header area
2. **Main Content**: Primary editing area
3. **Footer**: Document footer area

All sections support rich text editing with the tools provided in the toolbar.

### Project Information (Right Panel)

The right panel shows information about the currently selected project:

- **Project Info**: Title, author, and progress information
- **References**: List of references for the current project
- **Collaboration**: Collaboration tools (coming soon)

### Reference Management

In the references tab of the right panel, you can:

- **Add Reference**: Click the "+" button to add a new reference
- **Delete Reference**: Click the trash icon next to a reference to delete it

When adding a reference, you'll be prompted for:
- Author (in format "Name (Year)")
- Title
- Publication information

### Character and Word Count

The status bar at the bottom shows the current character and word count for the main content area.

## Custom Features

### Mathematical Equations

To insert a mathematical equation:
1. Click the "Insert" tab in the toolbar
2. Click the "수식" button
3. Enter your LaTeX equation in the prompt
4. The equation will be rendered in the document

Example: `E = mc^2`

### File Attachments

To insert a file attachment:
1. Click the "Insert" tab in the toolbar
2. Click the "파일 첨부" button
3. Enter the file information when prompted:
   - File name
   - File size (in bytes)
   - File type (MIME type)
4. The file attachment will appear in the document with download option

### Data Tags

To insert a data tag:
1. Click the "Insert" tab in the toolbar
2. Click the "데이터 태그" button
3. Enter the tag type and value when prompted
4. The tag will appear in the document as `{{type: value}}`

## Keyboard Shortcuts

Common keyboard shortcuts supported:
- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+U**: Underline
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo

## Troubleshooting

### Editor Not Loading
- Ensure all dependencies are installed
- Check the browser console for error messages
- Refresh the page

### Equation Not Rendering
- Check that the LaTeX syntax is correct
- Ensure the equation is properly formatted

### File Attachment Issues
- Verify file information is entered correctly
- Check that the file type is valid

## Feedback and Support

For issues or feature requests, please contact the development team.