import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI | null = null;
  private isEnabled = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const enabled = this.configService.get<string>('AI_ENABLED') === 'true';

    if (enabled && apiKey && apiKey !== 'sk-proj-your-openai-key-here') {
      this.openai = new OpenAI({ apiKey });
      this.isEnabled = true;
      this.logger.log('✅ AI Service enabled with OpenAI');
    } else {
      this.logger.warn('⚠️ AI Service disabled - No valid OpenAI API key');
    }
  }

  async generateReply(
    customerMessage: string,
    conversationContext: string[] = [],
    customerName?: string,
  ): Promise<string> {
    if (!this.isEnabled || !this.openai) {
      return this.getFallbackReply(customerMessage);
    }

    try {
      const systemPrompt = `أنت مساعد خدمة عملاء محترف لشركة "المسار الساخن" (AlMasar). 
مهمتك:
- الرد بشكل احترافي وودود
- استخدام اللغة العربية الفصحى
- التعامل مع الاستفسارات والشكاوى بطريقة إيجابية
- تقديم حلول عملية
- عدم تجاوز 100 كلمة في الرد
- استخدام الرموز التعبيرية بشكل مناسب

معلومات عن الشركة:
- خدمات: مركز اتصالات، إدارة وسائل التواصل الاجتماعي، خدمات رقمية
- ساعات العمل: من الأحد للخميس 9 صباحاً - 6 مساءً
- الدعم الفني: متاح 24/7
- التواصل: WhatsApp, Messenger, Telegram`;

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
      ];

      // إضافة سياق المحادثة
      conversationContext.forEach((msg, index) => {
        messages.push({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: msg,
        });
      });

      // إضافة الرسالة الحالية
      messages.push({
        role: 'user',
        content: customerName 
          ? `${customerName} يقول: ${customerMessage}`
          : customerMessage,
      });

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('AI_MODEL') || 'gpt-3.5-turbo',
        messages,
        max_tokens: 200,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || this.getFallbackReply(customerMessage);
      
      this.logger.log(`🤖 AI Reply generated for: "${customerMessage.substring(0, 30)}..."`);
      
      return reply;
    } catch (error) {
      this.logger.error('❌ Error generating AI reply:', error.message);
      return this.getFallbackReply(customerMessage);
    }
  }

  /**
   * ردود ذكية بدون AI (fallback)
   */
  private getFallbackReply(message: string): string {
    const lowerMessage = message.toLowerCase().trim();

    // تحيات
    if (/^(مرحبا|أهلا|السلام عليكم|هاي|hello|hi)/.test(lowerMessage)) {
      return 'مرحباً بك! 👋 كيف يمكنني مساعدتك اليوم؟';
    }

    // استفسار عن الخدمات
    if (lowerMessage.includes('خدمات') || lowerMessage.includes('ايه اللي') || lowerMessage.includes('services')) {
      return `نحن نقدم خدمات متنوعة:\n✅ مركز اتصالات احترافي\n✅ إدارة حسابات السوشيال ميديا\n✅ خدمة عملاء 24/7\n✅ حلول رقمية متكاملة\n\nهل تريد معرفة المزيد عن خدمة معينة؟ 😊`;
    }

    // أسعار
    if (lowerMessage.includes('سعر') || lowerMessage.includes('كام') || lowerMessage.includes('تكلفة') || lowerMessage.includes('price')) {
      return 'بالنسبة للأسعار، يسعدنا تقديم عروض خاصة حسب احتياجاتك! 💰\nيمكنك التواصل مع فريق المبيعات للحصول على عرض سعر مخصص.\nهل تريد أن أحولك لأحد مسؤولي المبيعات؟';
    }

    // شكوى
    if (lowerMessage.includes('مشكلة') || lowerMessage.includes('شكوى') || lowerMessage.includes('خطأ') || lowerMessage.includes('problem')) {
      return 'أعتذر عن أي إزعاج واجهته 🙏\nيهمنا حل مشكلتك في أسرع وقت. هل يمكنك توضيح تفاصيل المشكلة حتى نساعدك بشكل أفضل؟';
    }

    // ساعات العمل
    if (lowerMessage.includes('ساعات') || lowerMessage.includes('وقت') || lowerMessage.includes('متى') || lowerMessage.includes('hours')) {
      return 'ساعات العمل: 🕐\n• من الأحد للخميس: 9 صباحاً - 6 مساءً\n• الدعم الفني: متاح 24/7\n• WhatsApp: متاح دائماً للرد التلقائي';
    }

    // شكر
    if (lowerMessage.includes('شكرا') || lowerMessage.includes('thank')) {
      return 'العفو! سعداء بخدمتك دائماً 😊\nإذا احتجت أي مساعدة أخرى، لا تتردد في التواصل معنا!';
    }

    // وداع
    if (lowerMessage.includes('باي') || lowerMessage.includes('وداع') || lowerMessage.includes('bye')) {
      return 'مع السلامة! 👋 نتمنى لك يوماً سعيداً ونتطلع للتواصل معك قريباً!';
    }

    // رد افتراضي - الآن يستخدم شجرة الأسئلة من Frontend
    // لا نرسل رد تلقائي من Backend، Frontend Bot سيتولى الأمر
    return null; // Frontend bot will handle the response
  }

  /**
   * تحليل نية العميل (Intent Detection)
   */
  async detectIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    suggestedAction: string;
  }> {
    const lowerMessage = message.toLowerCase();

    const intents = [
      {
        name: 'greeting',
        keywords: ['مرحبا', 'أهلا', 'السلام', 'هاي', 'hello', 'hi'],
        action: 'Send welcome message',
      },
      {
        name: 'service_inquiry',
        keywords: ['خدمات', 'خدمة', 'ايه اللي', 'services', 'what do you'],
        action: 'Show services list',
      },
      {
        name: 'pricing',
        keywords: ['سعر', 'كام', 'تكلفة', 'price', 'cost', 'how much'],
        action: 'Connect to sales team',
      },
      {
        name: 'complaint',
        keywords: ['مشكلة', 'شكوى', 'خطأ', 'problem', 'issue', 'complaint'],
        action: 'Escalate to support',
      },
      {
        name: 'hours',
        keywords: ['ساعات', 'وقت', 'متى', 'hours', 'when', 'time'],
        action: 'Show working hours',
      },
    ];

    for (const intent of intents) {
      const matchCount = intent.keywords.filter((keyword) =>
        lowerMessage.includes(keyword),
      ).length;

      if (matchCount > 0) {
        const confidence = Math.min((matchCount / intent.keywords.length) * 100, 95);
        return {
          intent: intent.name,
          confidence,
          suggestedAction: intent.action,
        };
      }
    }

    return {
      intent: 'unknown',
      confidence: 0,
      suggestedAction: 'Forward to human agent',
    };
  }

  isAIEnabled(): boolean {
    return this.isEnabled;
  }
}
