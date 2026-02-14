import { useState, useCallback, useEffect, useMemo } from 'react';
import type { GameObject } from '@shared/schema';

const STORAGE_KEY = 'components';
const INSTANCES_KEY = 'component_instances';

export interface ComponentTemplate {
  name: string;
  type: string;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  metadata: GameObject['metadata'];
  dataKey?: string;
  mediaUrl?: string;
  audioUrl?: string;
  customId?: string;
  classes?: string[];
  tags?: string[];
}

export interface Component {
  id: string;
  name: string;
  sourceObjectId: string;
  template: ComponentTemplate;
  createdAt: string;
}

export interface InstanceOverrides {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  visible?: boolean;
}

export interface InstanceMetadata {
  componentId: string;
  overrides: InstanceOverrides;
}

export interface InstanceData {
  id: string;
  componentId: string;
  objectId: string;
  overrides: InstanceOverrides;
  createdAt: string;
}

function loadComponents(): Component[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load components from localStorage', e);
  }
  return [];
}

function saveComponents(components: Component[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
  } catch (e) {
    console.warn('Failed to save components to localStorage', e);
  }
}

function loadInstances(): InstanceData[] {
  try {
    const stored = localStorage.getItem(INSTANCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load instances from localStorage', e);
  }
  return [];
}

function saveInstances(instances: InstanceData[]): void {
  try {
    localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
  } catch (e) {
    console.warn('Failed to save instances to localStorage', e);
  }
}

export function useComponents() {
  const [components, setComponents] = useState<Component[]>(() => loadComponents());
  const [instances, setInstances] = useState<InstanceData[]>(() => loadInstances());

  useEffect(() => {
    saveComponents(components);
  }, [components]);

  useEffect(() => {
    saveInstances(instances);
  }, [instances]);

  const createComponent = useCallback((object: GameObject): Component => {
    const template: ComponentTemplate = {
      name: object.name,
      type: object.type,
      width: object.width,
      height: object.height,
      rotation: object.rotation ?? 0,
      scaleX: object.scaleX ?? 1,
      scaleY: object.scaleY ?? 1,
      opacity: object.opacity ?? 1,
      visible: object.visible ?? true,
      metadata: object.metadata,
      dataKey: object.dataKey ?? undefined,
      mediaUrl: object.mediaUrl ?? undefined,
      audioUrl: object.audioUrl ?? undefined,
      customId: object.customId ?? undefined,
      classes: object.classes ?? [],
      tags: object.tags ?? [],
    };

    const component: Component = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: object.name,
      sourceObjectId: object.id,
      template,
      createdAt: new Date().toISOString(),
    };

    setComponents(prev => [...prev, component]);
    return component;
  }, []);

  const updateComponentTemplate = useCallback((componentId: string, updates: Partial<ComponentTemplate>): void => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId 
        ? { ...comp, template: { ...comp.template, ...updates } }
        : comp
    ));
  }, []);

  const deleteComponent = useCallback((componentId: string): void => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId));
  }, []);

  const renameComponent = useCallback((componentId: string, name: string): void => {
    setComponents(prev => prev.map(comp =>
      comp.id === componentId ? { ...comp, name } : comp
    ));
  }, []);

  const getComponent = useCallback((componentId: string): Component | undefined => {
    return components.find(c => c.id === componentId);
  }, [components]);

  const getComponentBySourceId = useCallback((sourceObjectId: string): Component | undefined => {
    return components.find(c => c.sourceObjectId === sourceObjectId);
  }, [components]);

  const isObjectMasterComponent = useCallback((objectId: string): boolean => {
    return components.some(c => c.sourceObjectId === objectId);
  }, [components]);

  const isObjectInstance = useCallback((object: GameObject): boolean => {
    return instances.some(inst => inst.objectId === object.id);
  }, [instances]);
  
  const getInstanceByObjectId = useCallback((objectId: string): InstanceData | undefined => {
    return instances.find(inst => inst.objectId === objectId);
  }, [instances]);
  
  const insertInstance = useCallback((
    componentId: string, 
    _templateOverrides: Partial<ComponentTemplate>,
    objectId: string
  ): InstanceData => {
    const instance: InstanceData = {
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      componentId,
      objectId,
      overrides: {},
      createdAt: new Date().toISOString(),
    };
    
    setInstances(prev => [...prev, instance]);
    return instance;
  }, []);
  
  const removeInstance = useCallback((objectId: string): void => {
    setInstances(prev => prev.filter(inst => inst.objectId !== objectId));
  }, []);
  
  const getInstancesOfComponent = useCallback((componentId: string): InstanceData[] => {
    return instances.filter(inst => inst.componentId === componentId);
  }, [instances]);

  const getInstanceMetadata = useCallback((object: GameObject): InstanceMetadata | null => {
    const instance = instances.find(inst => inst.objectId === object.id);
    if (!instance) return null;
    return {
      componentId: instance.componentId,
      overrides: instance.overrides,
    };
  }, [instances]);

  const getEffectiveInstanceProps = useCallback((object: GameObject): Partial<GameObject> => {
    const instanceMeta = getInstanceMetadata(object);
    if (!instanceMeta) return {};

    const component = getComponent(instanceMeta.componentId);
    if (!component) return {};

    const { template } = component;
    const { overrides } = instanceMeta;

    return {
      width: overrides.width ?? template.width,
      height: overrides.height ?? template.height,
      rotation: overrides.rotation ?? template.rotation,
      scaleX: overrides.scaleX ?? template.scaleX,
      scaleY: overrides.scaleY ?? template.scaleY,
      opacity: overrides.opacity ?? template.opacity,
      visible: overrides.visible ?? template.visible,
    };
  }, [getComponent, getInstanceMetadata]);

  const createInstanceData = useCallback((componentId: string, x: number, y: number): {
    props: Partial<GameObject>;
    metadata: Record<string, unknown>;
  } => {
    const component = getComponent(componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }

    const instanceMetadata: InstanceMetadata = {
      componentId,
      overrides: {},
    };

    return {
      props: {
        name: `${component.name} (Instance)`,
        type: component.template.type,
        x,
        y,
        width: component.template.width,
        height: component.template.height,
        rotation: component.template.rotation,
        scaleX: component.template.scaleX,
        scaleY: component.template.scaleY,
        opacity: component.template.opacity,
        visible: component.template.visible,
        dataKey: component.template.dataKey,
        mediaUrl: component.template.mediaUrl,
        audioUrl: component.template.audioUrl,
        customId: undefined,
        classes: [...(component.template.classes || [])],
        tags: [...(component.template.tags || [])],
      },
      metadata: {
        ...component.template.metadata,
        componentId: instanceMetadata.componentId,
        overrides: instanceMetadata.overrides,
      },
    };
  }, [getComponent]);

  const applyOverride = useCallback((
    objectId: string,
    property: keyof InstanceOverrides,
    value: number | boolean
  ): void => {
    setInstances(prev => prev.map(inst => 
      inst.objectId === objectId 
        ? { ...inst, overrides: { ...inst.overrides, [property]: value } }
        : inst
    ));
  }, []);

  const resetOverride = useCallback((
    objectId: string,
    property: keyof InstanceOverrides | null
  ): void => {
    setInstances(prev => prev.map(inst => {
      if (inst.objectId !== objectId) return inst;
      
      if (property === null) {
        return { ...inst, overrides: {} };
      }
      
      const newOverrides = { ...inst.overrides };
      delete newOverrides[property];
      return { ...inst, overrides: newOverrides };
    }));
  }, []);

  const hasOverride = useCallback((object: GameObject, property: keyof InstanceOverrides): boolean => {
    const instanceMeta = getInstanceMetadata(object);
    if (!instanceMeta) return false;
    return instanceMeta.overrides[property] !== undefined;
  }, [getInstanceMetadata]);

  const getComponentForObject = useCallback((object: GameObject): Component | undefined => {
    const instance = instances.find(inst => inst.objectId === object.id);
    if (!instance) return undefined;
    return components.find(c => c.id === instance.componentId);
  }, [components, instances]);
  
  const updateComponent = useCallback((componentId: string, updates: Partial<Component>): void => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, ...updates } : comp
    ));
  }, []);

  return {
    components,
    instances,
    createComponent,
    updateComponent,
    updateComponentTemplate,
    deleteComponent,
    renameComponent,
    getComponent,
    getComponentBySourceId,
    isObjectMasterComponent,
    isObjectInstance,
    insertInstance,
    removeInstance,
    getInstanceByObjectId,
    getInstancesOfComponent,
    getComponentForObject,
    getInstanceMetadata,
    getEffectiveInstanceProps,
    createInstanceData,
    applyOverride,
    resetOverride,
    hasOverride,
  };
}
