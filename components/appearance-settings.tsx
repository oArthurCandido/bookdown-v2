"use client";

import * as React from "react";
import { Settings2, Moon, Sun, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppearanceStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AppearanceSettings() {
  const { setTheme, theme } = useTheme();
  const { fontFamily, fontSize, setFontFamily, setFontSize } = useAppearanceStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0" />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Appearance Settings">
          <Settings2 className="h-5 w-5" />
          <span className="sr-only">Appearance Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-6">
          <div className="space-y-2">
            <h4 className="font-medium leading-none flex items-center gap-2">
              <Type className="h-4 w-4" /> Typography
            </h4>
            <p className="text-sm text-muted-foreground">
              Customize the reading experience.
            </p>
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-family">Font Family</Label>
              <RadioGroup
                id="font-family"
                value={fontFamily}
                onValueChange={(val: 'sans' | 'serif') => setFontFamily(val)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sans" id="r1" />
                  <Label htmlFor="r1" className="font-sans">Sans</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serif" id="r2" />
                  <Label htmlFor="r2" style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}>Serif</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Font Size</Label>
                <span className="text-sm text-muted-foreground">{fontSize}px</span>
              </div>
              <Slider
                id="font-size"
                max={24}
                min={12}
                step={1}
                value={[fontSize]}
                onValueChange={(vals) => setFontSize(vals[0])}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between pt-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setTheme('light')}
                    className="h-8 w-8"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setTheme('dark')}
                    className="h-8 w-8"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
