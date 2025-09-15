/**
 * Tiptap 에디터 설정 관리 유틸리티
 * .edit 파일을 읽고 적용하는 기능을 제공합니다.
 */

// 에디터 설정 타입 정의
export interface EditorSettings {
  editor: {
    name: string;
    version: string;
    description: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: number;
    letterSpacing: string;
    wordSpacing: string;
    textAlign: string;
    textIndent: string;
  };
  spacing: {
    paragraphSpacing: string;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    paddingTop: string;
    paddingBottom: string;
    paddingLeft: string;
    paddingRight: string;
  };
  colors: {
    textColor: string;
    backgroundColor: string;
    selectionColor: string;
    linkColor: string;
    highlightColor: string;
    borderColor: string;
  };
  theme: {
    mode: 'light' | 'dark';
    darkMode: {
      textColor: string;
      backgroundColor: string;
      selectionColor: string;
      linkColor: string;
      highlightColor: string;
      borderColor: string;
    };
  };
  page: {
    width: string;
    height: string;
    orientation: 'portrait' | 'landscape';
    margins: {
      top: string;
      bottom: string;
      left: string;
      right: string;
    };
    background: string;
    shadow: boolean;
    border: boolean;
  };
  header: {
    enabled: boolean;
    height: string;
    fontSize: string;
    fontWeight: string;
    textAlign: string;
    borderBottom: boolean;
    padding: string;
  };
  footer: {
    enabled: boolean;
    height: string;
    fontSize: string;
    fontWeight: string;
    textAlign: string;
    borderTop: boolean;
    padding: string;
    showPageNumber: boolean;
  };
  formatting: {
    bold: { enabled: boolean; fontWeight: string; };
    italic: { enabled: boolean; fontStyle: string; };
    underline: { enabled: boolean; textDecoration: string; };
    strikethrough: { enabled: boolean; textDecoration: string; };
    superscript: { enabled: boolean; verticalAlign: string; fontSize: string; };
    subscript: { enabled: boolean; verticalAlign: string; fontSize: string; };
  };
  headings: {
    [key: string]: {
      fontSize: string;
      fontWeight: string;
      lineHeight: number;
      marginTop: string;
      marginBottom: string;
      color: string;
    };
  };
  lists: {
    bulletList: {
      enabled: boolean;
      marginLeft: string;
      listStyleType: string;
      lineHeight: number;
    };
    orderedList: {
      enabled: boolean;
      marginLeft: string;
      listStyleType: string;
      lineHeight: number;
    };
    taskList: {
      enabled: boolean;
      marginLeft: string;
      checkboxSize: string;
      lineHeight: number;
    };
  };
  tables: {
    enabled: boolean;
    borderCollapse: string;
    borderWidth: string;
    borderColor: string;
    cellPadding: string;
    headerBackground: string;
    headerFontWeight: string;
    stripedRows: boolean;
  };
  blockquote: {
    enabled: boolean;
    borderLeft: string;
    paddingLeft: string;
    marginLeft: string;
    fontStyle: string;
    color: string;
    backgroundColor: string;
  };
  codeBlock: {
    enabled: boolean;
    fontFamily: string;
    fontSize: string;
    backgroundColor: string;
    padding: string;
    borderRadius: string;
    border: string;
    lineHeight: number;
  };
  links: {
    enabled: boolean;
    color: string;
    textDecoration: string;
    hoverColor: string;
    openInNewTab: boolean;
  };
  images: {
    enabled: boolean;
    maxWidth: string;
    height: string;
    borderRadius: string;
    shadow: boolean;
    alignment: string;
    caption: {
      enabled: boolean;
      fontSize: string;
      color: string;
      textAlign: string;
      marginTop: string;
    };
  };
  extensions: {
    placeholder: { enabled: boolean; text: string; color: string; };
    characterCount: { enabled: boolean; limit: number | null; showCount: boolean; };
    wordCount: { enabled: boolean; showCount: boolean; };
    readingTime: { enabled: boolean; wordsPerMinute: number; };
    autoSave: { enabled: boolean; interval: number; showIndicator: boolean; };
    spellCheck: { enabled: boolean; language: string; };
  };
  shortcuts: { [key: string]: string; };
  performance: {
    debounceDelay: number;
    maxHistoryDepth: number;
    lazyLoading: boolean;
    virtualScrolling: boolean;
  };
  accessibility: {
    ariaLabels: boolean;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    highContrast: boolean;
    focusIndicator: boolean;
  };
  export: {
    pdf: { enabled: boolean; format: string; orientation: string; margins: string; includeStyles: boolean; };
    html: { enabled: boolean; includeStyles: boolean; minify: boolean; };
    markdown: { enabled: boolean; flavor: string; };
    docx: { enabled: boolean; template: string | null; };
  };
  collaboration: {
    enabled: boolean;
    realTime: boolean;
    showCursors: boolean;
    showNames: boolean;
    conflictResolution: string;
  };
  metadata: {
    createdAt: string | null;
    updatedAt: string | null;
    author: string | null;
    version: string;
    tags: string[];
    category: string | null;
    language: string;
  };
}

/**
 * 에디터 설정 관리 클래스
 */
export class EditorSettingsManager {
  private settings: EditorSettings | null = null;
  private settingsPath: string;

  constructor(settingsPath: string = './tiptap-editor.edit') {
    this.settingsPath = settingsPath;
  }

  /**
   * .edit 파일에서 설정을 로드합니다.
   */
  async loadSettings(): Promise<EditorSettings> {
    try {
      const response = await fetch(this.settingsPath);
      if (!response.ok) {
        throw new Error(`설정 파일을 불러올 수 없습니다: ${response.statusText}`);
      }
      const settings = await response.json();
      this.settings = settings;
      return settings;
    } catch (error) {
      console.error('설정 파일 로드 중 오류:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * 현재 설정을 반환합니다.
   */
  getSettings(): EditorSettings {
    return this.settings || this.getDefaultSettings();
  }

  /**
   * 특정 설정 섹션을 반환합니다.
   */
  getSection<K extends keyof EditorSettings>(section: K): EditorSettings[K] {
    const settings = this.getSettings();
    return settings[section];
  }

  /**
   * 설정을 업데이트합니다.
   */
  updateSettings(newSettings: Partial<EditorSettings>): void {
    this.settings = { ...this.getSettings(), ...newSettings };
  }

  /**
   * 특정 섹션의 설정을 업데이트합니다.
   */
  updateSection<K extends keyof EditorSettings>(
    section: K,
    sectionSettings: Partial<EditorSettings[K]>
  ): void {
    const currentSettings = this.getSettings();
    currentSettings[section] = { ...currentSettings[section], ...sectionSettings };
    this.settings = currentSettings;
  }

  /**
   * 설정을 파일에 저장합니다.
   */
  async saveSettings(): Promise<void> {
    try {
      const settingsJson = JSON.stringify(this.settings, null, 2);
      // 브라우저 환경에서는 직접 파일 저장이 제한되므로 다운로드로 처리
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tiptap-editor.edit';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('설정 파일 저장 중 오류:', error);
      throw error;
    }
  }

  /**
   * CSS 스타일을 생성합니다.
   */
  generateCSS(): string {
    const settings = this.getSettings();
    const { typography, colors, spacing, theme } = settings;
    
    const currentColors = theme.mode === 'dark' ? theme.darkMode : colors;
    
    return `
      .ProseMirror {
        font-family: ${typography.fontFamily} !important;
        font-size: ${typography.fontSize} !important;
        line-height: ${typography.lineHeight} !important;
        letter-spacing: ${typography.letterSpacing} !important;
        word-spacing: ${typography.wordSpacing} !important;
        text-align: ${typography.textAlign} !important;
        text-indent: ${typography.textIndent} !important;
        color: ${currentColors.textColor} !important;
        background-color: ${currentColors.backgroundColor} !important;
        padding-top: ${spacing.paddingTop} !important;
        padding-bottom: ${spacing.paddingBottom} !important;
        padding-left: ${spacing.paddingLeft} !important;
        padding-right: ${spacing.paddingRight} !important;
        margin-top: ${spacing.marginTop} !important;
        margin-bottom: ${spacing.marginBottom} !important;
        margin-left: ${spacing.marginLeft} !important;
        margin-right: ${spacing.marginRight} !important;
      }
      
      .ProseMirror p {
        margin-bottom: ${spacing.paragraphSpacing} !important;
      }
      
      .ProseMirror::selection {
        background-color: ${currentColors.selectionColor} !important;
      }
      
      .ProseMirror a {
        color: ${currentColors.linkColor} !important;
        text-decoration: ${settings.links.textDecoration} !important;
      }
      
      .ProseMirror a:hover {
        color: ${settings.links.hoverColor} !important;
      }
      
      .ProseMirror mark {
        background-color: ${currentColors.highlightColor} !important;
      }
      
      ${Object.entries(settings.headings).map(([tag, styles]) => `
        .ProseMirror ${tag} {
          font-size: ${styles.fontSize} !important;
          font-weight: ${styles.fontWeight} !important;
          line-height: ${styles.lineHeight} !important;
          margin-top: ${styles.marginTop} !important;
          margin-bottom: ${styles.marginBottom} !important;
          color: ${styles.color === 'inherit' ? currentColors.textColor : styles.color} !important;
        }
      `).join('')}
      
      .ProseMirror blockquote {
        border-left: ${settings.blockquote.borderLeft} !important;
        padding-left: ${settings.blockquote.paddingLeft} !important;
        margin-left: ${settings.blockquote.marginLeft} !important;
        font-style: ${settings.blockquote.fontStyle} !important;
        color: ${settings.blockquote.color} !important;
        background-color: ${settings.blockquote.backgroundColor} !important;
      }
      
      .ProseMirror pre {
        font-family: ${settings.codeBlock.fontFamily} !important;
        font-size: ${settings.codeBlock.fontSize} !important;
        background-color: ${settings.codeBlock.backgroundColor} !important;
        padding: ${settings.codeBlock.padding} !important;
        border-radius: ${settings.codeBlock.borderRadius} !important;
        border: ${settings.codeBlock.border} !important;
        line-height: ${settings.codeBlock.lineHeight} !important;
      }
    `;
  }

  /**
   * 스타일을 DOM에 적용합니다.
   */
  applyStyles(): void {
    const existingStyle = document.getElementById('tiptap-editor-settings');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'tiptap-editor-settings';
    style.textContent = this.generateCSS();
    document.head.appendChild(style);
  }

  /**
   * 기본 설정을 반환합니다.
   */
  private getDefaultSettings(): EditorSettings {
    return {
      editor: {
        name: "Tiptap Editor Settings",
        version: "1.0.0",
        description: "Tiptap 에디터의 기본 설정값입니다."
      },
      typography: {
        fontFamily: "Noto Sans KR, sans-serif",
        fontSize: "16px",
        lineHeight: 1.7,
        letterSpacing: "0px",
        wordSpacing: "0px",
        textAlign: "left",
        textIndent: "0px"
      },
      spacing: {
        paragraphSpacing: "1em",
        marginTop: "0px",
        marginBottom: "0px",
        marginLeft: "0px",
        marginRight: "0px",
        paddingTop: "0px",
        paddingBottom: "40px",
        paddingLeft: "40px",
        paddingRight: "40px"
      },
      colors: {
        textColor: "#1f2937",
        backgroundColor: "#ffffff",
        selectionColor: "#60a5fa",
        linkColor: "#3b82f6",
        highlightColor: "#fef08a",
        borderColor: "#e5e7eb"
      },
      theme: {
        mode: "light",
        darkMode: {
          textColor: "#f9fafb",
          backgroundColor: "#111827",
          selectionColor: "#60a5fa",
          linkColor: "#93c5fd",
          highlightColor: "#fbbf24",
          borderColor: "#374151"
        }
      },
      page: {
        width: "21cm",
        height: "29.7cm",
        orientation: "portrait",
        margins: {
          top: "2.5cm",
          bottom: "2.5cm",
          left: "2cm",
          right: "2cm"
        },
        background: "#ffffff",
        shadow: true,
        border: false
      },
      header: {
        enabled: true,
        height: "1.5cm",
        fontSize: "12px",
        fontWeight: "normal",
        textAlign: "center",
        borderBottom: true,
        padding: "10px"
      },
      footer: {
        enabled: true,
        height: "1.5cm",
        fontSize: "12px",
        fontWeight: "normal",
        textAlign: "center",
        borderTop: true,
        padding: "10px",
        showPageNumber: true
      },
      formatting: {
        bold: { enabled: true, fontWeight: "700" },
        italic: { enabled: true, fontStyle: "italic" },
        underline: { enabled: true, textDecoration: "underline" },
        strikethrough: { enabled: true, textDecoration: "line-through" },
        superscript: { enabled: true, verticalAlign: "super", fontSize: "0.8em" },
        subscript: { enabled: true, verticalAlign: "sub", fontSize: "0.8em" }
      },
      headings: {
        h1: { fontSize: "2em", fontWeight: "700", lineHeight: 1.2, marginTop: "1.5em", marginBottom: "0.5em", color: "inherit" },
        h2: { fontSize: "1.5em", fontWeight: "600", lineHeight: 1.3, marginTop: "1.2em", marginBottom: "0.4em", color: "inherit" },
        h3: { fontSize: "1.25em", fontWeight: "600", lineHeight: 1.4, marginTop: "1em", marginBottom: "0.3em", color: "inherit" },
        h4: { fontSize: "1.1em", fontWeight: "500", lineHeight: 1.5, marginTop: "0.8em", marginBottom: "0.2em", color: "inherit" },
        h5: { fontSize: "1em", fontWeight: "500", lineHeight: 1.6, marginTop: "0.6em", marginBottom: "0.2em", color: "inherit" },
        h6: { fontSize: "0.9em", fontWeight: "500", lineHeight: 1.6, marginTop: "0.5em", marginBottom: "0.1em", color: "inherit" }
      },
      lists: {
        bulletList: { enabled: true, marginLeft: "1.5em", listStyleType: "disc", lineHeight: 1.6 },
        orderedList: { enabled: true, marginLeft: "1.5em", listStyleType: "decimal", lineHeight: 1.6 },
        taskList: { enabled: true, marginLeft: "1.5em", checkboxSize: "16px", lineHeight: 1.6 }
      },
      tables: {
        enabled: true,
        borderCollapse: "collapse",
        borderWidth: "1px",
        borderColor: "#e5e7eb",
        cellPadding: "8px",
        headerBackground: "#f9fafb",
        headerFontWeight: "600",
        stripedRows: false
      },
      blockquote: {
        enabled: true,
        borderLeft: "4px solid #e5e7eb",
        paddingLeft: "1em",
        marginLeft: "0",
        fontStyle: "italic",
        color: "#6b7280",
        backgroundColor: "transparent"
      },
      codeBlock: {
        enabled: true,
        fontFamily: "'Courier New', monospace",
        fontSize: "14px",
        backgroundColor: "#f3f4f6",
        padding: "1em",
        borderRadius: "4px",
        border: "1px solid #e5e7eb",
        lineHeight: 1.4
      },
      links: {
        enabled: true,
        color: "#3b82f6",
        textDecoration: "underline",
        hoverColor: "#1d4ed8",
        openInNewTab: false
      },
      images: {
        enabled: true,
        maxWidth: "100%",
        height: "auto",
        borderRadius: "4px",
        shadow: false,
        alignment: "left",
        caption: {
          enabled: true,
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
          marginTop: "8px"
        }
      },
      extensions: {
        placeholder: { enabled: true, text: "여기에 내용을 입력하세요...", color: "#9ca3af" },
        characterCount: { enabled: true, limit: null, showCount: true },
        wordCount: { enabled: true, showCount: true },
        readingTime: { enabled: true, wordsPerMinute: 200 },
        autoSave: { enabled: true, interval: 30000, showIndicator: true },
        spellCheck: { enabled: true, language: "ko-KR" }
      },
      shortcuts: {
        bold: "Ctrl+B",
        italic: "Ctrl+I",
        underline: "Ctrl+U",
        undo: "Ctrl+Z",
        redo: "Ctrl+Y",
        save: "Ctrl+S",
        selectAll: "Ctrl+A",
        copy: "Ctrl+C",
        paste: "Ctrl+V",
        cut: "Ctrl+X",
        find: "Ctrl+F",
        replace: "Ctrl+H"
      },
      performance: {
        debounceDelay: 300,
        maxHistoryDepth: 100,
        lazyLoading: true,
        virtualScrolling: false
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: false,
        focusIndicator: true
      },
      export: {
        pdf: { enabled: true, format: "A4", orientation: "portrait", margins: "default", includeStyles: true },
        html: { enabled: true, includeStyles: true, minify: false },
        markdown: { enabled: true, flavor: "github" },
        docx: { enabled: false, template: null }
      },
      collaboration: {
        enabled: false,
        realTime: false,
        showCursors: true,
        showNames: true,
        conflictResolution: "last-write-wins"
      },
      metadata: {
        createdAt: null,
        updatedAt: null,
        author: null,
        version: "1.0.0",
        tags: [],
        category: null,
        language: "ko-KR"
      }
    };
  }
}

// 전역 인스턴스 생성
export const editorSettingsManager = new EditorSettingsManager();

// 편의 함수들
export const loadEditorSettings = () => editorSettingsManager.loadSettings();
export const getEditorSettings = () => editorSettingsManager.getSettings();
export const applyEditorStyles = () => editorSettingsManager.applyStyles();
export const saveEditorSettings = () => editorSettingsManager.saveSettings();

// 초기화 함수
export const initializeEditorSettings = async () => {
  await editorSettingsManager.loadSettings();
  editorSettingsManager.applyStyles();
};