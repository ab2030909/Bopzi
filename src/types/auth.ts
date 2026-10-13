export type AccountType = 'teacher' | 'student' | 'personal' | 'professional';
export type WorkplaceType = 'school' | 'higher_ed' | 'business' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  workplace?: WorkplaceType;
  gradeLevel?: string;
  organizationName?: string;
  avatarSeed?: string;
  createdAt: string;
}

export const ACCOUNT_TYPE_CONFIG: Record<
  AccountType,
  {
    title: string;
    subtitle: string;
    badge: string;
    color: string;
    icon: string;
  }
> = {
  teacher: {
    title: 'Teacher',
    subtitle: 'K-12 schools, universities & tutoring educators',
    badge: 'Education',
    color: 'from-purple-500 to-indigo-600',
    icon: 'GraduationCap',
  },
  student: {
    title: 'Student',
    subtitle: 'School, college, study groups & homework',
    badge: 'Learner',
    color: 'from-pink-500 to-rose-600',
    icon: 'BookOpen',
  },
  personal: {
    title: 'Personal / Friends',
    subtitle: 'Game nights, trivia parties & family gatherings',
    badge: 'Social',
    color: 'from-amber-500 to-orange-500',
    icon: 'Smile',
  },
  professional: {
    title: 'Professional / Business',
    subtitle: 'Workplace training, all-hands & corporate events',
    badge: 'Work',
    color: 'from-cyan-500 to-blue-600',
    icon: 'Briefcase',
  },
};
