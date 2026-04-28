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

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface CaseData {
  id: string;
  projectId?: string; // Optional link to original hearing project
  name: string;
  clientName: string;
  status: 'active' | 'completed' | 'archived';
  technicalInfo: {
    url: string;
    idPass: string;
    server: string;
    memo: string;
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
  cases: CaseData[];
  
  // Security
  pinCode: string;
  isLocked: boolean;
  setPinCode: (pin: string) => void;
  setLocked: (locked: boolean) => void;

  // Dashboard Actions
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updater: (project: ProjectData) => void) => void;
  
  // Case Actions
  createCase: (name: string, projectId?: string) => string;
  deleteCase: (id: string) => void;
  updateCase: (id: string, updater: (c: CaseData) => void) => void;
  convertToCase: (projectId: string) => void;
}

// ---------------------------------------------------------
// Initial Data Generators
// ---------------------------------------------------------
export const generateId = () => Math.random().toString(36).substring(2, 9);

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
    // 目的・ターゲット
    { id: generateId(), category: '① 目的・ターゲット', label: 'サイトの主な目的 (CV、認知、採用等)', value: '' },
    { id: generateId(), category: '① 目的・ターゲット', label: 'ターゲット層 (年齢、性別、属性、悩み等)', value: '' },
    { id: generateId(), category: '① 目的・ターゲット', label: '競合・ベンチマークサイト (URL)', value: '' },
    
    // デザイン・ブランド
    { id: generateId(), category: '② デザイン・ブランド', label: 'キーカラー・イメージカラー', value: '' },
    { id: generateId(), category: '② デザイン・ブランド', label: '全体の雰囲気 (高級、ポップ、信頼感等)', value: '' },
    { id: generateId(), category: '② デザイン・ブランド', label: 'ロゴ・既存ブランド規定の有無', value: '' },
    
    // コンテンツ・素材
    { id: generateId(), category: '③ コンテンツ・素材', label: '必要なページ構成 (TOP、会社概要、ブログ等)', value: '' },
    { id: generateId(), category: '③ コンテンツ・素材', label: '写真・素材の準備状況', value: '' },
    { id: generateId(), category: '③ コンテンツ・素材', label: '各ページの原稿・テキストの準備状況', value: '' },
    
    // 機能・システム
    { id: generateId(), category: '④ 機能・システム', label: '必須機能 (問い合わせ、予約、決済等)', value: '' },
    { id: generateId(), category: '④ 機能・システム', label: 'SNS連携・埋め込み (Instagram, LINE等)', value: '' },
    { id: generateId(), category: '④ 機能・システム', label: '多言語対応の要否', value: '' },
    
    // 技術・運用
    { id: generateId(), category: '⑤ 技術・運用', label: 'ドメイン・サーバーの希望 (新規/既存)', value: '' },
    { id: generateId(), category: '⑤ 技術・運用', label: '更新頻度・サイト運営体制', value: '' },
    { id: generateId(), category: '⑤ 技術・運用', label: 'SEO対策・広告運用の希望', value: '' },
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
      cases: [],
      pinCode: '0000',
      isLocked: true,

      setPinCode: (pin) => set({ pinCode: pin }),
      setLocked: (locked) => set({ isLocked: locked }),
      
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
      },

      createCase: (name: string, projectId?: string) => {
        const id = generateId();
        const newCase: CaseData = {
          id,
          projectId,
          name,
          clientName: '',
          status: 'active',
          technicalInfo: { url: '', idPass: '', server: '', memo: '' },
          todos: [],
          updatedAt: Date.now(),
          createdAt: Date.now()
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

        // 1. Create Case
        const caseId = state.createCase(project.name, project.id);
        state.updateCase(caseId, (c) => {
          c.clientName = project.basicInfo.clientName || project.name;
          c.technicalInfo.url = project.basicInfo.urlOrDomain;
        });

        // 2. Move project to backup folder
        state.updateProject(projectId, (p) => {
          p.folder = 'backup';
        });
      }
    }),
    {
      name: 'alchemist-v5-storage',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Rehydration error:', error);
            return;
          }
          
          // Migration logic: if new state is empty, try to pull from old key
          if (rehydratedState && rehydratedState.projects.length === 0) {
            const storageEngine: any = idbStorage;
            if (storageEngine && storageEngine.getItem) {
              storageEngine.getItem('hears-v3-storage').then((oldDataStr: any) => {
                if (oldDataStr) {
                  try {
                    const oldData = JSON.parse(oldDataStr as string);
                    if (oldData.state && oldData.state.projects) {
                      console.log('Migrating old data...');
                      rehydratedState.projects = oldData.state.projects;
                      // Force update the store
                      useHearsStore.setState({ projects: oldData.state.projects });
                    }
                  } catch (e) {
                    console.error('Migration failed:', e);
                  }
                }
              });
            }
          }
        };
      },
    }
  )
);
