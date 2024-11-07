// src/store/slices/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InfoUser {
  idUser: number,
  fullName: string,
  phoneNumber: string,
  email: string,
  roleId: string,
  image: string
}

interface StaffData {
  id: number | null;
  fullName: string | null;
}

interface ScheduleData {
  id: string;
  date: string;
  timeType: string;
}

interface TimeSlot {
  valueVi: string;
  valueEn: string;
}

interface Ticket {
  id: number;
  idSchedule: string;
  numberPeople: number;
  phoneCustomer: string;
  nameCustomer: string;
  emailCustomer: string;
  ticketType: string;
  numberAdult: number;
  numberKid: number;
  numberAdultBest: number;
  numberKidBest: number;
  idStaff: number;
  bill: number;
  dishOrder: string;
  priceOrder: number;
  payStatus: boolean;
  payToken: string;
  receiveStatus: boolean;
  createdAt: string;
  updatedAt: string;
  staffData: StaffData;
  scheduleData: ScheduleData;
  timeSlot: TimeSlot;
  tableString: string;
}


interface WorkSchedule {
  date: string,
  timeType: string,
  userData: InfoUser[],
  allCodeData: string
}

// Định nghĩa kiểu cho state
interface CounterState {
  isAuthenticated: boolean,
  route: string,
  token: string,
  inforUser: InfoUser,
  arrTicket: Ticket[];
  arrWorkSchedule: WorkSchedule[]
}


// Khởi tạo state
const initialState: CounterState = {
  isAuthenticated: false,
  route: 'home',
  token: '',
  inforUser: {
    idUser: 0,
    fullName: "",
    phoneNumber: "",
    email: "",
    roleId: "",
    image: ""
  },
  arrTicket: [],
  arrWorkSchedule: []
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setRoute: (state, action: PayloadAction<string>) => {
      state.route = action.payload
    },
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setInfoUser: (state, action: PayloadAction<InfoUser>) => {
      state.inforUser = action.payload
    },
    setArrTicket: (state, action: PayloadAction<Ticket[]>) => {
      state.arrTicket = action.payload
    },
    setArrWorkScheduleStore: (state, action: PayloadAction<WorkSchedule[]>) => {
      state.arrWorkSchedule = action.payload
    }
  },
});

export const { setRoute, setAuth, setToken, setInfoUser, setArrTicket, setArrWorkScheduleStore } = appSlice.actions;
export default appSlice.reducer;
