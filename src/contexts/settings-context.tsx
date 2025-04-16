
import { createContext, useContext, useEffect, useState } from "react";

export interface UserSettings {
  regexFlags: {
    global: boolean;
    caseInsensitive: boolean;
    multiline: boolean;
    singleLine: boolean;
    unicode: boolean;
    sticky: boolean;
  };
  jwtSettings: {
    defaultExpiration: number;
    algorithm: string;
  };
  markdownSettings: {
    livePreview: boolean;
    defaultView: "split" | "edit" | "preview";
  };
  base64Settings: {
    lineBreaks: boolean;
    urlSafe: boolean;
  };
  converterSettings: {
    defaultInputFormat: string;
    defaultOutputFormat: string;
    prettyPrint: boolean;
  };
  display: {
    fontSize: number;
  };
}

const defaultSettings: UserSettings = {
  regexFlags: {
    global: true,
    caseInsensitive: false,
    multiline: false,
    singleLine: false,
    unicode: false,
    sticky: false,
  },
  jwtSettings: {
    defaultExpiration: 24,
    algorithm: "HS256",
  },
  markdownSettings: {
    livePreview: true,
    defaultView: "split",
  },
  base64Settings: {
    lineBreaks: false,
    urlSafe: false,
  },
  converterSettings: {
    defaultInputFormat: "json",
    defaultOutputFormat: "yaml",
    prettyPrint: true,
  },
  display: {
    fontSize: 14,
  },
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: <K extends keyof UserSettings, S extends keyof UserSettings[K]>(
    category: K,
    setting: S,
    value: UserSettings[K][S]
  ) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("devtoolbox-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("devtoolbox-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = <K extends keyof UserSettings, S extends keyof UserSettings[K]>(
    category: K,
    setting: S,
    value: UserSettings[K][S]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
