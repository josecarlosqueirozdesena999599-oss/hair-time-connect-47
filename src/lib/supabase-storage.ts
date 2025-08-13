import { supabase } from "@/integrations/supabase/client";

// Types matching the database schema
export interface BarberShopSettings {
  id: string;
  name: string;
  whatsapp: string;
  admin_password: string;
  available_days: string[];
  slots_per_day: number;
  slots_per_hour: number;
  working_hours_start: string;
  working_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  customer_name: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// Settings functions
export const getSettings = async (): Promise<BarberShopSettings | null> => {
  const { data, error } = await supabase
    .from('barbershop_settings')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return data;
};

export const updateSettings = async (settings: Partial<BarberShopSettings>): Promise<boolean> => {
  const { error } = await supabase
    .from('barbershop_settings')
    .update(settings)
    .eq('id', (await getSettings())?.id);
  
  if (error) {
    console.error('Error updating settings:', error);
    return false;
  }
  
  return true;
};

// Services functions
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  
  return data || [];
};

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'active'>): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .insert([service]);
  
  if (error) {
    console.error('Error creating service:', error);
    return false;
  }
  
  return true;
};

export const updateService = async (id: string, service: Partial<Service>): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .update(service)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating service:', error);
    return false;
  }
  
  return true;
};

export const deleteService = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }
  
  return true;
};

// Appointments functions
export const getAppointments = async (date?: string): Promise<Appointment[]> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      service:services(*)
    `)
    .order('appointment_date')
    .order('appointment_time');
  
  if (date) {
    query = query.eq('appointment_date', date);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
  
  return data || [];
};

export const createAppointment = async (appointment: {
  customer_name: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  price: number;
}): Promise<boolean> => {
  const { error } = await supabase
    .from('appointments')
    .insert([appointment]);
  
  if (error) {
    console.error('Error creating appointment:', error);
    return false;
  }
  
  return true;
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<boolean> => {
  const { error } = await supabase
    .from('appointments')
    .update(appointment)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating appointment:', error);
    return false;
  }
  
  return true;
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }
  
  return true;
};

// Expenses functions
export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
  
  return data || [];
};

export const createExpense = async (expense: {
  description: string;
  amount: number;
  expense_date: string;
  category: string;
}): Promise<boolean> => {
  const { error } = await supabase
    .from('expenses')
    .insert([expense]);
  
  if (error) {
    console.error('Error creating expense:', error);
    return false;
  }
  
  return true;
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
  
  return true;
};

// Time slots functions
export const isSlotAvailable = async (date: string, time: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // No appointment found, slot is available
    return true;
  }
  
  // If there's data or another error, slot is not available
  return false;
};

export const generateTimeSlots = async (date: string) => {
  const settings = await getSettings();
  if (!settings) return [];
  
  const slots = [];
  const startHour = parseInt(settings.working_hours_start.split(':')[0]);
  const endHour = parseInt(settings.working_hours_end.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let i = 0; i < settings.slots_per_hour; i++) {
      const minutes = i * (60 / settings.slots_per_hour);
      const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const available = await isSlotAvailable(date, time);
      
      slots.push({
        id: `${date}-${time}`,
        time,
        available
      });
    }
  }
  
  return slots;
};