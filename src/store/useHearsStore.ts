import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------
export interface BasicInfo {
  clientName: string;
  managerName: string;
  contact: string;
  location: string;
  phone: string;
  parking: string;
  siteName: string;
  urlOrDomain: string;
  deadline: string;
  budget: string;
}

export interface Equipment {
  id: string;
  name: string;
}

export interface RentalItem {
  id: string;
  name: string;
  price: string;
}

export interface RoomItem {
  id: string;
  roomNumber: string;
  rank: string;
  specialEquipments: Equipment[];
}

export interface GeneralQuestionItem {
  id: string;
  category: string;
  label: string;
  value: string;
}

export interface ProjectData {
  id: string;
  name: string;
  updatedAt: number;
  basicInfo: BasicInfo;
  
  loveHotel: {
    sellingPoints: string;
    commonEquipments: Equipment[];
    rooms: RoomItem[];
    pricing: {
      rest: string;
      stay: string;
      freeTime: string;
      shortTime: string;
      extension: string;
      image: string | null;
    };
    food: {
      welcomeService: boolean;
      midnightMenu: boolean;
      memberPrice: boolean;
      menuImageBase64: string | null;
    };
    system: {
      hotenavi: {
        displays: {
          member: string; // 'ホテナビで表示' | 'HPで表示' | '両方'
          price: string;
          service: string;
          food: string;
        };
        reverseLinks: string; // HPからホテナビへリンクさせる項目
      };
      hasMemberSystem: boolean;
      memberDetails: string;
      hasRental: boolean;
      rentals: RentalItem[];
      hasSale: boolean;
      sales: RentalItem[];
      couponInfo: string;
    };
    access: {
      entryEase: string;
      parkingHiding: string;
      highRoof: boolean;
    };
    memo: string;
    images: {
      basicInfo: string | null;
      rooms: string | null;
      system: string | null;
      access: string | null;
    };
  };
  
  generalQuestions: GeneralQuestionItem[];
  generalImages: Record<string, string>;
}

export interface HearsState {
  projects: ProjectData[];
  
  // Dashboard Actions
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  importProjects: (projects: ProjectData[]) => void;
  
  // Editor Actions
  updateProject: (id: string, updater: (project: ProjectData) => void) => void;
}

// ---------------------------------------------------------
// Initial Data Generators
// ---------------------------------------------------------
export const generateId = () => Math.random().toString(36).substring(2, 9);

const createInitialProject = (name: string): ProjectData => ({
  id: generateId(),
  name,
  updatedAt: Date.now(),
  basicInfo: {
    clientName: '', managerName: '', contact: '', location: '', phone: '', parking: '',
    siteName: '', urlOrDomain: '', deadline: '', budget: ''
  },
  loveHotel: {
    sellingPoints: '',
    commonEquipments: [
      { id: generateId(), name: 'サウナ' },
      { id: generateId(), name: '岩盤浴' },
      { id: generateId(), name: 'カラオケ' },
    ],
    rooms: [
      { id: generateId(), roomNumber: '201', rank: 'A', specialEquipments: [] }
    ],
    pricing: {
      rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null
    },
    food: {
      welcomeService: false, midnightMenu: false, memberPrice: false, menuImageBase64: null
    },
    system: {
      hotenavi: {
        displays: { member: '両方', price: '両方', service: '両方', food: '両方' },
        reverseLinks: ''
      },
      hasMemberSystem: true, memberDetails: '',
      hasRental: true, rentals: [
        { id: generateId(), name: 'コスプレ', price: '無料' },
        { id: generateId(), name: 'ヘアアイロン', price: '無料' },
        { id: generateId(), name: '充電器', price: '無料' },
        { id: generateId(), name: '美顔器', price: '無料' },
        { id: generateId(), name: '各種シャンプー', price: '無料' },
      ],
      hasSale: true, sales: [
        { id: generateId(), name: 'コンタクト保存液', price: '500円' },
        { id: generateId(), name: 'ストッキング', price: '500円' },
        { id: generateId(), name: '生理用品', price: '300円' },
      ],
      couponInfo: ''
    },
    access: {
      entryEase: '', parkingHiding: '', highRoof: false
    },
    memo: '',
    images: { basicInfo: null, rooms: null, system: null, access: null }
  },
  generalQuestions: [
    { id: generateId(), category: '目的・ターゲット', label: 'CV（売上、採用、認知等）', value: '' },
    { id: generateId(), category: 'コンテンツ', label: '強み（USP）', value: '' },
    { id: generateId(), category: '機能', label: '決済・多言語・問い合わせ等', value: '' },
  ],
  generalImages: {}
});

// ---------------------------------------------------------
// IndexedDB Storage Engine
// ---------------------------------------------------------
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

// ---------------------------------------------------------
// Store
// ---------------------------------------------------------
export const useHearsStore = create<HearsState>()(
  persist(
    (set, get) => ({
      projects: [],
      
      createProject: (name: string) => {
        const newProject = createInitialProject(name);
        set((state) => ({
          projects: [...state.projects, newProject]
        }));
        return newProject.id;
      },
      
      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id)
        }));
      },
      
      importProjects: (importedProjects: ProjectData[]) => {
        set({ projects: importedProjects });
      },
      
      updateProject: (id: string, updater: (project: ProjectData) => void) => {
        set((state) => {
          const newProjects = state.projects.map(p => {
            if (p.id === id) {
              const clone = JSON.parse(JSON.stringify(p)); // deep clone
              updater(clone);
              clone.updatedAt = Date.now();
              return clone;
            }
            return p;
          });
          return { projects: newProjects };
        });
      }
    }),
    {
      name: 'hears-v3-storage',
      storage: createJSONStorage(() => idbStorage),
      // To handle migrations if needed, but since we changed the name, it will start fresh.
    }
  )
);
