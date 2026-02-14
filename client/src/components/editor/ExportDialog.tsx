import React, { useState, useCallback, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Download, FileImage, FileCode, FileJson, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Screen, GameObject, ObjectState } from "@shared/schema";

export type ExportFormat = "png" | "svg" | "json";
export type ExportScope = "selected" | "canvas";
export type ExportScale = 1 | 2 | 3;

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
  objects: GameObject[];
  objectStates: ObjectState[];
  selectedObjectIds: string[];
  canvasRef: HTMLDivElement | null;
  getEffectiveProps: (obj: GameObject) => {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    opacity: number;
    visible: boolean;
  };
}

export function ExportDialog({
  open,
  onOpenChange,
  screen,
  objects,
  objectStates,
  selectedObjectIds,
  canvasRef,
  getEffectiveProps,
}: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportScope, setExportScope] = useState<ExportScope>(
    selectedObjectIds.length > 0 ? "selected" : "canvas"
  );
  const [exportScale, setExportScale] = useState<ExportScale>(1);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedObjectIds.length === 0 && exportScope === "selected") {
      setExportScope("canvas");
    }
  }, [selectedObjectIds, exportScope]);

  const getExportBounds = useCallback(() => {
    if (!screen) return null;

    if (exportScope === "canvas") {
      return {
        x: 0,
        y: 0,
        width: screen.width,
        height: screen.height,
      };
    }

    const selectedObjs = objects.filter((obj) =>
      selectedObjectIds.includes(obj.id)
    );
    if (selectedObjs.length === 0) {
      return {
        x: 0,
        y: 0,
        width: screen.width,
        height: screen.height,
      };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    selectedObjs.forEach((obj) => {
      const props = getEffectiveProps(obj);
      minX = Math.min(minX, props.x);
      minY = Math.min(minY, props.y);
      maxX = Math.max(maxX, props.x + obj.width * props.scaleX);
      maxY = Math.max(maxY, props.y + obj.height * props.scaleY);
    });

    const padding = 10;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: Math.min(screen.width, maxX - minX + padding * 2),
      height: Math.min(screen.height, maxY - minY + padding * 2),
    };
  }, [screen, exportScope, objects, selectedObjectIds, getEffectiveProps]);

  const handleExportPNG = useCallback(async () => {
    if (!canvasRef || !screen) {
      toast({
        title: "Export failed",
        description: "Canvas not available",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const bounds = getExportBounds();
      if (!bounds) throw new Error("Unable to calculate export bounds");

      const canvas = await html2canvas(canvasRef, {
        scale: exportScale,
        backgroundColor: includeBackground ? "#ffffff" : null,
        useCORS: true,
        logging: false,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        windowWidth: screen.width,
        windowHeight: screen.height,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${screen.title || "export"}_${exportScale}x.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "Export successful",
            description: `Exported as PNG at ${exportScale}x scale`,
          });
          onOpenChange(false);
        }
      }, "image/png");
    } catch (error) {
      console.error("PNG export failed:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [canvasRef, screen, exportScale, includeBackground, getExportBounds, onOpenChange]);

  const handleExportSVG = useCallback(() => {
    if (!screen) {
      toast({
        title: "Export failed",
        description: "Screen not available",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const bounds = getExportBounds();
      if (!bounds) throw new Error("Unable to calculate export bounds");

      const objectsToExport =
        exportScope === "selected"
          ? objects.filter((obj) => selectedObjectIds.includes(obj.id))
          : objects;

      const visibleObjects = objectsToExport.filter((obj) => {
        const props = getEffectiveProps(obj);
        return props.visible;
      });

      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" 
     width="${bounds.width}" height="${bounds.height}">
  <title>${screen.title || "Export"}</title>
`;

      if (includeBackground) {
        svgContent += `  <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="white"/>
`;
      }

      const gradientDefs: string[] = [];

      visibleObjects
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        .forEach((obj) => {
          const props = getEffectiveProps(obj);
          const metadata = obj.metadata;

          if (metadata?.gradientDef) {
            const gradientId = `gradient-${obj.id}`;
            const grad = metadata.gradientDef;
            if (grad.type === "linear") {
              gradientDefs.push(`    <linearGradient id="${gradientId}" x1="${grad.x1 || "0%"}" y1="${grad.y1 || "0%"}" x2="${grad.x2 || "100%"}" y2="${grad.y2 || "0%"}">
${grad.stops.map((s) => `      <stop offset="${s.offset}" stop-color="${s.color}"/>`).join("\n")}
    </linearGradient>`);
            } else if (grad.type === "radial") {
              gradientDefs.push(`    <radialGradient id="${gradientId}" cx="${grad.cx || "50%"}" cy="${grad.cy || "50%"}" r="${grad.r || "50%"}">
${grad.stops.map((s) => `      <stop offset="${s.offset}" stop-color="${s.color}"/>`).join("\n")}
    </radialGradient>`);
            }
          }
        });

      if (gradientDefs.length > 0) {
        svgContent += `  <defs>
${gradientDefs.join("\n")}
  </defs>
`;
      }

      visibleObjects
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        .forEach((obj) => {
          const props = getEffectiveProps(obj);
          const metadata = obj.metadata;

          const transform = `translate(${props.x}, ${props.y}) rotate(${props.rotation}) scale(${props.scaleX}, ${props.scaleY})`;
          
          svgContent += `  <g id="${obj.id}" data-name="${obj.name}" transform="${transform}" opacity="${props.opacity}">
`;

          if (metadata?.pathData) {
            const fill = metadata.gradientDef
              ? `url(#gradient-${obj.id})`
              : metadata.fill || "transparent";
            svgContent += `    <path d="${metadata.pathData}" fill="${fill}" stroke="${metadata.stroke || "none"}"/>
`;
          } else if (metadata?.fill || metadata?.gradientDef) {
            const fill = metadata.gradientDef
              ? `url(#gradient-${obj.id})`
              : metadata.fill || "transparent";
            svgContent += `    <rect x="0" y="0" width="${obj.width}" height="${obj.height}" fill="${fill}" stroke="${metadata?.stroke || "none"}"/>
`;
          } else {
            svgContent += `    <rect x="0" y="0" width="${obj.width}" height="${obj.height}" fill="transparent" stroke="#999" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="${obj.width / 2}" y="${obj.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">${obj.name}</text>
`;
          }

          svgContent += `  </g>
`;
        });

      svgContent += `</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${screen.title || "export"}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Exported ${visibleObjects.length} objects as SVG`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("SVG export failed:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [screen, objects, selectedObjectIds, exportScope, includeBackground, getEffectiveProps, getExportBounds, onOpenChange]);

  const handleExportJSON = useCallback(() => {
    if (!screen) {
      toast({
        title: "Export failed",
        description: "Screen not available",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const objectsToExport =
        exportScope === "selected"
          ? objects.filter((obj) => selectedObjectIds.includes(obj.id))
          : objects;

      const exportData = {
        screen: {
          id: screen.id,
          title: screen.title,
          width: screen.width,
          height: screen.height,
        },
        objects: objectsToExport.map((obj) => {
          const props = getEffectiveProps(obj);
          return {
            id: obj.id,
            name: obj.name,
            type: obj.type,
            x: props.x,
            y: props.y,
            width: obj.width,
            height: obj.height,
            rotation: props.rotation,
            scaleX: props.scaleX,
            scaleY: props.scaleY,
            opacity: props.opacity,
            visible: props.visible,
            zIndex: obj.zIndex,
            customId: obj.customId,
            classes: obj.classes,
            tags: obj.tags,
            dataKey: obj.dataKey,
            metadata: obj.metadata,
          };
        }),
        exportedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${screen.title || "export"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Exported ${objectsToExport.length} objects as JSON`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("JSON export failed:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [screen, objects, selectedObjectIds, exportScope, getEffectiveProps, onOpenChange]);

  const handleExport = useCallback(() => {
    switch (exportFormat) {
      case "png":
        handleExportPNG();
        break;
      case "svg":
        handleExportSVG();
        break;
      case "json":
        handleExportJSON();
        break;
    }
  }, [exportFormat, handleExportPNG, handleExportSVG, handleExportJSON]);

  const bounds = getExportBounds();
  const previewAspectRatio = bounds ? bounds.width / bounds.height : 16 / 9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Canvas
          </DialogTitle>
          <DialogDescription>
            Export your canvas or selected objects in various formats.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div
            ref={previewRef}
            className="relative bg-secondary/30 rounded-lg overflow-hidden border"
            style={{
              aspectRatio: previewAspectRatio,
              maxHeight: 200,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              {screen ? (
                <div className="text-center">
                  <div className="font-medium">{screen.title}</div>
                  <div className="text-xs mt-1">
                    {bounds?.width.toFixed(0)} × {bounds?.height.toFixed(0)} px
                    {exportFormat === "png" && exportScale > 1 && (
                      <span className="text-primary ml-1">
                        → {(bounds?.width ?? 0) * exportScale} ×{" "}
                        {(bounds?.height ?? 0) * exportScale} px
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                "No screen selected"
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Scope</Label>
              <RadioGroup
                value={exportScope}
                onValueChange={(v) => setExportScope(v as ExportScope)}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="canvas"
                    id="scope-canvas"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="scope-canvas"
                    className={cn(
                      "flex items-center justify-center rounded-md border-2 p-3 cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                    data-testid="export-scope-canvas"
                  >
                    Entire Canvas
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="selected"
                    id="scope-selected"
                    className="peer sr-only"
                    disabled={selectedObjectIds.length === 0}
                  />
                  <Label
                    htmlFor="scope-selected"
                    className={cn(
                      "flex items-center justify-center rounded-md border-2 p-3 cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                      selectedObjectIds.length === 0 &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    data-testid="export-scope-selected"
                  >
                    Selected ({selectedObjectIds.length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Format</Label>
              <RadioGroup
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as ExportFormat)}
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="png"
                    id="format-png"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="format-png"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer gap-1",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                    data-testid="export-format-png"
                  >
                    <FileImage className="w-5 h-5" />
                    <span className="text-xs">PNG</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="svg"
                    id="format-svg"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="format-svg"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer gap-1",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                    data-testid="export-format-svg"
                  >
                    <FileCode className="w-5 h-5" />
                    <span className="text-xs">SVG</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="json"
                    id="format-json"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="format-json"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer gap-1",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                    data-testid="export-format-json"
                  >
                    <FileJson className="w-5 h-5" />
                    <span className="text-xs">JSON</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {exportFormat === "png" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Scale</Label>
                <RadioGroup
                  value={exportScale.toString()}
                  onValueChange={(v) => setExportScale(parseInt(v) as ExportScale)}
                  className="grid grid-cols-3 gap-3"
                >
                  {[1, 2, 3].map((scale) => (
                    <div key={scale}>
                      <RadioGroupItem
                        value={scale.toString()}
                        id={`scale-${scale}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`scale-${scale}`}
                        className={cn(
                          "flex items-center justify-center rounded-md border-2 p-3 cursor-pointer",
                          "hover:bg-accent hover:text-accent-foreground",
                          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        )}
                        data-testid={`export-scale-${scale}x`}
                      >
                        {scale}x
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-background" className="text-sm font-medium">
                  Include Background
                </Label>
                <p className="text-xs text-muted-foreground">
                  {exportFormat === "png"
                    ? "White background or transparent"
                    : "Add white background to export"}
                </p>
              </div>
              <Switch
                id="include-background"
                checked={includeBackground}
                onCheckedChange={setIncludeBackground}
                data-testid="export-include-background"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="export-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !screen}
            className="gap-2"
            data-testid="export-confirm"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
