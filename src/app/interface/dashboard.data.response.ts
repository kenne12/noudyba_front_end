import {OperationResponse} from "./operation.response";

export interface DashboardDataResponse {
  //charData?: Map<string, DashboardData>;
  charData: any;
  operations?: OperationResponse [];
  contributions?: any [];
  pourcentageParticipation?: number;
  nombreMembres?: number;

  // map.set(key, value) – adds a new entry in the Map.
  // map.get(key) – retrieves the value for a given key from the Map.
  // map.has(key) – checks if a key is present in the Map. Returns true or false.
  // map.size – returns the count of entries in the Map.
  // map.delete(key)
  // nameAgeMapping.clear()

  // for (let key of charData.keys()) {}

  // for (let value of nameAgeMapping.values()) {}
  // for (let [key, value] of nameAgeMapping) {}
}
