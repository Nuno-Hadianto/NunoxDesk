export interface User {
  id?: number;
  username: string;
  role: string;
}

export interface LowStockPart {
  id: number;
  part_code?: string;
  name: string;
  stock: number;
}

export interface DashboardStats {
  todayServices: number;
  inProgress: number;
  completed: number;
  incomeMonth: number;
  labaBersih: number;
  chartData: {
    labels: string[];
    values: number[];
  };
  lowStockParts: LowStockPart[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Part {
  id: number;
  part_code: string;
  name: string;
  category: string;
  stock: number;
  buy_price: number;
  sell_price: number;
  unit: string;
  notes: string;
}
