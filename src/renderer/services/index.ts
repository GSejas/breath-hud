/**
 * Services barrel export
 * Centralized service access point
 */

export { ConfigService, type ConfigData } from './config-service';
export { StateManager, type AppState, type StateChangeListener } from './state-manager';
export { DataService, type StorageOptions } from './data-service';
