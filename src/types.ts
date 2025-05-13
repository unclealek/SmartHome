export interface SensorData {
  homeTemp: number;
  cityTemp: number;
  soundLevel: number;
  lightStatus: boolean;
  humidity: number;
}

export interface SensorCardProps {
  title: string;
  value: number | boolean | string;
  unit?: string;
  icon: React.ReactNode;
  subtitle?: string;
}