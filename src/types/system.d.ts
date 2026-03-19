interface System {
  import(moduleName: string): Promise<any>;
}

declare var System: System; 