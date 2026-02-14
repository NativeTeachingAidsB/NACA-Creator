import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, MousePointer2, Hand, LayoutTemplate, Plus, Monitor, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export interface Screen {
  id: string;
  title: string;
  image: string;
}

interface CanvasProps {
  screens: Screen[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAddScreen: () => void;
}

export function Canvas({ screens, selectedId, onSelect, onAddScreen }: CanvasProps) {
  const [zoom, setZoom] = React.useState([100]);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP Animation for selection
  useGSAP(() => {
    if (selectedId) {
      // Animate the selected element
      gsap.fromTo(`[data-id="${selectedId}"]`,
        { scale: 0.98, opacity: 0.9 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, { scope: containerRef, dependencies: [selectedId] });

  const handleAnimateSelection = () => {
    if (!selectedId) return;
    
    // Demo animation
    gsap.to(`[data-id="${selectedId}"]`, {
      rotation: 360,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(`[data-id="${selectedId}"]`, { rotation: 0 });
      }
    });
  };

  // Check if selectedId is a child of a screen
  // We assume simple matching or if the ID starts with the screen ID
  const isSelected = (screenId: string) => {
    if (selectedId === screenId) return true;
    return selectedId === screenId;
  };

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card z-10 shrink-0">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-accent text-accent-foreground">
                <MousePointer2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move (V)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Hand className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hand Tool (H)</TooltipContent>
          </Tooltip>
          <div className="w-px h-4 bg-border mx-2" />
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 text-xs gap-2"
            onClick={onAddScreen}
          >
            <Monitor className="w-3 h-3" />
            Add Display
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs gap-2 border-primary/50 text-primary hover:bg-primary/10"
            onClick={handleAnimateSelection}
            disabled={!selectedId}
          >
            <Play className="w-3 h-3 fill-current" />
            Animate Selection
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground">Mobile App V1 / Page 1</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom([Math.max(10, zoom[0] - 10)])}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <div className="w-24">
            <Slider 
              value={zoom} 
              onValueChange={setZoom} 
              min={10} 
              max={200} 
              step={10} 
              className="cursor-pointer"
            />
          </div>
          <span className="text-xs w-10 text-right font-mono">{zoom[0]}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom([Math.min(200, zoom[0] + 10)])}>
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Infinite Canvas Area */}
      <div className="flex-1 overflow-auto bg-secondary/30 p-10 relative">
         {/* Dot Grid Background */}
         <div className="absolute inset-0 pointer-events-none opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} 
         />

        <div 
          ref={containerRef}
          className="w-full min-h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 items-start justify-center origin-top-left transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom[0] / 100})` }}
        >
          <AnimatePresence>
            {screens.map((screen) => (
              <div
                key={screen.id}
                data-id={screen.id}
                className={cn(
                  "group relative flex flex-col gap-3 select-none transition-opacity duration-300",
                  isSelected(screen.id) ? "z-20" : "z-10"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(screen.id);
                }}
              >
                {/* Selection Ring & Hover Effect */}
                <div 
                  className={cn(
                    "absolute -inset-4 rounded-xl border-2 transition-all duration-200 pointer-events-none",
                    isSelected(screen.id)
                      ? "border-primary shadow-[0_0_0_4px_rgba(124,58,237,0.1)]" 
                      : "border-transparent opacity-0 group-hover:border-primary/30 group-hover:opacity-100"
                  )} 
                />

                {/* Label Header */}
                <div className="flex items-center justify-between px-1">
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isSelected(screen.id) ? "text-primary" : "text-muted-foreground"
                  )}>
                    {screen.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    375x812
                  </span>
                </div>

                {/* Screen Content */}
                <div className="relative aspect-[9/16] bg-white rounded-lg shadow-sm overflow-hidden border border-border/50 group-hover:shadow-md transition-shadow">
                  <img 
                    src={screen.image} 
                    alt={screen.title} 
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  
                  {/* Overlay for non-selected items */}
                  {selectedId && !isSelected(screen.id) && (
                    <div className="absolute inset-0 bg-background/5 backdrop-blur-[0.5px] transition-all duration-300" />
                  )}
                </div>
              </div>
            ))}
          </AnimatePresence>
          
          {/* Add New Placeholder */}
          <motion.div 
            className="aspect-[9/16] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-accent/5 cursor-pointer transition-colors"
            onClick={onAddScreen}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Add Screen</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
