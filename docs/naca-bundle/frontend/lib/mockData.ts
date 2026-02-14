import { 
  Frame, 
  Type, 
  Image as ImageIcon, 
  LayoutGrid, 
  Box, 
  Layers, 
  Component, 
  Folder 
} from "lucide-react";

export type FigmaNode = {
  id: string;
  name: string;
  type: "FRAME" | "TEXT" | "IMAGE" | "GROUP" | "COMPONENT" | "RECTANGLE" | "PAGE" | "ELLIPSE" | "INSTANCE" | "VECTOR" | "LINE";
  children?: FigmaNode[];
  expanded?: boolean;
  visible?: boolean;
  locked?: boolean;
};

export const mockFigmaFile: FigmaNode[] = [
  {
    id: "page-1",
    name: "Mobile App V1",
    type: "PAGE",
    expanded: true,
    children: [
      {
        id: "frame-1",
        name: "Login Screen",
        type: "FRAME",
        children: [
          { id: "comp-1", name: "Header", type: "COMPONENT" },
          { id: "group-1", name: "Input Fields", type: "GROUP", children: [
            { id: "text-1", name: "Email Label", type: "TEXT" },
            { id: "rect-1", name: "Email Input Bg", type: "RECTANGLE" },
            { id: "text-2", name: "Password Label", type: "TEXT" },
            { id: "rect-2", name: "Password Input Bg", type: "RECTANGLE" }
          ]},
          { id: "btn-1", name: "Sign In Button", type: "COMPONENT" }
        ]
      },
      {
        id: "frame-2",
        name: "Dashboard",
        type: "FRAME",
        children: [
          { id: "nav-1", name: "Bottom Navigation", type: "COMPONENT" },
          { id: "chart-1", name: "Activity Chart", type: "GROUP" },
          { id: "list-1", name: "Recent Transactions", type: "GROUP" }
        ]
      },
      {
        id: "frame-3",
        name: "Settings",
        type: "FRAME",
        children: [
          { id: "list-2", name: "Option List", type: "GROUP" },
          { id: "toggle-1", name: "Dark Mode Toggle", type: "COMPONENT" }
        ]
      }
    ]
  },
  {
    id: "page-2",
    name: "Design System",
    type: "PAGE",
    children: [
      { id: "frame-4", name: "Typography", type: "FRAME" },
      { id: "frame-5", name: "Colors", type: "FRAME" },
      { id: "frame-6", name: "Components", type: "FRAME" }
    ]
  }
];

export const getNodeIcon = (type: FigmaNode["type"]) => {
  switch (type) {
    case "PAGE": return Folder;
    case "FRAME": return LayoutGrid;
    case "TEXT": return Type;
    case "IMAGE": return ImageIcon;
    case "GROUP": return Layers;
    case "COMPONENT": return Component;
    case "RECTANGLE": return Box;
    default: return Box;
  }
};
