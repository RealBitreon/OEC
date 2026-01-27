// Repository factory - exports singleton instances
// Currently using mock implementations until Supabase is fully configured

import type {
  IUsersRepo,
  ICompetitionsRepo,
  IQuestionsRepo,
  ISubmissionsRepo,
  ITicketsRepo,
  IWheelRepo,
  IWinnersRepo,
  IAuditRepo,
  IParticipantsRepo,
  ITrainingSubmissionsRepo,
} from './interfaces'

import type {
  User,
  Competition,
  Question,
  Submission,
  Ticket,
  WheelRun,
  Winner,
  AuditLog,
  Participant,
  TrainingSubmission,
} from '@/lib/store/types'

// Mock implementations for now - replace with Supabase repos when ready
class MockUsersRepo implements IUsersRepo {
  async getById(id: string): Promise<User | null> {
    return null
  }
  async getByUsername(username: string): Promise<User | null> {
    return null
  }
  async create(data: User): Promise<User> {
    return data
  }
  async update(id: string, patch: Partial<User>): Promise<User> {
    throw new Error('Not implemented')
  }
  async listAll(): Promise<User[]> {
    return []
  }
}

class MockCompetitionsRepo implements ICompetitionsRepo {
  async getActive(): Promise<Competition | null> {
    return null
  }
  async getBySlug(slug: string): Promise<Competition | null> {
    return null
  }
  async getById(id: string): Promise<Competition | null> {
    return null
  }
  async listAll(): Promise<Competition[]> {
    return []
  }
  async listByStatus(status: 'active' | 'archived' | 'draft'): Promise<Competition[]> {
    return []
  }
  async create(data: Competition): Promise<Competition> {
    return data
  }
  async update(id: string, patch: Partial<Competition>): Promise<Competition> {
    throw new Error('Not implemented')
  }
  async archiveActive(): Promise<void> {}
}

class MockQuestionsRepo implements IQuestionsRepo {
  private trainingQuestions: Question[] = [
    // Geography - MCQ
    {
      id: 'demo-1',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'جغرافيا',
      difficulty: 'سهل',
      questionText: 'ما هي عاصمة سلطنة عُمان؟',
      options: ['مسقط', 'صلالة', 'نزوى', 'صحار'],
      correctAnswer: 'مسقط',
      sourceRef: { volume: '1', page: '15', lineFrom: '3', lineTo: '5' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'جغرافيا',
      difficulty: 'متوسط',
      questionText: 'ما هو أعلى جبل في سلطنة عُمان؟',
      options: ['جبل شمس', 'جبل الأخضر', 'جبل حفيت', 'جبل القهر'],
      correctAnswer: 'جبل شمس',
      sourceRef: { volume: '1', page: '42', lineFrom: '8', lineTo: '10' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'جغرافيا',
      difficulty: 'متوسط',
      questionText: 'كم عدد محافظات سلطنة عُمان؟',
      options: ['9', '11', '13', '15'],
      correctAnswer: '11',
      sourceRef: { volume: '1', page: '28', lineFrom: '12', lineTo: '14' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Geography - True/False
    {
      id: 'demo-4',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'جغرافيا',
      difficulty: 'سهل',
      questionText: 'تقع محافظة مسندم في أقصى شمال سلطنة عُمان',
      correctAnswer: 'true',
      sourceRef: { volume: '1', page: '35', lineFrom: '5', lineTo: '7' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Geography - Fill Blank
    {
      id: 'demo-5',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'جغرافيا',
      difficulty: 'متوسط',
      questionText: 'يطل الساحل الشمالي لسلطنة عُمان على _____ عُمان',
      correctAnswer: 'خليج',
      sourceRef: { volume: '1', page: '18', lineFrom: '15', lineTo: '17' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-26',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'جغرافيا',
      difficulty: 'صعب',
      questionText: 'تبلغ مساحة سلطنة عُمان حوالي _____ كيلومتر مربع',
      correctAnswer: '309500',
      sourceRef: { volume: '1', page: '8', lineFrom: '3', lineTo: '5' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // History - MCQ
    {
      id: 'demo-6',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'تاريخ',
      difficulty: 'متوسط',
      questionText: 'من هو مؤسس الدولة البوسعيدية؟',
      options: ['الإمام أحمد بن سعيد', 'السلطان قابوس', 'الإمام سلطان بن سيف', 'السيد سعيد بن سلطان'],
      correctAnswer: 'الإمام أحمد بن سعيد',
      sourceRef: { volume: '2', page: '67', lineFrom: '3', lineTo: '6' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-7',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'تاريخ',
      difficulty: 'سهل',
      questionText: 'في أي عام تولى السلطان قابوس بن سعيد الحكم؟',
      options: ['1970', '1965', '1975', '1980'],
      correctAnswer: '1970',
      sourceRef: { volume: '2', page: '145', lineFrom: '10', lineTo: '12' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // History - True/False
    {
      id: 'demo-8',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'تاريخ',
      difficulty: 'سهل',
      questionText: 'كانت عُمان تُعرف قديماً باسم "مجان"',
      correctAnswer: 'true',
      sourceRef: { volume: '2', page: '12', lineFrom: '8', lineTo: '10' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // History - Fill Blank
    {
      id: 'demo-9',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'تاريخ',
      difficulty: 'متوسط',
      questionText: 'حكم السيد سعيد بن سلطان عُمان و_____ في نفس الوقت',
      correctAnswer: 'زنجبار',
      sourceRef: { volume: '2', page: '89', lineFrom: '15', lineTo: '18' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // History - Essay
    {
      id: 'demo-10',
      competitionId: null,
      isTraining: true,
      type: 'essay',
      category: 'تاريخ',
      difficulty: 'صعب',
      questionText: 'اذكر أهم الإنجازات التي حققتها سلطنة عُمان بعد انضمامها للأمم المتحدة عام 1971',
      correctAnswer: 'تشمل الإنجازات: تطوير العلاقات الدبلوماسية، المشاركة في المنظمات الدولية، تعزيز السلام الإقليمي، والمساهمة في القضايا الإنسانية',
      sourceRef: { volume: '2', page: '178', lineFrom: '5', lineTo: '15' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Culture - MCQ
    {
      id: 'demo-11',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'ثقافة',
      difficulty: 'متوسط',
      questionText: 'ما هي أهم الصناعات التقليدية في عُمان؟',
      options: ['صناعة الخناجر والفضيات', 'صناعة السيارات', 'صناعة الإلكترونيات', 'صناعة الطائرات'],
      correctAnswer: 'صناعة الخناجر والفضيات',
      sourceRef: { volume: '3', page: '45', lineFrom: '12', lineTo: '15' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-12',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'ثقافة',
      difficulty: 'سهل',
      questionText: 'ما هو الزي التقليدي للرجل العُماني؟',
      options: ['الدشداشة والكمة', 'الثوب والغترة', 'القميص والبنطلون', 'الجلابية والطاقية'],
      correctAnswer: 'الدشداشة والكمة',
      sourceRef: { volume: '3', page: '78', lineFrom: '3', lineTo: '6' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Culture - True/False
    {
      id: 'demo-13',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'ثقافة',
      difficulty: 'سهل',
      questionText: 'الخنجر العُماني هو جزء من الزي الرسمي للرجل العُماني',
      correctAnswer: 'true',
      sourceRef: { volume: '3', page: '82', lineFrom: '8', lineTo: '10' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Culture - Fill Blank
    {
      id: 'demo-14',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'ثقافة',
      difficulty: 'متوسط',
      questionText: 'الرقصة التقليدية الشهيرة في عُمان تسمى _____',
      correctAnswer: 'البرعة',
      sourceRef: { volume: '3', page: '112', lineFrom: '15', lineTo: '18' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-29',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'ثقافة',
      difficulty: 'صعب',
      questionText: 'يُعتبر _____ من أشهر الشعراء العُمانيين في العصر الحديث',
      correctAnswer: 'سيف الرحبي',
      sourceRef: { volume: '3', page: '156', lineFrom: '8', lineTo: '11' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Culture - Essay
    {
      id: 'demo-15',
      competitionId: null,
      isTraining: true,
      type: 'essay',
      category: 'ثقافة',
      difficulty: 'صعب',
      questionText: 'اشرح أهمية اللبان في التاريخ والثقافة العُمانية',
      correctAnswer: 'اللبان له أهمية تاريخية كبيرة في عُمان، حيث كان من أهم السلع التجارية في العصور القديمة، ويُستخدم في المناسبات الدينية والاجتماعية، وتشتهر محافظة ظفار بإنتاجه',
      sourceRef: { volume: '3', page: '134', lineFrom: '5', lineTo: '18' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Heritage - MCQ
    {
      id: 'demo-16',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'تراث',
      difficulty: 'متوسط',
      questionText: 'ما هي القلعة الشهيرة في محافظة نزوى؟',
      options: ['قلعة نزوى', 'قلعة بهلا', 'قلعة الجلالي', 'قلعة الميراني'],
      correctAnswer: 'قلعة نزوى',
      sourceRef: { volume: '4', page: '23', lineFrom: '10', lineTo: '13' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Heritage - True/False
    {
      id: 'demo-17',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'تراث',
      difficulty: 'سهل',
      questionText: 'تم إدراج أفلاج عُمان ضمن قائمة التراث العالمي لليونسكو',
      correctAnswer: 'true',
      sourceRef: { volume: '4', page: '56', lineFrom: '3', lineTo: '5' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Heritage - Fill Blank
    {
      id: 'demo-18',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'تراث',
      difficulty: 'متوسط',
      questionText: 'دار الأوبرا السلطانية تقع في محافظة _____',
      correctAnswer: 'مسقط',
      sourceRef: { volume: '4', page: '89', lineFrom: '12', lineTo: '15' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Heritage - Essay
    {
      id: 'demo-19',
      competitionId: null,
      isTraining: true,
      type: 'essay',
      category: 'تراث',
      difficulty: 'صعب',
      questionText: 'صف أهمية وادي شاب كموقع سياحي في محافظة جنوب الشرقية',
      correctAnswer: 'وادي شاب من أهم المواقع السياحية الطبيعية في عُمان، يتميز بمناظره الخلابة والمياه الزرقاء الصافية، ويجذب السياح من مختلف أنحاء العالم للسباحة والمشي',
      sourceRef: { volume: '4', page: '145', lineFrom: '8', lineTo: '20' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Tourism - True/False
    {
      id: 'demo-20',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'سياحة',
      difficulty: 'سهل',
      questionText: 'تشتهر محافظة ظفار بموسم الخريف السياحي',
      correctAnswer: 'true',
      sourceRef: { volume: '4', page: '167', lineFrom: '15', lineTo: '17' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Tourism - Essay
    {
      id: 'demo-27',
      competitionId: null,
      isTraining: true,
      type: 'essay',
      category: 'سياحة',
      difficulty: 'صعب',
      questionText: 'اذكر ثلاثة من أهم المواقع السياحية في محافظة مسقط واشرح أهميتها',
      correctAnswer: 'من أهم المواقع: دار الأوبرا السلطانية (مركز ثقافي وفني)، قلعة الجلالي والميراني (تراث تاريخي)، المتحف الوطني (حفظ التراث العُماني)',
      sourceRef: { volume: '4', page: '201', lineFrom: '10', lineTo: '25' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Economy - MCQ
    {
      id: 'demo-21',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'اقتصاد',
      difficulty: 'سهل',
      questionText: 'ما هو المورد الطبيعي الرئيسي لاقتصاد عُمان؟',
      options: ['النفط والغاز', 'الذهب', 'الماس', 'الفحم'],
      correctAnswer: 'النفط والغاز',
      sourceRef: { volume: '5', page: '34', lineFrom: '5', lineTo: '8' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-22',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'اقتصاد',
      difficulty: 'متوسط',
      questionText: 'ما هو اسم الميناء الرئيسي في محافظة ظفار؟',
      options: ['ميناء صلالة', 'ميناء السلطان قابوس', 'ميناء صحار', 'ميناء الدقم'],
      correctAnswer: 'ميناء صلالة',
      sourceRef: { volume: '5', page: '78', lineFrom: '12', lineTo: '15' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Economy - True/False
    {
      id: 'demo-23',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'اقتصاد',
      difficulty: 'سهل',
      questionText: 'تسعى رؤية عُمان 2040 إلى تنويع مصادر الدخل الوطني',
      correctAnswer: 'true',
      sourceRef: { volume: '5', page: '112', lineFrom: '3', lineTo: '6' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Economy - Fill Blank
    {
      id: 'demo-24',
      competitionId: null,
      isTraining: true,
      type: 'fill_blank',
      category: 'اقتصاد',
      difficulty: 'سهل',
      questionText: 'العملة الرسمية لسلطنة عُمان هي _____ العُماني',
      correctAnswer: 'الريال',
      sourceRef: { volume: '5', page: '145', lineFrom: '8', lineTo: '10' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Economy - Essay
    {
      id: 'demo-30',
      competitionId: null,
      isTraining: true,
      type: 'essay',
      category: 'اقتصاد',
      difficulty: 'صعب',
      questionText: 'ناقش دور الموانئ العُمانية في تعزيز التجارة الإقليمية والدولية',
      correctAnswer: 'الموانئ العُمانية مثل ميناء صلالة وصحار والدقم تلعب دوراً محورياً في التجارة البحرية، حيث تربط آسيا بأفريقيا وأوروبا، وتوفر خدمات لوجستية متطورة، وتساهم في تنويع الاقتصاد الوطني',
      sourceRef: { volume: '5', page: '85', lineFrom: '5', lineTo: '22' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Education - MCQ
    {
      id: 'demo-25',
      competitionId: null,
      isTraining: true,
      type: 'mcq',
      category: 'تعليم',
      difficulty: 'متوسط',
      questionText: 'في أي عام تم افتتاح جامعة السلطان قابوس؟',
      options: ['1986', '1980', '1990', '1995'],
      correctAnswer: '1986',
      sourceRef: { volume: '5', page: '189', lineFrom: '15', lineTo: '18' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Education - True/False
    {
      id: 'demo-28',
      competitionId: null,
      isTraining: true,
      type: 'true_false',
      category: 'تعليم',
      difficulty: 'متوسط',
      questionText: 'التعليم في سلطنة عُمان مجاني في جميع المراحل الحكومية',
      correctAnswer: 'true',
      sourceRef: { volume: '5', page: '195', lineFrom: '12', lineTo: '14' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  async getById(id: string): Promise<Question | null> {
    return this.trainingQuestions.find(q => q.id === id) || null
  }
  async listByCompetition(competitionId: string): Promise<Question[]> {
    return []
  }
  async listTraining(): Promise<Question[]> {
    return this.trainingQuestions
  }
  async listAll(): Promise<Question[]> {
    return this.trainingQuestions
  }
  async create(data: Question): Promise<Question> {
    return data
  }
  async update(id: string, patch: Partial<Question>): Promise<Question> {
    throw new Error('Not implemented')
  }
  async delete(id: string): Promise<void> {}
  async moveToTraining(competitionId: string): Promise<void> {}
}

class MockSubmissionsRepo implements ISubmissionsRepo {
  async getById(id: string): Promise<Submission | null> {
    return null
  }
  async listByUser(userId: string): Promise<Submission[]> {
    return []
  }
  async listByCompetition(competitionId: string): Promise<Submission[]> {
    return []
  }
  async create(data: Submission): Promise<Submission> {
    return data
  }
  async update(id: string, patch: Partial<Submission>): Promise<Submission> {
    throw new Error('Not implemented')
  }
  async deleteByCompetition(competitionId: string): Promise<void> {}
}

class MockTicketsRepo implements ITicketsRepo {
  async listByUser(userId: string, competitionId: string): Promise<Ticket[]> {
    return []
  }
  async listByCompetition(competitionId: string): Promise<Ticket[]> {
    return []
  }
  async create(data: Ticket): Promise<Ticket> {
    return data
  }
  async update(id: string, patch: Partial<Ticket>): Promise<Ticket> {
    throw new Error('Not implemented')
  }
  async delete(id: string): Promise<void> {}
  async deleteByCompetition(competitionId: string): Promise<void> {}
  async recalculate(competitionId: string): Promise<void> {}
}

class MockWheelRepo implements IWheelRepo {
  async getByCompetition(competitionId: string): Promise<WheelRun | null> {
    return null
  }
  async create(data: WheelRun): Promise<WheelRun> {
    return data
  }
  async deleteByCompetition(competitionId: string): Promise<void> {}
}

class MockWinnersRepo implements IWinnersRepo {
  async getByCompetition(competitionId: string): Promise<Winner | null> {
    return null
  }
  async create(data: Winner): Promise<Winner> {
    return data
  }
  async update(id: string, patch: Partial<Winner>): Promise<Winner> {
    throw new Error('Not implemented')
  }
}

class MockAuditRepo implements IAuditRepo {
  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    return {
      id: Math.random().toString(36),
      ...data,
      createdAt: new Date().toISOString(),
    }
  }
  async listByUser(userId: string): Promise<AuditLog[]> {
    return []
  }
  async listAll(limit?: number): Promise<AuditLog[]> {
    return []
  }
}

class MockParticipantsRepo implements IParticipantsRepo {
  async getById(id: string): Promise<Participant | null> {
    return null
  }
  async listByCompetition(competitionId: string): Promise<Participant[]> {
    return []
  }
  async create(data: Participant): Promise<Participant> {
    return data
  }
}

class MockTrainingSubmissionsRepo implements ITrainingSubmissionsRepo {
  async listByUser(userId: string): Promise<TrainingSubmission[]> {
    return []
  }
  async create(data: TrainingSubmission): Promise<TrainingSubmission> {
    return data
  }
}

// Export singleton instances
export const usersRepo: IUsersRepo = new MockUsersRepo()
export const competitionsRepo: ICompetitionsRepo = new MockCompetitionsRepo()
export const questionsRepo: IQuestionsRepo = new MockQuestionsRepo()
export const submissionsRepo: ISubmissionsRepo = new MockSubmissionsRepo()
export const ticketsRepo: ITicketsRepo = new MockTicketsRepo()
export const wheelRepo: IWheelRepo = new MockWheelRepo()
export const winnersRepo: IWinnersRepo = new MockWinnersRepo()
export const auditRepo: IAuditRepo = new MockAuditRepo()
export const participantsRepo: IParticipantsRepo = new MockParticipantsRepo()
export const trainingSubmissionsRepo: ITrainingSubmissionsRepo = new MockTrainingSubmissionsRepo()
