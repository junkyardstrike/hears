import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get as getIDB, set as setIDB, del as delIDB } from 'idb-keyval';
import { format } from 'date-fns';
import { 
  encryptData, decryptData, 
  saveEncryptedFile, readEncryptedFile 
} from '@/lib/syncService';

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

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface ClientData {
  id: string;
  name: string;
  managerName?: string;
  contact?: string;
  memo?: string;
  updatedAt: number;
}

export interface CaseData {
  id: string;
  projectId?: string;
  name: string;
  clientName: string;
  contractEntity: string;
  clientId?: string;
  status: 'active' | 'completed' | 'archived';
  genre?: string;
  technicalInfo: {
    url: string;
    idPass: string;
    server: string;
    memo: string;
  };
  finance: {
    // For HP/SNS (Stock Type)
    maintenanceFee: number;
    oneTimeFee: number;
    oneTimeFeeTakeHome?: number;
    oneTimeFeeMonth?: string;
    
    // For Spot Type (Other Genres)
    spotFee?: number;
    spotRate?: number; // % (default 40)
    spotMonth?: string;

    revenueStartMonth: string;
  };
  todos: TodoItem[];
  updatedAt: number;
  createdAt: number;
}

export type HearingFolder = 'not-started' | 'in-progress' | 'backup';

export interface ProjectData {
  id: string;
  name: string;
  folder: HearingFolder;
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
          member: string;
          price: string;
          service: string;
          food: string;
        };
        reverseLinks: string;
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
  cases: CaseData[];
  clients: ClientData[];
  globalGenres: string[];
  
  pinCode: string;
  isLocked: boolean;
  setPinCode: (pin: string) => void;
  setLocked: (locked: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  globalFinance: {
    baseSalary: number;
    baseSalaryOverrides?: Record<string, number>; // yyyy-MM -> amount
  };
  updateGlobalFinance: (updater: (f: HearsState['globalFinance']) => void) => void;

  backupSettings: {
    enabled: boolean;
    syncDirHandle?: any;
    masterPassword?: string;
    lastBackupDate?: number;
  };
  setBackupSettings: (settings: Partial<HearsState['backupSettings']>) => void;
  loadSyncDirHandle: () => Promise<void>;

  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updater: (project: ProjectData) => void) => void;
  
  createCase: (name: string, projectId?: string) => string;
  deleteCase: (id: string) => void;
  updateCase: (id: string, updater: (c: CaseData) => void) => void;
  convertToCase: (projectId: string) => void;

  createClient: (name: string) => string;
  deleteClient: (id: string) => void;
  updateClient: (id: string, updater: (client: ClientData) => void) => void;

  addGenre: (name: string) => void;
  deleteGenre: (name: string) => void;

  importData: (rawData: any) => void;
  importDatabase: (fileHandle: any, password: string) => Promise<{ success: boolean; error?: string }>;
  exportDatabase: (directoryHandle: any, password: string) => Promise<{ success: boolean; fileName?: string; error?: string }>;
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

const createInitialProject = (name: string): ProjectData => ({
  id: generateId(),
  name,
  folder: 'not-started',
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
    { id: generateId(), category: '① 目的・ターゲット', label: 'サイトの主な目的 (CV、認知、採用等)', value: '' },
    { id: generateId(), category: '① 目的・ターゲット', label: 'ターゲット層 (年齢、性別、属性、悩み等)', value: '' },
    { id: generateId(), category: '① 目的・ターゲット', label: '競合・ベンチマークサイト (URL)', value: '' },
    { id: generateId(), category: '② デザイン・ブランド', label: 'キーカラー・イメージカラー', value: '' },
    { id: generateId(), category: '② デザイン・ブランド', label: '全体の雰囲気 (高級、ポップ、信頼感等)', value: '' },
    { id: generateId(), category: '② デザイン・ブランド', label: 'ロゴ・既存ブランド規定の有無', value: '' },
    { id: generateId(), category: '③ コンテンツ・素材', label: '必要なページ構成 (TOP、会社概要、ブログ等)', value: '' },
    { id: generateId(), category: '③ コンテンツ・素材', label: '写真・素材の準備状況', value: '' },
    { id: generateId(), category: '③ コンテンツ・素材', label: '各ページの原稿・テキストの準備状況', value: '' },
    { id: generateId(), category: '④ 機能・システム', label: '必須機能 (問い合わせ、予約、決済等)', value: '' },
    { id: generateId(), category: '④ 機能・システム', label: 'SNS連携・埋め込み (Instagram, LINE等)', value: '' },
    { id: generateId(), category: '④ 機能・システム', label: '多言語対応の要否', value: '' },
    { id: generateId(), category: '⑤ 技術・運用', label: 'ドメイン・サーバーの希望 (新規/既存)', value: '' },
    { id: generateId(), category: '⑤ 技術・運用', label: '更新頻度・サイト運営体制', value: '' },
    { id: generateId(), category: '⑤ 技術・運用', label: 'SEO対策・広告運用の希望', value: '' },
  ],
  generalImages: {}
});

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await getIDB(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await setIDB(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await delIDB(name);
  },
};

export const useHearsStore = create<HearsState>()(
  persist(
    (set, get) => ({
      projects: [],
      cases: [],
      clients: [],
      globalGenres: [
        'HP制作',
        'SNS運用',
        'システム開発',
        '保守・運用',
        'コンサルティング'
      ],
      pinCode: '0000',
      isLocked: true,
      mobileMenuOpen: false,
      globalFinance: {
        baseSalary: 200000,
        baseSalaryOverrides: {},
      },
      backupSettings: {
        enabled: false,
        lastBackupDate: undefined,
      },

      setBackupSettings: (settings) => {
        set((state) => {
          const newSettings = { ...state.backupSettings, ...settings };
          // If we have a handle, persist it specifically in IDB since persist middleware can't handle it
          if (settings.syncDirHandle) {
            setIDB('alchemist-sync-dir', settings.syncDirHandle);
          }
          return { backupSettings: newSettings };
        });
      },

      loadSyncDirHandle: async () => {
        const handle = await getIDB<FileSystemDirectoryHandle>('alchemist-sync-dir');
        if (handle) {
          // Verify permission
          const status = await handle.queryPermission({ mode: 'readwrite' });
          if (status === 'granted') {
            set((state) => ({ backupSettings: { ...state.backupSettings, syncDirHandle: handle } }));
          }
        }
      },

      setPinCode: (pin) => set({ pinCode: pin }),
      setLocked: (locked: boolean) => set({ isLocked: locked }),
      setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),

      updateGlobalFinance: (updater) => {
        set((state) => {
          const clone = JSON.parse(JSON.stringify(state.globalFinance));
          updater(clone);
          return { globalFinance: clone };
        });
      },
      
      createProject: (name: string) => {
        const newProject = createInitialProject(name);
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject.id;
      },
      
      deleteProject: (id: string) => {
        set((state) => ({ projects: state.projects.filter(p => p.id !== id) }));
      },
      
      importDatabase: async (fileHandle: FileSystemFileHandle, password: string) => {
        try {
          const encryptedBuffer = await readEncryptedFile(fileHandle);
          const decryptedJson = await decryptData(encryptedBuffer, password);
          const data = JSON.parse(decryptedJson);
          
          set({
            projects: data.projects || [],
            cases: data.cases || [],
            clients: data.clients || [],
            globalFinance: data.globalFinance || { baseSalary: 200000, baseSalaryOverrides: {} }
          });
          return { success: true };
        } catch (e) {
          console.error('Import failed:', e);
          return { success: false, error: '復号に失敗しました。パスワードが違うか、ファイルが破損しています。' };
        }
      },

      exportDatabase: async (directoryHandle: FileSystemDirectoryHandle, password: string) => {
        try {
          const state = get();
          const plainData = JSON.stringify({
            projects: state.projects,
            cases: state.cases,
            clients: state.clients,
            globalFinance: state.globalFinance
          });

          const encryptedBuffer = await encryptData(plainData, password);
          const fileName = `alchemist_db_${format(new Date(), 'yyyyMMdd_HHmmss')}.alchemist`;
          
          await saveEncryptedFile(directoryHandle, fileName, encryptedBuffer);
          return { success: true, fileName };
        } catch (e) {
          console.error('Export failed:', e);
          return { success: false, error: 'エクスポートに失敗しました。' };
        }
      },

      updateProject: (id: string, updater: (project: ProjectData) => void) => {
        set((state) => ({
          projects: state.projects.map(p => {
            if (p.id === id) {
              const clone = JSON.parse(JSON.stringify(p));
              updater(clone);
              if (clone.folder === 'not-started') {
                clone.folder = 'in-progress';
              }
              clone.updatedAt = Date.now();
              return clone;
            }
            return p;
          })
        }));
      },

      importData: (rawData: any) => {
        set((state) => {
          const existingIds = new Set(state.projects.map(p => p.id));
          const processProject = (p: any): ProjectData => {
            const base = createInitialProject(p.name || '不明なプロジェクト');
            let targetId = p.id || base.id;
            if (existingIds.has(targetId)) targetId = generateId();
            return {
              ...base, ...p, id: targetId, updatedAt: p.updatedAt || Date.now(),
              basicInfo: { ...base.basicInfo, ...(p.basicInfo || {}) },
              loveHotel: {
                ...base.loveHotel, ...(p.loveHotel || {}),
                pricing: { ...base.loveHotel.pricing, ...(p.loveHotel?.pricing || {}) },
                food: { ...base.loveHotel.food, ...(p.loveHotel?.food || {}) },
                system: { 
                  ...base.loveHotel.system, ...(p.loveHotel?.system || {}),
                  hotenavi: { ...base.loveHotel.system.hotenavi, ...(p.loveHotel?.system?.hotenavi || {}) }
                },
                access: { ...base.loveHotel.access, ...(p.loveHotel?.access || {}) },
                images: { ...base.loveHotel.images, ...(p.loveHotel?.images || {}) }
              },
              generalQuestions: Array.isArray(p.generalQuestions) && p.generalQuestions.length > 0 ? p.generalQuestions : base.generalQuestions,
              generalImages: { ...base.generalImages, ...(p.generalImages || {}) }
            };
          };
          let newProjects = [...state.projects];
          let newCases = [...state.cases];
          let newClients = [...state.clients];
          if (rawData.projects && Array.isArray(rawData.projects)) {
            newProjects = rawData.projects.map(processProject);
            newCases = rawData.cases || [];
            newClients = rawData.clients || [];
          }
          return { projects: newProjects, cases: newCases, clients: newClients };
        });
      },

      addGenre: (name: string) => {
        set((state) => {
          if (state.globalGenres.includes(name)) return state;
          return { globalGenres: [...state.globalGenres, name] };
        });
      },

      deleteGenre: (name: string) => {
        set((state) => ({ globalGenres: state.globalGenres.filter(g => g !== name) }));
      },

      createCase: (name: string, projectId?: string) => {
        const id = generateId();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const newCase: CaseData = {
          id, projectId, name, clientName: '', contractEntity: '', status: 'active',
          technicalInfo: { url: '', idPass: '', server: '', memo: '' },
          finance: { maintenanceFee: 0, oneTimeFee: 0, revenueStartMonth: currentMonth, spotRate: 40 },
          todos: [], updatedAt: Date.now(), createdAt: Date.now()
        };
        set((state) => ({ cases: [...state.cases, newCase] }));
        return id;
      },

      deleteCase: (id: string) => {
        set((state) => ({ cases: state.cases.filter(c => c.id !== id) }));
      },

      updateCase: (id: string, updater: (c: CaseData) => void) => {
        set((state) => ({
          cases: state.cases.map(c => {
            if (c.id === id) {
              const clone = JSON.parse(JSON.stringify(c));
              updater(clone);
              clone.updatedAt = Date.now();
              return clone;
            }
            return c;
          })
        }));
      },

      convertToCase: (projectId: string) => {
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;
        const caseId = state.createCase(project.name, project.id);
        state.updateCase(caseId, (c) => {
          c.clientName = project.basicInfo.clientName || project.name;
          c.technicalInfo.url = project.basicInfo.urlOrDomain;
        });
        state.updateProject(projectId, (p) => { p.folder = 'backup'; });
      },

      createClient: (name: string) => {
        const id = generateId();
        const newClient: ClientData = { id, name, updatedAt: Date.now() };
        set((state) => ({ clients: [...state.clients, newClient] }));
        return id;
      },

      deleteClient: (id: string) => {
        set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));
      },

      updateClient: (id: string, updater: (client: ClientData) => void) => {
        set((state) => ({
          clients: state.clients.map(c => {
            if (c.id === id) {
              const clone = JSON.parse(JSON.stringify(c));
              updater(clone);
              clone.updatedAt = Date.now();
              return clone;
            }
            return c;
          })
        }));
      }
    }),
    {
      name: 'alchemist-v6-storage',
      storage: createJSONStorage(() => idbStorage)
    }
  )
);
