declare global {
  interface Window {
    Swal: any;
    Chart: any;
    api: any;
  }
}

export interface User {
  id?: number;
  username: string;
  password?: string;
  role: string;
}

export interface LowStockPart {
  id: number;
  part_code?: string;
  name: string;
  stock: number;
}

export interface AbandonedService {
  id: number;
  ticket_number: string;
  customer_name: string;
  service_status: string;
  days_pending: number;
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
  abandonedServices?: AbandonedService[];
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

export interface Device {
  id: number;
  customer_id: number;
  customer_name?: string;
  device_type: string;
  brand: string;
  model: string;
  serial_number: string;
  color: string;
  accessories: string;
  physical_condition: string;
  notes: string;
}

export interface ServiceOrder {
  id: number;
  ticket_number: string;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  device_id: number;
  device_type?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  customer_complaint: string;
  technician: string;
  estimated_cost: number;
  service_status: string;
  total_cost: number;
  payment_status: string;
  received_date: string;
  estimated_completion_date?: string;
  completed_date?: string;
  diagnosis_result?: string;
  actions_taken?: string;
  technician_notes?: string;
}

export interface ServiceHistory {
  id: number;
  service_order_id: number;
  status: string;
  notes: string;
  created_at: string;
}

export interface ServiceItem {
  id: number;
  service_order_id: number;
  item_type: string;
  spare_part_id?: number | null;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  service_order_id: number;
  payment_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string;
}

export interface Settings {
  id?: number;
  business_name: string;
  phone: string;
  whatsapp?: string;
  address: string;
  receipt_footer: string;
}
