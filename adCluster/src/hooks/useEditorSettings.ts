/**
 * Tiptap 에디터 설정을 관리하는 React 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { EditorSettings, EditorSettingsManager, editorSettingsManager } from '../utils/editorSettings';

export interface UseEditorSettingsReturn {
  settings: EditorSettings | null;
  loading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  updateSection: <K extends keyof EditorSettings>(
    section: K,
    sectionSettings: Partial<EditorSettings[K]>
  ) => void;
  saveSettings: () => Promise<void>;
  applyStyles: () => void;
  resetToDefaults: () => void;
  getSection: <K extends keyof EditorSettings>(section: K) => EditorSettings[K] | null;
}

/**
 * 에디터 설정을 관리하는 커스텀 훅
 */
export const useEditorSettings = (autoLoad: boolean = true): UseEditorSettingsReturn => {
  const [settings, setSettings] = useState<EditorSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 설정 로드
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedSettings = await editorSettingsManager.loadSettings();
      setSettings(loadedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '설정을 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('설정 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    editorSettingsManager.updateSettings(newSettings);
    setSettings(updatedSettings);
  }, [settings]);

  // 특정 섹션 업데이트
  const updateSection = useCallback(<K extends keyof EditorSettings>(
    section: K,
    sectionSettings: Partial<EditorSettings[K]>
  ) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [section]: { ...settings[section], ...sectionSettings }
    };
    editorSettingsManager.updateSection(section, sectionSettings);
    setSettings(updatedSettings);
  }, [settings]);

  // 설정 저장
  const saveSettings = useCallback(async () => {
    setError(null);
    try {
      await editorSettingsManager.saveSettings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '설정을 저장하는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('설정 저장 오류:', err);
      throw err;
    }
  }, []);

  // 스타일 적용
  const applyStyles = useCallback(() => {
    editorSettingsManager.applyStyles();
  }, []);

  // 기본값으로 리셋
  const resetToDefaults = useCallback(() => {
    const defaultSettings = new EditorSettingsManager().getSettings();
    editorSettingsManager.updateSettings(defaultSettings);
    setSettings(defaultSettings);
  }, []);

  // 특정 섹션 가져오기
  const getSection = useCallback(<K extends keyof EditorSettings>(section: K): EditorSettings[K] | null => {
    return settings ? settings[section] : null;
  }, [settings]);

  // 컴포넌트 마운트 시 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadSettings();
    }
  }, [autoLoad, loadSettings]);

  // 설정이 변경될 때마다 스타일 자동 적용
  useEffect(() => {
    if (settings) {
      applyStyles();
    }
  }, [settings, applyStyles]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    updateSection,
    saveSettings,
    applyStyles,
    resetToDefaults,
    getSection
  };
};

/**
 * 특정 설정 섹션만 관리하는 훅
 */
export const useEditorSettingsSection = <K extends keyof EditorSettings>(
  section: K,
  autoLoad: boolean = true
) => {
  const {
    settings,
    loading,
    error,
    loadSettings,
    updateSection,
    saveSettings,
    applyStyles,
    getSection
  } = useEditorSettings(autoLoad);

  const sectionData = getSection(section);
  
  const updateSectionData = useCallback((sectionSettings: Partial<EditorSettings[K]>) => {
    updateSection(section, sectionSettings);
  }, [section, updateSection]);

  return {
    sectionData,
    loading,
    error,
    loadSettings,
    updateSection: updateSectionData,
    saveSettings,
    applyStyles,
    fullSettings: settings
  };
};

/**
 * 테마 관리 전용 훅
 */
export const useEditorTheme = (autoLoad: boolean = true) => {
  const { updateSection, getSection, ...rest } = useEditorSettings(autoLoad);
  
  const themeSettings = getSection('theme');
  const colorSettings = getSection('colors');
  
  const toggleTheme = useCallback(() => {
    if (!themeSettings) return;
    
    const newMode = themeSettings.mode === 'light' ? 'dark' : 'light';
    updateSection('theme', { mode: newMode });
  }, [themeSettings, updateSection]);
  
  const setThemeMode = useCallback((mode: 'light' | 'dark') => {
    updateSection('theme', { mode });
  }, [updateSection]);
  
  const updateThemeColors = useCallback((colors: Partial<EditorSettings['colors']>) => {
    updateSection('colors', colors);
  }, [updateSection]);
  
  const updateDarkModeColors = useCallback((colors: Partial<EditorSettings['theme']['darkMode']>) => {
    if (!themeSettings) return;
    updateSection('theme', {
      darkMode: { ...themeSettings.darkMode, ...colors }
    });
  }, [themeSettings, updateSection]);
  
  return {
    ...rest,
    themeSettings,
    colorSettings,
    currentMode: themeSettings?.mode || 'light',
    isDarkMode: themeSettings?.mode === 'dark',
    toggleTheme,
    setThemeMode,
    updateThemeColors,
    updateDarkModeColors
  };
};

/**
 * 타이포그래피 설정 전용 훅
 */
export const useEditorTypography = (autoLoad: boolean = true) => {
  const { updateSection, getSection, ...rest } = useEditorSettings(autoLoad);
  
  const typography = getSection('typography');
  
  const updateTypography = useCallback((newTypography: Partial<EditorSettings['typography']>) => {
    updateSection('typography', newTypography);
  }, [updateSection]);
  
  const setFontFamily = useCallback((fontFamily: string) => {
    updateSection('typography', { fontFamily });
  }, [updateSection]);
  
  const setFontSize = useCallback((fontSize: string) => {
    updateSection('typography', { fontSize });
  }, [updateSection]);
  
  const setLineHeight = useCallback((lineHeight: number) => {
    updateSection('typography', { lineHeight });
  }, [updateSection]);
  
  return {
    ...rest,
    typography,
    updateTypography,
    setFontFamily,
    setFontSize,
    setLineHeight
  };
};

/**
 * 페이지 레이아웃 설정 전용 훅
 */
export const useEditorPageLayout = (autoLoad: boolean = true) => {
  const { updateSection, getSection, ...rest } = useEditorSettings(autoLoad);
  
  const pageSettings = getSection('page');
  const spacingSettings = getSection('spacing');
  
  const updatePageSettings = useCallback((newPageSettings: Partial<EditorSettings['page']>) => {
    updateSection('page', newPageSettings);
  }, [updateSection]);
  
  const updateSpacingSettings = useCallback((newSpacingSettings: Partial<EditorSettings['spacing']>) => {
    updateSection('spacing', newSpacingSettings);
  }, [updateSection]);
  
  const setPageSize = useCallback((width: string, height: string) => {
    updateSection('page', { width, height });
  }, [updateSection]);
  
  const setOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    updateSection('page', { orientation });
  }, [updateSection]);
  
  const setMargins = useCallback((margins: Partial<EditorSettings['page']['margins']>) => {
    if (!pageSettings) return;
    updateSection('page', {
      margins: { ...pageSettings.margins, ...margins }
    });
  }, [pageSettings, updateSection]);
  
  return {
    ...rest,
    pageSettings,
    spacingSettings,
    updatePageSettings,
    updateSpacingSettings,
    setPageSize,
    setOrientation,
    setMargins
  };
};