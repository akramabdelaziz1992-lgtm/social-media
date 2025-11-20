const sqlite3 = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3(path.join(__dirname, 'almasar.db'));

try {
  console.log('📝 Adding sample data...\n');

  // Sample channels
  const channels = [
    {
      id: uuidv4(),
      type: 'whatsapp',
      name: 'واتس اب العملاء',
      status: 'active',
      isActive: 1,
      credentials: JSON.stringify({ phoneNumber: '+966501234567' }),
      metadata: JSON.stringify({ provider: 'whatsapp-api' })
    },
    {
      id: uuidv4(),
      type: 'facebook',
      name: 'صفحة الفيسبوك',
      status: 'active',
      isActive: 1,
      credentials: JSON.stringify({ pageId: '123456789' }),
      metadata: JSON.stringify({ provider: 'facebook-graph-api' })
    },
    {
      id: uuidv4(),
      type: 'email',
      name: 'البريد الإلكتروني',
      status: 'active',
      isActive: 1,
      credentials: JSON.stringify({ email: 'support@almasar.com' }),
      metadata: JSON.stringify({ provider: 'smtp' })
    }
  ];

  channels.forEach(channel => {
    const stmt = db.prepare(`
      INSERT INTO channels (id, type, name, status, isActive, credentials, metadata, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(channel.id, channel.type, channel.name, channel.status, channel.isActive, channel.credentials, channel.metadata);
  });
  console.log('✅ Added 3 sample channels');

  // Get first channel ID for conversations
  const channelRow = db.prepare('SELECT id FROM channels LIMIT 1').get();
  const channelId = channelRow?.id;

  // Get admin user ID
  const userRow = db.prepare('SELECT id FROM users WHERE email = ? LIMIT 1').get('admin@elmasarelsa5en.com');
  const adminUserId = userRow?.id;

  if (channelId && adminUserId) {
    // Sample conversations
    const conversations = [
      {
        id: uuidv4(),
        channelId,
        externalThreadId: 'ext_conv_001',
        assignedToUserId: adminUserId,
        department: 'sales',
        customerProfile: JSON.stringify({ name: 'أحمد محمد', phone: '+966501111111' }),
        privacyScope: 'private',
        status: 'open',
        unreadCount: 2,
        tags: JSON.stringify(['vip', 'عاجل']),
        notes: 'عميل جديد يبحث عن المنتجات'
      },
      {
        id: uuidv4(),
        channelId,
        externalThreadId: 'ext_conv_002',
        assignedToUserId: adminUserId,
        department: 'support',
        customerProfile: JSON.stringify({ name: 'فاطمة علي', phone: '+966502222222' }),
        privacyScope: 'private',
        status: 'open',
        unreadCount: 1,
        tags: JSON.stringify(['شكوى', 'أولويات عالية']),
        notes: 'مشكلة في الطلب السابق'
      },
      {
        id: uuidv4(),
        channelId,
        externalThreadId: 'ext_conv_003',
        assignedToUserId: adminUserId,
        department: 'reservations',
        customerProfile: JSON.stringify({ name: 'خالد سالم', phone: '+966503333333' }),
        privacyScope: 'private',
        status: 'closed',
        unreadCount: 0,
        tags: JSON.stringify(['محفوظ']),
        notes: 'تم إكمال الحجز بنجاح'
      }
    ];

    conversations.forEach(conv => {
      const stmt = db.prepare(`
        INSERT INTO conversations (
          id, channelId, externalThreadId, assignedToUserId, department, 
          customerProfile, privacyScope, status, unreadCount, tags, notes, 
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      stmt.run(
        conv.id, conv.channelId, conv.externalThreadId, conv.assignedToUserId,
        conv.department, conv.customerProfile, conv.privacyScope,
        conv.status, conv.unreadCount, conv.tags, conv.notes
      );
    });
    console.log('✅ Added 3 sample conversations');

    // Get first conversation ID
    const convRow = db.prepare('SELECT id FROM conversations LIMIT 1').get();
    const conversationId = convRow?.id;

    if (conversationId) {
      // Sample messages
      const messages = [
        {
          id: uuidv4(),
          conversationId,
          senderType: 'customer',
          senderId: 'cust_001',
          text: 'مرحبا، أريد معلومات عن المنتجات',
          status: 'delivered',
          isAutoReply: 0,
          replyToMessageId: null
        },
        {
          id: uuidv4(),
          conversationId,
          senderType: 'agent',
          senderId: adminUserId,
          text: 'أهلا وسهلا بك! كيف يمكننا مساعدتك؟',
          status: 'sent',
          isAutoReply: 1,
          replyToMessageId: null
        },
        {
          id: uuidv4(),
          conversationId,
          senderType: 'customer',
          senderId: 'cust_001',
          text: 'أريد معرفة الأسعار والعروض الحالية',
          status: 'delivered',
          isAutoReply: 0,
          replyToMessageId: null
        },
        {
          id: uuidv4(),
          conversationId,
          senderType: 'agent',
          senderId: adminUserId,
          text: 'سيتم إرسال الكتالوج الكامل لك الآن',
          status: 'sent',
          isAutoReply: 0,
          replyToMessageId: null
        }
      ];

      messages.forEach(msg => {
        const stmt = db.prepare(`
          INSERT INTO messages (
            id, conversationId, senderType, senderId, text, status, isAutoReply, replyToMessageId,
            createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        stmt.run(msg.id, msg.conversationId, msg.senderType, msg.senderId, msg.text, msg.status, msg.isAutoReply, msg.replyToMessageId);
      });
      console.log('✅ Added 4 sample messages');
    }
  }

  // Sample templates
  const templates = [
    {
      id: uuidv4(),
      name: 'رد ترحيبي',
      description: 'رسالة ترحيب للعملاء الجدد',
      channelType: 'all',
      content: 'مرحبا بك في {{company_name}}! كيف يمكننا مساعدتك؟',
      category: 'greeting',
      isActive: 1,
      usageCount: 15
    },
    {
      id: uuidv4(),
      name: 'معلومات المنتجات',
      description: 'إرسال معلومات عن المنتجات',
      channelType: 'all',
      content: 'إليك قائمة بمنتجاتنا الرئيسية:\n{{products_list}}',
      category: 'product_info',
      isActive: 1,
      usageCount: 8
    },
    {
      id: uuidv4(),
      name: 'شكر على التواصل',
      description: 'شكر العميل على تواصله',
      channelType: 'all',
      content: 'شكرا لتواصلك معنا {{customer_name}}. سيتم الرد عليك قريبا.',
      category: 'thank_you',
      isActive: 1,
      usageCount: 22
    }
  ];

  templates.forEach(tmpl => {
    const stmt = db.prepare(`
      INSERT INTO templates (
        id, name, description, channelType, content, category, isActive, usageCount,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(tmpl.id, tmpl.name, tmpl.description, tmpl.channelType, tmpl.content, tmpl.category, tmpl.isActive, tmpl.usageCount);
  });
  console.log('✅ Added 3 sample templates');

  // Sample auto-reply rules
  const autoReplyRules = [
    {
      id: uuidv4(),
      name: 'رد تلقائي على الرسائل خارج الأوقات',
      description: 'ردود تلقائية خارج ساعات العمل',
      channelType: 'whatsapp',
      department: 'support',
      triggers: JSON.stringify(['off-hours', 'after-business']),
      enabled: 1,
      priority: 1,
      executionCount: 45
    },
    {
      id: uuidv4(),
      name: 'رد تلقائي على الاستفسارات',
      description: 'ردود تلقائية على الاستفسارات الشائعة',
      channelType: 'facebook',
      department: 'sales',
      triggers: JSON.stringify(['inquiry', 'question']),
      enabled: 1,
      priority: 2,
      executionCount: 120
    }
  ];

  autoReplyRules.forEach(rule => {
    const stmt = db.prepare(`
      INSERT INTO auto_reply_rules (
        id, name, description, channelType, department, triggers, enabled, priority, executionCount,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(rule.id, rule.name, rule.description, rule.channelType, rule.department, rule.triggers, rule.enabled, rule.priority, rule.executionCount);
  });
  console.log('✅ Added 2 sample auto-reply rules');

  console.log('\n✨ جميع البيانات التجريبية تمت إضافتها بنجاح!');
  db.close();
} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
}
